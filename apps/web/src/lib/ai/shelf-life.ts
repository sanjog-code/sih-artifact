export type ShelfLifeRiskLevel =
  | 'OPTIMAL'
  | 'MONITOR'
  | 'EXPEDITE_SALE'
  | 'DISPOSAL_RISK';

export interface ShelfLifeParams {
  commodity: string;
  currentQualityScore?: number;       // Initial quality (0 to 100, default 100)
  storageDays?: number;              // Current days elapsed in storage (default 0)
  ambientTemperatureC?: number;      // Storage temperature in °C (default 25)
  relativeHumidityPct?: number;      // Relative humidity % (default 70)
  isColdStorage?: boolean;           // Cold storage flag (overrides temp to 4°C if true and temp > 8)
}

export interface RetentionPoint {
  day: number;
  retainedQualityPct: number;
  recommendedDiscountPct: number;
}

export interface ShelfLifeResult {
  success: boolean;
  commodity: string;
  remainingShelfLifeDays: number;
  currentQualityRetainedPct: number;
  decayRatePerDay: number;
  dynamicMarkdownPercent: number;
  riskLevel: ShelfLifeRiskLevel;
  retentionCurve: RetentionPoint[];
  recommendations: string[];
  timestamp: string;
}

// Reference decay rates (day^-1) at T_ref = 4°C calibrated to standard ICAR/FAO storage benchmarks
const CROP_DECAY_RATES_REF: Record<string, number> = {
  tomato: 0.018,
  potato: 0.0025,
  onion: 0.0030,
  wheat: 0.0003,
  rice: 0.0003,
  mustard: 0.0005,
  soybean: 0.0005,
  maize: 0.0004,
  apple: 0.0050,
  banana: 0.022,
  mango: 0.016,
  leafy: 0.035,
  default: 0.014,
};

const T_REF = 4.0; // Reference temperature in °C
const Q10 = 2.0;   // Arrhenius temperature acceleration coefficient
const CRITICAL_SPOILAGE_QUALITY = 50.0; // Discard threshold

export function calculateShelfLifeDecay(params: ShelfLifeParams): ShelfLifeResult {
  const rawCommodity = (params.commodity || 'Vegetable').trim();
  const lowerComm = rawCommodity.toLowerCase();

  const initialQuality = Math.max(1, Math.min(100, Number(params.currentQualityScore ?? 100)));
  const storageDays = Math.max(0, Number(params.storageDays ?? 0));
  let tempC = Number(params.ambientTemperatureC ?? 25);
  const rhPct = Math.max(1, Math.min(100, Number(params.relativeHumidityPct ?? 70)));

  if (params.isColdStorage && tempC > 8) {
    tempC = 4.0;
  }

  // Determine base decay rate k_ref
  let kRef = CROP_DECAY_RATES_REF.default;
  for (const [key, val] of Object.entries(CROP_DECAY_RATES_REF)) {
    if (lowerComm.includes(key)) {
      kRef = val;
      break;
    }
  }

  // 1. Arrhenius Temperature Acceleration: k(T) = k_ref * Q10^((T - T_ref) / 10)
  const tempFactor = Math.pow(Q10, (tempC - T_REF) / 10.0);
  const kT = kRef * tempFactor;

  // 2. Vapor Pressure Deficit (VPD) Adjustment
  // e_s(T) in kPa = 0.61078 * exp((17.27 * T) / (T + 237.3))
  const satVaporPressure = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const vpd = satVaporPressure * (1.0 - rhPct / 100.0);
  const vpdFactor = 1.0 + 0.4 * Math.max(0, vpd - 0.6);

  // 3. Effective Decay Constant per Day
  const decayRatePerDay = Number((kT * vpdFactor).toFixed(5));

  // 4. Quality Retained at Storage Day t
  const currentQualityRetained = initialQuality * Math.exp(-decayRatePerDay * storageDays);
  const currentQualityRetainedPct = Number(
    Math.max(0, Math.min(100, currentQualityRetained)).toFixed(1)
  );

  // 5. Remaining Shelf-Life Days (time until quality drops to 50%)
  let remainingDays = 0;
  if (currentQualityRetainedPct > CRITICAL_SPOILAGE_QUALITY && decayRatePerDay > 0) {
    remainingDays = Math.log(currentQualityRetainedPct / CRITICAL_SPOILAGE_QUALITY) / decayRatePerDay;
  }
  const remainingShelfLifeDays = Number(Math.max(0, remainingDays).toFixed(1));

  // 6. Dynamic Markdown Discount Curve (0% to 35%)
  let dynamicMarkdownPercent = 0;
  if (currentQualityRetainedPct < 85.0) {
    const decayGap = (85.0 - currentQualityRetainedPct) / (85.0 - CRITICAL_SPOILAGE_QUALITY);
    dynamicMarkdownPercent = Number(Math.min(35.0, Math.max(0, decayGap * 35.0)).toFixed(1));
  }

  // 7. Risk Classification
  let riskLevel: ShelfLifeRiskLevel;
  if (currentQualityRetainedPct >= 80.0 && remainingShelfLifeDays >= 5.0) {
    riskLevel = 'OPTIMAL';
  } else if (currentQualityRetainedPct >= 65.0) {
    riskLevel = 'MONITOR';
  } else if (currentQualityRetainedPct >= CRITICAL_SPOILAGE_QUALITY) {
    riskLevel = 'EXPEDITE_SALE';
  } else {
    riskLevel = 'DISPOSAL_RISK';
  }

  // 8. Dynamic Recommendations
  const recommendations: string[] = [];
  if (tempC > 15 && !lowerComm.includes('wheat') && !lowerComm.includes('rice')) {
    recommendations.push(
      `Ambient temperature (${tempC.toFixed(1)}°C) accelerates perishability by ${tempFactor.toFixed(1)}x compared to cold storage. Relocate to refrigerated chamber (4-8°C).`
    );
  }
  if (rhPct < 60) {
    recommendations.push(
      `Low relative humidity (${rhPct}%) causes elevated VPD (${vpd.toFixed(2)} kPa), accelerating moisture transpiration and shriveling. Increase humidity to 85-90%.`
    );
  }
  if (dynamicMarkdownPercent > 0) {
    recommendations.push(
      `Recommend active markdown discount of ${dynamicMarkdownPercent}% to clear inventory before reaching critical spoilage threshold (${remainingShelfLifeDays} days remaining).`
    );
  } else {
    recommendations.push('Produce quality retention is optimal. Standard wholesale clearing terms apply.');
  }

  // 9. Projected Retention & Markdown Curve (Next 14 Days)
  const retentionCurve: RetentionPoint[] = [];
  const maxDays = Math.min(30, Math.max(10, Math.ceil(remainingShelfLifeDays + 5)));

  for (let dayOffset = 0; dayOffset <= maxDays; dayOffset += Math.max(1, Math.floor(maxDays / 10))) {
    const futureDay = storageDays + dayOffset;
    const futureQuality = Math.max(0, initialQuality * Math.exp(-decayRatePerDay * futureDay));
    let discount = 0;
    if (futureQuality < 85.0) {
      const gap = (85.0 - futureQuality) / (85.0 - CRITICAL_SPOILAGE_QUALITY);
      discount = Number(Math.min(35.0, Math.max(0, gap * 35.0)).toFixed(1));
    }

    retentionCurve.push({
      day: dayOffset,
      retainedQualityPct: Number(futureQuality.toFixed(1)),
      recommendedDiscountPct: discount,
    });
  }

  return {
    success: true,
    commodity: rawCommodity,
    remainingShelfLifeDays,
    currentQualityRetainedPct,
    decayRatePerDay,
    dynamicMarkdownPercent,
    riskLevel,
    retentionCurve,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}
