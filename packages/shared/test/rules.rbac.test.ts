import { can, hasPermission } from '../src/rules/rbac';
import { PERMISSIONS, ROLES } from '../src/constants';

describe('RBAC', () => {
  it('farmer cannot access admin audits', () => {
    expect(hasPermission(ROLES.FARMER, PERMISSIONS.ADMIN_AUDIT)).toBe(false);
  });

  it('platform admin can access audits, operations admin cannot', () => {
    expect(hasPermission(ROLES.PLATFORM_ADMIN, PERMISSIONS.ADMIN_AUDIT)).toBe(true);
    expect(hasPermission(ROLES.OPERATIONS_ADMIN, PERMISSIONS.ADMIN_AUDIT)).toBe(false);
  });

  it('finance partner has consent-scoped finance access only', () => {
    expect(hasPermission(ROLES.FINANCE_PARTNER, PERMISSIONS.FINANCE_CASE_VIEW_CONSENTED)).toBe(true);
    expect(hasPermission(ROLES.FINANCE_PARTNER, PERMISSIONS.ORDER_CREATE)).toBe(false);
    expect(hasPermission(ROLES.FINANCE_PARTNER, PERMISSIONS.BUYER_RFQ_CREATE)).toBe(false);
  });

  it('warehouse operator can grade but not manage users', () => {
    expect(can(ROLES.WAREHOUSE_OPERATOR, PERMISSIONS.WAREHOUSE_GRADE)).toBe(true);
    expect(can(ROLES.WAREHOUSE_OPERATOR, PERMISSIONS.ADMIN_USER_MANAGE)).toBe(false);
  });

  it('consumers and bulk buyers cannot declare produce', () => {
    expect(can(ROLES.CONSUMER, PERMISSIONS.PRODUCE_DECLARE)).toBe(false);
    expect(can(ROLES.BULK_BUYER, PERMISSIONS.PRODUCE_DECLARE)).toBe(false);
  });

  it('null/undefined role is denied', () => {
    expect(can(null, PERMISSIONS.CATALOGUE_READ)).toBe(false);
  });
});