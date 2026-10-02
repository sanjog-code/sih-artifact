import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Grade, Prisma } from '@prisma/client';
import { computePricingInsight, type PriceInsightResult, type PricingRuleConfig } from '@farmlink/shared';
import { PRICING_RULES_VERSION } from '@farmlink/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { MarketDataService } from './market-data.service';

export interface InsightRequest {
  cropId: string;
  varietyId?: string;
  grade: Grade;
  state: string;
  district?: string;
  season?: string;
  stockAgeDays?: number;
  stockQuantityKg?: number;
  lotId?: string;
}

@Injectable()
export class PricingService {
  private readonly log = new Logger('pricing');

  constructor(
    private readonly prisma: PrismaService,
    private readonly market: MarketDataService,
    private readonly audit: AuditService,
  ) {}

  private async ruleConfig(cropId: string, grade: Grade): Promise<PricingRuleConfig> {
    const rule = await this.prisma.priceRule.findFirst({ where: { cropId, grade, isActive: true } });
    if (rule) {
      return {
        baseLowRs: rule.baseLowRs,
        baseHighRs: rule.baseHighRs,
        mspRs: rule.mspRs ?? undefined,
        demandFactorBps: rule.demandFactorBps,
        supplyFactorBps: rule.supplyFactorBps,
        seasonFactorBps: rule.seasonFactorBps,
        stockAgeFactorBps: rule.stockAgeFactorBps,
      };
    }
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException('crop_not_found');
    return { baseLowRs: 12, baseHighRs: 16, mspRs: 10 };
  }

  async generateInsight(input: InsightRequest, actorId: string): Promise<{ id: string; result: PriceInsightResult; isDemo: boolean }> {
    const crop = await this.prisma.crop.findUnique({ where: { id: input.cropId } });
    if (!crop) throw new NotFoundException('crop_not_found');

    const rule = await this.ruleConfig(input.cropId, input.grade);
    const market = await this.market.snapshot({
      cropCode: crop.code,
      season: input.season ?? 'RABI',
      state: input.state,
      district: input.district,
    });
    const result = computePricingInsight(
      {
        cropId: input.cropId,
        varietyId: input.varietyId,
        grade: input.grade,
        state: input.state,
        district: input.district,
        season: input.season,
        stockAgeDays: input.stockAgeDays,
        stockQuantityKg: input.stockQuantityKg,
      },
      rule,
      market,
    );

    const insight = await this.prisma.pricingInsight.create({
      data: {
        lotId: input.lotId ?? null,
        farmerId: actorId,
        cropId: input.cropId,
        varietyId: input.varietyId ?? null,
        grade: result.grade,
        state: result.state,
        inputSnapshot: input as unknown as Prisma.InputJsonValue,
        marketSnapshot: market as unknown as Prisma.InputJsonValue,
        outputSnapshot: { factors: result.factors, demandSignal: result.demandSignal } as unknown as Prisma.InputJsonValue,
        suggestedLowRs: result.suggestedLowRs,
        suggestedHighRs: result.suggestedHighRs,
        demandSignal: result.demandSignal,
        recommendSell: result.recommendSell,
        considerHold: result.considerHold,
        confidence: result.confidence,
        dataFreshnessMinutes: result.dataFreshnessMinutes,
        ruleVersion: result.ruleVersion,
        disclaimer: result.disclaimer,
        isDemo: true, // sample data (mock market feed) by design
      },
    });

    await this.audit.record({
      actorUserId: actorId,
      action: 'pricing:insight:generated',
      targetType: 'pricing_insight',
      targetId: insight.id,
      after: {
        cropId: input.cropId,
        grade: result.grade,
        suggestedLowRs: result.suggestedLowRs,
        suggestedHighRs: result.suggestedHighRs,
        ruleVersion: result.ruleVersion,
      },
    });

    return { id: insight.id, result, isDemo: true };
  }

  async listForFarmer(farmerId: string, opts: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      this.prisma.pricingInsight.findMany({
        where: { farmerId },
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
        include: { lot: { select: { id: true, lotNumber: true } } },
      }),
      this.prisma.pricingInsight.count({ where: { farmerId } }),
    ]);
    const cropIds = [...new Set(items.map((i) => i.cropId).filter(Boolean))];
    const crops = await this.prisma.crop.findMany({ where: { id: { in: cropIds } }, select: { id: true, name: true } });
    const cropNameById = new Map(crops.map((c) => [c.id, c.name]));
    const enriched = items.map((i) => ({ ...i, cropName: cropNameById.get(i.cropId) ?? null }));
    return { items: enriched, total, page: opts.page, pageSize: opts.pageSize };
  }

  async latestForLot(lotId: string) {
    return this.prisma.pricingInsight.findFirst({
      where: { lotId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listObservations(opts: { cropId?: string; page: number; pageSize: number }) {
    const where = opts.cropId ? { cropId: opts.cropId } : {};
    const [items, total] = await Promise.all([
      this.prisma.priceObservation.findMany({
        where,
        orderBy: { observedAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.priceObservation.count({ where }),
    ]);
    return { items, total, page: opts.page, pageSize: opts.pageSize };
  }

  async upsertPriceRule(
    input: {
      cropId: string;
      grade: Grade;
      baseLowRs: number;
      baseHighRs: number;
      mspRs?: number;
      isActive: boolean;
      version?: string;
    },
    actorId: string,
  ) {
    const before = await this.prisma.priceRule.findUnique({ where: { cropId_grade: { cropId: input.cropId, grade: input.grade } } });
    const rule = await this.prisma.priceRule.upsert({
      where: { cropId_grade: { cropId: input.cropId, grade: input.grade } },
      create: {
        cropId: input.cropId,
        grade: input.grade,
        baseLowRs: input.baseLowRs,
        baseHighRs: input.baseHighRs,
        mspRs: input.mspRs,
        isActive: input.isActive,
        version: input.version ?? PRICING_RULES_VERSION,
        updatedBy: actorId,
        isDemo: true,
      },
      update: {
        baseLowRs: input.baseLowRs,
        baseHighRs: input.baseHighRs,
        mspRs: input.mspRs,
        isActive: input.isActive,
        version: input.version ?? PRICING_RULES_VERSION,
        updatedBy: actorId,
      },
    });
    await this.audit.record({
      actorUserId: actorId,
      action: 'pricing:policychange',
      targetType: 'price_rule',
      targetId: rule.id,
      before: before ?? undefined,
      after: rule,
    });
    return rule;
  }
}