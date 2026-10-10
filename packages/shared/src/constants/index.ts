/**
 * FarmLink shared (domain) constants.
 * Keep the string values lower_snake_case: they are stored as-enum in PostgreSQL.
 */

// ---------------------------------------------------------------------------
// Roles & RBAC
// ---------------------------------------------------------------------------
export const ROLES = {
  FARMER: 'farmer',
  CONSUMER: 'consumer',
  BULK_BUYER: 'bulk_buyer',
  WAREHOUSE_OPERATOR: 'warehouse_operator',
  OPERATIONS_ADMIN: 'operations_admin',
  PLATFORM_ADMIN: 'platform_admin',
  FINANCE_PARTNER: 'finance_partner',
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.FARMER]: 'Farmer',
  [ROLES.CONSUMER]: 'Consumer',
  [ROLES.BULK_BUYER]: 'Verified bulk buyer',
  [ROLES.WAREHOUSE_OPERATOR]: 'Warehouse operator',
  [ROLES.OPERATIONS_ADMIN]: 'Operations admin',
  [ROLES.PLATFORM_ADMIN]: 'Platform admin',
  [ROLES.FINANCE_PARTNER]: 'Finance partner',
};

export const PERMISSIONS = {
  AUTH_SESSION: 'auth:session',
  CATALOGUE_READ: 'catalogue:read',

  // Farmer
  FARMER_PROFILE_READ: 'farmer:profile:read',
  FARMER_PROFILE_WRITE: 'farmer:profile:write',
  PRODUCE_DECLARE: 'produce:declare',
  PICKUP_REQUEST: 'pickup:request',
  LOT_VIEW_OWN: 'lot:view:own',
  LOT_DECISION: 'lot:decision',
  INSIGHT_VIEW_OWN: 'insight:view:own',
  FINANCE_CONSENT_OWN: 'finance:consent:own',
  FINANCE_CASE_VIEW_OWN: 'finance:case:view:own',
  ENWR_ENQUIRY_OWN: 'enwr:enquiry:own',

  // Consumer
  MARKET_SEARCH: 'market:search',
  LOT_VIEW_PUBLIC: 'lot:view:public',
  CART_WRITE: 'cart:write',
  ORDER_CREATE: 'order:create',
  ORDER_VIEW_OWN: 'order:view:own',
  PAYMENT_INITIATE: 'payment:initiate',
  DELIVERY_SLOT_SELECT: 'delivery:slot:select',
  DISPUTE_CREATE: 'dispute:create',
  REVIEW_CREATE: 'review:create',

  // Bulk buyer
  BUYER_RFQ_CREATE: 'buyer:rfq:create',
  BUYER_RFQ_VIEW_OWN: 'buyer:rfq:view:own',
  BUYER_NEGOTIATE: 'buyer:negotiate',
  BUYER_RESERVE: 'buyer:reserve',
  BUYER_ORDER_VIEW_OWN: 'buyer:order:view:own',

  // Warehouse operator
  WAREHOUSE_INTAKE: 'warehouse:intake',
  WAREHOUSE_GRADE: 'warehouse:grade',
  WAREHOUSE_INVENTORY_WRITE_OWN: 'warehouse:inventory:write:own',
  WAREHOUSE_LOT_VIEW_OWN: 'warehouse:lot:view:own',
  WAREHOUSE_TRANSFER: 'warehouse:transfer',
  LOGISTICS_ASSIGN: 'logistics:assign',
  PICKUP_MANAGE: 'pickup:manage',

  // Operation / platform admin
  ADMIN_USER_MANAGE: 'admin:user:manage',
  ADMIN_VERIFICATION: 'admin:verification',
  ADMIN_CATALOGUE: 'admin:catalogue',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT: 'admin:audit',
  ADMIN_REPORTS: 'admin:reports',
  ADMIN_ORDERS: 'admin:orders',
  ADMIN_DISPUTES: 'admin:disputes',
  ADMIN_FINANCE: 'admin:finance',
  ADMIN_WAREHOUSE: 'admin:warehouse',
  ONDC_READY_MANAGE: 'ondc:manage',

  // Finance partner (consent-scoped)
  FINANCE_CASE_VIEW_CONSENTED: 'finance:case:view:consented',
  FINANCE_CASE_UPDATE_CONSENTED: 'finance:case:update:consented',

  // Shared
  UPLOAD_CREATE: 'upload:create',
  UPLOAD_READ_OWN: 'upload:read:own',
  NOTIFICATION_VIEW_OWN: 'notification:view:own',
  AUDIT_WRITE: 'audit:write',
  PRIVACY_EXPORT: 'privacy:export',
  PRIVACY_DELETE: 'privacy:delete',
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const OPERATIONS_ADMIN_PERMISSIONS = [
  PERMISSIONS.AUTH_SESSION,
  PERMISSIONS.CATALOGUE_READ,
  PERMISSIONS.ADMIN_USER_MANAGE,
  PERMISSIONS.ADMIN_VERIFICATION,
  PERMISSIONS.ADMIN_CATALOGUE,
  PERMISSIONS.ADMIN_SETTINGS,
  PERMISSIONS.ADMIN_ORDERS,
  PERMISSIONS.ADMIN_DISPUTES,
  PERMISSIONS.ADMIN_WAREHOUSE,
  PERMISSIONS.ADMIN_FINANCE,
  PERMISSIONS.ADMIN_REPORTS,
  PERMISSIONS.PICKUP_MANAGE,
  PERMISSIONS.LOGISTICS_ASSIGN,
  PERMISSIONS.WAREHOUSE_GRADE,
  PERMISSIONS.MARKET_SEARCH,
  PERMISSIONS.UPLOAD_CREATE,
  PERMISSIONS.NOTIFICATION_VIEW_OWN,
] as const;

export const PERMISSIONS_BY_ROLE: Record<Role, readonly Permission[]> = {
  [ROLES.FARMER]: [
    PERMISSIONS.AUTH_SESSION,
    PERMISSIONS.CATALOGUE_READ,
    PERMISSIONS.FARMER_PROFILE_READ,
    PERMISSIONS.FARMER_PROFILE_WRITE,
    PERMISSIONS.PRODUCE_DECLARE,
    PERMISSIONS.PICKUP_REQUEST,
    PERMISSIONS.LOT_VIEW_OWN,
    PERMISSIONS.LOT_DECISION,
    PERMISSIONS.INSIGHT_VIEW_OWN,
    PERMISSIONS.FINANCE_CONSENT_OWN,
    PERMISSIONS.FINANCE_CASE_VIEW_OWN,
    PERMISSIONS.ENWR_ENQUIRY_OWN,
    PERMISSIONS.MARKET_SEARCH,
    PERMISSIONS.UPLOAD_CREATE,
    PERMISSIONS.UPLOAD_READ_OWN,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    PERMISSIONS.PRIVACY_EXPORT,
    PERMISSIONS.PRIVACY_DELETE,
  ],
  [ROLES.CONSUMER]: [
    PERMISSIONS.AUTH_SESSION,
    PERMISSIONS.CATALOGUE_READ,
    PERMISSIONS.MARKET_SEARCH,
    PERMISSIONS.LOT_VIEW_PUBLIC,
    PERMISSIONS.CART_WRITE,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_VIEW_OWN,
    PERMISSIONS.PAYMENT_INITIATE,
    PERMISSIONS.DELIVERY_SLOT_SELECT,
    PERMISSIONS.DISPUTE_CREATE,
    PERMISSIONS.REVIEW_CREATE,
    PERMISSIONS.UPLOAD_CREATE,
    PERMISSIONS.UPLOAD_READ_OWN,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    PERMISSIONS.PRIVACY_EXPORT,
    PERMISSIONS.PRIVACY_DELETE,
  ],
  [ROLES.BULK_BUYER]: [
    PERMISSIONS.AUTH_SESSION,
    PERMISSIONS.CATALOGUE_READ,
    PERMISSIONS.MARKET_SEARCH,
    PERMISSIONS.LOT_VIEW_PUBLIC,
    PERMISSIONS.BUYER_RFQ_CREATE,
    PERMISSIONS.BUYER_RFQ_VIEW_OWN,
    PERMISSIONS.BUYER_NEGOTIATE,
    PERMISSIONS.BUYER_RESERVE,
    PERMISSIONS.BUYER_ORDER_VIEW_OWN,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.PAYMENT_INITIATE,
    PERMISSIONS.DISPUTE_CREATE,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    PERMISSIONS.UPLOAD_CREATE,
    PERMISSIONS.UPLOAD_READ_OWN,
    PERMISSIONS.PRIVACY_EXPORT,
  ],
  [ROLES.WAREHOUSE_OPERATOR]: [
    PERMISSIONS.AUTH_SESSION,
    PERMISSIONS.CATALOGUE_READ,
    PERMISSIONS.WAREHOUSE_INTAKE,
    PERMISSIONS.WAREHOUSE_GRADE,
    PERMISSIONS.WAREHOUSE_INVENTORY_WRITE_OWN,
    PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN,
    PERMISSIONS.WAREHOUSE_TRANSFER,
    PERMISSIONS.LOGISTICS_ASSIGN,
    PERMISSIONS.PICKUP_MANAGE,
    PERMISSIONS.MARKET_SEARCH,
    PERMISSIONS.UPLOAD_CREATE,
    PERMISSIONS.UPLOAD_READ_OWN,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
  ],
  [ROLES.OPERATIONS_ADMIN]: [...OPERATIONS_ADMIN_PERMISSIONS],
  [ROLES.PLATFORM_ADMIN]: [...OPERATIONS_ADMIN_PERMISSIONS, PERMISSIONS.ADMIN_AUDIT],
  [ROLES.FINANCE_PARTNER]: [
    PERMISSIONS.AUTH_SESSION,
    PERMISSIONS.CATALOGUE_READ,
    PERMISSIONS.FINANCE_CASE_VIEW_CONSENTED,
    PERMISSIONS.FINANCE_CASE_UPDATE_CONSENTED,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
  ],
};

export const PUBLIC_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.CATALOGUE_READ,
  PERMISSIONS.MARKET_SEARCH,
  PERMISSIONS.LOT_VIEW_PUBLIC,
];

// ---------------------------------------------------------------------------
// Grades
// ---------------------------------------------------------------------------
export const GRADE = {
  UNGRADED: 'UNGRADED',
  A1: 'A1',
  A2: 'A2',
  B: 'B',
  C: 'C',
} as const;
export type Grade = (typeof GRADE)[keyof typeof GRADE];
export const GRADE_ORDER: Grade[] = [GRADE.A1, GRADE.A2, GRADE.B, GRADE.C];
export const GRADE_LABELS_EN: Record<Grade, string> = {
  [GRADE.UNGRADED]: 'Not graded',
  [GRADE.A1]: 'Grade A1',
  [GRADE.A2]: 'Grade A2',
  [GRADE.B]: 'Grade B',
  [GRADE.C]: 'Grade C',
};
export const GRADE_LABELS_HI: Record<Grade, string> = {
  [GRADE.UNGRADED]: 'ग्रेड नहीं हुआ',
  [GRADE.A1]: 'ग्रेड A1',
  [GRADE.A2]: 'ग्रेड A2',
  [GRADE.B]: 'ग्रेड B',
  [GRADE.C]: 'ग्रेड C',
};

// ---------------------------------------------------------------------------
// Produce / decision states
// ---------------------------------------------------------------------------
export const FARMER_DECISION = {
  SELL_NOW: 'SELL_NOW',
  HOLD: 'HOLD',
  REQUEST_QUOTE: 'REQUEST_QUOTE',
  LIST_FOR_BUYERS: 'LIST_FOR_BUYERS',
} as const;
export type FarmerDecision = (typeof FARMER_DECISION)[keyof typeof FARMER_DECISION];

// ---------------------------------------------------------------------------
// Pricing / rules metadata
// ---------------------------------------------------------------------------
export const PRICING_RULES_VERSION = 'price-rules-v1';
export const PRICING_DISCLAIMER =
  'Recommendation only, not a price guarantee. Based on sample/simulated market data for the demo.';
export const DEMO_DATA_LABEL =
  'DEMO — All prices, forecasts and finance outcomes are sample data for demonstration only.';
export const ONDC_READY_LABEL = 'ONDC-ready (sandbox/mock adapter; not ONDC certified)';
export const MSP_CONFIG_KEY = 'msp.minimum_support_prices';
export const PRICING_POLICY_KEY = 'pricing.policy';
export const DEFAULT_CURRENCY = 'INR';
export const MAX_RESERVATION_TTL_SECONDS = 24 * 60 * 60; // reservations expire after 24h
export const DEFAULT_RESERVATION_TTL_SECONDS = 4 * 60 * 60; // bulk reservations default 4h
export const MAX_INTIME_GRACE_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Ranges / limits
// ---------------------------------------------------------------------------
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;
export const OTP_LENGTH = 6;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_UPLOAD_FILES_PER_LOT = 12;
export const MAX_PAGE_SIZE = 100;
export const SEARCH_MIN_CHARS = 2;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const LANGS = ['en', 'hi', 'pa', 'mr', 'te', 'ta'] as const;
export type Lang = (typeof LANGS)[number];

export const AUTH_SECURE_ACTIONS = ['sell', 'finance', 'delete_account', 'refund'] as const;
export type AuthSecureAction = (typeof AUTH_SECURE_ACTIONS)[number];

/**
 * Indian states used by the pilot.
 */
export const STATES = ['RJ', 'MH', 'DL', 'UP', 'GJ', 'MP', 'HR', 'PB', 'KA', 'TN', 'WB', 'OD'] as const;
export const PILOT_STATE = 'RJ' as const;