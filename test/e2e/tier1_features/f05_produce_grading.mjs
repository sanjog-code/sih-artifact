import { expect } from '../helpers/assertions.mjs';
import { gradeProduceOptical } from '../helpers/ai_engine.mjs';

export function runF05ProduceGradingTests(harness) {
  harness.describe('Tier 1 - F05: Produce Quality Grading API', () => {
    harness.it('F05-T1.1: Pristine produce yields Grade A1 with zero discount', () => {
      const res = gradeProduceOptical({
        commodity: 'Potato',
        defects: [],
        lightingScore: 1.0,
      });

      expect.equal(res.success, true, 'Grading call should succeed');
      expect.equal(res.grade, 'Grade A1', 'Pristine produce must be Grade A1');
      expect.greaterOrEqual(res.qualityScore, 90, 'Grade A1 must score >= 90');
      expect.equal(res.suggestedDiscountPercent, 0, 'Grade A1 should have 0% discount');
    });

    harness.it('F05-T1.2: Minor superficial defect classifies as Grade A2', () => {
      const res = gradeProduceOptical({
        commodity: 'Tomato',
        defects: [{ type: 'discoloration', severity: 0.3, areaPct: 6.0 }],
        lightingScore: 0.95,
      });

      expect.equal(res.grade, 'Grade A2', 'Minor defects under 5% should qualify for Grade A2');
      expect.greaterOrEqual(res.qualityScore, 75, 'Grade A2 score must be >= 75');
      expect.lessThan(res.qualityScore, 90, 'Grade A2 score must be < 90');
      expect.equal(res.suggestedDiscountPercent, 8, 'Grade A2 discount should be ~8%');
    });

    harness.it('F05-T1.3: Moderate defect surface area classifies as Grade B', () => {
      const res = gradeProduceOptical({
        commodity: 'Potato',
        defects: [
          { type: 'bruising', severity: 0.4, areaPct: 8.0 },
          { type: 'physical_damage', severity: 0.3, areaPct: 4.5 },
        ],
        lightingScore: 0.9,
      });

      expect.equal(res.grade, 'Grade B', 'Defects between 10-20% should classify as Grade B');
      expect.greaterOrEqual(res.qualityScore, 60, 'Grade B score must be >= 60');
      expect.lessThan(res.qualityScore, 75, 'Grade B score must be < 75');
      expect.equal(res.suggestedDiscountPercent, 16, 'Grade B discount should be ~16%');
    });

    harness.it('F05-T1.4: Extensive defect area classifies as Grade C processing grade', () => {
      const res = gradeProduceOptical({
        commodity: 'Tomato',
        defects: [{ type: 'shriveling', severity: 0.4, areaPct: 22.0 }],
        lightingScore: 0.85,
      });

      expect.equal(res.grade, 'Grade C', 'Defects between 20-35% should classify as Grade C');
      expect.greaterOrEqual(res.qualityScore, 40, 'Grade C score must be >= 40');
      expect.lessThan(res.qualityScore, 60, 'Grade C score must be < 60');
      expect.equal(res.suggestedDiscountPercent, 32, 'Grade C discount should be ~32%');
    });

    harness.it('F05-T1.5: Critical decay or severe defect area triggers Reject classification', () => {
      const res = gradeProduceOptical({
        commodity: 'Potato',
        defects: [{ type: 'spoilage', severity: 0.9, areaPct: 15.0 }],
        lightingScore: 0.9,
      });

      expect.equal(res.grade, 'Reject', 'Severe fungal decay / spoilage must trigger Reject');
      expect.equal(res.suggestedDiscountPercent, 100, 'Rejected lot must require 100% discount / liquidation');
      expect.equal(res.metrics.agmarkStandardMet, false, 'Rejected lot fails AGMARK standard');
    });
  });
}
