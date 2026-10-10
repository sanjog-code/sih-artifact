import { expect } from '../helpers/assertions.mjs';
import { calculateShelfLifeDecay } from '../helpers/ai_engine.mjs';

export function runF06ShelfBoundariesTests(harness) {
  harness.describe('Tier 2 - F06: Storage Shelf-Life Boundary & Corner Cases', () => {
    harness.it('F06-T2.1: Sub-zero or freezing ambient temperatures handle safely without negative decay rate', () => {
      const res = calculateShelfLifeDecay({
        commodity: 'Potato',
        ambientTemperatureC: -2,
        storageDays: 10,
      });

      expect.greaterThan(res.decayRatePerDay, 0, 'Decay rate must remain positive even at sub-zero');
      expect.greaterThan(res.currentQualityRetainedPct, 0, 'Quality retained must remain non-negative');
    });

    harness.it('F06-T2.2: Extreme desert heat accelerates Arrhenius rate without arithmetic overflow', () => {
      const res = calculateShelfLifeDecay({
        commodity: 'Tomato',
        ambientTemperatureC: 48,
        storageDays: 4,
      });

      expect.notOk(isNaN(res.decayRatePerDay), 'Decay rate at 48°C must not be NaN');
      expect.notOk(isNaN(res.remainingShelfLifeDays), 'Remaining days must not be NaN');
      expect.equal(res.riskLevel, 'DISPOSAL_RISK', '48°C hold on tomato after 4 days must be DISPOSAL_RISK');
    });

    harness.it('F06-T2.3: Zero storage days yields 100% of initial quality retained', () => {
      const res = calculateShelfLifeDecay({
        commodity: 'Wheat',
        currentQualityScore: 95,
        storageDays: 0,
        ambientTemperatureC: 20,
      });

      expect.closeTo(res.currentQualityRetainedPct, 95.0, 0.1, 'Zero storage days must retain 100% of initial score');
      expect.equal(res.dynamicMarkdownPercent, 0, 'Zero markdown on freshly stored batch');
    });

    harness.it('F06-T2.4: Saturated 100% relative humidity eliminates vapor deficit moisture penalty', () => {
      const satRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        ambientTemperatureC: 15,
        relativeHumidityPct: 100,
        storageDays: 5,
      });

      const dryRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        ambientTemperatureC: 15,
        relativeHumidityPct: 20,
        storageDays: 5,
      });

      expect.lessThan(satRes.decayRatePerDay, dryRes.decayRatePerDay, '100% RH must decay slower than 20% RH');
    });

    harness.it('F06-T2.5: Substandard initial quality score accelerates transition to disposal risk', () => {
      const poorInitial = calculateShelfLifeDecay({
        commodity: 'Tomato',
        currentQualityScore: 42, // already degraded batch
        storageDays: 3,
        ambientTemperatureC: 25,
      });

      expect.ok(
        ['EXPEDITE_SALE', 'DISPOSAL_RISK'].includes(poorInitial.riskLevel),
        'Substandard batch must trigger EXPEDITE_SALE or DISPOSAL_RISK earlier'
      );
      expect.greaterOrEqual(poorInitial.dynamicMarkdownPercent, 30, 'Markdown must reflect elevated degradation');
    });
  });
}
