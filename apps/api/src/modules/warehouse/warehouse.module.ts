import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { WarehouseController, OFFLINE_INTAKE_QUEUE } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueueService } from '../../common/queue/queue.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
class OfflineIntakeWorker implements OnModuleInit {
  constructor(
    private readonly queue: QueueService,
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  onModuleInit(): void {
    this.queue.register(OFFLINE_INTAKE_QUEUE, async (data) => {
      const idempotencyKey = String(data.idempotencyKey ?? '');
      if (!idempotencyKey) return;
      const item = await this.prisma.syncQueueItem.findUnique({ where: { idempotencyKey } });
      if (!item || item.status === 'SUCCESS') return;
      await this.prisma.syncQueueItem.update({
        where: { id: item.id },
        data: { status: 'PROCESSING', attempts: { increment: 1 } },
      });
      try {
        const payload = item.payload as unknown as {
          farmerId: string;
          cropId: string;
          varietyId: string;
          warehouseId: string;
          storageLocationId?: string;
          sourceCluster: string;
          grossWeightKg: number;
          tareWeightKg: number;
        };
        await this.inventory.intake({
          farmerId: payload.farmerId,
          cropId: payload.cropId,
          varietyId: payload.varietyId,
          warehouseId: payload.warehouseId,
          storageLocationId: payload.storageLocationId,
          sourceCluster: payload.sourceCluster,
          grossWeightKg: payload.grossWeightKg,
          tareWeightKg: payload.tareWeightKg,
          intakeById: 'sync-worker',
          idempotencyKey,
        });
        await this.prisma.syncQueueItem.update({
          where: { id: item.id },
          data: { status: 'SUCCESS', processedAt: new Date() },
        });
      } catch (err) {
        await this.prisma.syncQueueItem.update({
          where: { id: item.id },
          data: { status: 'FAILED', lastError: String((err as Error).message).slice(0, 400) },
        });
        throw err;
      }
    });
  }
}

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, OfflineIntakeWorker, QueueService],
  exports: [WarehouseService],
})
export class WarehouseModule {}