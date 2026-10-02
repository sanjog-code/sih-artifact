import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SessionUser } from '@farmlink/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../redis/cache.service';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import { getRequest } from './request.util';

export interface JwtSession {
  sub: string;
  jti: string;
  purpose: 'session';
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly userCacheTtl = 60;

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, context.getHandler()) ?? Reflect.getMetadata(IS_PUBLIC_KEY, context.getClass());
    if (isPublic) return true;

    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('auth_required');

    let payload: JwtSession;
    try {
      payload = await this.jwt.verifyAsync<JwtSession>(token);
    } catch {
      throw new UnauthorizedException('auth_invalid');
    }
    if (payload.purpose !== 'session') throw new UnauthorizedException('auth_invalid');

    // Fresh user state from the database (cached 60s) so suspension/role changes
    // take effect immediately and stale tokens cannot access endpoints.
    const cacheKey = `user:${payload.sub}`;
    let user = await this.cache.get<SessionUser>(cacheKey);
    if (!user) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, phone: true, email: true, name: true, role: true, lang: true, status: true },
      });
      if (!dbUser) throw new UnauthorizedException('auth_invalid');
      user = {
        id: dbUser.id,
        phone: dbUser.phone,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        lang: dbUser.lang as 'en' | 'hi',
        status: dbUser.status,
      };
      void this.cache.set(cacheKey, user, this.userCacheTtl);
    }
    if (user.status !== 'ACTIVE') throw new ForbiddenException('account_suspended');

    request.user = user;
    request.jwtSession = payload;
    return true;
  }

  private extractToken(request: {
    cookies?: Record<string, string | undefined>;
    headers?: Record<string, string | string[] | undefined>;
  }): string | null {
    const cookie = request.cookies?.['__fl_session'];
    if (cookie) return cookie;
    const auth = request.headers?.['authorization'];
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }
}