import { NextResponse } from 'next/server';
import {
  BUSINESS_TIER_CONFIGS,
  CONSUMER_TIER_CONFIGS,
  FARMER_TIER_CONFIGS,
} from '@/lib/server/monetization-domain';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      currency: 'INR',
      farmerPlans: Object.values(FARMER_TIER_CONFIGS).map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyFeeInr: plan.monthlyFeeInr,
        commissionRatePct: plan.commissionRatePct,
        minSalesVolumeThresholdInr: plan.minSalesVolumeThresholdInr,
        features: plan.features,
      })),
      businessPlans: Object.values(BUSINESS_TIER_CONFIGS).map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyFeeInr: plan.monthlyFeeInr,
        yearlyFeeInr: plan.yearlyFeeInr,
        entitlements: Array.from(plan.entitlements),
        description: plan.description,
      })),
      consumerPlans: Object.values(CONSUMER_TIER_CONFIGS).map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyFeeInr: plan.monthlyFeeInr,
        yearlyFeeInr: plan.yearlyFeeInr,
        deliveryDiscountInr: plan.deliveryDiscountInr,
        freeDeliveryThresholdInr: plan.freeDeliveryThresholdInr,
        hasTraceabilityPassport: plan.hasTraceabilityPassport,
        hasPrioritySupport: plan.hasPrioritySupport,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to load plans' },
      { status: 500 }
    );
  }
}
