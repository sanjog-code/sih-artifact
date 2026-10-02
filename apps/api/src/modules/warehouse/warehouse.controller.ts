import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { WarehouseService } from './warehouse.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueueService } from '../../common/queue/queue.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { intakeSchema, offlineIntakeSyncSchema } from '@farmlink/shared';

export const OFFLINE_INTAKE_QUEUE = 'offline-intake';

const idParam = z.string().min(1);
const queryOpts = z.object({
  warehouseId: z.string().optional(),
  cropId: z.string().optional(),
  status: z.string().optional(),
  graded: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

@ApiTags('warehouse')
@Controller('warehouse')
@UseGuards(AuthGuard, RbacGuard)
export class WarehouseController {
  constructor(
    private readonly warehouse: WarehouseService,
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  @Get('lots')
  @Permissions(PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN)
  async lots(@CurrentUser() user: SessionUser, @Query() q: unknown) {
    const parsed = queryOpts.safeParse(q ?? {});
    const fallback = { warehouseId: undefined as string | undefined, cropId: undefined as string | undefined, status: undefined as string | undefined, graded: undefined as string | undefined, page: 1, pageSize: 20 };
    const opts = parsed.success ? { ...fallback, ...parsed.data } : fallback;
    const isAdmin = user.role === 'operations_admin' || user.role === 'platform_admin';
    return this.warehouse.listLots({
      userId: user.id,
      warehouseId: opts.warehouseId,
      cropId: opts.cropId,
      status: opts.status,
      graded: opts.graded === 'true' ? true : opts.graded === 'false' ? false : undefined,
      page: opts.page,
      pageSize: opts.pageSize,
      isAdmin,
    });
  }

  @Get('lots/:id')
  @Permissions(PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN)
  async lot(@Param('id') id: string) {
    return this.warehouse.lotDetail(idParam.parse(id));
  }

  @Get('storage')
  @Permissions(PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN)
  async storage(@CurrentUser() user: SessionUser, @Query('warehouseId') warehouseId?: string) {
    return this.warehouse.storageLocations(user.id, warehouseId);
  }

  @Post('intake')
  @Permissions(PERMISSIONS.WAREHOUSE_INTAKE)
  @RateLimit(MutationRateLimit)
  async intake(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = intakeSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const result = await this.warehouse.intake({
      ...parsed.data,
      intakeById: user.id,
      isDemo: false,
    });
    return { ok: true, ...result };
  }

  /**
   * Resilient offline intake: a device queues the payload locally and syncs it
   * here later. The idempotency key guarantees a given physical intake is
   * processed exactly once even if the sync request retries.
   */
  @Post('offline-intake/sync')
  @Permissions(PERMISSIONS.WAREHOUSE_INTAKE)
  @RateLimit(MutationRateLimit)
  async offlineIntakeSync(@Body() body: unknown, @CurrentUser() _user: SessionUser) {
    const parsed = offlineIntakeSyncSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const { deviceId, idempotencyKey, payload } = parsed.data;

    const existing = await this.prisma.syncQueueItem.findUnique({ where: { idempotencyKey } });
    if (existing) return { ok: true, accepted: true, status: existing.status, queued: false };

    await this.prisma.syncQueueItem.create({
      data: { deviceId, idempotencyKey, payload: payload as never, status: 'PENDING' },
    });
    await this.queue.enqueue(OFFLINE_INTAKE_QUEUE, { idempotencyKey }, { jobId: `offline-${idempotencyKey}` });
    return { ok: true, accepted: true, queued: true };
  }
}