import type { AUTH_SECURE_ACTIONS as AUTH_SECURE_ACTIONS_CONST, FARMER_DECISION, Grade, Role } from '../constants';

// ---------------------------------------------------------------------------
// Auth / session
// ---------------------------------------------------------------------------
export interface SessionUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string;
  role: Role;
  lang: 'en' | 'hi';
  status: string;
  organizationId?: string | null;
}

export type SecureAction = (typeof AUTH_SECURE_ACTIONS_CONST)[number];

export type SecureActionContext = {
  action: SecureAction;
  resourceId: string;
};

// ---------------------------------------------------------------------------
// Farmer
// ---------------------------------------------------------------------------
export interface FarmerDeclareInput {
  cropId: string;
  varietyId: string;
  estimatedQuantityKg: number;
  expectedHarvestDate: string;
  preferredCluster: string;
}

export interface PickupRequestInput {
  cropId: string;
  varietyId: string;
  quantityKg: number;
  warehouseId?: string;
  scheduledWindow?: string;
  notes?: string;
}

export interface LotDecisionInput {
  lotId: string;
  decision: (typeof FARMER_DECISION)[keyof typeof FARMER_DECISION];
  note?: string;
}

// ---------------------------------------------------------------------------
// Warehouse intake
// ---------------------------------------------------------------------------
export interface IntakeInput {
  farmerId: string;
  cropId: string;
  varietyId: string;
  warehouseId: string;
  storageLocationId: string;
  sourceCluster: string;
  grossWeightKg: number;
  tareWeightKg: number;
  intakeAt?: string;
  note?: string;
}

export interface GradeConfirmationInput {
  lotId: string;
  confirmedGrade: Grade;
  gradingRunId?: string;
  source: 'MANUAL' | 'MODEL';
  overrideReason?: string; // required when MANUAL differs from model candidate
  remarks?: string;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
export interface ReserveStockInput {
  lotId: string;
  quantityKg: number;
  channel: 'CONSUMER' | 'BULK';
  ttlSeconds?: number;
  reference?: string;
}

// ---------------------------------------------------------------------------
// Market / orders
// ---------------------------------------------------------------------------
export interface CartAddInput {
  lotId: string;
  quantityKg: number;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface CheckoutInput {
  cartItemIds: string[];
  deliveryType: 'PICKUP' | 'DELIVERY';
  slotId?: string;
  address?: AddressInput;
}

export interface DisputeInput {
  orderId: string;
  reason: string;
  type: 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'QUANTITY' | 'OTHER';
}

export interface ReviewInput {
  orderItemId: string;
  rating: number; // 1..5
  comment?: string;
}

// ---------------------------------------------------------------------------
// Bulk buyer
// ---------------------------------------------------------------------------
export interface RfqCreateInput {
  cropId: string;
  varietyId?: string;
  targetGrade: Grade;
  quantityKg: number;
  maxPricePerKg: number;
  targetWarehouseId?: string;
  negotiateDeadlineAt?: string;
  note?: string;
}

export interface NegotiationInput {
  rfqId: string;
  lotId?: string;
  warehouseId?: string;
  proposedPricePerKg: number;
  quantityKg?: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------
export interface FinanceConsentInput {
  version: string;
  dataFields: string[];
  expiresAt?: string;
}

export interface FinanceCaseCreateInput {
  consentId: string;
  lotId?: string;
  reason: string;
  requestedAmountRs?: number;
  durationMonths?: number;
}

// ---------------------------------------------------------------------------
// Pricing insight
// ---------------------------------------------------------------------------
export type DemandSignal = 'LOW' | 'NORMAL' | 'HIGH' | 'VERY_HIGH';

export interface PriceInsightInput {
  cropId: string;
  varietyId?: string;
  grade: Grade;
  state: string;
  district?: string;
  season?: string;
  stockAgeDays?: number;
  stockQuantityKg?: number;
}

export interface PricingFactor {
  key: string;
  label: string;
  direction: 'up' | 'down' | 'neutral';
  contributionBps: number;
  explanation: string;
}

export interface PriceInsightResult {
  cropId: string;
  varietyId?: string;
  grade: Grade;
  state: string;
  suggestedLowRs: number;
  suggestedHighRs: number;
  demandSignal: DemandSignal;
  recommendSell: boolean;
  considerHold: boolean;
  factors: PricingFactor[];
  confidence: number; // 0..1
  dataFreshnessMinutes: number;
  ruleVersion: string;
  disclaimer: string;
  generatedAt: string;
  inputs: PriceInsightInput;
}

// Market snapshot shape, identical to what the mock provider returns.
export interface MarketSnapshot {
  demandIndex: number; // 0..100
  supplyIndex: number; // 0..100
  recentAvgRs: number;
  trendPct: number; // recent week vs prior week, + is rising
  freshnessMinutes: number;
  spotQuality: { defectPct: number; pestPressure: number };
  qualityNote: string;
}

// ---------------------------------------------------------------------------
// Notifications / IVR
// ---------------------------------------------------------------------------
export type IvrIntent =
  | 'PRICE_INSIGHT'
  | 'STOCK_STATUS'
  | 'PICKUP_REQUEST'
  | 'ORDER_STATUS'
  | 'HUMAN_SUPPORT';

export interface IvrHandoff {
  callSid: string;
  fromPhone: string;
  intent: IvrIntent;
  transcript: string;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------
export interface WebhookEnvelope {
  id: string;
  timestamp: string; // ISO, used for replay detection
  nonce: string;
  type: string;
  payload: Record<string, unknown>;
  signature: string; // hex HMAC-SHA256
  signatureVersion: 'v1';
}

// ---------------------------------------------------------------------------
// Privacy
// ---------------------------------------------------------------------------
export type RetentionPeriod = '7d' | '30d' | '90d' | '1y' | '3y';

export interface ExportManifest {
  userId: string;
  exportedAt: string;
  sections: string[];
  objectKey: string;
}

export type { Grade, Role } from '../constants';