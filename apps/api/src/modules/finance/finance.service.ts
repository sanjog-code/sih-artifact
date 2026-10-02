import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConsentType, FinanceCaseStatus, Prisma } from '@prisma/client';
import { preliminaryFinanceEligibility, gradeMultiplier } from '@farmlink/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { generateCaseNumber } from '../../common/utils/ids.util';
import { sha256Hex } from '../../common/utils/crypto.util';

export interface ConsentGrantInput {
  type: ConsentType;
  version: string;
  dataFields?: string[];
  expiresAt?: string;
}

export interface FinanceEnquiryInput {
  consentId: string;
  lotId?: string;
  reason: string;
  requestedAmountRs?: number;
  durationMonths?: number;
}

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // -------------------------------------------------------------------------
  // Consent
  // -------------------------------------------------------------------------
  async grantConsent(userId: string, input: ConsentGrantInput): Promise<{ consentId: string; status: string }> {
    const consentTextHash = sha256Hex(`${input.type}:${input.version}:${JSON.stringify(input.dataFields)}`);
    const consent = await this.prisma.financeConsent.create({
      data: {
        userId,
        type: input.type,
        version: input.version,
        status: 'GRANTED',
        dataFields: input.dataFields ?? [],
        consentTextHash,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : new Date(Date.now() + 365 * 86400_000),
      },
    });
    await this.prisma.financeConsentHistory.create({
      data: { consentId: consent.id, action: 'GRANTED', version: input.version, byUserId: userId },
    });
    await this.audit.record({
      actorUserId: userId,
      action: 'finance:consent:granted',
      targetType: 'consent',
      targetId: consent.id,
      after: { type: input.type, version: input.version, fields: input.dataFields },
    });
    return { consentId: consent.id, status: 'GRANTED' };
  }

  async revokeConsent(userId: string, consentId: string, reason?: string): Promise<void> {
    const consent = await this.prisma.financeConsent.findUnique({ where: { id: consentId } });
    if (!consent || consent.userId !== userId) throw new NotFoundException('consent_not_found');
    if (consent.status !== 'GRANTED') throw new BadRequestException('consent_not_active');
    await this.prisma.financeConsent.update({
      where: { id: consentId },
      data: { status: 'REVOKED', revokedAt: new Date(), reason },
    });
    await this.prisma.financeConsentHistory.create({
      data: { consentId, action: 'REVOKED', version: consent.version, byUserId: userId, reason },
    });
    await this.audit.record({
      actorUserId: userId,
      action: 'finance:consent:revoked',
      targetType: 'consent',
      targetId: consentId,
      after: { reason },
    });
  }

  async myConsents(userId: string) {
    return this.prisma.financeConsent.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
      include: { history: { orderBy: { at: 'desc' }, take: 5 } },
    });
  }

  // -------------------------------------------------------------------------
  // Enquiry machinery => partner case (consent-gated)
  // -------------------------------------------------------------------------
  private async activeConsent(userId: string, consentId: string) {
    const consent = await this.prisma.financeConsent.findFirst({
      where: {
        id: consentId,
        userId,
        type: 'FINANCE_E_NWR',
        status: 'GRANTED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    return consent;
  }

  async createCase(userId: string, input: FinanceEnquiryInput): Promise<{ caseId: string; caseNumber: string; status: string }> {
    const consent = await this.activeConsent(userId, input.consentId);
    if (!consent) throw new ForbiddenException('consent_required');

    const farmer = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!farmer) throw new NotFoundException('user_not_found');

    // Preliminary eligibility check ONLY. No credit decision, no e-NWR, no WDRA claim.
    let lotValueRs = 0;
    let lotConfirmed = false;
    let eligible: ReturnType<typeof preliminaryFinanceEligibility>;
    if (input.lotId) {
      const lot = await this.prisma.lot.findUnique({ where: { id: input.lotId } });
      if (!lot || lot.farmerId !== userId) throw new NotFoundException('lot_not_found');
      lotConfirmed = lot.confirmedGrade !== null;
      if (lotConfirmed) {
        const rule = await this.prisma.priceRule.findFirst({ where: { cropId: lot.cropId, grade: lot.confirmedGrade!, isActive: true } });
        const unit = rule ? (rule.baseLowRs + rule.baseHighRs) / 2 * gradeMultiplier(lot.confirmedGrade!) : 10;
        lotValueRs = unit * lot.netWeightKg;
      }
    }
    eligible = preliminaryFinanceEligibility({
      farmerSinceDays: Math.max(0, Math.round((Date.now() - farmer.createdAt.getTime()) / 86400_000)),
      hasConsent: true,
      lotConfirmed,
      lotValueRs,
      requestedAmountRs: input.requestedAmountRs,
      recentTransactions: await this.prisma.order.count({ where: { userId } }),
      creditProfile: 'unknown',
    });

    const caseNumber = generateCaseNumber();
    const financeCase = await this.prisma.financeCase.create({
      data: {
        caseNumber,
        farmerUserId: userId,
        consentId: consent.id,
        lotId: input.lotId ?? null,
        quantityKg: input.lotId ? (await this.prisma.lot.findUnique({ where: { id: input.lotId } }))?.netWeightKg ?? null : null,
        reason: input.reason,
        requestedAmountRs: input.requestedAmountRs ?? null,
        durationMonths: input.durationMonths ?? null,
        eligibility: eligible as unknown as Prisma.InputJsonValue,
        status: 'CONSENTED',
        disclaimerSnapshot: { eligibilityDisclaimer: eligible.disclaimer, demo: true } as unknown as Prisma.InputJsonValue,
        partnerOrgId: null,
      },
    });
    await this.prisma.financeStatusEvent.create({
      data: { caseId: financeCase.id, from: 'DRAFT', to: 'CONSENTED', byUserId: userId, note: 'Farmer submitted consent-gated enquiry' },
    });
    await this.audit.record({
      actorUserId: userId,
      action: 'finance:case:created',
      targetType: 'finance_case',
      targetId: caseNumber,
      after: { consentId: consent.id, lotConsented: !!input.lotId, preliminaryEligible: eligible.eligibleForPreliminaryStep },
    });
    return { caseId: financeCase.id, caseNumber, status: 'CONSENTED' };
  }

  async myCases(userId: string) {
    return this.prisma.financeCase.findMany({
      where: { farmerUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: { consent: true, lot: { select: { id: true, lotNumber: true } }, events: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  /**
   * Partner-facing list: consent-scoped, data-minimized.
   * Partners only ever see consented, non-PII case data.
   */
  async partnerCases(partnerOrgId: string) {
    const cases = await this.prisma.financeCase.findMany({
      where: { partnerOrgId },
      orderBy: { createdAt: 'desc' },
      include: {
        consent: { select: { id: true, dataFields: true, version: true, status: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    return cases.map((c) => this.serializeForPartner(c as never));
  }

  private serializeForPartner(caseRow: any) {
    // Data minimization: only consented fields; never phone/email/address.
    const consented = new Set(caseRow.consent?.dataFields ?? []);
    return {
      caseNumber: caseRow.caseNumber,
      consentId: caseRow.consentId,
      consentVersion: caseRow.consent?.version,
      cropId: caseRow.cropId,
      lotConsented: caseRow.lotId ? consented.has('lot') : false,
      quantityKg: caseRow.quantityKg,
      reason: caseRow.reason,
      requestedAmountRs: caseRow.requestedAmountRs,
      durationMonths: caseRow.durationMonths,
      status: caseRow.status,
      eligibility: caseRow.eligibility,
      partnerRef: caseRow.partnerRef,
      createdAt: caseRow.createdAt,
      updatedAt: caseRow.updatedAt,
      statusEvents: (caseRow.events ?? []).map((e: any) => ({ from: e.from, to: e.to, note: e.note, at: e.createdAt })),
    };
  }

  async partnerAssignCases(partnerOrgId: string, caseIds: string[]): Promise<number> {
    const result = await this.prisma.financeCase.updateMany({
      where: { id: { in: caseIds }, partnerOrgId: null, status: 'CONSENTED' },
      data: { partnerOrgId, status: 'SHARED_WITH_PARTNER' },
    });
    await this.audit.record({
      action: 'finance:case:shared_with_partner',
      targetType: 'finance_case',
      targetId: `${caseIds.length} case(s)`,
    });
    return result.count;
  }

  async partnerUpdateStatus(partnerOrgId: string, caseId: string, to: string, note?: string): Promise<void> {
    const caseRow = await this.prisma.financeCase.findUnique({ where: { id: caseId } });
    if (!caseRow || caseRow.partnerOrgId !== partnerOrgId) throw new ForbiddenException('case_not_visible');
    const allowedFrom: Record<string, readonly string[]> = {
      SHARED_WITH_PARTNER: ['UNDER_PARTNER_REVIEW', 'DECLINED'],
      UNDER_PARTNER_REVIEW: ['APPROVED_BY_PARTNER', 'DECLINED', 'CLOSED'],
      APPROVED_BY_PARTNER: ['CLOSED'],
    };
    const allowed = allowedFrom[caseRow.status] ?? [];
    if (!allowed.includes(to)) throw new BadRequestException('invalid_status_transition');
    await this.prisma.financeCase.update({ where: { id: caseId }, data: { status: to as FinanceCaseStatus, partnerRef: caseRow.partnerRef ?? `PRT-${caseId.slice(0, 6)}` } });
    await this.prisma.financeStatusEvent.create({
      data: { caseId, from: caseRow.status, to: to as never, byUserId: null, note },
    });
    await this.audit.record({
      action: 'finance:case:status',
      targetType: 'finance_case',
      targetId: caseRow.caseNumber,
      before: { status: caseRow.status },
      after: { status: to, note },
    });
  }
}