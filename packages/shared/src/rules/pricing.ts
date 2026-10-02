import {
  DEMO_DATA_LABEL,
  GRADE,
  Grade,
  PRICING_DISCLAIMER,
  PRICING_RULES_VERSION,
} from '../constants';
import type { DemandSignal, MarketSnapshot, PriceInsightInput, PriceInsightResult, PricingFactor } from '../types';

/**
 * Explainable, rule-based price guidance model (v1).
 * IMPORTANT: deterministic, auditable, human-explainable. This is NOT opaque ML,
 * and its output NEVER triggers automated selling/holding/listing.
 */

export interface GradeMultiplier {
  grade: Grade;
  multiplier: number;
  label: string;
}

export const GRADE_MULTIPLIERS: GradeMultiplier[] = [
  { grade: GRADE.A1, multiplier: 1.0, label: 'A1 (premium quality)' },
  { grade: GRADE.A2, multiplier: 0.93, label: 'A2 (good quality)' },
  { grade: GRADE.B, multiplier: 0.84, label: 'B (fair quality)' },
  { grade: GRADE.C, multiplier: 0.7, label: 'C (processing grade)' },
];

export const SEASON_FACTORS: Record<string, number> = {
  RABI: 1.04,
  KHARIF: 0.98,
  ZAID: 1.02,
  OFF_SEASON: 1.1,
};

export interface PricingRuleConfig {
  baseLowRs: number;
  baseHighRs: number;
  mspRs?: number;
  demandFactorBps?: number;
  supplyFactorBps?: number;
  seasonFactorBps?: number;
  stockAgeFactorBps?: number;
}

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

export function gradeMultiplier(grade: Grade): number {
  return GRADE_MULTIPLIERS.find((g) => g.grade === grade)?.multiplier ?? 1;
}

/**
 * Deterministic market-data snapshot. In production this is replaced by a real
 * market-data provider; the shape is identical.
 */
export function mockMarketSnapshot(opts: {
  cropCode: string;
  season: string;
  state: string;
  district?: string;
}): MarketSnapshot {
  const seed = hashString(`${opts.cropCode}|${opts.season}|${opts.state}|${opts.district ?? 'na'}`);
  const demandIndex = 40 + (seed % 5000) / 100; // 40..90
  const supplyIndex = 30 + ((seed * 7) % 4500) / 100; // 30..75
  const trendPct = ((seed % 1000) - 500) / 100; // -5..+5 %
  const freshnessMinutes = 12 + (seed % 600); // 12..612 min
  return {
    demandIndex: Math.round(demandIndex),
    supplyIndex: Math.round(supplyIndex),
    recentAvgRs: 0,
    trendPct: Math.round(trendPct * 100) / 100,
    freshnessMinutes,
    spotQuality: { defectPct: (seed % 150) / 10, pestPressure: (seed % 40) / 10 },
    qualityNote: 'Simulated mandi sample data for demo',
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function computePricingInsight(
  input: PriceInsightInput,
  rule: PricingRuleConfig,
  market: MarketSnapshot,
): PriceInsightResult {
  const gradeMul = gradeMultiplier(input.grade);
  const seasonFactor = SEASON_FACTORS[input.season ?? 'RABI'] ?? 1;

  // Center estimate from base rule, moved by grade & season.
  let low = rule.baseLowRs * gradeMul * seasonFactor;
  let high = rule.baseHighRs * gradeMul * seasonFactor;

  const factors: PricingFactor[] = [];
  const add = (key: string, label: string, direction: 'up' | 'down' | 'neutral', bps: number, explanation: string) =>
    factors.push({ key, label, direction, contributionBps: Math.round(bps), explanation });

  // Demand pressure.
  const demandBps = 2 * (market.demandIndex - 50); // -100..+100 bps
  add(
    'demand',
    'Demand in nearby mandis',
    demandBps >= 0 ? 'up' : 'down',
    demandBps,
    `Demand index ${market.demandIndex}/100 (${
      demandBps >= 0 ? 'above' : 'below'
    } seasonal norm)`,
  );

  // Supply pressure (inverse).
  const supplyBps = -2 * (market.supplyIndex - 50);
  add(
    'supply',
    'Fresh supply arriving',
    supplyBps >= 0 ? 'up' : 'down',
    supplyBps,
    `Supply index ${market.supplyIndex}/100 ${supplyBps >= 0 ? 'supports price' : 'pressures price'}`,
  );

  // Historical trend.
  const trendBps = Math.round(market.trendPct * 100);
  add(
    'trend',
    'Recent price trend (7d)',
    trendBps >= 0 ? 'up' : 'down',
    trendBps,
    `Prices ${trendBps >= 0 ? 'rising' : 'falling'} ~${Math.abs(trendBps / 100).toFixed(1)}% vs last week`,
  );

  // Stock age / spoilage pressure.
  const stockAgeDays = input.stockAgeDays ?? 0;
  const shelfPressureBps = stockAgeDays >= 3 ? -60 - stockAgeDays * 15 : 0;
  add(
    'stockAge',
    'Stock age & spoilage risk',
    shelfPressureBps >= 0 ? 'up' : 'down',
    shelfPressureBps,
    stockAgeDays === 0
      ? 'Fresh stock — minimal spoilage risk'
      : `Stock aged ${stockAgeDays}d — accelerating spoilage risk`,
  );

  // Quality premium.
  const qualityBps = input.grade === GRADE.A1 ? 25 : input.grade === GRADE.A2 ? 10 : input.grade === GRADE.B ? -15 : -50;
  add(
    'grade',
    `Grade ${input.grade} quality premium`, // eslint-disable-line @typescript-eslint/restrict-template-expressions
    qualityBps >= 0 ? 'up' : 'down',
    qualityBps,
    `Grade ${input.grade} trades ${qualityBps >= 0 ? 'at premium' : 'at discount'} (${(gradeMul * 100).toFixed(0)}% of A1)`,
  );

  const totalBps = factors.reduce((s, f) => s + f.contributionBps, 0);
  low = low * (1 + totalBps / 10000);
  high = high * (1 + totalBps / 10000);

  // MSP floor + policy constraint (configurable; never auto-enforced on sales).
  if (rule.mspRs) {
    low = Math.max(low, rule.mspRs);
    add('msp', 'Minimum Support Price floor', 'up', Math.max(0, Math.round(((rule.mspRs - high) / high) * 10000)), `MSP floor at ₹${rule.mspRs}/kg (policy constraint)`);
    high = Math.max(high, rule.mspRs);
  }

  // Demand signal.
  const net = market.demandIndex - market.supplyIndex;
  const demandSignal: DemandSignal = net >= 35 ? 'VERY_HIGH' : net >= 15 ? 'HIGH' : net >= -10 ? 'NORMAL' : 'LOW';

  // Sell / hold guidance (explicitly advisory only).
  const shelfLifeDays = 7;
  const agePct = stockAgeDays / shelfLifeDays;
  const priceHealthy = (low + high) / 2 >= (rule.mspRs ?? (low + high) / 2) * 1.05;
  const recommendSell =
    demandSignal === 'VERY_HIGH' || demandSignal === 'HIGH' || agePct >= 0.6 || priceHealthy;
  const considerHold = demandSignal === 'LOW' && agePct < 0.35 && !priceHealthy;
  const strongSellReason = agePct >= 0.8 ? ' — stock nearing spoilage' : '';

  // Confidence from freshness + determinism of inputs.
  const freshnessScore = clamp(1 - market.freshnessMinutes / 1440, 0.2, 1);
  const inputCompleteness = input.stockAgeDays !== undefined && input.stockQuantityKg ? 1 : 0.85;
  const confidence = Math.round(clamp(0.55 * freshnessScore + 0.25 * inputCompleteness + 0.2, 0, 1) * 100) / 100;

  return {
    cropId: input.cropId,
    varietyId: input.varietyId,
    grade: input.grade,
    state: input.state,
    suggestedLowRs: roundToHalf(low),
    suggestedHighRs: roundToHalf(high),
    demandSignal,
    recommendSell,
    considerHold,
    factors,
    confidence,
    dataFreshnessMinutes: market.freshnessMinutes,
    ruleVersion: PRICING_RULES_VERSION,
    disclaimer: `${PRICING_DISCLAIMER} ${DEMO_DATA_LABEL}`,
    generatedAt: PRICING_RULES_VERSION,
    inputs: input,
  };
}

function roundToHalf(x: number): number {
  return Math.max(0, Math.round(x * 2) / 2);
}

export function explainResult(result: PriceInsightResult): string {
  const top = [...result.factors].sort((a, b) => Math.abs(b.contributionBps) - Math.abs(a.contributionBps)).slice(0, 3);
  const lines = top.map((f) => `${f.label}: ${f.explanation}`);
  return lines.join('\n');
}