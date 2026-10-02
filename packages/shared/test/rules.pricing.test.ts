import { GRADE } from '../src/constants';
import { computePricingInsight, mockMarketSnapshot } from '../src/rules/pricing';
import type { PriceInsightInput } from '../src/types';

const rule = {
  baseLowRs: 14,
  baseHighRs: 18,
  mspRs: 12,
};

const baseInput: PriceInsightInput = {
  cropId: 'crop_tomato',
  varietyId: 'var_deshi',
  grade: GRADE.A1,
  state: 'RJ',
  district: 'Jaipur',
  season: 'RABI',
  stockAgeDays: 1,
  stockQuantityKg: 250,
};

describe('pricing rules v1', () => {
  it('is deterministic for identical inputs', () => {
    const a = computePricingInsight(baseInput, rule, mockMarketSnapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ', district: 'Jaipur' }));
    const b = computePricingInsight(baseInput, rule, mockMarketSnapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ', district: 'Jaipur' }));
    expect(b).toEqual(a);
  });

  it('returns explainable factors and a price range', () => {
    const snap = mockMarketSnapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ' });
    const r = computePricingInsight(baseInput, rule, snap);
    expect(r.suggestedHighRs).toBeGreaterThanOrEqual(r.suggestedLowRs);
    expect(r.factors.length).toBeGreaterThanOrEqual(4);
    expect(r.factors.every((f) => f.explanation.length > 0)).toBe(true);
    expect(r.suggestedLowRs).toBeGreaterThan(0);
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
  });

  it('respects the configurable MSP floor (low >= MSP)', () => {
    const snap: typeof rule & { demandIndex: number; supplyIndex: number; recentAvgRs: number; trendPct: number; freshnessMinutes: number; spotQuality: import('../src/types').MarketSnapshot['spotQuality']; qualityNote: string } = {
      baseLowRs: 5,
      baseHighRs: 8,
      mspRs: 10,
      demandIndex: 20,
      supplyIndex: 80,
      recentAvgRs: 6,
      trendPct: -8,
      freshnessMinutes: 700,
      spotQuality: { defectPct: 30, pestPressure: 20 },
      qualityNote: 'x',
    };
    const r = computePricingInsight(baseInput, snap, {
      demandIndex: 20,
      supplyIndex: 80,
      recentAvgRs: 6,
      trendPct: -8,
      freshnessMinutes: 700,
      spotQuality: { defectPct: 30, pestPressure: 20 },
      qualityNote: 'x',
    });
    expect(r.suggestedLowRs).toBeGreaterThanOrEqual(10);
    expect(r.disclaimer).toContain('Recommendation only, not a price guarantee');
  });

  it('older stock produces stronger sell signal', () => {
    const fresh = computePricingInsight(
      { ...baseInput, stockAgeDays: 1 },
      rule,
      mockMarketSnapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ' }),
    );
    const old = computePricingInsight(
      { ...baseInput, stockAgeDays: 6 },
      rule,
      mockMarketSnapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ' }),
    );
    const ageFactor = (r: typeof old) => r.factors.find((f) => f.key === 'stockAge')!.contributionBps;
    expect(ageFactor(old)).toBeLessThan(ageFactor(fresh));
  });

  it('never recommends actions automatically (no side effects in model)', () => {
    const r = computePricingInsight(baseInput, rule, mockMarketSnapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ' }));
    expect(r.recommendSell).toEqual(expect.any(Boolean));
  });
});