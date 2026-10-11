import { NextRequest, NextResponse } from 'next/server';
import { calculateOrderFinancials, ConsumerPlanTier, FarmerPlanTier } from '@/lib/server/monetization-domain';

export interface OrderItemInput {
  listingId: string;
  quantityKg: number;
  pricePerKg: number;
  farmerTier?: FarmerPlanTier;
}

const IN_MEMORY_ORDERS: Array<Record<string, unknown>> = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');

    let orders = [...IN_MEMORY_ORDERS];
    if (buyerId) {
      orders = orders.filter((o) => o.buyerId === buyerId);
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerId = 'buyer_user_01',
      buyerRole = 'consumer', // 'consumer' or 'buyer'
      consumerPlan = 'basic',
      items,
      deliveryAddress,
      paymentMethod = 'UPI_ESCROW',
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one produce line item' },
        { status: 400 }
      );
    }

    // Server-enforced financial calculations
    const financials = calculateOrderFinancials({
      items,
      consumerPlan: consumerPlan as ConsumerPlanTier,
    });

    const newOrder = {
      orderId: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      buyerId,
      buyerRole,
      consumerPlan,
      financials,
      deliveryAddress: deliveryAddress || '12-B MG Road, Indiranagar, Bengaluru, 560038',
      paymentMethod,
      paymentStatus: 'PAID_ESCROW_HELD',
      orderStatus: 'CONFIRMED',
      escrowStatus: 'NODAL_ACCOUNT_SECURED',
      tPlusOneSettlementDate: new Date(Date.now() + 86_400_000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    IN_MEMORY_ORDERS.unshift(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Order created with verified server-side commission & escrow allocation.',
      order: newOrder,
    });
  } catch (error) {
    console.error('[MarketplaceOrders] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Order creation failed' },
      { status: 500 }
    );
  }
}
