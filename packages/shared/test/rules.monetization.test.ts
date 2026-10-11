import {
  assertBusinessEntitlement,
  calculateConsumerDeliveryDiscount,
  calculateFarmerPayout,
  calculateOrderFinancials,
  evaluateFarmerTierProgression,
  hasBusinessEntitlement,
} from '../src/rules/monetization';

describe('FarmLink Premier — Monetization Rules', () => {
  describe('Farmer Commission Tiers', () => {
    it('applies 5% commission on Basic tier with transparent net payout', () => {
      const payout = calculateFarmerPayout(10_000, 'basic');
      expect(payout.commissionRatePct).toBe(5);
      expect(payout.commissionAmountInr).toBe(500);
      expect(payout.netPayoutInr).toBe(9_500);
    });

    it('applies 4% commission on Premier tier', () => {
      const payout = calculateFarmerPayout(10_000, 'premier');
      expect(payout.commissionRatePct).toBe(4);
      expect(payout.commissionAmountInr).toBe(400);
      expect(payout.netPayoutInr).toBe(9_600);
    });

    it('applies 3% commission on Premier Pro tier', () => {
      const payout = calculateFarmerPayout(10_000, 'premier_pro');
      expect(payout.commissionRatePct).toBe(3);
      expect(payout.commissionAmountInr).toBe(300);
      expect(payout.netPayoutInr).toBe(9_700);
    });

    it('applies 2% commission on Premier Elite tier', () => {
      const payout = calculateFarmerPayout(10_000, 'premier_elite');
      expect(payout.commissionRatePct).toBe(2);
      expect(payout.commissionAmountInr).toBe(200);
      expect(payout.netPayoutInr).toBe(9_800);
    });

    it('evaluates auditable tier progression by sales volume', () => {
      expect(evaluateFarmerTierProgression(10_000)).toBe('basic');
      expect(evaluateFarmerTierProgression(50_000)).toBe('premier');
      expect(evaluateFarmerTierProgression(250_000)).toBe('premier_pro');
      expect(evaluateFarmerTierProgression(600_000)).toBe('premier_elite');
    });
  });

  describe('Business Buyer Plan Entitlements', () => {
    it('allows basic operations for Starter plan, but denies advanced features', () => {
      expect(hasBusinessEntitlement('starter', 'buyer:basic_search')).toBe(true);
      expect(hasBusinessEntitlement('starter', 'buyer:order_management')).toBe(true);
      expect(hasBusinessEntitlement('starter', 'buyer:recurring_orders')).toBe(false);
      expect(hasBusinessEntitlement('starter', 'buyer:multi_depot_routing')).toBe(false);

      expect(() => assertBusinessEntitlement('starter', 'buyer:recurring_orders')).toThrow(
        /Entitlement Denied/
      );
    });

    it('allows recurring orders and multi-supplier sourcing on Growth tier', () => {
      expect(hasBusinessEntitlement('growth', 'buyer:recurring_orders')).toBe(true);
      expect(hasBusinessEntitlement('growth', 'buyer:multi_supplier_sourcing')).toBe(true);
      expect(hasBusinessEntitlement('growth', 'buyer:multi_depot_routing')).toBe(false);
    });

    it('allows multi-depot routing and audit reports on Pro tier', () => {
      expect(hasBusinessEntitlement('pro', 'buyer:multi_depot_routing')).toBe(true);
      expect(hasBusinessEntitlement('pro', 'buyer:consolidated_audit_reports')).toBe(true);
      expect(hasBusinessEntitlement('pro', 'buyer:custom_erp_integrations')).toBe(false);
    });

    it('allows enterprise features on Enterprise tier', () => {
      expect(hasBusinessEntitlement('enterprise', 'buyer:custom_erp_integrations')).toBe(true);
      expect(hasBusinessEntitlement('enterprise', 'buyer:dedicated_account_desk')).toBe(true);
    });
  });

  describe('Consumer Membership Delivery Discounts', () => {
    it('charges standard delivery for Consumer Basic', () => {
      const res = calculateConsumerDeliveryDiscount(200, 60, 'basic');
      expect(res.discountInr).toBe(0);
      expect(res.finalDeliveryFeeInr).toBe(60);
    });

    it('applies ₹40 capped discount for Consumer Premier', () => {
      const res = calculateConsumerDeliveryDiscount(200, 60, 'premier');
      expect(res.discountInr).toBe(40);
      expect(res.finalDeliveryFeeInr).toBe(20);
    });

    it('applies 100% free delivery for Consumer Plus when order >= ₹399', () => {
      const res = calculateConsumerDeliveryDiscount(450, 80, 'plus');
      expect(res.discountInr).toBe(80);
      expect(res.finalDeliveryFeeInr).toBe(0);
    });

    it('applies ₹40 discount for Consumer Plus when order is below ₹399 threshold', () => {
      const res = calculateConsumerDeliveryDiscount(250, 70, 'plus');
      expect(res.discountInr).toBe(40);
      expect(res.finalDeliveryFeeInr).toBe(30);
    });
  });

  describe('Server-Side Order Financials Calculation', () => {
    it('accurately computes subtotal, commission, discounts, and fee disclosure', () => {
      const calc = calculateOrderFinancials({
        items: [
          { listingId: 'lst_1', quantityKg: 50, pricePerKg: 30, farmerTier: 'basic' }, // ₹1,500, 5% = ₹75 fee
          { listingId: 'lst_2', quantityKg: 100, pricePerKg: 20, farmerTier: 'premier_pro' }, // ₹2,000, 3% = ₹60 fee
        ],
        consumerPlan: 'premier',
        baseDeliveryFeeInr: 60,
      });

      expect(calc.subtotalInr).toBe(3500);
      expect(calc.platformCommissionTotalInr).toBe(135); // 75 + 60
      expect(calc.deliveryDiscountInr).toBe(40);
      expect(calc.finalDeliveryFeeInr).toBe(20);
      expect(calc.totalPayableInr).toBe(3520); // 3500 + 20
      expect(calc.feeDisclosure.length).toBeGreaterThanOrEqual(3);
    });
  });
});
