export type AgmarkGrade =
  | 'Grade A1'
  | 'Grade A2'
  | 'Grade B'
  | 'Grade C'
  | 'Reject';

export interface DefectItem {
  type: string;
  severity: number; // 0.0 to 1.0
  areaPct: number;  // 0.0 to 100.0
}

export interface ProduceGradingParams {
  commodity: string;
  defects?: DefectItem[];
  lightingScore?: number;      // 0.0 to 1.0 (ambient optical illumination quality)
  sampleWeightGrams?: number;
}

export interface ProduceGradingResult {
  success: boolean;
  commodity: string;
  qualityScore: number;
  grade: AgmarkGrade;
  defectSummary: string[];
  suggestedDiscountPercent: number;
  metrics: {
    totalDefectAreaPct: number;
    primaryDefect?: string;
    agmarkStandardMet: boolean;
    cleanlinessScore: number;
  };
  timestamp: string;
}

const DEFECT_WEIGHTS: Record<string, number> = {
  bruising: 8.0,
  physical_damage: 8.0,
  discoloration: 5.0,
  shriveling: 7.0,
  foreign_matter: 4.0,
  fungal_decay: 18.0,
  spoilage: 15.0,
  other: 5.0,
};

export function assessProduceQuality(params: ProduceGradingParams): ProduceGradingResult {
  const commodity = params.commodity || 'Vegetable';
  const defects = params.defects || [];
  const lightingScore = Math.max(0, Math.min(1, params.lightingScore ?? 1.0));

  let totalDefectPenalty = 0;
  let totalDefectAreaPct = 0;
  let hasFungalDecay = false;
  let maxDefectImpact = 0;
  let primaryDefect: string | undefined;

  const defectSummary: string[] = [];

  for (const defect of defects) {
    const normType = defect.type.toLowerCase().trim();
    const weight = DEFECT_WEIGHTS[normType] || DEFECT_WEIGHTS.other;
    const severity = Math.max(0, Math.min(1, defect.severity));
    const areaPct = Math.max(0, Math.min(100, defect.areaPct));

    const defectImpact = weight * severity + areaPct * 2.2;
    totalDefectPenalty += defectImpact;
    totalDefectAreaPct += areaPct;

    if (normType.includes('fungal') || normType.includes('spoil')) {
      hasFungalDecay = true;
    }

    if (defectImpact > maxDefectImpact) {
      maxDefectImpact = defectImpact;
      primaryDefect = defect.type;
    }

    defectSummary.push(
      `${defect.type}: ${(severity * 100).toFixed(0)}% severity across ${areaPct.toFixed(1)}% surface area.`
    );
  }

  // Optical illumination penalty if lighting was poor during camera capture
  const lightingPenalty = (1.0 - lightingScore) * 6.0;
  const areaPenalty = totalDefectAreaPct * 0.8;

  const rawQuality = 100 - totalDefectPenalty - lightingPenalty - areaPenalty;
  const qualityScore = Number(Math.max(0, Math.min(100, rawQuality)).toFixed(1));

  // Determine AGMARK Grade per Indian APMC AGMARK Rules
  let grade: AgmarkGrade;
  let suggestedDiscountPercent = 0;

  if (hasFungalDecay && (totalDefectAreaPct > 2.0 || qualityScore < 60)) {
    grade = 'Reject';
    suggestedDiscountPercent = 100;
  } else if (qualityScore >= 88 && totalDefectAreaPct <= 2.5 && defects.length <= 1) {
    grade = 'Grade A1';
    suggestedDiscountPercent = 0;
  } else if (qualityScore >= 75 && totalDefectAreaPct <= 6.0 && defects.length <= 3) {
    grade = 'Grade A2';
    suggestedDiscountPercent = 6;
  } else if (qualityScore >= 60 && totalDefectAreaPct <= 14.0 && defects.length <= 5) {
    grade = 'Grade B';
    suggestedDiscountPercent = 15;
  } else if (qualityScore >= 45 && totalDefectAreaPct <= 22.0) {
    grade = 'Grade C';
    suggestedDiscountPercent = 28;
  } else {
    grade = 'Reject';
    suggestedDiscountPercent = 100;
  }

  if (defectSummary.length === 0) {
    defectSummary.push('No surface defects detected. Uniform skin color and pristine morphology.');
  }

  const cleanlinessScore = Number(Math.max(0, 100 - totalDefectAreaPct * 3.5).toFixed(1));
  const agmarkStandardMet = grade !== 'Reject';

  return {
    success: true,
    commodity,
    qualityScore,
    grade,
    defectSummary,
    suggestedDiscountPercent,
    metrics: {
      totalDefectAreaPct: Number(totalDefectAreaPct.toFixed(2)),
      primaryDefect,
      agmarkStandardMet,
      cleanlinessScore,
    },
    timestamp: new Date().toISOString(),
  };
}
