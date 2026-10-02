import { z } from 'zod';
import {
  EMAIL_REGEX,
  GRADE,
  LANGS,
  MAX_PAGE_SIZE,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES_PER_LOT,
  OTP_LENGTH,
  PHONE_REGEX,
} from '../constants';

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------
export const idSchema = z.string().min(1).max(64);
export const ulidSchema = idSchema;
export const phoneSchema = z.string().regex(PHONE_REGEX, 'Must be a valid 10-digit Indian mobile number');
export const emailSchema = z.string().regex(EMAIL_REGEX, 'Invalid email address').max(254);
export const langSchema = z.enum(LANGS);
export const gradeSchema = z.enum([
  GRADE.UNGRADED,
  GRADE.A1,
  GRADE.A2,
  GRADE.B,
  GRADE.C,
]);
export const decimalSchema = z.number().finite();
export const quantitySchema = z
  .number()
  .positive('Quantity must be positive')
  .max(1_000_000, 'Quantity too large');
export const priceSchema = z.number().nonnegative('Price must be non-negative').max(1_000_000);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});

export const otpRequestSchema = z.object({
  identifier: z.string().min(3).max(254),
  channel: z.enum(['phone', 'email']),
  purpose: z.enum(['LOGIN', 'SECURE_ACTION']).default('LOGIN'),
  lang: langSchema.optional(),
});

export const otpVerifySchema = z
  .object({
    identifier: z.string().min(3).max(254),
    channel: z.enum(['phone', 'email']),
    code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `OTP must be ${OTP_LENGTH} digits`),
    purpose: z.enum(['LOGIN', 'SECURE_ACTION']).default('LOGIN'),
    actionContext: z
      .object({
        action: z.enum(['sell', 'finance', 'delete_account', 'refund']),
        resourceId: z.string().min(1),
      })
      .optional(),
  })
  .refine((v) => v.purpose !== 'SECURE_ACTION' || !!v.actionContext, {
    message: 'actionContext required for SECURE_ACTION',
  });

export const demoLoginSchema = z.object({
  role: z.enum([
    'farmer',
    'consumer',
    'bulk_buyer',
    'warehouse_operator',
    'operations_admin',
    'platform_admin',
    'finance_partner',
  ]),
  phone: phoneSchema.optional(),
  lang: langSchema.optional(),
});

export const refreshSessionSchema = z.object({
  nonce: z.string().min(8),
});

// ---------------------------------------------------------------------------
// Farmer
// ---------------------------------------------------------------------------
export const declareProduceSchema = z.object({
  cropId: idSchema,
  varietyId: idSchema,
  estimatedQuantityKg: quantitySchema,
  expectedHarvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  preferredCluster: z.string().min(3).max(200),
  preferredLanguage: langSchema.default('hi'),
});

export const pickupRequestSchema = z
  .object({
    cropId: idSchema,
    varietyId: idSchema,
    quantityKg: quantitySchema,
    warehouseId: idSchema.optional(),
    scheduledWindow: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => v.scheduledWindow === undefined || z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/).safeParse(v.scheduledWindow).success, {
    message: 'scheduledWindow must be ISO datetime',
    path: ['scheduledWindow'],
  });

export const lotDecisionSchema = z.object({
  lotId: idSchema,
  decision: z.enum(['SELL_NOW', 'HOLD', 'REQUEST_QUOTE', 'LIST_FOR_BUYERS']),
  note: z.string().max(500).optional(),
});

export const enwrEnquirySchema = z.object({
  lotId: idSchema.optional(),
  reason: z.string().min(3).max(500),
  requestedAmountRs: priceSchema.optional(),
});

export const consentGrantSchema = z.object({
  type: z.enum(['FINANCE_E_NWR', 'DATA_SHARING', 'MARKETING', 'PRIVACY_POLICY']),
  version: z.string().min(1),
  dataFields: z.array(z.string()).max(50).default([]),
  expiresAt: z.string().datetime().optional(),
});

export const consentRevokeSchema = z.object({
  consentId: idSchema,
  reason: z.string().max(300).optional(),
});

export const financeCaseCreateSchema = z
  .object({
    consentId: idSchema,
    lotId: idSchema.optional(),
    reason: z.string().min(3).max(1000),
    requestedAmountRs: priceSchema.optional(),
    durationMonths: z.coerce.number().int().min(1).max(36).optional(),
  })
  .refine((v) => !!v.consentId, { message: 'consentId required' });

// ---------------------------------------------------------------------------
// Warehouse / intake / grading
// ---------------------------------------------------------------------------
export const intakeSchema = z
  .object({
    farmerId: idSchema,
    cropId: idSchema,
    varietyId: idSchema,
    warehouseId: idSchema,
    storageLocationId: idSchema,
    sourceCluster: z.string().min(3).max(200),
    grossWeightKg: z.number().positive().max(100000),
    tareWeightKg: z.number().nonnegative().max(100000),
    intakeAt: z.string().datetime().optional(),
    note: z.string().max(500).optional(),
  })
  .refine((v) => v.grossWeightKg > v.tareWeightKg, {
    message: 'gross weight must exceed tare weight',
    path: ['grossWeightKg'],
  });

export const offlineIntakeSyncSchema = z.object({
  deviceId: z.string().min(4).max(64),
  idempotencyKey: z.string().min(8).max(128),
  payload: intakeSchema,
  capturedAt: z.string().datetime(),
});

export const gradeConfirmationSchema = z
  .object({
    lotId: idSchema,
    confirmedGrade: gradeSchema,
    gradingRunId: idSchema.optional(),
    source: z.enum(['MANUAL', 'MODEL']),
    overrideReason: z.string().max(500).optional(),
    remarks: z.string().max(1000).optional(),
  })
  .refine(
    (v) => {
      if (v.source !== 'MANUAL') return true;
      return v.overrideReason !== undefined && v.overrideReason.trim().length >= 3;
    },
    {
      message: 'overrideReason (min 3 chars) is required when MANUAL grade is confirmed',
      path: ['overrideReason'],
    },
  );

export const gradingRunSchema = z.object({
  lotId: idSchema,
  imageIds: z.array(idSchema).min(1).max(MAX_UPLOAD_FILES_PER_LOT),
});

export const inventoryCorrectionSchema = z
  .object({
    lotId: idSchema,
    type: z.enum(['CORRECTION', 'SPOILAGE', 'LOSS', 'TRANSFER']),
    quantityDeltaKg: z.number().finite(), // signed: -amount reduces stock
    targetStorageLocationId: idSchema.optional(),
    reason: z.string().min(3).max(500),
    idempotencyKey: z.string().min(8).max(128),
  })
  .refine((v) => (v.type === 'TRANSFER' ? !!v.targetStorageLocationId : true), {
    message: 'targetStorageLocationId required for TRANSFER',
    path: ['targetStorageLocationId'],
  });

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------
export const uploadPreflightSchema = z.object({
  lotId: idSchema.optional(),
  kind: z.enum(['INTAKE', 'GRADING', 'DOCUMENT', 'POD', 'DISPUTE']),
  mime: z.string().regex(/^[a-z]+\/[a-z0-9.+-]+$/, 'invalid mime'),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  fileName: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^"\\/:*?"<>|\u0000-\u001f]+$/, 'invalid filename'),
});

// ---------------------------------------------------------------------------
// Market / consumer
// ---------------------------------------------------------------------------
export const marketSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  cropId: idSchema.optional(),
  varietyId: idSchema.optional(),
  grade: gradeSchema.optional(),
  warehouseId: idSchema.optional(),
  state: z.string().length(2).optional(),
  maxPrice: priceSchema.optional(),
  minQtyKg: z.number().positive().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().positive().max(500).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'freshness', 'nearest']).default('freshness'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(24),
});

export const cartAddSchema = z.object({
  lotId: idSchema,
  quantityKg: quantitySchema,
});

export const checkoutSchema = z.object({
  cartItemIds: z.array(idSchema).min(1).max(50),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  slotId: idSchema.optional(),
  address: z
    .object({
      fullName: z.string().min(2).max(120),
      phone: phoneSchema,
      line1: z.string().min(3).max(250),
      line2: z.string().max(250).optional(),
      city: z.string().min(2).max(120),
      state: z.string().length(2),
      pinCode: z.string().regex(/^\d{6}$/, '6-digit PIN code'),
    })
    .optional(),
  idempotencyKey: z.string().min(8).max(128),
});

export const paySchema = z.object({
  orderId: idSchema,
  provider: z.enum(['mock']).default('mock'), // replace with real providers later
});

export const disputeCreateSchema = z.object({
  orderId: idSchema,
  reason: z.string().min(5).max(1000),
  type: z.enum(['PRODUCT', 'DELIVERY', 'PAYMENT', 'QUANTITY', 'OTHER']),
});

export const reviewCreateSchema = z.object({
  orderItemId: idSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ---------------------------------------------------------------------------
// Bulk buyer
// ---------------------------------------------------------------------------
export const rfqCreateSchema = z
  .object({
    cropId: idSchema,
    varietyId: idSchema.optional(),
    targetGrade: gradeSchema,
    quantityKg: z.number().int().positive().min(50).max(1_000_000),
    maxPricePerKg: priceSchema,
    targetWarehouseId: idSchema.optional(),
    negotiateDeadlineAt: z.string().datetime().optional(),
    note: z.string().max(1000).optional(),
  })
  .refine((v) => v.maxPricePerKg > 0, { message: 'maxPricePerKg must be > 0', path: ['maxPricePerKg'] });

export const negotiationSchema = z.object({
  rfqId: idSchema,
  lotId: idSchema.optional(),
  warehouseId: idSchema.optional(),
  proposedPricePerKg: priceSchema,
  quantityKg: quantitySchema.optional(),
  message: z.string().max(1000).optional(),
});

export const reserveSchema = z.object({
  lotId: idSchema,
  quantityKg: quantitySchema,
  channel: z.enum(['CONSUMER', 'BULK']).default('BULK'),
  ttlSeconds: z.number().int().min(60).max(86400).optional(),
  reference: z.string().max(100).optional(),
});

export const buyerOnboardSchema = z.object({
  legalName: z.string().min(2).max(200),
  gstin: z.string().regex(/^[0-9A-Z]{15}$/, 'Invalid 15-char GSTIN'),
  address: z.string().min(5).max(300),
  contactPerson: z.string().min(2).max(120),
  contactPhone: phoneSchema,
  contactEmail: emailSchema,
  category: z.enum(['RETAILER', 'PROCESSOR', 'EXPORTER', 'HORECA', 'GOVERNMENT', 'WHOLESALER', 'OTHER']),
  certDocs: z.array(idSchema).max(10).optional(),
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export const verificationDecisionSchema = z.object({
  targetType: z.enum(['USER', 'ORGANIZATION', 'FPO', 'WAREHOUSE']),
  targetId: idSchema,
  decision: z.enum(['VERIFIED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().min(3).max(500),
});

export const settingsUpdateSchema = z.record(z.string(), z.unknown());

export const cropUpsertSchema = z.object({
  id: idSchema.optional(),
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(120),
  nameHi: z.string().min(1).max(120),
  category: z.string().min(2).max(80),
  emoji: z.string().max(8).optional(),
  season: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const priceRuleSchema = z.object({
  cropId: idSchema,
  grade: gradeSchema,
  baseLowRs: priceSchema,
  baseHighRs: priceSchema,
  mspRs: priceSchema.optional(), // Minimum Support Price (configurable)
  demandFactorBps: z.number().int().min(-10000).max(10000).default(0),
  supplyFactorBps: z.number().int().min(-10000).max(10000).default(0),
  seasonFactorBps: z.number().int().min(-10000).max(10000).default(0),
  stockAgeFactorBps: z.number().int().min(-10000).max(10000).default(0),
  isActive: z.boolean().default(true),
  version: z.string().default('price-rules-v1'),
});

export const notificationTemplateSchema = z.object({
  key: z.string().min(3).max(80),
  channel: z.enum(['SMS', 'EMAIL', 'PUSH', 'IVR']),
  variants: z.record(z.string(), z.object({ subject: z.string().max(200), body: z.string().max(2000) })),
  isActive: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Finance partner
// ---------------------------------------------------------------------------
export const financeStatusEventSchema = z.object({
  caseId: idSchema,
  status: z.enum([
    'DRAFT',
    'AWAITING_CONSENT',
    'ELIGIBILITY_CHECK',
    'CONSENTED',
    'SHARED_WITH_PARTNER',
    'UNDER_PARTNER_REVIEW',
    'APPROVED_BY_PARTNER',
    'DECLINED',
    'CLOSED',
  ]),
  note: z.string().max(1000).optional(),
});

// ---------------------------------------------------------------------------
// IVR / webhooks / privacy
// ---------------------------------------------------------------------------
export const ivrSessionStartSchema = z.object({
  phone: phoneSchema,
  callSid: z.string().max(64),
});

export const ivrIntentSchema = z.object({
  sessionId: idSchema,
  phrase: z.string().min(1).max(500),
});

export const ivrConfirmSchema = z.object({
  sessionId: idSchema,
  pin: z.string().regex(/^\d{6}$/),
});

export const webhookEventSchema = z
  .object({
    id: z.string().min(1).max(128),
    timestamp: z.string().datetime(),
    nonce: z.string().min(16).max(256),
    type: z.string().min(1).max(100),
    payload: z.record(z.string(), z.unknown()).default({}),
  })
  .required();

export const webhookSignatureSchema = z.object({
  signature: z.string().regex(/^[0-9a-f]{64}$/, 'v1 HMAC-SHA256 hex signature'),
  signatureVersion: z.literal('v1'),
});

export const exportRequestSchema = z.object({
  sections: z.array(z.enum(['profile', 'lots', 'orders', 'finance', 'activity'])).min(1),
});

export const deletionRequestSchema = z.object({
  confirmText: z.literal('DELETE'),
});

export type OtpRequest = z.infer<typeof otpRequestSchema>;
export type OtpVerify = z.infer<typeof otpVerifySchema>;
export type DemoLoginInput = z.infer<typeof demoLoginSchema>;
export type GradeConfirmation = z.infer<typeof gradeConfirmationSchema>;
export type WebhookEvent = z.infer<typeof webhookEventSchema>;