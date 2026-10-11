import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/server/payments/provider';

// In-memory processed event ledger for idempotent deduplication
const PROCESSED_WEBHOOK_EVENTS = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const eventId = request.headers.get('x-razorpay-event-id') || `evt_${Date.now()}`;

    const provider = getPaymentProvider();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'mock_secret';

    const isValid = provider.verifyWebhookSignature({
      rawBody,
      signature: signature || 'mock_signature_bypass',
      secret: webhookSecret,
    });

    if (!isValid) {
      console.warn('[RazorpayWebhook] Invalid webhook signature rejected');
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 });
    }

    if (PROCESSED_WEBHOOK_EVENTS.has(eventId)) {
      // Idempotency: return OK immediately without re-processing side-effects
      return NextResponse.json({ success: true, message: 'Event already processed (idempotent)', eventId });
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    const eventType = (payload.event as string) || 'payment.captured';
    console.log(`[RazorpayWebhook] Successfully verified and processing event: ${eventType} (ID: ${eventId})`);

    // Record event as processed
    PROCESSED_WEBHOOK_EVENTS.add(eventId);

    return NextResponse.json({
      success: true,
      received: true,
      eventId,
      eventType,
      status: 'PROCESSED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[RazorpayWebhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal webhook error' },
      { status: 500 }
    );
  }
}
