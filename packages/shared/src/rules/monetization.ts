/**
 * FarmLink Premier — Monetization & Entitlement Rules Engine
 *
 * All financial rules, commission percentages, B2B entitlements, and consumer
 * discounts are strictly computed here.
 * NEVER allow AI to mutate, decide, or override pricing, commissions, or entitlements.
 */

// ---------------------------------------------------------------------------
// 1. Farmer Commission Tiers & Rules
// ---------------------------------------------------------------------------

export const FARMER_PLAN_TIERS = {
  BASIC: 'basic',
  PREMIER: 'premier',
  PREMIER_PRO: 'premier_pro',
  PREMIER_ELITE: 'premier_elite',
} as const;

export type FarmerPlanTier = (typeof FARMER_PLAN_TIERS)[keyof typeof FARMER_PLAN_TIERS];

export interface FarmerTierConfig {
  id: FarmerPlanTier;
  name: string;
  monthlyFeeInr: number; // Always ₹0
  commissionRatePct: number; // 5%, 4%, 3%, 2%
  commissionFraction: number; // 0.05, 0.04, 0.03, 0.02
  minSalesVolumeThresholdInr: number; // For automatic rule progression
  features: string[];
}

export const FARMER_TIER_CONFIGS: Record<FarmerPlanTier, FarmerTierConfig> = {
  basic: {
    id: 'basic',
    name: 'Basic Farmer',
    monthlyFeeInr: 0,
    commissionRatePct: 5,
    commissionFraction: 0.05,
    minSalesVolumeThresholdInr: 0,
    features: [
      'Standard marketplace listing',
      'APMC/Mandi benchmark pricing guide',
      'UPI & NEFT escrow direct payout',
      'Basic SMS dispatch alerts',
    ],
  },
  premier: {
    id: 'premier',
    name: 'Premier Farmer',
    monthlyFeeInr: 0,
    commissionRatePct: 4,
    commissionFraction: 0.04,
    minSalesVolumeThresholdInr: 50_000,
    features: [
      'All Basic features',
      'Verified regional buyer demand signals',
      'Aggregation hub matching priority',
      'Digital produce quality summary',
    ],
  },
  premier_pro: {
    id: 'premier_pro',
    name: 'Premier Pro Farmer',
    monthlyFeeInr: 0,
    commissionRatePct: 3,
    commissionFraction: 0.03,
    minSalesVolumeThresholdInr: 200_000,
    features: [
      'All Premier features',
      'AI Listing Copilot assistance (drafting & tags)',
      '14-day price trajectory projections',
      'Promotional placement on buyer feed',
      'Priority logistics collection window',
    ],
  },
  premier_elite: {
    id: 'premier_elite',
    name: 'Premier Elite Farmer',
    monthlyFeeInr: 0,
    commissionRatePct: 2,
    commissionFraction: 0.02,
    minSalesVolumeThresholdInr: 500_000,
    features: [
      'All Premier Pro features',
      'Institutional B2B direct-dispatch contracts',
      'Dedicated agricultural desk advisor',
      'Custom palletization & cold-chain coordination',
      'Zero-wait T+1 escrow settlement guarantee',
    ],
  },
};

/**
 * Calculates farmer platform commission and net payout for an order line item.
 */
export function calculateFarmerPayout(
  grossAmountInr: number,
  tier: FarmerPlanTier = 'basic'
): {
  grossAmountInr: number;
  commissionRatePct: number;
  commissionAmountInr: number;
  netPayoutInr: number;
} {
  if (grossAmountInr < 0) {
    throw new Error('Gross amount cannot be negative');
  }
  const config = FARMER_TIER_CONFIGS[tier] || FARMER_TIER_CONFIGS.basic;
  const commissionAmountInr = Math.round(grossAmountInr * config.commissionFraction * 100) / 100;
  const netPayoutInr = Math.round((grossAmountInr - commissionAmountInr) * 100) / 100;

  return {
    grossAmountInr,
    commissionRatePct: config.commissionRatePct,
    commissionAmountInr,
    netPayoutInr,
  };
}

/**
 * Evaluates whether a farmer qualifies for an upgraded tier based on historical sales volume.
 * Must be executed by auditable backend worker, NEVER by AI.
 */
export function evaluateFarmerTierProgression(cumulativeCompletedSalesInr: number): FarmerPlanTier {
  if (cumulativeCompletedSalesInr >= FARMER_TIER_CONFIGS.premier_elite.minSalesVolumeThresholdInr) {
    return 'premier_elite';
  }
  if (cumulativeCompletedSalesInr >= FARMER_TIER_CONFIGS.premier_pro.minSalesVolumeThresholdInr) {
    return 'premier_pro';
  }
  if (cumulativeCompletedSalesInr >= FARMER_TIER_CONFIGS.premier.minSalesVolumeThresholdInr) {
    return 'premier';
  }
  return 'basic';
}

// ---------------------------------------------------------------------------
// 2. Business Buyer Subscription Tiers & Entitlements
// ---------------------------------------------------------------------------

export const BUSINESS_PLAN_TIERS = {
  STARTER: 'starter',
  GROWTH: 'growth',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type BusinessPlanTier = (typeof BUSINESS_PLAN_TIERS)[keyof typeof BUSINESS_PLAN_TIERS];

export type BusinessEntitlement =
  | 'buyer:basic_search'
  | 'buyer:order_management'
  | 'buyer:single_depot'
  | 'buyer:multi_supplier_sourcing'
  | 'buyer:recurring_orders'
  | 'buyer:supplier_performance_analytics'
  | 'buyer:multi_depot_routing'
  | 'buyer:consolidated_audit_reports'
  | 'buyer:priority_dispatch'
  | 'buyer:custom_erp_integrations'
  | 'buyer:dedicated_account_desk';

export interface BusinessTierConfig {
  id: BusinessPlanTier;
  name: string;
  monthlyFeeInr: number;
  yearlyFeeInr: number;
  entitlements: Set<BusinessEntitlement>;
  description: string;
}

export const BUSINESS_TIER_CONFIGS: Record<BusinessPlanTier, BusinessTierConfig> = {
  starter: {
    id: 'starter',
    name: 'Business Starter',
    monthlyFeeInr: 4_999,
    yearlyFeeInr: 49_990,
    entitlements: new Set<BusinessEntitlement>([
      'buyer:basic_search',
      'buyer:order_management',
      'buyer:single_depot',
    ]),
    description: 'Essential procurement tools for independent restaurants and small retailers.',
  },
  growth: {
    id: 'growth',
    name: 'Business Growth',
    monthlyFeeInr: 9_999,
    yearlyFeeInr: 99_990,
    entitlements: new Set<BusinessEntitlement>([
      'buyer:basic_search',
      'buyer:order_management',
      'buyer:single_depot',
      'buyer:multi_supplier_sourcing',
      'buyer:recurring_orders',
      'buyer:supplier_performance_analytics',
    ]),
    description: 'Multi-supplier sourcing & automated recurring orders for growing chains.',
  },
  pro: {
    id: 'pro',
    name: 'Business Pro',
    monthlyFeeInr: 19_999,
    yearlyFeeInr: 199_990,
    entitlements: new Set<BusinessEntitlement>([
      'buyer:basic_search',
      'buyer:order_management',
      'buyer:single_depot',
      'buyer:multi_supplier_sourcing',
      'buyer:recurring_orders',
      'buyer:supplier_performance_analytics',
      'buyer:multi_depot_routing',
      'buyer:consolidated_audit_reports',
      'buyer:priority_dispatch',
    ]),
    description: 'Multi-depot routing and consolidated audit reports for regional processors.',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyFeeInr: 49_999,
    yearlyFeeInr: 499_990,
    entitlements: new Set<BusinessEntitlement>([
      'buyer:basic_search',
      'buyer:order_management',
      'buyer:single_depot',
      'buyer:multi_supplier_sourcing',
      'buyer:recurring_orders',
      'buyer:supplier_performance_analytics',
      'buyer:multi_depot_routing',
      'buyer:consolidated_audit_reports',
      'buyer:priority_dispatch',
      'buyer:custom_erp_integrations',
      'buyer:dedicated_account_desk',
    ]),
    description: 'Custom ERP integrations, tailored SLAs, and dedicated agri-procurement desk.',
  },
};

/**
 * Server-enforced entitlement checker for B2B buyer features.
 */
export function hasBusinessEntitlement(
  plan: BusinessPlanTier,
  entitlement: BusinessEntitlement
): boolean {
  const config = BUSINESS_TIER_CONFIGS[plan];
  if (!config) return false;
  return config.entitlements.has(entitlement);
}

/**
 * Guard that throws a detailed error if the plan lacks the required entitlement.
 */
export function assertBusinessEntitlement(
  plan: BusinessPlanTier,
  entitlement: BusinessEntitlement
): void {
  if (!hasBusinessEntitlement(plan, entitlement)) {
    throw new Error(
      `Entitlement Denied: Plan "${plan}" does not grant access to feature "${entitlement}". Upgrade to an eligible tier to unlock.`
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Consumer Membership Tiers & Benefits
// ---------------------------------------------------------------------------

export const CONSUMER_PLAN_TIERS = {
  BASIC: 'basic',
  PREMIER: 'premier',
  PLUS: 'plus',
} as const;

export type ConsumerPlanTier = (typeof CONSUMER_PLAN_TIERS)[keyof typeof CONSUMER_PLAN_TIERS];

export interface ConsumerTierConfig {
  id: ConsumerPlanTier;
  name: string;
  monthlyFeeInr: number;
  yearlyFeeInr: number;
  deliveryDiscountInr: number;
  freeDeliveryThresholdInr?: number;
  hasTraceabilityPassport: boolean;
  hasPrioritySupport: boolean;
  hasEarlyHarvestDrops: boolean;
}

export const CONSUMER_TIER_CONFIGS: Record<ConsumerPlanTier, ConsumerTierConfig> = {
  basic: {
    id: 'basic',
    name: 'Consumer Basic',
    monthlyFeeInr: 0,
    yearlyFeeInr: 0,
    deliveryDiscountInr: 0,
    hasTraceabilityPassport: false,
    hasPrioritySupport: false,
    hasEarlyHarvestDrops: false,
  },
  premier: {
    id: 'premier',
    name: 'Consumer Premier',
    monthlyFeeInr: 99,
    yearlyFeeInr: 999,
    deliveryDiscountInr: 40, // ₹40 delivery fee discount per order
    hasTraceabilityPassport: true,
    hasPrioritySupport: false,
    hasEarlyHarvestDrops: false,
  },
  plus: {
    id: 'plus',
    name: 'Consumer Plus',
    monthlyFeeInr: 199,
    yearlyFeeInr: 1_999,
    deliveryDiscountInr: 40,
    freeDeliveryThresholdInr: 399, // 100% Free eco-delivery if order >= ₹399
    hasTraceabilityPassport: true,
    hasPrioritySupport: true,
    hasEarlyHarvestDrops: true,
  },
};

/**
 * Calculates delivery fee discount based on consumer membership tier.
 * Policy-driven, capped, and auditable.
 */
export function calculateConsumerDeliveryDiscount(
  subtotalInr: number,
  baseDeliveryFeeInr: number,
  plan: ConsumerPlanTier = 'basic'
): {
  baseDeliveryFeeInr: number;
  discountInr: number;
  finalDeliveryFeeInr: number;
  reason: string;
} {
  const config = CONSUMER_TIER_CONFIGS[plan] || CONSUMER_TIER_CONFIGS.basic;

  // Free delivery rule for Plus members above threshold
  if (config.freeDeliveryThresholdInr && subtotalInr >= config.freeDeliveryThresholdInr) {
    return {
      baseDeliveryFeeInr,
      discountInr: baseDeliveryFeeInr,
      finalDeliveryFeeInr: 0,
      reason: `Consumer Plus VIP: 100% Free delivery on orders over ₹${config.freeDeliveryThresholdInr}`,
    };
  }

  // Capped delivery discount for Premier/Plus below threshold
  const discountInr = Math.min(baseDeliveryFeeInr, config.deliveryDiscountInr);
  const finalDeliveryFeeInr = Math.max(0, baseDeliveryFeeInr - discountInr);

  return {
    baseDeliveryFeeInr,
    discountInr,
    finalDeliveryFeeInr,
    reason:
      discountInr > 0
        ? `${config.name} Benefit: ₹${discountInr} delivery discount applied`
        : 'Standard retail delivery fee',
  };
}

// ---------------------------------------------------------------------------
// 4. Order Total & Fee Breakdown Engine
// ---------------------------------------------------------------------------

export interface OrderItemCalculationInput {
  listingId: string;
  quantityKg: number;
  pricePerKg: number;
  farmerTier?: FarmerPlanTier;
}

export interface OrderFinancialSummary {
  subtotalInr: number;
  baseDeliveryFeeInr: number;
  deliveryDiscountInr: number;
  finalDeliveryFeeInr: number;
  platformCommissionTotalInr: number;
  totalPayableInr: number;
  items: {
    listingId: string;
    quantityKg: number;
    pricePerKg: number;
    itemSubtotalInr: number;
    farmerCommissionRatePct: number;
    farmerCommissionInr: number;
    netFarmerPayoutInr: number;
  }[];
  feeDisclosure: {
    label: string;
    amountInr: number;
  }[];
}

export function calculateOrderFinancials(params: {
  items: OrderItemCalculationInput[];
  consumerPlan?: ConsumerPlanTier;
  baseDeliveryFeeInr?: number;
}): OrderFinancialSummary {
  const baseDelivery = params.baseDeliveryFeeInr ?? 60;
  let subtotal = 0;
  let commissionTotal = 0;

  const calculatedItems = params.items.map((item) => {
    const itemSubtotal = Math.round(item.quantityKg * item.pricePerKg * 100) / 100;
    subtotal += itemSubtotal;

    const payout = calculateFarmerPayout(itemSubtotal, item.farmerTier ?? 'basic');
    commissionTotal += payout.commissionAmountInr;

    return {
      listingId: item.listingId,
      quantityKg: item.quantityKg,
      pricePerKg: item.pricePerKg,
      itemSubtotalInr: itemSubtotal,
      farmerCommissionRatePct: payout.commissionRatePct,
      farmerCommissionInr: payout.commissionAmountInr,
      netFarmerPayoutInr: payout.netPayoutInr,
    };
  });

  const deliveryCalc = calculateConsumerDeliveryDiscount(
    subtotal,
    baseDelivery,
    params.consumerPlan ?? 'basic'
  );

  const totalPayable = Math.round((subtotal + deliveryCalc.finalDeliveryFeeInr) * 100) / 100;

  const feeDisclosure = [
    { label: 'Produce Subtotal', amountInr: subtotal },
    { label: 'Standard Delivery Fee', amountInr: deliveryCalc.baseDeliveryFeeInr },
    ...(deliveryCalc.discountInr > 0
      ? [{ label: 'Membership Delivery Discount', amountInr: -deliveryCalc.discountInr }]
      : []),
    { label: 'Total Payable by Buyer', amountInr: totalPayable },
  ];

  return {
    subtotalInr: Math.round(subtotal * 100) / 100,
    baseDeliveryFeeInr: deliveryCalc.baseDeliveryFeeInr,
    deliveryDiscountInr: deliveryCalc.discountInr,
    finalDeliveryFeeInr: deliveryCalc.finalDeliveryFeeInr,
    platformCommissionTotalInr: Math.round(commissionTotal * 100) / 100,
    totalPayableInr: totalPayable,
    items: calculatedItems,
    feeDisclosure,
  };
}
