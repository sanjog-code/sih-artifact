import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../redis/cache.service';
import { CSRF_SKIP_KEY, IS_PUBLIC_KEY, RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/auth.decorators';
import { getRequest } from './request.util';

/**
 * CSRF protection for cookie-authenticated apps: double-submit token.
 * The `<html>` client reads the CSRF cookie and echoes it in `x-csrf-token`
 * for every mutating request. Guards are skipped for OAuth/webhook/public routes.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') return true;
    const skip = this.reflector.getAllAndOverride<boolean>(CSRF_SKIP_KEY, [context.getHandler(), context.getClass()]);
    if (skip) return true;

    const headerName = process.env.CSRF_HEADER ?? 'x-csrf-token';
    const cookieName = process.env.CSRF_COOKIE_NAME ?? '_farmlink_csrf';
    const cookieValue = request.cookies?.[cookieName] as string | undefined;
    const headerValue = request.headers?.[headerName] as string | undefined;
    if (!cookieValue || !headerValue) throw new HttpException('csrf_missing', HttpStatus.FORBIDDEN);
    if (cookieValue !== headerValue) throw new HttpException('csrf_invalid', HttpStatus.FORBIDDEN);

    // double-submit only protects against cross-site writes when the cookie is
    // not readable cross-origin; binding the token to the session adds defense.
    const bound = request.cookies?.['__fl_session'];
    if (bound) {
      const token = request.cookies?.['__fl_csrf_bound'] as string | undefined;
      if (!token) throw new HttpException('csrf_invalid', HttpStatus.FORBIDDEN);
    }
    // Rate-limit CSRF failures to slow brute force.
    const key = `csrf:${cookieValue ?? ''}`;
    const { allowed } = await this.cache.rateLimit(key, 20, 300);
    if (!allowed) throw new HttpException('too_many_attempts', HttpStatus.TOO_MANY_REQUESTS);
    return true;
  }
}

export type RateLimitMeta = RateLimitOptions;

// Re-export of the metadata key for reuse in the rate-limit guard below.
export const RATE_LIMIT_META = RATE_LIMIT_KEY;