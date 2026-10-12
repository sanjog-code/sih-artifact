/**
 * Client-side Payment Gateway Integration
 * Dynamically initiates standard Razorpay Checkout when live credentials are available,
 * or delegates seamlessly to the institutional test payment modal.
 */

export interface CheckoutOptions {
  type: 'SUBSCRIPTION' | 'MARKETPLACE_ORDER';
  planCode?: string;
  billingInterval?: 'monthly' | 'annual';
  items?: Array<{ id: string; quantityKg: number; unitPriceInr: number; cropName: string }>;
  customerName?: string;
  customerPhone?: string;
  onSuccess: (response: { paymentId: string; orderId: string; method?: string }) => void;
  onFailure?: (error: any) => void;
  openFallbackModal: (modalData: {
    amountInr: number;
    planName?: string;
    billingInterval?: 'monthly' | 'annual';
    title: string;
    onAuthorize: () => void;
  }) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export async function initiateClientPayment(options: CheckoutOptions) {
  try {
    const res = await fetch('/api/monetization/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: options.type,
        planCode: options.planCode,
        billingInterval: options.billingInterval,
        items: options.items,
        customerName: options.customerName,
        customerPhone: options.customerPhone,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to initialize payment order');
    }

    const { paymentOrder, amountInr, planName } = data;
    const finalAmount = amountInr || (paymentOrder?.amountInr) || 0;

    // Check if Razorpay is configured with real key
    const isMock = !paymentOrder.keyId || paymentOrder.keyId.includes('mock') || !paymentOrder.keyId.startsWith('rzp_live');

    if (isMock) {
      // Delegate to institutional test modal
      options.openFallbackModal({
        amountInr: finalAmount,
        planName,
        billingInterval: options.billingInterval,
        title: options.type === 'SUBSCRIPTION' ? `Subscribe to ${planName || 'Plan'}` : 'Authorize Escrow Order Lock',
        onAuthorize: () => {
          options.onSuccess({
            paymentId: `pay_${Date.now()}_simulated`,
            orderId: paymentOrder.orderId,
            method: 'INSTITUTIONAL_ESCROW',
          });
        },
      });
      return;
    }

    // Load Razorpay script if needed
    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
        document.body.appendChild(script);
      });
    }

    const rzp = new window.Razorpay({
      key: paymentOrder.keyId,
      amount: paymentOrder.amountPaise,
      currency: 'INR',
      name: 'Fasal Matrix Institutional Escrow',
      description: options.type === 'SUBSCRIPTION' ? `Subscription: ${planName}` : 'Produce Sourcing Escrow Lock',
      order_id: paymentOrder.orderId,
      prefill: {
        name: options.customerName || 'Verified Buyer',
        contact: options.customerPhone || '9876543210',
      },
      theme: {
        color: '#059669', // Emerald 600
      },
      handler: function (response: any) {
        options.onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        });
      },
      modal: {
        ondismiss: function () {
          if (options.onFailure) options.onFailure(new Error('Payment window closed by user'));
        },
      },
    });

    rzp.open();
  } catch (err) {
    console.error('[initiateClientPayment] Error:', err);
    if (options.onFailure) {
      options.onFailure(err);
    } else {
      alert(err instanceof Error ? err.message : 'Payment initialization failed');
    }
  }
}
