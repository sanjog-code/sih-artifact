import { SetMetadata, createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Permission, Role } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';

export const IS_PUBLIC_KEY = 'isPublic';
/** Mark a route as publicly accessible (no auth, no CSRF). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const CSRF_SKIP_KEY = 'csrfSkip';
export const SkipCsrf = () => SetMetadata(CSRF_SKIP_KEY, true);

export const RATE_LIMIT_KEY = 'rateLimit';
export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  keyPrefix: string;
}
export const RateLimit = (opts: Partial<RateLimitOptions>) => SetMetadata(RATE_LIMIT_KEY, opts);

export const CurrentUser = createParamDecorator(
  (data: keyof SessionUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as SessionUser | undefined;
    return data ? user?.[data] : user;
  },
);