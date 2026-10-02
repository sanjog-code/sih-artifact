import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  DEFAULT_RESERVATION_TTL_SECONDS,
  MAX_RESERVATION_TTL_SECONDS,
} from '@farmlink/shared';
import { generateLotNumber, generateQrCode, generateIdempotencyNonce } from '../../common/utils/ids.util';

export interface IntakeParams {
  farmerId: string;
  cropId: string;
  varietyId: string;
  warehouseId: string;
  storageLocationId?: string;
  sourceCluster: string;
  grossWeightKg: number;
  tareWeightKg: number;
  intakeById: string;
  note?: string;
  isDemo?: boolean;
  idempotencyKey?: string;
}

export interface ReserveParams {
  lotId: string;
  quantityKg: number;
  channel: 'CONSUMER' | 'BULK';
  ttlSeconds?: number;
  reference?: string;
  idempotencyKey: string;
}

const oversell = () => new ConflictException('insufficient_stock');
const notFound = (what: string) => new NotFoundException(`${what}_not_found`);

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Single intake transaction: lot + stock balance + intake event (append-only). */
  async intake(params: IntakeParams): Promise<{ lotId: string; lotNumber: string; qrCode: string }> {
    const key = params.idempotencyKey ?? `intake-${generateIdempotencyNonce()}`;
    const existing = await this.prisma.inventoryEvent.findUnique({ where: { idempotencyKey: key } });
    if (existing) {
      const lot = await this.prisma.lot.findUnique({ where: { id: existing.referenceId ?? '' } });
      if (lot) return { lotId: lot.id, lotNumber: lot.lotNumber, qrCode: lot.qrCode };
    }

    const netWeight = params.grossWeightKg - params.tareWeightKg;
    if (netWeight <= 0) throw new ConflictException('invalid_weights');

    const idempotencyKey = key;
    const lotNumber = generateLotNumber();
    const qrCode = generateQrCode();

    await this.prisma.$transaction(async (tx) => {
      const lot = await tx.lot.create({
        data: {
          lotNumber,
          qrCode,
          farmerId: params.farmerId,
          cropId: params.cropId,
          varietyId: params.varietyId,
          warehouseId: params.warehouseId,
          storageLocationId: params.storageLocationId,
          sourceCluster: params.sourceCluster,
          grossWeightKg: params.grossWeightKg,
          tareWeightKg: params.tareWeightKg,
          netWeightKg: netWeight,
          intakeAt: new Date(),
          intakeById: params.intakeById,
          status: 'ACCEPTED',
          note: params.note,
          isDemo: params.isDemo ?? false,
        },
      });
      await tx.stockBalance.create({
        data: {
          lotId: lot.id,
          warehouseId: params.warehouseId,
          storageLocationId: params.storageLocationId,
          quantityAvailableKg: netWeight,
          quantityReservedKg: 0,
          version: 1,
        },
      });
      await tx.inventoryEvent.create({
        data: {
          lotId: lot.id,
          type: 'INTAKE',
          direction: 'IN',
          quantityDeltaKg: netWeight,
          prevBalanceKg: 0,
          postBalanceKg: netWeight,
          warehouseId: params.warehouseId,
          storageLocationId: params.storageLocationId,
          referenceId: lot.id,
          payload: { cluster: params.sourceCluster },
          idempotencyKey,
          createdById: params.intakeById,
        },
      });
    });

    await this.audit.record({
      actorUserId: params.intakeById,
      action: 'inventory:intake',
      targetType: 'lot',
      targetId: lotNumber,
      after: { netWeight },
    });
    return { lotId: await this.lotIdForNumber(lotNumber), lotNumber, qrCode };
  }

  private async lotIdForNumber(lotNumber: string): Promise<string> {
    const lot = await this.prisma.lot.findUnique({ where: { lotNumber } });
    return lot?.id ?? '';
  }

  /**
   * Reserve stock under a row lock so concurrent reservations can never oversell.
   * Idempotent by idempotencyKey.
   */
  async reserve(params: ReserveParams): Promise<Prisma.ReservationGetPayload<object> | null> {
    const existing = await this.prisma.reservation.findUnique({ where: { idempotencyKey: params.idempotencyKey } });
    if (existing) return existing;

    const ttlSeconds = Math.min(
      params.ttlSeconds ?? DEFAULT_RESERVATION_TTL_SECONDS,
      MAX_RESERVATION_TTL_SECONDS,
    );

    return this.prisma.$transaction(async (tx) => {
      const lock = await tx.$queryRaw<Array<{ lot_id: string }>>(
        Prisma.sql`SELECT id FROM "StockBalance" WHERE "lotId" = ${params.lotId} FOR UPDATE`,
      );
      if (!lock || lock.length === 0) throw notFound('stock_balance');

      const balance = await tx.stockBalance.findUniqueOrThrow({ where: { lotId: params.lotId } });
      if (balance.quantityAvailableKg < params.quantityKg) throw oversell();

      const prev = balance.quantityAvailableKg;
      const post = prev - params.quantityKg;

      await tx.stockBalance.update({
        where: { id: balance.id },
        data: {
          quantityAvailableKg: post,
          quantityReservedKg: balance.quantityReservedKg + params.quantityKg,
          version: { increment: 1 },
        },
      });

      const reservation = await tx.reservation.create({
        data: {
          lotId: params.lotId,
          channel: params.channel,
          quantityKg: params.quantityKg,
          status: 'ACTIVE',
          ttlSeconds,
          expiresAt: new Date(Date.now() + ttlSeconds * 1000),
          idempotencyKey: params.idempotencyKey,
          reference: params.reference,
        },
      });

      await tx.inventoryEvent.create({
        data: {
          lotId: params.lotId,
          type: 'RESERVATION',
          direction: 'RESERVE',
          quantityDeltaKg: -params.quantityKg,
          prevBalanceKg: prev,
          postBalanceKg: post,
          warehouseId: balance.warehouseId,
          storageLocationId: balance.storageLocationId,
          referenceType: 'Reservation',
          referenceId: reservation.id,
          idempotencyKey: `evt-res-${params.idempotencyKey}`,
          createdById: 'system',
        },
      });

      await this.audit.record({
        action: 'inventory:reserve',
        targetType: 'lot',
        targetId: params.lotId,
        after: { quantityKg: params.quantityKg, channel: params.channel, ttlSeconds },
      });
      return reservation;
    });
  }

  /**
   * Release an active reservation, returning stock to available. Used on expiry,
   * cancellation, or failed payment.
   */
  async releaseReservation(reservationId: string, reason = 'release'): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation || reservation.status !== 'ACTIVE') return;

      const lock = await tx.$queryRaw<Array<{ lot_id: string }>>(
        Prisma.sql`SELECT id FROM "StockBalance" WHERE "lotId" = ${reservation.lotId} FOR UPDATE`,
      );
      if (!lock || lock.length === 0) return;

      const balance = await tx.stockBalance.findUniqueOrThrow({ where: { lotId: reservation.lotId } });
      const reservedRelease = Math.min(balance.quantityReservedKg, reservation.quantityKg);

      await tx.stockBalance.update({
        where: { id: balance.id },
        data: {
          quantityReservedKg: balance.quantityReservedKg - reservedRelease,
          quantityAvailableKg: balance.quantityAvailableKg + reservedRelease,
          version: { increment: 1 },
        },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: reason === 'expiry' ? 'EXPIRED' : 'CANCELLED', releasedAt: new Date() },
      });
      await tx.inventoryEvent.create({
        data: {
          lotId: reservation.lotId,
          type: 'UNRESERVATION',
          direction: 'RELEASE',
          quantityDeltaKg: reservedRelease,
          prevBalanceKg: balance.quantityAvailableKg,
          postBalanceKg: balance.quantityAvailableKg + reservedRelease,
          warehouseId: balance.warehouseId,
          storageLocationId: balance.storageLocationId,
          referenceType: 'Reservation',
          referenceId: reservationId,
          idempotencyKey: `evt-unres-${reservationId}-${reason}`,
          createdById: 'system',
        },
      });
    });
  }

  /** Dispatch/sell: consumes the reserved quantity and finalizes the lot movement. */
  async dispatchReservation(reservationId: string, opts?: { weightKg?: number }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation || reservation.status !== 'ACTIVE') return;

      const lock = await tx.$queryRaw<Array<{ lot_id: string }>>(
        Prisma.sql`SELECT id FROM "StockBalance" WHERE "lotId" = ${reservation.lotId} FOR UPDATE`,
      );
      if (!lock || lock.length === 0) throw notFound('stock_balance');
      const balance = await tx.stockBalance.findUniqueOrThrow({ where: { lotId: reservation.lotId } });

      const moved = opts?.weightKg ? Math.min(opts.weightKg, reservation.quantityKg) : reservation.quantityKg;
      const reservedAfter = Math.max(0, balance.quantityReservedKg - moved);

      await tx.stockBalance.update({
        where: { id: balance.id },
        data: { quantityReservedKg: reservedAfter, version: { increment: 1 } },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'FULFILLED', fulfilledAt: new Date() },
      });
      await tx.inventoryEvent.create({
        data: {
          lotId: reservation.lotId,
          type: 'DISPATCH',
          direction: 'OUT',
          quantityDeltaKg: -moved,
          prevBalanceKg: balance.quantityAvailableKg,
          postBalanceKg: balance.quantityAvailableKg + (balance.quantityReservedKg - reservedAfter),
          warehouseId: balance.warehouseId,
          storageLocationId: balance.storageLocationId,
          referenceType: 'Reservation',
          referenceId: reservationId,
          idempotencyKey: `evt-dispatch-${reservationId}`,
          createdById: 'system',
        },
      });
    });
  }

  /** Corrections/transfer/spoilage/loss, always recorded as append-only events. */
  async applyCorrection(params: {
    lotId: string;
    type: 'CORRECTION' | 'SPOILAGE' | 'LOSS' | 'TRANSFER';
    quantityDeltaKg: number;
    targetStorageLocationId?: string;
    reason: string;
    idempotencyKey: string;
    actorId: string;
  }): Promise<void> {
    const existing = await this.prisma.inventoryEvent.findUnique({ where: { idempotencyKey: params.idempotencyKey } });
    if (existing) return;

    await this.prisma.$transaction(async (tx) => {
      const lock = await tx.$queryRaw<Array<{ lot_id: string }>>(
        Prisma.sql`SELECT id FROM "StockBalance" WHERE "lotId" = ${params.lotId} FOR UPDATE`,
      );
      const balance = lock
        ? await tx.stockBalance.findUniqueOrThrow({ where: { lotId: params.lotId } })
        : undefined;
      if (!balance) throw notFound('stock_balance');

      const delta = params.type === 'CORRECTION' ? params.quantityDeltaKg : -Math.abs(params.quantityDeltaKg);
      const next = Math.max(0, balance.quantityAvailableKg + delta);
      const prev = balance.quantityAvailableKg;
      if (delta < 0 && balance.quantityAvailableKg < Math.abs(delta)) throw oversell();

      await tx.stockBalance.update({
        where: { id: balance.id },
        data: {
          quantityAvailableKg: next,
          version: { increment: 1 },
          ...(params.type === 'TRANSFER' && params.targetStorageLocationId
            ? { storageLocationId: params.targetStorageLocationId }
            : {}),
        },
      });
      await tx.inventoryEvent.create({
        data: {
          lotId: params.lotId,
          type: params.type,
          direction: delta >= 0 ? 'ADJUST' : 'OUT',
          quantityDeltaKg: delta,
          prevBalanceKg: prev,
          postBalanceKg: next,
          warehouseId: balance.warehouseId,
          storageLocationId: balance.storageLocationId,
          payload: { reason: params.reason },
          idempotencyKey: params.idempotencyKey,
          createdById: params.actorId,
        },
      });
      if (params.type === 'SPOILAGE') {
        await tx.lot.update({ where: { id: params.lotId }, data: { status: 'SPOILED' } });
      }
    });

    await this.audit.record({
      actorUserId: params.actorId,
      action: `inventory:${params.type.toLowerCase()}`,
      targetType: 'lot',
      targetId: params.lotId,
      after: { quantityDeltaKg: params.quantityDeltaKg, reason: params.reason },
    });
  }

  /** Background sweeper: expire active reservations past their TTL. */
  async expireStaleReservations(): Promise<number> {
    const now = new Date();
    const stale = await this.prisma.reservation.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: now } },
      take: 100,
    });
    for (const r of stale) await this.releaseReservation(r.id, 'expiry');
    return stale.length;
  }

  async lotStock(lotId: string) {
    return this.prisma.stockBalance.findUnique({ where: { lotId } });
  }
}

export { ReservationStatus };
export type { Prisma };