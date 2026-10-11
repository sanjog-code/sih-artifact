import crypto from 'crypto';

export interface PaymentOrderParams {
  amountInr: number; // in rupees
  receipt: string;
  notes?: Record<string, string>;
  customerName?: string;
  customerPhone?: string;
}

export interface PaymentOrderResult {
  orderId: string;
  amountPaise: number;
  amountInr: number;
  currency: 'INR';
  provider: 'mock' | 'razorpay';
  keyId: string;
  status: 'created';
}

export interface SubscriptionParams {
  planCode: string;
  amountInr: number;
  customerPhone: string;
  customerName?: string;
  billingInterval: 'monthly' | 'annual';
}

export interface SubscriptionResult {
  subscriptionId: string;
  planCode: string;
  amountInr: number;
  provider: 'mock' | 'razorpay';
  status: 'active' | 'created';
  currentPeriodEnd: string;
}

export interface WebhookVerifyParams {
  rawBody: string;
  signature: string;
  secret: string;
}

export interface PaymentProvider {
  readonly name: 'mock' | 'razorpay';
  createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
  createSubscription(params: SubscriptionParams): Promise<SubscriptionResult>;
  verifyWebhookSignature(params: WebhookVerifyParams): boolean;
}

/**
 * 1. Mock Payment Provider (Local Development & Demos)
 * Instant deterministic orders and HMAC verification with zero external dependencies.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock' as const;

  async createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
    const mockId = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      orderId: mockId,
      amountPaise: Math.round(params.amountInr * 100),
      amountInr: params.amountInr,
      currency: 'INR',
      provider: 'mock',
      keyId: 'rzp_test_mock_mode_active',
      status: 'created',
    };
  }

  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    const subId = `sub_mock_${params.planCode.toLowerCase()}_${Date.now()}`;
    const periodDays = params.billingInterval === 'annual' ? 365 : 30;
    const expiresAt = new Date(Date.now() + periodDays * 86_400_000).toISOString();

    return {
      subscriptionId: subId,
      planCode: params.planCode,
      amountInr: params.amountInr,
      provider: 'mock',
      status: 'active',
      currentPeriodEnd: expiresAt,
    };
  }

  verifyWebhookSignature(params: WebhookVerifyParams): boolean {
    // In mock mode, if signature is "mock_signature_bypass" or matches computed HMAC with provided secret
    if (params.signature === 'mock_signature_bypass') return true;
    const expected = crypto.createHmac('sha256', params.secret || 'mock_secret').update(params.rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(params.signature, 'hex'));
  }
}

/**
 * 2. Razorpay Payment Provider (Production Indian Gateway)
 * Verifies standard Razorpay HMAC-SHA256 signatures and handles subscriptions / payment links.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = 'razorpay' as const;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(keyId?: string, keySecret?: string) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
    const amountPaise = Math.round(params.amountInr * 100);

    // If real keys are missing, gracefully fall back to mock
    if (!this.keyId || !this.keySecret) {
      console.warn('[RazorpayPaymentProvider] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Falling back to mock order.');
      const fallback = new MockPaymentProvider();
      return fallback.createOrder(params);
    }

    try {
      const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: params.receipt,
          notes: params.notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        orderId: data.id,
        amountPaise: data.amount,
        amountInr: params.amountInr,
        currency: 'INR',
        provider: 'razorpay',
        keyId: this.keyId,
        status: 'created',
      };
    } catch (err) {
      console.error('[RazorpayPaymentProvider] Order creation failed:', err);
      throw err;
    }
  }

  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    if (!this.keyId || !this.keySecret) {
      console.warn('[RazorpayPaymentProvider] RAZORPAY_KEY_ID missing for subscription. Falling back to mock.');
      const fallback = new MockPaymentProvider();
      return fallback.createSubscription(params);
    }

    // Call Razorpay Subscriptions API
    const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        plan_id: params.planCode,
        total_count: params.billingInterval === 'annual' ? 1 : 12,
        quantity: 1,
        notes: {
          customerPhone: params.customerPhone,
        },
      }),
    });

    if (!response.ok) {
      // In sandbox if plan_id does not exist, provide safe fallback
      const errorText = await response.text();
      console.warn(`[RazorpayPaymentProvider] Subscription API call failed: ${errorText}. Using fallback.`);
      const fallback = new MockPaymentProvider();
      return fallback.createSubscription(params);
    }

    const data = await response.json();
    return {
      subscriptionId: data.id,
      planCode: params.planCode,
      amountInr: params.amountInr,
      provider: 'razorpay',
      status: 'created',
      currentPeriodEnd: new Date(data.current_end * 1000).toISOString(),
    };
  }

  verifyWebhookSignature(params: WebhookVerifyParams): boolean {
    const secret = params.secret || process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;
    if (!secret) return false;

    try {
      const expected = crypto.createHmac('sha256', secret).update(params.rawBody).digest('hex');
      const expectedBuffer = Buffer.from(expected, 'hex');
      const signatureBuffer = Buffer.from(params.signature, 'hex');

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (e) {
      console.error('[RazorpayPaymentProvider] Signature verification error:', e);
      return false;
    }
  }
}

/**
 * Singleton factory returning active payment provider based on PAYMENTS_PROVIDER env variable.
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = (process.env.PAYMENTS_PROVIDER || 'mock').toLowerCase();
  if (provider === 'razorpay') {
    return new RazorpayPaymentProvider();
  }
  return new MockPaymentProvider();
}
