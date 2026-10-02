import { checkoutSchema, intakeSchema, gradeConfirmationSchema, demoLoginSchema, webhookEventSchema } from '../src/schemas';

describe('zod schemas', () => {
  it('validates a valid intake', () => {
    const r = intakeSchema.safeParse({
      farmerId: 'usr_1',
      cropId: 'crop_1',
      varietyId: 'var_1',
      warehouseId: 'wh_1',
      storageLocationId: 'loc_1',
      sourceCluster: 'Jaipur cluster A',
      grossWeightKg: 250.5,
      tareWeightKg: 20,
    });
    expect(r.success).toBe(true);
  });

  it('rejects gross <= tare', () => {
    const r = intakeSchema.safeParse({
      farmerId: 'usr_1',
      cropId: 'crop_1',
      varietyId: 'var_1',
      warehouseId: 'wh_1',
      storageLocationId: 'loc_1',
      sourceCluster: 'Jaipur cluster A',
      grossWeightKg: 10,
      tareWeightKg: 20,
    });
    expect(r.success).toBe(false);
  });

  it('requires an override reason on MANUAL grade confirmation', () => {
    const ok = gradeConfirmationSchema.safeParse({
      lotId: 'lot_1',
      confirmedGrade: 'B',
      source: 'MANUAL',
      gradingRunId: 'gr_1',
      overrideReason: 'Blennishing observed',
    });
    expect(ok.success).toBe(true);
    const bad = gradeConfirmationSchema.safeParse({
      lotId: 'lot_1',
      confirmedGrade: 'B',
      source: 'MANUAL',
    });
    expect(bad.success).toBe(false);
  });

  it('accepts MODEL confirmation without override reason', () => {
    const r = gradeConfirmationSchema.safeParse({
      lotId: 'lot_1',
      confirmedGrade: 'A1',
      source: 'MODEL',
      gradingRunId: 'gr_1',
    });
    expect(r.success).toBe(true);
  });

  it('demo login validates roles', () => {
    expect(demoLoginSchema.safeParse({ role: 'farmer' }).success).toBe(true);
    expect(demoLoginSchema.safeParse({ role: 'superuser' }).success).toBe(false);
  });

  it('checkout requires an idempotency key and cart items', () => {
    expect(
      checkoutSchema.safeParse({ cartItemIds: ['ci_1'], deliveryType: 'PICKUP', idempotencyKey: 'key-12345678' }).success,
    ).toBe(true);
    expect(checkoutSchema.safeParse({ cartItemIds: [], deliveryType: 'PICKUP', idempotencyKey: 'key-123' }).success).toBe(false);
  });

  it('webhook events require timestamp + nonce + signature fields shape', () => {
    expect(webhookEventSchema.safeParse({ id: 'evt_1', timestamp: '2026-01-01T00:00:00Z', nonce: 'n'.repeat(16), type: 'order.created', payload: {} }).success).toBe(true);
    expect(webhookEventSchema.safeParse({ id: 'evt_1', timestamp: 'not-a-date', nonce: 'abc', type: '' }).success).toBe(false);
  });
});