import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { Role } from '@prisma/client';
import { constantTimeEquals, generateOtp, generateOtpSalt, hashOtp, sha256Hex } from '../../common/utils/crypto.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { ENV } from '../../config/app.config';
import { OtpSender } from './otp.sender';

export interface OtpRequestInput {
  identifier: string;
  channel: 'phone' | 'email';
  purpose: 'LOGIN' | 'SECURE_ACTION';
  lang?: 'en' | 'hi';
}

export interface OtpVerifyInput extends OtpRequestInput {
  code: string;
  actionContext?: { action: string; resourceId: string };
}

export interface SecureActionInput {
  action: 'sell' | 'finance' | 'delete_account' | 'refund';
  resourceId: string;
}

@Injectable()
export class AuthService {
  private readonly log = new Logger('auth');
  private readonly otpTtlSec = 5 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
    @Inject('OTP_SENDER') private readonly otpSender: OtpSender,
  ) {}

  private challengeKey(identifier: string, purpose: string): string {
    return `otp:${sha256Hex(identifier).slice(0, 24)}:${purpose}`;
  }

  async requestOtp(input: OtpRequestInput): Promise<{ sent: boolean; hint: boolean; provider: string }> {
    const code = ENV.otpProvider === 'mock' ? ENV.mockOtpCode : generateOtp();
    const salt = generateOtpSalt();
    await this.cache.set(
      this.challengeKey(input.identifier, input.purpose),
      { hash: hashOtp(code, salt), salt, attempts: 0, expiresAt: Date.now() + this.otpTtlSec * 1000 },
      this.otpTtlSec,
    );
    await this.otpSender.send({ ...input, code });
    await this.audit.record({
      action: `auth:otp:request:${input.purpose}`,
      targetType: 'identity',
      targetId: input.identifier.slice(0, 8),
      after: { channel: input.channel, purpose: input.purpose },
    });
    return { sent: true, hint: ENV.otpProvider === 'mock', provider: this.otpSender.provider };
  }

  async verifyOtp(
    input: OtpVerifyInput,
    req: { ip?: string; ua?: string; requestId?: string },
  ): Promise<{ sessionToken: string; user: { id: string; name: string; role: Role; lang: string } | null }> {
    const stored = await this.cache.get<{ hash: string; salt: string; attempts: number; expiresAt: number }>(
      this.challengeKey(input.identifier, input.purpose),
    );
    if (!stored) throw new UnauthorizedException('otp_expired');

    stored.attempts += 1;
    if (stored.attempts > 5) {
      await this.cache.del(this.challengeKey(input.identifier, input.purpose));
      throw new UnauthorizedException('otp_locked');
    }
    if (Date.now() > stored.expiresAt) {
      await this.cache.del(this.challengeKey(input.identifier, input.purpose));
      throw new UnauthorizedException('otp_expired');
    }

    const suppliedHash = hashOtp(input.code, stored.salt);
    if (!constantTimeEquals(suppliedHash, stored.hash)) {
      await this.cache.set(this.challengeKey(input.identifier, input.purpose), stored, this.otpTtlSec);
      throw new UnauthorizedException('otp_invalid');
    }
    await this.cache.del(this.challengeKey(input.identifier, input.purpose));

    if (input.purpose === 'SECURE_ACTION') {
      if (!input.actionContext) throw new BadRequestException('actionContext_required');
      const token = await this.issueSecureActionToken(input.identifier, input.actionContext);
      await this.audit.record({
        action: `auth:secure:grant`,
        targetType: 'resource',
        targetId: input.actionContext.resourceId,
        after: { action: input.actionContext.action },
        request: req,
      });
      return { sessionToken: token, user: null };
    }

    const user = await this.findOrCreateUser(input.identifier, 'farmer', input.lang);
    const sessionToken = await this.issueSessionToken(user);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.record({
      actorUserId: user.id,
      actorRole: user.role,
      action: 'auth:login',
      targetType: 'user',
      targetId: user.id,
      request: req,
    });
    return { sessionToken, user: { id: user.id, name: user.name, role: user.role, lang: user.lang } };
  }

  /** Demo login picks a role and phone, always issuing the mock OTP. */
  async loginDemo(input: { role: Role; phone?: string; lang?: 'en' | 'hi' }): Promise<{
    requiresOtp: true;
    identifier: string;
    demoCode: string;
    hint: boolean;
    user: { id: string; name: string; role: Role };
  }> {
    const identifier = input.phone ?? demoPhoneForRole(input.role);
    const user = await this.findOrCreateUser(identifier, input.role, input.lang ?? 'en');
    await this.requestOtp({ identifier, channel: 'phone', purpose: 'LOGIN', lang: input.lang });
    return {
      requiresOtp: true,
      identifier,
      demoCode: ENV.mockOtpCode,
      hint: true,
      user: { id: user.id, name: user.name, role: user.role },
    };
  }

  async findOrCreateUser(identifier: string, role: Role, lang?: 'en' | 'hi'): Promise<{
    id: string;
    name: string;
    role: Role;
    lang: string;
    status: string;
  }> {
    if (/^\d{10}$/.test(identifier)) {
      let user = await this.prisma.user.findUnique({ where: { phone: identifier } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phone: identifier,
            name: 'Demo Farmer',
            role: 'farmer',
            lang: (lang ?? 'hi') as 'en' | 'hi',
            status: 'ACTIVE',
            demoPinHash: sha256Hex(`${ENV.sessionSecret}:${ENV.mockOtpCode}`),
          },
        });
        await this.prisma.farmerProfile.create({
          data: { userId: user.id, farmId: (await this.prisma.farm.create({ data: { farmerUserId: user.id, name: 'Demo Farm', state: 'RJ', district: 'Jaipur', lat: 26.9124, lng: 75.7873, fpoCluster: 'Jaipur cluster A' } })).id },
        });
      }
      return { id: user.id, name: user.name, role: user.role, lang: user.lang, status: user.status };
    }
    let user = await this.prisma.user.findUnique({ where: { email: identifier } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: identifier,
          name: 'Demo User',
          role: 'consumer',
          lang: (lang ?? 'en') as 'en' | 'hi',
          status: 'ACTIVE',
        },
      });
    }
    return { id: user.id, name: user.name, role: user.role, lang: user.lang, status: user.status };
  }

  async issueSessionToken(user: { id: string; role: Role; lang: string }): Promise<string> {
    return this.jwt.signAsync({
      sub: user.id,
      role: user.role,
      lang: user.lang,
      purpose: 'session',
      jti: randomUUID(),
    });
  }

  async issueSecureActionToken(
    identifier: string,
    ctx: { action: string; resourceId: string },
  ): Promise<string> {
    const jti = randomUUID();
    const ttlSec = 10 * 60;
    await this.cache.set(`secure:${jti}`, { action: ctx.action, resourceId: ctx.resourceId, used: false }, ttlSec);
    return this.jwt.signAsync({ sub: identifier, purpose: 'secure_action', action: ctx.action, resourceId: ctx.resourceId, jti }, { expiresIn: ttlSec });
  }

  /** Consume a secure-action token; throws if already used. */
  async consumeSecureActionToken(token: string): Promise<{ action: string; resourceId: string; userId: string }> {
    let payload: { sub: string; purpose: string; action: string; resourceId: string; jti: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('secure_token_invalid');
    }
    if (payload.purpose !== 'secure_action') throw new UnauthorizedException('secure_token_invalid');
    const meta = await this.cache.get<{ used: boolean }>(`secure:${payload.jti}`);
    if (!meta || meta.used) throw new UnauthorizedException('secure_token_used');
    await this.cache.set(`secure:${payload.jti}`, { ...meta, used: true }, 60);
    return { action: payload.action, resourceId: payload.resourceId, userId: payload.sub };
  }

  async logout(userId: string, req: { ip?: string; requestId?: string }): Promise<void> {
    await this.audit.record({ actorUserId: userId, action: 'auth:logout', targetType: 'user', targetId: userId, request: req });
  }
}

const demoDefaults: Record<Role, { phone: string; name: string; orgType?: 'FPO' | 'WAREHOUSE_CO' | 'BUYER' | 'FINANCE_PARTNER' }> = {
  farmer: { phone: '9899000001', name: 'Demo Farmer' },
  consumer: { phone: '9899000002', name: 'Demo Consumer' },
  bulk_buyer: { phone: '9899000003', name: 'Demo Bulk Buyer', orgType: 'BUYER' },
  warehouse_operator: { phone: '9899000004', name: 'Demo Warehouse Operator', orgType: 'WAREHOUSE_CO' },
  operations_admin: { phone: '9899000005', name: 'Demo Ops Admin' },
  platform_admin: { phone: '9899000006', name: 'Demo Platform Admin' },
  finance_partner: { phone: '9899000007', name: 'Demo Finance Partner', orgType: 'FINANCE_PARTNER' },
};

function demoPhoneForRole(role: Role): string {
  return demoDefaults[role].phone;
}