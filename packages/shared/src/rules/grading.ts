import { Grade } from '../constants';

/**
 * Deterministic mock grading model. Real deployments replace `gradeFromImageMeta`
 * with a camera-grading inference service behind the same interface. Farmers'
 * images are NEVER used for training — the model is a fixed rule set.
 */

export interface ImageMeta {
  width: number; // px
  height: number; // px
  byteSize: number;
  avgBrightness: number; // 0..255
  colorHueDeg: number; // dominant hue approx
  colorSaturation: number; // 0..1
  colorValue: number; // 0..1
  objectAreaPct: number; // 0..100 estimated produce coverage
  defectCount: number; // simulated defect blobs
}

export interface DetectDefect {
  kind: 'physical_damage' | 'discoloration' | 'shriveling' | 'foreign_matter';
  severity: 'low' | 'medium' | 'high';
  areaPct: number;
}

export interface GradeCandidate {
  candidateGrade: Grade;
  confidence: number; // 0..1
  defects: DetectDefect[];
  modelVersion: string;
  imageMeta: ImageMeta;
  method: 'mock-rules-v1';
}

export const MOCK_GRADING_MODEL_VERSION = 'mock-rules-v1';

export function mockImageMetaFromDimensions(opts: {
  width: number;
  height: number;
  byteSize: number;
  defectCount?: number;
  brightness?: number;
  saturation?: number;
  objectAreaPct?: number;
}): ImageMeta {
  const seed = opts.width * 31 + opts.height + opts.byteSize;
  const s = Math.abs(seed);
  return {
    width: opts.width,
    height: opts.height,
    byteSize: opts.byteSize,
    avgBrightness: opts.brightness ?? 110 + (s % 90),
    colorHueDeg: (s % 60) + 15, // red/orange-ish dominant hue
    colorSaturation: opts.saturation ?? 0.35 + ((s % 40) / 100),
    colorValue: 0.5 + ((s % 40) / 100),
    objectAreaPct: opts.objectAreaPct ?? 55 + (s % 40),
    defectCount: opts.defectCount ?? (s % 8),
  };
}

export function gradeFromImageMeta(meta: ImageMeta): GradeCandidate {
  const defectScore = meta.defectCount * 100000 + meta.objectAreaPct;
  const darknessPenalty = meta.avgBrightness < 90 ? 1 : 0;
  const lowAreaPenalty = meta.objectAreaPct < 45 ? 1 : 0;

  let candidateGrade: Grade;
  let confidence: number;
  let defectCount = meta.defectCount;

  // Keep the "score" deterministic.
  const defects: DetectDefect[] = [];
  const rng = (n: number): number => {
    const x = Math.sin(defectScore + n * 91.7) * 43758.5453;
    return Math.abs(x - Math.floor(x));
  };
  if (defectCount > 0) {
    for (let i = 0; i < defectCount; i++) {
      defects.push({
        kind: (['physical_damage', 'discoloration', 'shriveling', 'foreign_matter'] as const)[
          Math.floor(rng(i) * 4)
        ]!,
        severity: rng(i + 99) < 0.3 ? 'high' : rng(i) < 0.6 ? 'medium' : 'low',
        areaPct: Math.round(rng(i + 7) * 12) / 10,
      });
    }
  }

  if (defectCount <= 1 && !darknessPenalty && !lowAreaPenalty) {
    candidateGrade = 'A1';
    confidence = 0.82 + rng(11) * 0.13;
  } else if (defectCount <= 3 && !lowAreaPenalty) {
    candidateGrade = 'A2';
    confidence = 0.7 + rng(12) * 0.2;
  } else if (defectCount <= 5) {
    candidateGrade = 'B';
    confidence = 0.6 + rng(13) * 0.24;
  } else {
    candidateGrade = 'C';
    confidence = 0.55 + rng(14) * 0.25;
  }

  return {
    candidateGrade,
    confidence: Math.round(Math.min(0.99, confidence) * 100) / 100,
    defects,
    modelVersion: MOCK_GRADING_MODEL_VERSION,
    imageMeta: meta,
    method: 'mock-rules-v1',
  };
}

export function suspectSpoilage(opts: {
  stockAgeDays: number;
  grade: Grade;
  ambientTempC: number;
  packaging: 'ventilated' | 'sealed';
}): { risk: 'low' | 'medium' | 'high' | 'critical'; nextAction: string } {
  const shelfLife = gradeShelfLifeDays(opts.grade);
  const agePct = opts.stockAgeDays / shelfLife;
  let risk: 'low' | 'medium' | 'high' | 'critical';
  if (agePct >= 1) risk = 'critical';
  else if (agePct >= 0.7) risk = 'high';
  else if (agePct >= 0.4 || opts.ambientTempC > 32) risk = 'medium';
  else risk = 'low';
  const nextAction =
    risk === 'critical'
      ? 'Dispatch immediately or quarantine; expect heavy spoilage'
      : risk === 'high'
        ? 'Prioritize dispatch within 24h; monitor temperature'
        : risk === 'medium'
          ? 'Review cold-chain and sell within 48h'
          : 'No immediate action required';
  return { risk, nextAction };
}

export function gradeShelfLifeDays(grade: Grade): number {
  if (grade === 'A1') return 7;
  if (grade === 'A2') return 6;
  if (grade === 'B') return 4;
  return 3;
}