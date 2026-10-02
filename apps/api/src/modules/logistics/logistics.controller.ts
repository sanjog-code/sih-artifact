import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { LogisticsService } from './logistics.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit, SearchRateLimit } from '../../common/guards/rate-limit.guard';
import { WarehouseService } from '../warehouse/warehouse.service';

const idParam = z.string().min(1);
const routePlanSchema = z.object({
  warehouseId: z.string().min(1),
  cluster: z.string().min(1),
  date: z.string().datetime(),
  driverUserId: z.string().min(1),
  distanceKm: z.number().positive().optional(),
  etaMinutes: z.number().int().positive().optional(),
  pickupRequestIds: z.array(z.string().min(1)).optional(),
});
const podSchema = z.object({ podKey: z.string().min(1) });
const pickupQ = z.object({ warehouseId: z.string().optional(), cluster: z.string().optional(), status: z.string().optional() });

@ApiTags('logistics')
@Controller('logistics')
@UseGuards(AuthGuard, RbacGuard)
export class LogisticsController {
  constructor(
    private readonly logistics: LogisticsService,
    private readonly warehouse: WarehouseService,
  ) {}

  @Post('routes/plan')
  @Permissions(PERMISSIONS.LOGISTICS_ASSIGN)
  @RateLimit(MutationRateLimit)
  async plan(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = routePlanSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.logistics.planRoute({ ...parsed.data, actorId: user.id });
  }

  @Get('routes')
  @Permissions(PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN)
  @RateLimit(SearchRateLimit)
  async routes(@Query('date') date?: string, @Query('status') status?: string) {
    return this.logistics.listRoutes(date, status);
  }

  @Get('pickups')
  @Permissions(PERMISSIONS.PICKUP_MANAGE)
  @RateLimit(SearchRateLimit)
  async pickups(@Query() q: unknown) {
    const parsed = pickupQ.safeParse(q ?? {});
    return this.logistics.listPickups(parsed.success ? parsed.data : {});
  }

  @Post('routes/:id/start')
  @Permissions(PERMISSIONS.LOGISTICS_ASSIGN)
  @RateLimit(MutationRateLimit)
  async start(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    return this.logistics.startRoute(idParam.parse(id), user.id);
  }

  @Post('pickups/:id/complete')
  @Permissions(PERMISSIONS.PICKUP_MANAGE)
  @RateLimit(MutationRateLimit)
  async completePickup(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = podSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.logistics.completePickup(idParam.parse(id), parsed.data.podKey, user.id);
  }

  @Post('routes/:id/complete')
  @Permissions(PERMISSIONS.LOGISTICS_ASSIGN)
  @RateLimit(MutationRateLimit)
  async completeRoute(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = podSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.logistics.completeRoute(idParam.parse(id), parsed.data.podKey, user.id);
  }
}