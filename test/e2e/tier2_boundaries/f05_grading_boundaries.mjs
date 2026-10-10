import { expect } from '../helpers/assertions.mjs';
import { gradeProduceOptical } from '../helpers/ai_engine.mjs';

export function runF05GradingBoundariesTests(harness) {
  harness.describe('Tier 2 - F05: Produce Grading Boundary & Corner Cases', () => {
    harness.it('F05-T2.1: Total defect area exceeding 100% clamps safely and classifies as Reject', () => {
      const res = gradeProduceOptical({
        commodity: 'Potato',
        defects: [
          { type: 'physical_damage', severity: 1.0, areaPct: 80 },
          { type: 'spoilage', severity: 1.0, areaPct: 60 },
        ],
      });

      expect.equal(res.grade, 'Reject', 'Massive defect area must classify as Reject');
      expect.equal(res.qualityScore, 0, 'Quality score must clamp at 0');
      expect.equal(res.suggestedDiscountPercent, 100, 'Discount must clamp at 100%');
    });

    harness.it('F05-T2.2: Degraded camera lighting score applies proportional uncertainty penalty', () => {
      const goodLight = gradeProduceOptical({
        commodity: 'Tomato',
        defects: [{ type: 'discoloration', severity: 0.3, areaPct: 8 }],
        lightingScore: 1.0,
      });

      const badLight = gradeProduceOptical({
        commodity: 'Tomato',
        defects: [{ type: 'discoloration', severity: 0.3, areaPct: 8 }],
        lightingScore: 0.5,
      });

      expect.lessOrEqual(
        badLight.qualityScore,
        goodLight.qualityScore,
        'Poor lighting should penalize confidence and lower quality score'
      );
    });

    harness.it('F05-T2.3: Zero-defect sample achieves maximum 100 quality score and Grade A1', () => {
      const res = gradeProduceOptical({
        commodity: 'Wheat',
        defects: [],
        lightingScore: 1.0,
      });

      expect.equal(res.qualityScore, 100, 'Zero defect sample must receive 100 score');
      expect.equal(res.grade, 'Grade A1', 'Zero defect sample must be Grade A1');
      expect.equal(res.suggestedDiscountPercent, 0, 'Zero discount for flawless produce');
    });

    harness.it('F05-T2.4: Multiple composite defects aggregate across distinct defect kinds', () => {
      const res = gradeProduceOptical({
        commodity: 'Potato',
        defects: [
          { type: 'shriveling', severity: 0.2, areaPct: 3 },
          { type: 'bruising', severity: 0.2, areaPct: 3 },
          { type: 'foreign_matter', severity: 0.2, areaPct: 3 },
        ],
      });

      expect.equal(res.defectSummary.length, 3, 'Must record all 3 defect kinds');
      expect.closeTo(res.metrics.totalDefectAreaPct, 9.0, 0.1, 'Composite area must equal 9%');
    });

    harness.it('F05-T2.5: High severity spoilage triggers Reject even with small localized surface area', () => {
      const res = gradeProduceOptical({
        commodity: 'Potato',
        defects: [{ type: 'spoilage', severity: 0.95, areaPct: 6 }],
      });

      expect.equal(res.grade, 'Reject', 'Critical fungal spoilage must trigger Reject regardless of area < 10%');
      expect.equal(res.suggestedDiscountPercent, 100, 'Spoilage must mandate 100% discount / rejection');
    });
  });
}
