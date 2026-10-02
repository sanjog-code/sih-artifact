import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { can, type Permission, type Role } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { getRequest } from './request.util';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/auth.decorators';

/** Role-check + fine-grained permission enforcement. Always server side. */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = getRequest(context);
    const handler = context.getHandler();
    const cls = context.getClass();

    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [handler, cls]);
    const permissions = this.reflector.getAllAndOverride<Permission[] | undefined>(PERMISSIONS_KEY, [handler, cls]);

    const user = request.user as SessionUser | undefined;
    if (!user) throw new ForbiddenException('forbidden');

    if (roles && roles.length > 0 && !roles.includes(user.role)) throw new ForbiddenException('forbidden');

    if (permissions && permissions.length > 0) {
      const ok = permissions.every((p) => can(user.role, p));
      if (!ok) throw new ForbiddenException('forbidden');
    }
    return true;
  }
}