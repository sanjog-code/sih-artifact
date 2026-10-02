import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { generateRfqNumber } from '../../common/utils/ids.util';

export interface CreateRfqInput {
  cropId: string;
  varietyId?: string;
  targetGrade: 'UNGRADED' | 'A1' | 'A2' | 'B' | 'C';
  quantityKg: number;
  maxPricePerKg: number;
  targetWarehouseId?: string;
  negotiateDeadlineAt?: string;
  note?: string;
}

export interface RespondInput {
  rfqId: string;
  lotId?: string;
  warehouseId?: string;
  proposedPricePerKg: number;
  quantityKg?: number;
  message?: string;
}

@Injectable()
export class RfqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
  ) {}

  async create(userId: string, input: CreateRfqInput): Promise<{ rfqId: string; rfqNumber: string }> {
    const org = await this.prisma.orgMember.findFirst({ where: { userId, org: { type: 'BUYER' } }, select: { orgId: true } });
    if (!org) throw new BadRequestException('buyer_org_required');
    const rfq = await this.prisma.rfq.create({
      data: {
        rfqNumber: generateRfqNumber(),
        organizationId: org.orgId,
        cropId: input.cropId,
        varietyId: input.varietyId ?? null,
        targetGrade: input.targetGrade,
        quantityKg: input.quantityKg,
        maxPricePerKg: input.maxPricePerKg,
        targetWarehouseId: input.targetWarehouseId ?? null,
        negotiateDeadlineAt: input.negotiateDeadlineAt ? new Date(input.negotiateDeadlineAt) : null,
        note: input.note,
        status: 'SUBMITTED',
      },
    });
    await this.audit.record({ actorUserId: userId, action: 'rfq:created', targetType: 'rfq', targetId: rfq.rfqNumber, after: { cropId: input.cropId, qty: input.quantityKg } });
    return { rfqId: rfq.id, rfqNumber: rfq.rfqNumber };
  }

  async listForBuyer(userId: string): Promise<never[]> {
    const org = await this.prisma.orgMember.findFirst({ where: { userId, org: { type: 'BUYER' } }, select: { orgId: true } });
    if (!org) return [];
    return this.prisma.rfq.findMany({
      where: { organizationId: org.orgId },
      orderBy: { createdAt: 'desc' },
      include: { negotiations: { orderBy: { createdAt: 'desc' }, take: 5 } },
    }) as Promise<never[]>;
  }

  async matchingForLots(farmerUserId: string) {
    const lots = await this.prisma.lot.findMany({
      where: { farmerId: farmerUserId, confirmedGrade: { not: null }, status: { in: ['ACCEPTED', 'STORED', 'RESERVED'] } },
      include: { crop: true },
    });
    const rfqs = await this.prisma.rfq.findMany({
      where: { status: { in: ['SUBMITTED', 'NEGOTIATING'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return {
      matches: lots.map((lot) => {
        const relevant = rfqs.filter(
          (r) => r.cropId === lot.cropId && (r.targetGrade === lot.confirmedGrade || r.targetGrade === 'A1') && (!r.targetWarehouseId || r.targetWarehouseId === lot.warehouseId),
        );
        return { lotId: lot.id, lotNumber: lot.lotNumber, crop: lot.crop.name, grade: lot.confirmedGrade, matches: relevant };
      }).filter((m) => m.matches.length > 0),
      openRfqs: rfqs.map((r) => ({ rfqId: r.id, rfqNumber: r.rfqNumber, cropId: r.cropId, targetGrade: r.targetGrade, quantityKg: r.quantityKg, maxPricePerKg: r.maxPricePerKg })),
    };
  }

  async respond(userId: string, userRole: Role, input: RespondInput): Promise<{ negotiationId: string; status: string }> {
    const rfq = await this.prisma.rfq.findUnique({ where: { id: input.rfqId } });
    if (!rfq) throw new NotFoundException('rfq_not_found');
    if (input.proposedPricePerKg > rfq.maxPricePerKg) {
      const dto = await this.prisma.rfqNegotiation.create({
        data: {
          rfqId: rfq.id,
          lotId: input.lotId ?? null,
          warehouseId: input.warehouseId ?? null,
          byRole: userRole,
          byUserId: userId,
          proposedPricePerKg: input.proposedPricePerKg,
          quantityKg: input.quantityKg ?? rfq.quantityKg,
          message: input.message,
          status: 'COUNTERED',
        },
      });
      return { negotiationId: dto.id, status: 'COUNTERED' };
    }
    const dto = await this.prisma.rfqNegotiation.create({
      data: {
        rfqId: rfq.id,
        lotId: input.lotId ?? null,
        warehouseId: input.warehouseId ?? null,
        byRole: userRole,
        byUserId: userId,
        proposedPricePerKg: input.proposedPricePerKg,
        quantityKg: input.quantityKg ?? rfq.quantityKg,
        message: input.message,
        status: 'OPEN',
      },
    });
    if (rfq.status !== 'NEGOTIATING') await this.prisma.rfq.update({ where: { id: rfq.id }, data: { status: 'NEGOTIATING' } });
    await this.audit.record({ actorUserId: userId, action: 'rfq:responded', targetType: 'rfq', targetId: rfq.rfqNumber });
    return { negotiationId: dto.id, status: 'OPEN' };
  }

  /** Buyer accepts a farmer's offer → reserves matching stock (bulk channel). */
  async acceptOffer(userId: string, negotiationId: string): Promise<{ ok: boolean; status: string; reservationId?: string }> {
    const org = await this.prisma.orgMember.findFirst({ where: { userId, org: { type: 'BUYER' } }, select: { orgId: true } });
    if (!org) throw new BadRequestException('buyer_org_required');

    const negotiation = await this.prisma.rfqNegotiation.findFirst({
      where: { id: negotiationId, rfq: { organizationId: org.orgId } },
      include: { rfq: true },
    });
    if (!negotiation) throw new NotFoundException('negotiation_not_found');
    if (negotiation.status !== 'OPEN') throw new BadRequestException('negotiation_not_open');

    let reservationId: string | undefined;
    if (negotiation.lotId) {
      const reservation = await this.inventory.reserve({
        lotId: negotiation.lotId,
        quantityKg: negotiation.quantityKg,
        channel: 'BULK',
        reference: negotiation.rfqId,
        idempotencyKey: `rfq-res-${negotiation.id}`,
      });
      reservationId = reservation?.id ?? undefined;
    }
    await this.prisma.rfqNegotiation.update({ where: { id: negotiation.id }, data: { status: 'ACCEPTED' } });
    await this.prisma.rfq.update({ where: { id: negotiation.rfqId }, data: { status: 'CONVERTED' } });
    await this.audit.record({ actorUserId: userId, action: 'rfq:accepted', targetType: 'rfq', targetId: negotiation.rfq.rfqNumber, after: { negotiationId } });
    return { ok: true, status: 'ACCEPTED', reservationId };
  }
}

export type { Prisma };