import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryType, OrderStatus, OrderType, Prisma } from '@prisma/client';
import { gradeMultiplier } from '@farmlink/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationService } from '../notifications/notification.service';
import { generateOrderNumber, generateIdempotencyNonce } from '../../common/utils/ids.util';

export interface CheckoutInput {
  deliveryType: DeliveryType;
  cartItemIds?: string[];
  addressSnapshot?: Record<string, unknown>;
  deliverySlotStart?: string;
  deliverySlotEnd?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationService,
  ) {}

  private async unitPriceForLot(cropId: string, grade: string): Promise<number> {
    const rule = await this.prisma.priceRule.findFirst({ where: { cropId, grade: grade as never, isActive: true } });
    if (rule) return ((rule.baseLowRs + rule.baseHighRs) / 2) * gradeMultiplier(grade as never);
    const obs = await this.prisma.priceObservation.findFirst({ where: { cropId }, orderBy: { observedAt: 'desc' } });
    return obs?.wholesalePrice ?? 20;
  }

  private idem(prefix: string): string {
    return `${prefix}-${generateIdempotencyNonce()}`;
  }

  // ------------------------------------------------------------------ cart
  async addToCart(userId: string, lotId: string, quantityKg: number): Promise<{ ok: boolean; lineId?: string }> {
    const lot = await this.prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) throw new NotFoundException('lot_not_found');
    const balance = await this.inventory.lotStock(lotId);
    if (!balance) throw new ConflictException('stock_unavailable');
    const desired = quantityKg;
    const existing = await this.prisma.cartItem.findUnique({ where: { userId_lotId: { userId, lotId } } });
    const currentReservedInCart = existing ? await this.latestEligibleQty(userId, lotId) : 0;
    // Cart is a soft intent; reserve only at checkout. Guard against obvious overshoot plus in-cart intent.
    if (balance.quantityAvailableKg - currentReservedInCart < desired) throw new ConflictException('insufficient_stock');

    const line = await this.prisma.cartItem.upsert({
      where: { userId_lotId: { userId, lotId } },
      create: { userId, lotId, quantityKg: desired },
      update: { quantityKg: { increment: desired } },
    });
    return { ok: true, lineId: line.id };
  }

  private async latestEligibleQty(userId: string, lotId: string): Promise<number> {
    const line = await this.prisma.cartItem.findUnique({ where: { userId_lotId: { userId, lotId } } });
    return line?.quantityKg ?? 0;
  }

  async removeFromCart(userId: string, lineId: string): Promise<{ ok: boolean }> {
    await this.prisma.cartItem.deleteMany({ where: { id: lineId, userId } });
    return { ok: true };
  }

  async cart(userId: string) {
    const lines = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        lot: {
          include: {
            crop: { select: { name: true, nameHi: true } },
            variety: { select: { name: true } },
            stockBalance: true,
          },
        },
      },
    });
    const priced = [];
    for (const line of lines) {
      const unit = await this.unitPriceForLot(line.lot.cropId, line.lot.confirmedGrade ?? 'UNGRADED');
      priced.push({
        lineId: line.id,
        lotId: line.lotId,
        crop: line.lot.crop.name,
        cropHi: line.lot.crop.nameHi,
        variety: line.lot.variety.name,
        grade: line.lot.confirmedGrade ?? 'UNGRADED',
        quantityKg: line.quantityKg,
        availableKg: line.lot.stockBalance?.quantityAvailableKg ?? 0,
        unitPrice: unit,
        total: Math.round(line.quantityKg * unit * 100) / 100,
      });
    }
    return { lines: priced, currency: 'INR' };
  }

  // ---------------------------------------------------------------- checkout
  async checkout(userId: string, input: CheckoutInput): Promise<{ orderId: string; orderNumber: string; status: string }> {
    const lines = await this.prisma.cartItem.findMany({
      where: input.cartItemIds?.length ? { userId, id: { in: input.cartItemIds } } : { userId },
    });
    if (lines.length === 0) throw new BadRequestException('empty_cart');

    const idem = this.idem('order');
    const order = await this.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        type: OrderType.CONSUMER,
        userId,
        deliveryType: input.deliveryType,
        addressSnapshot: input.addressSnapshot as never,
        deliverySlotStart: input.deliverySlotStart ? new Date(input.deliverySlotStart) : null,
        deliverySlotEnd: input.deliverySlotEnd ? new Date(input.deliverySlotEnd) : null,
        status: OrderStatus.DRAFT,
        idempotencyKey: idem,
        isDemo: true,
      },
    });

    // Reserve stock per line; any failure aborts the whole order atomically.
    let subtotal = 0;
    try {
      for (const line of lines) {
        const lot = await this.prisma.lot.findUnique({ where: { id: line.lotId } });
        if (!lot) throw new NotFoundException('lot_not_found');
        const unit = await this.unitPriceForLot(lot.cropId, lot.confirmedGrade ?? 'UNGRADED');
        const total = Math.round(line.quantityKg * unit * 100) / 100;
        subtotal += total;
        const reservation = await this.inventory.reserve({
          lotId: line.lotId,
          quantityKg: line.quantityKg,
          channel: 'CONSUMER',
          reference: order.id,
          idempotencyKey: `ord-res-${idem}-${line.lotId}`,
        });
        await this.prisma.orderItem.create({
          data: {
            orderId: order.id,
            lotId: line.lotId,
            reservationId: reservation?.id ?? null,
            quantityKg: line.quantityKg,
            unitPrice: unit,
            gradeSnapshot: lot.confirmedGrade ?? 'UNGRADED',
            cropSnapshot: lot.cropId,
            varietySnapshot: lot.varietyId,
            netWeightKg: line.quantityKg,
            total,
          },
        });
      }
    } catch (err) {
      // Roll back all reservations for this order attempt.
      const reservations = await this.prisma.reservation.findMany({ where: { reference: order.id } });
      for (const r of reservations) await this.inventory.releaseReservation(r.id, 'rollback');
      await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } });
      throw err as Error;
    }

    const deliveryFee = input.deliveryType === DeliveryType.DELIVERY ? 49 : 0;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;
    await this.prisma.order.update({
      where: { id: order.id },
      data: { subtotal: Math.round(subtotal * 100) / 100, deliveryFee, total, status: OrderStatus.PENDING_PAYMENT },
    });
    if (input.deliveryType === DeliveryType.DELIVERY) {
      await this.prisma.shipment.create({
        data: { orderId: order.id, slotStart: input.deliverySlotStart ? new Date(input.deliverySlotStart) : null, slotEnd: input.deliverySlotEnd ? new Date(input.deliverySlotEnd) : null },
      });
    }
    await this.prisma.cartItem.deleteMany({ where: { userId } });

    await this.audit.record({ actorUserId: userId, action: 'order:checkout', targetType: 'order', targetId: order.orderNumber, after: { items: lines.length, total } });
    return { orderId: order.id, orderNumber: order.orderNumber, status: OrderStatus.PENDING_PAYMENT };
  }

  // ------------------------------------------------------------- mock payment
  async payOrder(userId: string, orderId: string, providerRef?: string): Promise<{ ok: boolean; status: string }> {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('order_not_found');
    if (order.status !== OrderStatus.PENDING_PAYMENT) throw new ConflictException('not_awaiting_payment');
    const idem = this.idem('pay');
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        provider: 'MOCK',
        status: 'SUCCESS',
        providerRef: providerRef ?? `TSTPAY-${Date.now()}`,
        idempotencyKey: idem,
        completedAt: new Date(),
      },
    });
    await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CONFIRMED, placedAt: new Date() } });
    await this.notifications.notify({ userId, channel: 'SMS', templateKey: 'order:paid', vars: { orderNumber: order.orderNumber, total: String(order.total) } });
    return { ok: true, status: OrderStatus.CONFIRMED };
  }

  async failPayment(userId: string, orderId: string): Promise<{ ok: boolean; status: string }> {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('order_not_found');
    const reservations = await this.prisma.reservation.findMany({ where: { reference: order.id } });
    for (const r of reservations) await this.inventory.releaseReservation(r.id, 'rollback');
    await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } });
    return { ok: true, status: OrderStatus.CANCELLED };
  }

  // -------------------------------------------------------------- fulfilment
  async dispatch(orderId: string, actorId: string): Promise<{ ok: boolean; status: string }> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException('order_not_found');
    if (!['CONFIRMED', 'PACKING'].includes(order.status)) throw new ConflictException('order_not_ready');

    for (const item of order.items) {
      if (item.reservationId) await this.inventory.dispatchReservation(item.reservationId);
    }
    await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.DISPATCHED } });
    await this.prisma.shipment.updateMany({ where: { orderId: order.id }, data: { status: 'IN_TRANSIT' } });
    await this.audit.record({ actorUserId: actorId, action: 'order:dispatch', targetType: 'order', targetId: order.orderNumber });
    return { ok: true, status: OrderStatus.DISPATCHED };
  }

  async markPod(orderId: string, podKey: string, receivedKg: number): Promise<{ ok: boolean; status: string; discrepancyKg: number }> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true } });
    if (!order) throw new NotFoundException('order_not_found');
    const orderedKg = order.items.reduce((s, i) => s + i.quantityKg, 0);
    const discrepancyKg = Math.round((orderedKg - receivedKg) * 100) / 100;

    await this.prisma.shipment.update({
      where: { orderId: order.id },
      data: { status: 'DELIVERED', podKey, podSignedAt: new Date(), deliveredAt: new Date(), isPickedUp: true },
    });
    await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.DELIVERED } });

    if (discrepancyKg >= 0.01) {
      // Quantity dispute: auto-refund the shortfall (demo settlement).
      const avgUnit = order.subtotal / Math.max(1, orderedKg);
      const refundAmount = Math.round(discrepancyKg * avgUnit * 100) / 100;
      await this.prisma.dispute.create({
        data: {
          orderId: order.id,
          raisedById: order.userId,
          type: 'QUANTITY',
          reason: `Short delivery: received ${receivedKg}kg of ${orderedKg}kg`,
          status: 'AUTO_REFUNDED',
          resolution: `Auto-refunded ${refundAmount} for ${discrepancyKg}kg shortfall (demo)`,
          resolvedAt: new Date(),
        },
      });
      await this.prisma.payment.create({
        data: { orderId: order.id, amount: refundAmount, provider: 'MOCK', status: 'REFUNDED', meta: { type: 'quantity_shortfall' }, idempotencyKey: this.idem('refund'), refundedAt: new Date() },
      });
      return { ok: true, status: OrderStatus.DELIVERED, discrepancyKg };
    }
    return { ok: true, status: OrderStatus.DELIVERED, discrepancyKg };
  }

  // ---------------------------------------------------------------- disputes
  async raiseDispute(userId: string, orderId: string, type: string, reason: string): Promise<{ ok: boolean; disputeId: string }> {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('order_not_found');
    const dispute = await this.prisma.dispute.create({ data: { orderId, raisedById: userId, type: type as never, reason } });
    return { ok: true, disputeId: dispute.id };
  }

  async resolveDispute(disputeId: string, resolution: string, actorId: string): Promise<{ ok: boolean }> {
    await this.prisma.dispute.update({ where: { id: disputeId }, data: { status: 'RESOLVED', resolution, resolvedById: actorId, resolvedAt: new Date() } });
    return { ok: true };
  }

  async myOrders(userId: string, opts: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
        include: { items: true, payments: true, shipment: true, disputes: true },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page: opts.page, pageSize: opts.pageSize };
  }

  // ------------------------------------------------------------- reconciliation
  async reconcile(orderId: string, actorId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true, disputes: true } });
    if (!order) throw new NotFoundException('order_not_found');
    const itemTotal = Math.round(order.items.reduce((s, i) => s + i.total, 0) * 100) / 100;
    const paid = order.payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
    const refunded = order.payments.filter((p) => p.status === 'REFUNDED').reduce((s, p) => s + p.amount, 0);
    const consistent = itemTotal === order.subtotal && paid === order.total && refunded <= paid;
    await this.audit.record({ actorUserId: actorId, action: 'order:reconcile', targetType: 'order', targetId: order.orderNumber, after: { itemTotal, paid, refunded, consistent } });
    return { orderNumber: order.orderNumber, status: order.status, itemTotal, paid, refunded, total: order.total, consistent };
  }

  // ---------------------------------------------------------------- reviews
  async review(userId: string, orderItemId: string, rating: number, comment?: string): Promise<{ ok: boolean }> {
    const item = await this.prisma.orderItem.findUnique({ where: { id: orderItemId }, include: { order: true } });
    if (!item || item.order.userId !== userId) throw new NotFoundException('order_item_not_found');
    if (item.order.status !== OrderStatus.DELIVERED) throw new ConflictException('order_not_delivered');
    await this.prisma.review.upsert({
      where: { orderItemId },
      create: { orderItemId, userId, lotId: item.lotId, rating: Math.max(1, Math.min(5, Math.round(rating))), comment },
      update: { rating: Math.max(1, Math.min(5, Math.round(rating))), comment },
    });
    return { ok: true };
  }

  async lotReviews(lotId: string) {
    return this.prisma.review.findMany({ where: { lotId }, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } } } });
  }

  // --------------------------------------------------------------- sweeper
  async expireAbandonedOrders(): Promise<number> {
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);
    const stale = await this.prisma.order.findMany({ where: { status: OrderStatus.PENDING_PAYMENT, createdAt: { lt: cutoff }, isDemo: true }, take: 50 });
    for (const order of stale) {
      const reservations = await this.prisma.reservation.findMany({ where: { reference: order.id } });
      for (const r of reservations) await this.inventory.releaseReservation(r.id, 'expiry');
      await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.EXPIRED } });
    }
    return stale.length;
  }
}

export type { Prisma };