import { Injectable, NotFoundException } from '@nestjs/common';
import { FarmerDecisionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class FarmersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: { include: { farm: true } },
        memberships: { include: { org: true } },
      },
    });
    if (!user) throw new NotFoundException('user_not_found');
    return user;
  }

  async updateProfile(userId: string, input: { name?: string; lang?: string; cropsGrown?: string[] }) {
    const farmer = await this.prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new NotFoundException('farmer_profile_not_found');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        lang: input.lang === 'en' ? 'en' : input.lang === 'hi' ? 'hi' : undefined,
      },
    });
    const profile = await this.prisma.farmerProfile.update({
      where: { userId },
      data: { cropsGrown: input.cropsGrown },
    });
    await this.audit.record({ actorUserId: userId, action: 'farmer:profile_updated', targetType: 'user', targetId: userId });
    return { user, profile };
  }

  async declareProduce(userId: string, input: { cropId: string; varietyId: string; quantityKg: number; expectedHarvestDate?: string; cluster?: string; preferredLanguage?: string }) {
    const farm = await this.prisma.farm.findUnique({ where: { farmerUserId: userId }, select: { fpoCluster: true } });
    const cluster = input.cluster ?? farm?.fpoCluster ?? 'DEMO_CLUSTER';
    const req = await this.prisma.produceRequest.create({
      data: {
        farmerId: userId,
        cropId: input.cropId,
        varietyId: input.varietyId,
        quantityKg: input.quantityKg,
        expectedHarvestDate: input.expectedHarvestDate ? new Date(input.expectedHarvestDate) : new Date(Date.now() + 7 * 86400_000),
        cluster: cluster ?? 'DEMO_CLUSTER',
        preferredLanguage: (input.preferredLanguage === 'en' ? 'en' : 'hi') as never,
        status: 'DECLARED',
      },
    });
    await this.audit.record({ actorUserId: userId, action: 'farmer:produce_declared', targetType: 'produce_request', targetId: req.id, after: { cropId: input.cropId, qtyKg: input.quantityKg } });
    return { produceRequestId: req.id, status: 'DECLARED' };
  }

  async myDeclarations(userId: string) {
    return this.prisma.produceRequest.findMany({ where: { farmerId: userId }, orderBy: { createdAt: 'desc' }, include: { crop: { select: { name: true } }, variety: { select: { name: true } } } });
  }

  async requestPickup(userId: string, input: { cropId: string; varietyId: string; quantityKg: number; cluster?: string; note?: string; produceRequestId?: string }) {
    const farm = await this.prisma.farm.findUnique({ where: { farmerUserId: userId }, select: { fpoCluster: true } });
    const pickup = await this.prisma.pickupRequest.create({
      data: {
        farmerId: userId,
        produceRequestId: input.produceRequestId ?? null,
        cropId: input.cropId,
        varietyId: input.varietyId,
        quantityKg: input.quantityKg,
        cluster: input.cluster ?? farm?.fpoCluster ?? 'DEMO_CLUSTER',
        notes: input.note,
        status: 'SUBMITTED',
        isDemo: true,
      },
    });
    await this.audit.record({ actorUserId: userId, action: 'farmer:pickup_requested', targetType: 'pickup_request', targetId: pickup.id });
    return { pickupRequestId: pickup.id, status: 'SUBMITTED' };
  }

  async myPickups(userId: string) {
    return this.prisma.pickupRequest.findMany({ where: { farmerId: userId }, orderBy: { createdAt: 'desc' }, include: { crop: { select: { name: true } }, variety: { select: { name: true } } } });
  }

  async myLots(userId: string, opts: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      this.prisma.lot.findMany({
        where: { farmerId: userId },
        orderBy: { intakeAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
        include: {
          crop: { select: { name: true, nameHi: true } },
          variety: { select: { name: true } },
          stockBalance: true,
          warehouse: { select: { name: true, code: true } },
        },
      }),
      this.prisma.lot.count({ where: { farmerId: userId } }),
    ]);
    return { items, total, page: opts.page, pageSize: opts.pageSize };
  }

  async decide(userId: string, lotId: string, decision: FarmerDecisionType, note?: string): Promise<{ ok: boolean; decision: string }> {
    const lot = await this.prisma.lot.findFirst({ where: { id: lotId, farmerId: userId } });
    if (!lot) throw new NotFoundException('lot_not_found');
    if (!lot.confirmedGrade) return { ok: false, decision: decision }; // decide later once graded
    await this.prisma.lot.update({
      where: { id: lotId },
      data: { decision, decisionAt: new Date(), decisionById: userId, note: note ?? undefined },
    });
    await this.audit.record({ actorUserId: userId, action: 'farmer:lot_decision', targetType: 'lot', targetId: lot.lotNumber, after: { decision, note } });
    return { ok: true, decision };
  }

  async dashboard(userId: string) {
    const [lots, pendingPickups, declarations, insights, settlements, orders] = await Promise.all([
      this.prisma.lot.count({ where: { farmerId: userId } }),
      this.prisma.pickupRequest.count({ where: { farmerId: userId, status: { in: ['SUBMITTED', 'ACCEPTED', 'PICKUP_SCHEDULED'] } } }),
      this.prisma.produceRequest.count({ where: { farmerId: userId } }),
      this.prisma.pricingInsight.count({ where: { farmerId: userId } }),
      this.prisma.orderItem.count({ where: { lot: { farmerId: userId }, order: { status: 'DISPATCHED' } } }),
      this.prisma.order.count({ where: { items: { some: { lot: { farmerId: userId } } } } }),
    ]);
    return { lots, pendingPickups, declarations, insights, dispatchedOrderItems: settlements, orders, isDemo: true };
  }
}