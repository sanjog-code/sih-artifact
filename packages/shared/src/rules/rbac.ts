import { PERMISSIONS_BY_ROLE, Role, type Permission } from '../constants';

/** Server-enforced RBAC helper. */
export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[role].includes(permission);
}

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return hasPermission(role, permission);
}

export function requiredPermissionsFor(roles: Role[]): Permission[] {
  return Array.from(new Set(roles.flatMap((r) => PERMISSIONS_BY_ROLE[r])));
}

/** Deterministic audit label for a granted permission check. */
export function permissionCheck(role: Role, permission: Permission): { allowed: boolean; role: Role; permission: Permission } {
  const allowed = hasPermission(role, permission);
  return { allowed, role, permission };
}