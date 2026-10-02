import { canTransitionOrder, nextStates, canTransitionPayment } from '../src/rules/orders';

describe('order state machine', () => {
  it('allows valid consumer transitions', () => {
    expect(canTransitionOrder('CONSUMER', 'CONFIRMED', 'DISPATCHED')).toBe(true);
    expect(canTransitionOrder('CONSUMER', 'CONFIRMED', 'PACKING')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionOrder('CONSUMER', 'CONFIRMED', 'REFUNDED')).toBe(false);
    expect(canTransitionOrder('CONSUMER', 'DELIVERED', 'DELIVERED')).toBe(false);
  });

  it('bulk flow supports expiry and partial fulfillment', () => {
    expect(canTransitionOrder('BULK', 'PENDING_PAYMENT', 'EXPIRED')).toBe(true);
    expect(nextStates('BULK', 'DISPATCHED')).toContain('PARTIALLY_DELIVERED');
  });

  it('payment cannot skip states', () => {
    expect(canTransitionPayment('PENDING', 'REFUNDED')).toBe(false);
    expect(canTransitionPayment('SUCCESS', 'REFUNDED')).toBe(true);
  });
});