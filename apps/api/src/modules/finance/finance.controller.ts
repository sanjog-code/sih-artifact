import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { FinanceService } from './finance.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { consentGrantSchema, consentRevokeSchema, financeCaseCreateSchema, financeStatusEventSchema } from '@farmlink/shared';


const idParam = z.string().min(1);

@ApiTags('finance')
@Controller('finance')
@UseGuards(AuthGuard, RbacGuard)
export class FinanceController {
  constructor(
    private readonly finance: FinanceService,
    private readonly prisma: PrismaService,
  ) {}

  // ------------------------------------------------------------------ Farmer
  @Post('consents')
  @Permissions(PERMISSIONS.FINANCE_CONSENT_OWN)
  @RateLimit(MutationRateLimit)
  async grantConsent(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = consentGrantSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.finance.grantConsent(user.id, parsed.data);
  }

  @Get('consents')
  @Permissions(PERMISSIONS.FINANCE_CONSENT_OWN)
  async myConsents(@CurrentUser() user: SessionUser) {
    return this.finance.myConsents(user.id);
  }

  @Post('consents/:id/revoke')
  @Permissions(PERMISSIONS.FINANCE_CONSENT_OWN)
  @RateLimit(MutationRateLimit)
  async revokeConsent(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = consentRevokeSchema.safeParse(body ?? {});
    await this.finance.revokeConsent(user.id, idParam.parse(id), parsed.success ? parsed.data.reason : undefined);
    return { ok: true };
  }

  /** Farmer e-NWR / financial-product enquiry with explicit consent. */
  @Post('enquiries')
  @Permissions(PERMISSIONS.ENWR_ENQUIRY_OWN)
  @RateLimit(MutationRateLimit)
  async enquiry(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = financeCaseCreateSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.finance.createCase(user.id, parsed.data);
  }

  @Get('cases')
  @Permissions(PERMISSIONS.FINANCE_CASE_VIEW_OWN)
  async myCases(@CurrentUser() user: SessionUser) {
    return this.finance.myCases(user.id);
  }

  // ------------------------------------------------------------- Finance partner
  @Get('partner/cases')
  @Permissions(PERMISSIONS.FINANCE_CASE_VIEW_CONSENTED)
  async partnerCases(@CurrentUser() user: SessionUser) {
    const orgId = await this.partnerOrgId(user);
    if (!orgId) return { ok: false, code: 'no_partner_org' };
    return this.finance.partnerCases(orgId);
  }

  @Put('partner/cases/:id/status')
  @Permissions(PERMISSIONS.FINANCE_CASE_UPDATE_CONSENTED)
  @RateLimit(MutationRateLimit)
  async partnerStatus(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const orgId = await this.partnerOrgId(user);
    if (!orgId) return { ok: false, code: 'no_partner_org' };
    const parsed = financeStatusEventSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    await this.finance.partnerUpdateStatus(orgId, idParam.parse(id), parsed.data.status, parsed.data.note);
    return { ok: true, status: parsed.data.status };
  }

  private async partnerOrgId(user: SessionUser): Promise<string | null> {
    const member = await this.prisma.orgMember.findFirst({
      where: { userId: user.id, org: { type: 'FINANCE_PARTNER' } },
      select: { orgId: true },
    });
    return member?.orgId ?? null;
  }
}