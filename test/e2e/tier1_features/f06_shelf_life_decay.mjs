import { expect } from '../helpers/assertions.mjs';
import { calculateShelfLifeDecay } from '../helpers/ai_engine.mjs';

export function runF06ShelfLifeDecayTests(harness) {
  harness.describe('Tier 1 - F06: Storage Shelf-Life Decay API', () => {
    harness.it('F06-T1.1: Cold storage preserves produce shelf-life with minimal kinetic decay', () => {
      const res = calculateShelfLifeDecay({
        commodity: 'Tomato',
        currentQualityScore: 100,
        storageDays: 3,
        ambientTemperatureC: 4,
        relativeHumidityPct: 85,
        isColdStorage: true,
      });

      expect.equal(res.success, true, 'Shelf-life calculation should succeed');
      expect.equal(res.riskLevel, 'OPTIMAL', 'Cold-stored tomato at day 3 should be OPTIMAL');
      expect.greaterThan(res.remainingShelfLifeDays, 7, 'Cold storage should preserve > 7 remaining days');
      expect.equal(res.dynamicMarkdownPercent, 0, 'No markdown needed under OPTIMAL conditions');
    });

    harness.it('F06-T1.2: Elevated ambient temperatures accelerate Arrhenius perishability decay', () => {
      const coldRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        ambientTemperatureC: 4,
        storageDays: 5,
      });

      const hotRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        ambientTemperatureC: 34,
        storageDays: 5,
      });

      expect.greaterThan(
        hotRes.decayRatePerDay,
        coldRes.decayRatePerDay * 2.5,
        'Decay rate at 34°C must be > 2.5x faster than 4°C under Arrhenius kinetics'
      );
      expect.lessThan(
        hotRes.remainingShelfLifeDays,
        coldRes.remainingShelfLifeDays,
        'Remaining days at 34°C must be significantly shorter than at 4°C'
      );
    });

    harness.it('F06-T1.3: Vapor pressure deficit (low relative humidity) penalizes shelf-life', () => {
      const highRh = calculateShelfLifeDecay({
        commodity: 'Potato',
        ambientTemperatureC: 22,
        relativeHumidityPct: 85,
        storageDays: 20,
      });

      const lowRh = calculateShelfLifeDecay({
        commodity: 'Potato',
        ambientTemperatureC: 22,
        relativeHumidityPct: 40,
        storageDays: 20,
      });

      expect.greaterThan(lowRh.decayRatePerDay, highRh.decayRatePerDay, 'Low humidity (40% RH) should accelerate decay vs optimal (85% RH)');
    });

    harness.it('F06-T1.4: Dynamic markdowns increase as remaining shelf life approaches expiration', () => {
      const earlyRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        storageDays: 1,
        ambientTemperatureC: 25,
      });

      const lateRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        storageDays: 8,
        ambientTemperatureC: 25,
      });

      expect.greaterThan(
        lateRes.dynamicMarkdownPercent,
        earlyRes.dynamicMarkdownPercent,
        'Dynamic markdown percent must increase as storage duration grows'
      );
    });

    harness.it('F06-T1.5: Risk level transitions to EXPEDITE_SALE or DISPOSAL_RISK near end-of-life', () => {
      const expiredRes = calculateShelfLifeDecay({
        commodity: 'Tomato',
        storageDays: 16,
        ambientTemperatureC: 30,
      });

      expect.ok(
        ['EXPEDITE_SALE', 'DISPOSAL_RISK'].includes(expiredRes.riskLevel),
        'Late-stage batch must trigger EXPEDITE_SALE or DISPOSAL_RISK'
      );
      expect.greaterOrEqual(expiredRes.dynamicMarkdownPercent, 30, 'Late-stage markdown should be at least 30%');
    });
  });
}
