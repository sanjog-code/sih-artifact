import { gradeFromImageMeta, mockImageMetaFromDimensions, suspectSpoilage } from '../src/rules/grading';

describe('mock grading rules', () => {
  it('grades clean produce as A1 with high confidence', () => {
    const meta = mockImageMetaFromDimensions({ width: 1280, height: 720, byteSize: 400_000, defectCount: 0 });
    const r = gradeFromImageMeta(meta);
    expect(r.candidateGrade).toBe('A1');
    expect(r.confidence).toBeGreaterThan(0.8);
    expect(r.modelVersion).toBe('mock-rules-v1');
  });

  it('produces deterministic output for the same input', () => {
    const meta = mockImageMetaFromDimensions({ width: 640, height: 480, byteSize: 90_000, defectCount: 3 });
    expect(gradeFromImageMeta(meta)).toEqual(gradeFromImageMeta(meta));
  });

  it('records defects in the candidate output', () => {
    const meta = mockImageMetaFromDimensions({ width: 800, height: 600, byteSize: 120_000, defectCount: 5 });
    const r = gradeFromImageMeta(meta);
    expect(r.defects.length).toBe(5);
    expect(r.candidateGrade).not.toBe('UNGRADED');
  });

  it('flags spoilage risk from stock age', () => {
    expect(suspectSpoilage({ stockAgeDays: 6, grade: 'B', ambientTempC: 30, packaging: 'ventilated' }).risk).toBe('critical');
    expect(suspectSpoilage({ stockAgeDays: 0, grade: 'A1', ambientTempC: 20, packaging: 'ventilated' }).risk).toBe('low');
  });
});