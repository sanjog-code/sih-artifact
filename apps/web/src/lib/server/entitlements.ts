import {
  BUSINESS_TIER_CONFIGS,
  BusinessEntitlement,
  BusinessPlanTier,
  hasBusinessEntitlement,
} from './monetization-domain';

export interface EntitlementCheckResult {
  allowed: boolean;
  requiredPlanToUnlock?: BusinessPlanTier;
  reason?: string;
}

/**
 * Validates whether the given business buyer's plan possesses the requested entitlement.
 */
export function checkBusinessFeatureAccess(
  plan: BusinessPlanTier,
  feature: BusinessEntitlement
): EntitlementCheckResult {
  const allowed = hasBusinessEntitlement(plan, feature);
  if (allowed) {
    return { allowed: true };
  }

  // Find the lowest tier that grants this feature
  let requiredPlan: BusinessPlanTier = 'growth';
  for (const tier of ['growth', 'pro', 'enterprise'] as BusinessPlanTier[]) {
    if (BUSINESS_TIER_CONFIGS[tier].entitlements.has(feature)) {
      requiredPlan = tier;
      break;
    }
  }

  return {
    allowed: false,
    requiredPlanToUnlock: requiredPlan,
    reason: `Feature "${feature}" is restricted to ${BUSINESS_TIER_CONFIGS[requiredPlan].name} and above. Your current plan is ${BUSINESS_TIER_CONFIGS[plan]?.name || plan}.`,
  };
}

/**
 * Server guard that throws an error if access is denied.
 */
export function enforceBusinessFeature(
  plan: BusinessPlanTier,
  feature: BusinessEntitlement
): void {
  const result = checkBusinessFeatureAccess(plan, feature);
  if (!result.allowed) {
    const error = new Error(result.reason);
    (error as unknown as { statusCode: number }).statusCode = 403;
    throw error;
  }
}
