import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farmerPhone, commodity, targetPriceKg, condition, channel } = body;

    if (!farmerPhone || !commodity || !targetPriceKg) {
      return NextResponse.json(
        { success: false, error: 'Missing required alert subscription parameters' },
        { status: 400 }
      );
    }

    const alertId = `ALT-${commodity.toUpperCase()}-${Math.round(targetPriceKg)}-${Date.now().toString().slice(-4)}`;

    return NextResponse.json({
      success: true,
      alertId,
      message: `Alert activated: Farmer ${farmerPhone} will receive ${channel || 'WHATSAPP'} notification when ${commodity} ${condition === 'DROPS_BELOW' ? 'drops below' : 'crosses'} ₹${Number(targetPriceKg).toFixed(2)}/kg.`,
      channel: channel || 'WHATSAPP',
      status: 'ACTIVE',
      dispatchedVia: 'SMS_WHATSAPP_SANDBOX_GATEWAY',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}
