import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../redis/cache.service';
import { RateLimitOptions, RATE_LIMIT_KEY } from '../decorators/auth.decorators';
import { clientIp, getRequest } from './request.util';

const DEFAULT_AUTH_LIMIT: RateLimitOptions = { limit: 5, windowSeconds: 60, keyPrefix: 'rl:auth' };

/**
 * Sliding-style fixed-window rate limiter (Redis in production, in-memory in
 * dev/tests). Only active when applied via @RateLimit({...}).
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    let meta = this.reflector.get<RateLimitOptions | undefined>(RATE_LIMIT_KEY, context.getHandler());
    if (!meta) meta = this.reflector.get<RateLimitOptions | undefined>(RATE_LIMIT_KEY, context.getClass());
    if (!meta) return true;

    const ip = clientIp(request);
    const key = `${meta.keyPrefix ?? 'rl:global'}:${ip}:${request.method}:${request.path}`;
    const { allowed, retryAfterSeconds } = await this.cache.rateLimit(key, meta.limit, meta.windowSeconds);
    if (!allowed) {
      request.res?.setHeader('Retry-After', String(retryAfterSeconds));
      throw new HttpException('too_many_attempts', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}

/** Convenience defaults used by controllers. */
export const AuthRateLimit: RateLimitOptions = { ...DEFAULT_AUTH_LIMIT };
export const OtpRateLimit: RateLimitOptions = { limit: 10, windowSeconds: 60, keyPrefix: 'rl:otp' };
export const SearchRateLimit: RateLimitOptions = { limit: 60, windowSeconds: 60, keyPrefix: 'rl:search' };
export const MutationRateLimit: RateLimitOptions = { limit: 120, windowSeconds: 60, keyPrefix: 'rl:mutation' };
export const WebhookRateLimit: RateLimitOptions = { limit: 60, windowSeconds: 60, keyPrefix: 'rl:webhook' };
export const UploadRateLimit: RateLimitOptions = { limit: 30, windowSeconds: 60, keyPrefix: 'rl:upload' };