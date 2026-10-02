import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Grade, FarmerDecisionType, LotStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ObjectStorage, OBJECT_STORAGE } from '../../common/storage/object-storage.interface';

export interface SearchQuery {
  q?: string;
  cropId?: string;
  grade?: Grade;
  state?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async search(input: SearchQuery) {
    const where: Record<string, unknown> = {
      status: { in: [LotStatus.ACCEPTED, LotStatus.STORED, LotStatus.RESERVED] },
      decision: { in: [FarmerDecisionType.LIST_FOR_BUYERS, FarmerDecisionType.REQUEST_QUOTE, FarmerDecisionType.SELL_NOW] },
      stockBalance: { is: { quantityAvailableKg: { gt: 0 } } },
    };
    if (input.cropId) where.cropId = input.cropId;
    if (input.grade) where.confirmedGrade = input.grade;
    if (input.state) where.warehouse = { is: { state: input.state } };
    if (input.q) {
      where.OR = [
        { crop: { name: { contains: input.q, mode: 'insensitive' as const } } },
        { crop: { nameHi: { contains: input.q, mode: 'insensitive' as const } } },
        { variety: { name: { contains: input.q, mode: 'insensitive' as const } } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.lot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          crop: { select: { id: true, name: true, nameHi: true, code: true } },
          variety: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true, district: true, state: true } },
          farmer: {
            select: {
              id: true,
              farmerProfile: { select: { farm: { select: { state: true, district: true, fpoCluster: true } } } },
            },
          },
          stockBalance: { select: { quantityAvailableKg: true } },
        },
      }),
      this.prisma.lot.count({ where }),
    ]);
    const items = [];
    for (const row of rows) {
      const farm = row.farmer.farmerProfile?.farm;
      items.push({
        id: row.id,
        lotNumber: row.lotNumber,
        crop: row.crop,
        variety: row.variety,
        warehouse: row.warehouse,
        origin: { state: farm?.state ?? null, district: farm?.district ?? null, fpoCluster: farm?.fpoCluster ?? null },
        confirmedGrade: row.confirmedGrade,
        decision: row.decision,
        quantityAvailableKg: row.stockBalance?.quantityAvailableKg ?? 0,
        pricePerKgRs: 0,
        qrVerified: false,
        isDemo: row.isDemo,
      } as Record<string, unknown>);
    }
    await Promise.all(items.map((item) => this.attachPrice(item)));
    return { items, total, page: input.page, pageSize: input.pageSize };
  }

  private async attachPrice(item: Record<string, any>): Promise<void> {
    const cropId = item.crop?.id as string | undefined;
    if (!cropId) return;
    const rule = await this.prisma.priceRule.findFirst({ where: { cropId, isActive: true } });
    const obs = await this.prisma.priceObservation.findFirst({
      where: { cropId },
      orderBy: { observedAt: 'desc' },
    });
    const base = rule ? (rule.baseLowRs + rule.baseHighRs) / 2 : (obs?.wholesalePrice ?? 20);
    const gradeKey = (item.confirmedGrade as string) ?? 'UNGRADED';
    const multiplier = gradeKey === 'A1' ? 1.05 : gradeKey === 'A2' ? 1.0 : gradeKey === 'B' ? 0.94 : gradeKey === 'C' ? 0.86 : 1.0;
    item.pricePerKgRs = Math.round(base * multiplier * 100) / 100;
    item.priceBasis = rule ? 'policy_rule' : 'latest_observation';
    item.priceDisclaimer = 'Sample demo price; use as guidance only.';
  }

  async catalogue() {
    const [crops, varieties] = await Promise.all([this.prisma.crop.findMany({ orderBy: { name: 'asc' } }), this.prisma.variety.findMany({ orderBy: { name: 'asc' } })]);
    return { crops, varieties };
  }

  async currentPrice(cropId?: string) {
    const where = cropId ? { cropId } : {};
    const obs = await this.prisma.priceObservation.findMany({
      where,
      orderBy: { observedAt: 'desc' },
      take: 10,
    });
    return { items: obs, provider: 'mock', disclaimer: 'Sample market data for demonstration. Real feeding via mandi/API integrations in production.' };
  }

  /** Farm-to-fork traceability for a QR-scanned lot (public, PII-free). */
  async traceability(lotId: string, qrToken?: string) {
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        crop: { select: { id: true, name: true, nameHi: true, code: true } },
        variety: { select: { id: true, name: true } },
        images: { select: { id: true, objectKey: true, mime: true, createdAt: true }, take: 3 },
        storageLocation: { select: { id: true, code: true, kind: true } },
        warehouse: { select: { id: true, name: true, district: true, state: true } },
        farmer: {
          select: {
            id: true,
            farmerProfile: { select: { farm: { select: { state: true, district: true, fpoCluster: true } } } },
          },
        },
        confirmations: { select: { confirmedGrade: true }, orderBy: { reviewedAt: 'desc' }, take: 20 },
      },
    });
    if (!lot) throw new NotFoundException('lot_not_found');

    const events = await this.prisma.inventoryEvent.findMany({
      where: { lotId },
      orderBy: { createdAt: 'asc' },
      select: { type: true, quantityDeltaKg: true, createdAt: true, referenceType: true },
    });

    const gallery = await Promise.all(
      lot.images.map(async (img) => ({ imageId: img.id, mime: img.mime, capturedAt: img.createdAt, url: await this.storage.getSignedDownloadUrl(img.objectKey) })),
    );

    const farm = lot.farmer.farmerProfile?.farm;
    const shelfAdvice = gallery.length > 0 ? this.shelflifeHint(lot.confirmedGrade, lot.netWeightKg) : undefined;

    return {
      lotId: lot.id,
      qrVerified: !!qrToken,
      lotNumber: lot.lotNumber,
      crop: lot.crop,
      variety: lot.variety,
      origin: {
        farmCluster: farm?.fpoCluster ?? undefined,
        state: farm?.state,
        district: farm?.district,
      },
      warehouse: lot.warehouse,
      gallery,
      receivedAt: lot.intakeAt,
      receivedNetKg: lot.netWeightKg,
      currentGrade: lot.confirmedGrade,
      gradeHistory: lot.confirmations.map((c) => c.confirmedGrade),
      storage: lot.storageLocation,
      journey: events.map((e) => ({ stage: e.type, qtyKg: e.quantityDeltaKg, at: e.createdAt, reference: e.referenceType ?? undefined })),
      marketOutlook: {
        status: lot.status,
        shelfAdvice,
        disclaimer: 'Sample grading/storage data from a demo pilot.',
      },
    };
  }

  private shelflifeHint(grade: Grade | null, weightKg: number): string {
    if (grade && grade !== Grade.UNGRADED) return `${grade} approved lot scales to market in 24-48h (demo guidance).`;
    if (weightKg > 0) return `Awaiting grading confirmation (demo).`;
    return 'Awaiting intake confirmation (demo).';
  }
}