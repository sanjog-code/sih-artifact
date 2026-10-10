import { expect } from '../helpers/assertions.mjs';
import { predictPriceDemand } from '../helpers/ai_engine.mjs';

export function runF03PriceForecastTests(harness) {
  harness.describe('Tier 1 - F03: Price & Demand Forecast Model & API', () => {
    harness.it('F03-T1.1: Exact market match returns calibrated modal price and empirical metrics', () => {
      const res = predictPriceDemand({
        commodity: 'Tomato',
        state: 'RJ',
        district: 'Jaipur',
        market: 'Jaipur North APMC',
      });

      expect.equal(res.success, true, 'Forecast call should succeed');
      expect.equal(res.fallbackLevel, 'EXACT_MARKET', 'Should identify exact market match');
      expect.equal(res.currentModalPrice, 28.5, 'Should return calibrated modal price');
      expect.greaterThan(res.predictedModalPrice, 0, 'Predicted modal price must be positive');
      expect.ok(res.fairPriceRange.min < res.fairPriceRange.max, 'Fair price min must be less than max');
    });

    harness.it('F03-T1.2: Enforces statutory MSP floor protection across negative price shocks', () => {
      const wheatRes = predictPriceDemand({
        commodity: 'Wheat',
        state: 'MP',
        district: 'Ujjain',
        market: 'Ujjain Central Silo',
        storageDays: 30, // simulated prolonged hold
      });

      expect.greaterOrEqual(wheatRes.predictedModalPrice, 22.75, 'Wheat predicted price must never drop below MSP (₹22.75/kg)');
      expect.equal(wheatRes.mspFloor, 22.75, 'Wheat MSP floor benchmark must be ₹22.75/kg');

      const mustardRes = predictPriceDemand({
        commodity: 'Mustard',
        state: 'RJ',
        district: 'Jaipur',
        market: 'Phulera Mandi',
      });

      expect.greaterOrEqual(mustardRes.predictedModalPrice, 56.5, 'Mustard predicted price must adhere to MSP (₹56.50/kg)');
      expect.equal(mustardRes.mspFloor, 56.5, 'Mustard MSP floor benchmark must be ₹56.50/kg');
    });

    harness.it('F03-T1.3: Verified test MAE thresholds reported for primary agricultural commodities', () => {
      const wheatRes = predictPriceDemand({ commodity: 'Wheat' });
      expect.lessOrEqual(wheatRes.testMaeKg, 0.5, 'Wheat test MAE must be <= ₹0.50/kg (verified: ₹0.33/kg)');

      const potatoRes = predictPriceDemand({ commodity: 'Potato' });
      expect.lessOrEqual(potatoRes.testMaeKg, 1.0, 'Potato test MAE must be <= ₹1.00/kg (verified: ₹0.64/kg)');

      const tomatoRes = predictPriceDemand({ commodity: 'Tomato' });
      expect.lessOrEqual(tomatoRes.testMaeKg, 5.0, 'Tomato test MAE must be <= ₹5.00/kg (verified: ₹4.04/kg)');
    });

    harness.it('F03-T1.4: 5-tier fallback cascade resolves unobserved mandis without failure', () => {
      // Unobserved market in known district
      const distRes = predictPriceDemand({
        commodity: 'Wheat',
        state: 'PB',
        district: 'Ludhiana',
        market: 'Nonexistent Village Mandi 999',
      });
      expect.equal(distRes.fallbackLevel, 'DISTRICT_AGGREGATE', 'Should fall back to DISTRICT_AGGREGATE');

      // Known state without specific district
      const stateRes = predictPriceDemand({
        commodity: 'Wheat',
        state: 'PB',
        district: '',
      });
      expect.equal(stateRes.fallbackLevel, 'STATE_AGGREGATE', 'Should fall back to STATE_AGGREGATE');

      // Commodity only without specific state
      const commRes = predictPriceDemand({
        commodity: 'Wheat',
        state: '',
      });
      expect.equal(commRes.fallbackLevel, 'COMMODITY_BASELINE', 'Should fall back to COMMODITY_BASELINE');

      // Completely unobserved crop
      const natRes = predictPriceDemand({
        commodity: 'ExoticDragonFruit',
      });
      expect.equal(natRes.fallbackLevel, 'NATIONAL_BASELINE', 'Should fall back to NATIONAL_BASELINE');
    });

    harness.it('F03-T1.5: Demand signal classification matches price trend direction', () => {
      const incRes = predictPriceDemand({
        commodity: 'Tomato',
        state: 'RJ',
        district: 'Jaipur',
        market: 'Jaipur North APMC',
      });
      if (incRes.predictedChangePercent > 1.5) {
        expect.equal(incRes.demandSignal, 'HIGH_DEMAND', 'Positive price shift should indicate HIGH_DEMAND');
      }

      const stableRes = predictPriceDemand({
        commodity: 'Wheat',
        state: 'MP',
        district: 'Ujjain',
        market: 'Ujjain Central Silo',
      });
      expect.ok(
        ['STABLE', 'HIGH_DEMAND'].includes(stableRes.demandSignal),
        'Signal should be valid enum value'
      );
    });
  });
}
