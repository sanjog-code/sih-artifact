import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { PricingService } from './pricing.service';
import { MarketDataService } from './market-data.service';
import { Permissions, CurrentUser, Public, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { SearchRateLimit, MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { priceRuleSchema } from '@farmlink/shared';
import { PrismaService } from '../../common/prisma/prisma.service';

const insightSchema = z.object({
  cropId: z.string().min(1),
  varietyId: z.string().optional(),
  grade: z.enum(['UNGRADED', 'A1', 'A2', 'B', 'C']),
  state: z.string().length(2),
  district: z.string().optional(),
  season: z.string().optional(),
  stockAgeDays: z.number().int().min(0).max(365).optional(),
  stockQuantityKg: z.number().positive().optional(),
  lotId: z.string().optional(),
});

const pageQ = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });

@ApiTags('pricing')
@Controller('pricing')
@UseGuards(AuthGuard, RbacGuard)
export class PricingController {
  constructor(
    private readonly pricing: PricingService,
    private readonly market: MarketDataService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('insight')
  @Permissions(PERMISSIONS.INSIGHT_VIEW_OWN)
  @RateLimit(MutationRateLimit)
  async insight(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = insightSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const result = await this.pricing.generateInsight(parsed.data, user.id);
    return { ok: true, ...result };
  }

  @Get('insights')
  @Permissions(PERMISSIONS.INSIGHT_VIEW_OWN)
  async myInsights(@CurrentUser() user: SessionUser, @Query() q: unknown) {
    const parsed = pageQ.safeParse(q ?? {});
    return this.pricing.listForFarmer(user.id, parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }

  @Public()
  @Get('observations')
  @RateLimit(SearchRateLimit)
  async observations(@Query('cropId') cropId: string | undefined, @Query() q: unknown) {
    const parsed = pageQ.safeParse(q ?? {});
    return this.pricing.listObservations({ cropId, ...(parsed.success ? parsed.data : { page: 1, pageSize: 20 }) });
  }

  @Get('market/status')
  async marketStatus() {
    const status = await this.market.snapshot({ cropCode: 'tomato', season: 'RABI', state: 'RJ' });
    return { provider: 'mock', freshnessMinutes: status.freshnessMinutes, isDemo: true };
  }

  @Put('rules')
  @Permissions(PERMISSIONS.ADMIN_CATALOGUE)
  @RateLimit(MutationRateLimit)
  async upsertRule(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = priceRuleSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const rule = await this.pricing.upsertPriceRule(parsed.data, user.id);
    return { ok: true, rule };
  }

  @Get('rules')
  @Permissions(PERMISSIONS.ADMIN_CATALOGUE)
  async rules() {
    return this.prisma.priceRule.findMany({ include: { crop: true }, orderBy: { updatedAt: 'desc' } });
  }
}