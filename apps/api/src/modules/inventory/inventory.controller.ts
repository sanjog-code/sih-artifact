import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { InventoryService } from './inventory.service';
import { Permissions, RateLimit, CurrentUser } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { inventoryCorrectionSchema } from '@farmlink/shared';

const idParam = z.string().min(1);

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(AuthGuard, RbacGuard)
export class InventoryController {
  constructor(
    private readonly inventory: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('lots/:id/balance')
  @Permissions(PERMISSIONS.INSIGHT_VIEW_OWN, PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN)
  async balance(@Param('id') id: string, @CurrentUser() _user: SessionUser) {
    const lot = await this.prisma.lot.findUnique({ where: { id: idParam.parse(id) } });
    if (!lot) return { ok: false, code: 'not_found' };
    return this.inventory.lotStock(lot.id);
  }

  @Get('lots/:id/events')
  @Permissions(PERMISSIONS.WAREHOUSE_LOT_VIEW_OWN)
  async events(@Param('id') id: string, @Query('limit') limit = '50') {
    return this.prisma.inventoryEvent.findMany({
      where: { lotId: idParam.parse(id) },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 50, 500),
    });
  }

  @Post('lots/:id/correction')
  @Permissions(PERMISSIONS.WAREHOUSE_INVENTORY_WRITE_OWN)
  @RateLimit(MutationRateLimit)
  async correction(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = inventoryCorrectionSchema.safeParse({ ...(body as object), lotId: id });
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    await this.inventory.applyCorrection({ ...parsed.data, actorId: user.id });
    const stock = await this.inventory.lotStock(id);
    return { ok: true, stock };
  }
}