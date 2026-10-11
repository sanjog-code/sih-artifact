import { NextRequest, NextResponse } from 'next/server';
import {
  BUSINESS_TIER_CONFIGS,
  BusinessPlanTier,
  CONSUMER_TIER_CONFIGS,
  ConsumerPlanTier,
  calculateOrderFinancials,
} from '@/lib/server/monetization-domain';
import { getPaymentProvider } from '@/lib/server/payments/provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, planCode, billingInterval = 'monthly', items, consumerPlan = 'basic', customerPhone, customerName } = body;
    const provider = getPaymentProvider();

    if (type === 'SUBSCRIPTION') {
      let amountInr = 0;
      let planName = '';

      if (planCode in BUSINESS_TIER_CONFIGS) {
        const config = BUSINESS_TIER_CONFIGS[planCode as BusinessPlanTier];
        amountInr = billingInterval === 'annual' ? config.yearlyFeeInr : config.monthlyFeeInr;
        planName = config.name;
      } else if (planCode in CONSUMER_TIER_CONFIGS) {
        const config = CONSUMER_TIER_CONFIGS[planCode as ConsumerPlanTier];
        amountInr = billingInterval === 'annual' ? config.yearlyFeeInr : config.monthlyFeeInr;
        planName = config.name;
      } else {
        return NextResponse.json({ success: false, error: 'Invalid subscription plan code' }, { status: 400 });
      }

      const receipt = `sub_rcpt_${Date.now()}`;
      const paymentOrder = await provider.createOrder({
        amountInr,
        receipt,
        customerName: customerName || 'FarmLink Subscriber',
        customerPhone: customerPhone || '9876543210',
        notes: {
          type: 'SUBSCRIPTION',
          planCode,
          billingInterval,
        },
      });

      return NextResponse.json({
        success: true,
        type: 'SUBSCRIPTION',
        planCode,
        planName,
        billingInterval,
        amountInr,
        currency: 'INR',
        paymentOrder,
        feeDisclosure: [
          { label: `${planName} (${billingInterval})`, amountInr },
          { label: 'Platform GST (Inclusive)', amountInr: Math.round(amountInr * 0.18 * 100) / 100 },
          { label: 'Total Payable', amountInr },
        ],
      });
    }

    if (type === 'MARKETPLACE_ORDER') {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
      }

      const financials = calculateOrderFinancials({
        items,
        consumerPlan,
      });

      const receipt = `ord_rcpt_${Date.now()}`;
      const paymentOrder = await provider.createOrder({
        amountInr: financials.totalPayableInr,
        receipt,
        customerName: customerName || 'Marketplace Buyer',
        customerPhone: customerPhone || '9876543210',
        notes: {
          type: 'MARKETPLACE_ORDER',
          itemCount: String(items.length),
        },
      });

      return NextResponse.json({
        success: true,
        type: 'MARKETPLACE_ORDER',
        financials,
        paymentOrder,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported checkout type' }, { status: 400 });
  } catch (error) {
    console.error('[MonetizationCheckout] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal checkout error' },
      { status: 500 }
    );
  }
}
