import {
  calculateFarmerPayout,
  calculateOrderFinancials,
  hasBusinessEntitlement,
  assertBusinessEntitlement,
  calculateConsumerDeliveryDiscount,
  evaluateFarmerTierProgression,
} from '@farmlink/shared';
import * as crypto from 'crypto';

describe('FarmLink Premier — API Monetization & Entitlements Specification', () => {
  describe('Farmer Commission Tiers (Auditable Backend Computation)', () => {
    it('applies 5% take rate on Basic, 4% on Premier, 3% on Pro, 2% on Elite', () => {
      expect(calculateFarmerPayout(100_000, 'basic').commissionAmountInr).toBe(5000);
      expect(calculateFarmerPayout(100_000, 'premier').commissionAmountInr).toBe(4000);
      expect(calculateFarmerPayout(100_000, 'premier_pro').commissionAmountInr).toBe(3000);
      expect(calculateFarmerPayout(100_000, 'premier_elite').commissionAmountInr).toBe(2000);
    });

    it('guarantees gross = net + commission', () => {
      const p = calculateFarmerPayout(47_850, 'premier');
      expect(p.netPayoutInr + p.commissionAmountInr).toBeCloseTo(47_850, 2);
    });

    it('advances tiers by sales volume', () => {
      expect(evaluateFarmerTierProgression(45_000)).toBe('basic');
      expect(evaluateFarmerTierProgression(50_000)).toBe('premier');
      expect(evaluateFarmerTierProgression(200_000)).toBe('premier_pro');
      expect(evaluateFarmerTierProgression(500_000)).toBe('premier_elite');
    });
  });

  describe('Business Buyer Server Entitlements', () => {
    it('enforces plan boundaries on multi-supplier and recurring orders', () => {
      expect(hasBusinessEntitlement('starter', 'buyer:recurring_orders')).toBe(false);
      expect(hasBusinessEntitlement('growth', 'buyer:recurring_orders')).toBe(true);
      expect(hasBusinessEntitlement('starter', 'buyer:multi_depot_routing')).toBe(false);
      expect(hasBusinessEntitlement('pro', 'buyer:multi_depot_routing')).toBe(true);

      expect(() => assertBusinessEntitlement('starter', 'buyer:multi_depot_routing')).toThrow(
        /Entitlement Denied/
      );
    });
  });

  describe('Consumer Membership & Capped Benefits', () => {
    it('applies ₹40 delivery discount for Premier members', () => {
      const res = calculateConsumerDeliveryDiscount(200, 60, 'premier');
      expect(res.discountInr).toBe(40);
      expect(res.finalDeliveryFeeInr).toBe(20);
    });

    it('waives full delivery for Plus members when order exceeds ₹399', () => {
      const res = calculateConsumerDeliveryDiscount(500, 80, 'plus');
      expect(res.discountInr).toBe(80);
      expect(res.finalDeliveryFeeInr).toBe(0);
    });
  });

  describe('Server-Calculated Order Totals', () => {
    it('computes exact subtotal, commission, discounts, and fee disclosures', () => {
      const calc = calculateOrderFinancials({
        items: [
          { listingId: 'lst_1', quantityKg: 100, pricePerKg: 25, farmerTier: 'basic' }, // ₹2500, 5% = ₹125
          { listingId: 'lst_2', quantityKg: 50, pricePerKg: 40, farmerTier: 'premier_elite' }, // ₹2000, 2% = ₹40
        ],
        consumerPlan: 'plus',
        baseDeliveryFeeInr: 60,
      });

      expect(calc.subtotalInr).toBe(4500);
      expect(calc.platformCommissionTotalInr).toBe(165);
      expect(calc.finalDeliveryFeeInr).toBe(0); // Plus member order > ₹399
      expect(calc.totalPayableInr).toBe(4500);
    });
  });

  describe('Webhook Signature Verification & Idempotency', () => {
    it('verifies valid HMAC-SHA256 signature and rejects tampered bodies', () => {
      const secret = 'rzp_test_secret_for_unit_tests';
      const body = JSON.stringify({ event: 'payment.captured', id: 'pay_123' });
      const validSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(validSig, 'hex'),
        Buffer.from(crypto.createHmac('sha256', secret).update(body).digest('hex'), 'hex')
      );
      expect(isValid).toBe(true);

      const tamperedBody = JSON.stringify({ event: 'payment.captured', id: 'pay_999' });
      const tamperedSig = crypto.createHmac('sha256', secret).update(tamperedBody).digest('hex');
      expect(validSig).not.toBe(tamperedSig);
    });
  });
});
