import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { OrdersService } from './orders.service';
import { Permissions, CurrentUser, RateLimit, Public } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit, SearchRateLimit } from '../../common/guards/rate-limit.guard';
import { cartAddSchema, checkoutSchema, disputeCreateSchema, reviewCreateSchema } from '@farmlink/shared';

const idParam = z.string().min(1);
const pageQ = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
const podSchema = z.object({ podKey: z.string().min(1), receivedKg: z.number().positive() });

@ApiTags('orders')
@Controller('orders')
@UseGuards(AuthGuard, RbacGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  // ------------------------------------------------------------------ cart
  @Post('cart')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async addToCart(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = cartAddSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.addToCart(user.id, parsed.data.lotId, parsed.data.quantityKg);
  }

  @Get('cart')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  async cart(@CurrentUser() user: SessionUser) {
    return this.orders.cart(user.id);
  }

  @Post('cart/:lineId/remove')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async removeFromCart(@Param('lineId') lineId: string, @CurrentUser() user: SessionUser) {
    return this.orders.removeFromCart(user.id, idParam.parse(lineId));
  }

  // -------------------------------------------------------------- checkout
  @Post('checkout')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async checkout(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = checkoutSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const result = await this.orders.checkout(user.id, {
      deliveryType: parsed.data.deliveryType,
      cartItemIds: parsed.data.cartItemIds,
      addressSnapshot: parsed.data.address as never,
      deliverySlotStart: parsed.data.slotId,
      deliverySlotEnd: parsed.data.slotId,
    });
    return { ok: true, ...result };
  }

  @Post('pay')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async pay(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = z.object({ orderId: idParam, provider: z.enum(['mock']).default('mock') }).safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.payOrder(user.id, parsed.data.orderId);
  }

  /** Intentionally-provided failure path used by tests to verify rollback. */
  @Post('fail')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async failPayment(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = z.object({ orderId: idParam }).safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.failPayment(user.id, parsed.data.orderId);
  }

  @Get('mine')
  @Permissions(PERMISSIONS.ORDER_VIEW_OWN)
  async mine(@CurrentUser() user: SessionUser, @Query() q: unknown) {
    const parsed = pageQ.safeParse(q ?? {});
    return this.orders.myOrders(user.id, parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }

  // ---------------------------------------------------------------- fulfilment
  @Post(':id/dispatch')
  @Permissions(PERMISSIONS.WAREHOUSE_INVENTORY_WRITE_OWN)
  @RateLimit(MutationRateLimit)
  async dispatch(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    return this.orders.dispatch(idParam.parse(id), user.id);
  }

  @Post(':id/pod')
  @Permissions(PERMISSIONS.WAREHOUSE_INVENTORY_WRITE_OWN)
  @RateLimit(MutationRateLimit)
  async pod(@Param('id') id: string, @Body() body: unknown, @CurrentUser() _user: SessionUser) {
    const parsed = podSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.markPod(idParam.parse(id), parsed.data.podKey, parsed.data.receivedKg);
  }

  @Post(':id/reconcile')
  @Permissions(PERMISSIONS.ADMIN_FINANCE)
  @RateLimit(MutationRateLimit)
  async reconcile(@Param('id') id: string, @CurrentUser() _user: SessionUser) {
    return this.orders.reconcile(idParam.parse(id), _user.id);
  }

  // ---------------------------------------------------------------- disputes
  @Post('disputes')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async raiseDispute(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = disputeCreateSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.raiseDispute(user.id, parsed.data.orderId, parsed.data.type, parsed.data.reason);
  }

  @Put('disputes/:id/resolve')
  @Permissions(PERMISSIONS.ADMIN_DISPUTES)
  @RateLimit(MutationRateLimit)
  async resolveDispute(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = z.object({ resolution: z.string().min(3) }).safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.resolveDispute(idParam.parse(id), parsed.data.resolution, user.id);
  }

  // ---------------------------------------------------------------- reviews
  @Post('reviews')
  @Permissions(PERMISSIONS.ORDER_CREATE)
  @RateLimit(MutationRateLimit)
  async review(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = reviewCreateSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.orders.review(user.id, parsed.data.orderItemId, parsed.data.rating, parsed.data.comment);
  }

  @Public()
  @Get('lots/:lotId/reviews')
  @RateLimit(SearchRateLimit)
  async lotReviews(@Param('lotId') lotId: string) {
    return this.orders.lotReviews(idParam.parse(lotId));
  }
}