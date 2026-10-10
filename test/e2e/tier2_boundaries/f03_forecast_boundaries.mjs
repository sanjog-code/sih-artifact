import { expect } from '../helpers/assertions.mjs';
import { predictPriceDemand } from '../helpers/ai_engine.mjs';

export function runF03ForecastBoundariesTests(harness) {
  harness.describe('Tier 2 - F03: Price Forecast Boundary & Corner Cases', () => {
    harness.it('F03-T2.1: Extreme storage hold duration clamps perishable decay factor above zero', () => {
      const extremeHold = predictPriceDemand({
        commodity: 'Tomato',
        storageDays: 365, // 1 year hold on tomato
      });

      expect.greaterThan(extremeHold.predictedModalPrice, 0, 'Predicted price must remain strictly positive even after 365 days');
      expect.greaterThan(extremeHold.fairPriceRange.min, 0, 'Fair price floor must remain strictly positive');
    });

    harness.it('F03-T2.2: Empty, whitespace, or missing commodity names default safely', () => {
      const emptyRes = predictPriceDemand({ commodity: '' });
      expect.equal(emptyRes.success, true, 'Empty commodity should default safely');
      expect.ok(emptyRes.commodity.length > 0, 'Should assign a valid default commodity');

      const wsRes = predictPriceDemand({ commodity: '   ' });
      expect.equal(wsRes.success, true, 'Whitespace commodity should default safely');
    });

    harness.it('F03-T2.3: Special characters and injection patterns in market names handle safely', () => {
      const injectionAttempt = predictPriceDemand({
        commodity: 'Wheat',
        state: "RJ'; DROP TABLE mandis; --",
        district: '<script>alert(1)</script>',
        market: '../../../etc/passwd',
      });

      expect.equal(injectionAttempt.success, true, 'Injection patterns should not crash model resolution');
      expect.ok(
        ['STATE_AGGREGATE', 'DISTRICT_AGGREGATE', 'COMMODITY_BASELINE', 'NATIONAL_BASELINE'].includes(
          injectionAttempt.fallbackLevel
        ),
        'Must fall back to safe tier'
      );
    });

    harness.it('F03-T2.4: Extreme negative market trends never breach statutory MSP floor', () => {
      // Simulate extreme negative market pressure on Wheat (MSP 22.75)
      const crashScenario = predictPriceDemand({
        commodity: 'Wheat',
        state: 'MP',
        district: 'Ujjain',
        storageDays: 100,
      });

      expect.greaterOrEqual(crashScenario.predictedModalPrice, 22.75, 'Wheat price must remain >= MSP ₹22.75/kg under crash conditions');
      expect.equal(crashScenario.mspFloor, 22.75, 'MSP floor must be ₹22.75/kg');
    });

    harness.it('F03-T2.5: Case-insensitive matching resolves primary commodities', () => {
      const lower = predictPriceDemand({ commodity: 'wheat' });
      const upper = predictPriceDemand({ commodity: 'WHEAT' });
      const mixed = predictPriceDemand({ commodity: 'WhEaT' });

      expect.equal(lower.testMaeKg, 0.33, 'lowercase wheat must resolve verified MAE');
      expect.equal(upper.testMaeKg, 0.33, 'UPPERCASE WHEAT must resolve verified MAE');
      expect.equal(mixed.testMaeKg, 0.33, 'MixedCase WhEaT must resolve verified MAE');
    });
  });
}
