import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InventoryService, IntakeParams } from '../inventory/inventory.service';
import { CartClearResult } from './warehouse.types';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  /** Warehouse operator's own warehouse ids (admins see all). */
  async scopedWarehouseIds(userId: string, isAdmin = false): Promise<string[]> {
    if (isAdmin) {
      const all = await this.prisma.warehouse.findMany({ select: { id: true } });
      return all.map((w) => w.id);
    }
    const whs = await this.prisma.warehouse.findMany({ where: { operatorUserId: userId }, select: { id: true } });
    return whs.map((w) => w.id);
  }

  async intake(params: IntakeParams): Promise<{ lotId: string; lotNumber: string; qrCode: string }> {
    return this.inventory.intake(params);
  }

  async lotDetail(lotId: string) {
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        farmer: { select: { id: true, name: true } },
        crop: { select: { id: true, name: true, nameHi: true } },
        variety: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true, code: true } },
        storageLocation: true,
        images: { orderBy: { createdAt: 'desc' }, take: 20 },
        stockBalance: true,
        confirmations: { orderBy: { reviewedAt: 'desc' }, take: 5 },
        gradingRuns: { orderBy: { queuedAt: 'desc' }, take: 5 },
      },
    });
    if (!lot) throw new NotFoundException('lot_not_found');
    const events = await this.prisma.inventoryEvent.findMany({
      where: { lotId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return { ...lot, events };
  }

  async listLots(input: {
    userId: string;
    warehouseId?: string;
    cropId?: string;
    status?: string;
    graded?: boolean;
    page: number;
    pageSize: number;
    isAdmin?: boolean;
  }) {
    const warehouseIds = input.warehouseId
      ? [input.warehouseId]
      : await this.scopedWarehouseIds(input.userId, input.isAdmin);
    const where: Record<string, unknown> = { warehouseId: { in: warehouseIds } };
    if (input.cropId) where.cropId = input.cropId;
    if (input.status) where.status = input.status;
    if (input.graded !== undefined) where.confirmedGrade = input.graded ? { not: 'UNGRADED' } : { equals: null };

    const [items, total] = await Promise.all([
      this.prisma.lot.findMany({
        where,
        orderBy: { intakeAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          crop: { select: { name: true, nameHi: true } },
          variety: { select: { name: true } },
          farmer: { select: { id: true } },
          storageLocation: { select: { code: true } },
          stockBalance: true,
        },
      }),
      this.prisma.lot.count({ where }),
    ]);
    return { items, total, page: input.page, pageSize: input.pageSize };
  }

  async storageLocations(userId: string, warehouseId?: string) {
    const warehouseIds = warehouseId ? [warehouseId] : await this.scopedWarehouseIds(userId);
    return this.prisma.storageLocation.findMany({
      where: { warehouseId: { in: warehouseIds }, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  // Placeholder to satisfy imports in tests that only exercise warehouse service.
  async nothing(): Promise<CartClearResult> {
    return { cleared: 0 };
  }
}