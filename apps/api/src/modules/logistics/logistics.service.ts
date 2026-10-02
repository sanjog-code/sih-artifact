import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PickupStatus, RouteStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { generateRouteCode } from '../../common/utils/ids.util';

@Injectable()
export class LogisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Group eligible pickup requests of a cluster into a planned route on a date. */
  async planRoute(input: {
    warehouseId: string;
    cluster: string;
    date: string;
    driverUserId: string;
    distanceKm?: number;
    etaMinutes?: number;
    pickupRequestIds?: string[];
    actorId: string;
  }): Promise<{ routeId: string; routeCode: string; picked: number }> {
    const where = {
      cluster: input.cluster,
      status: PickupStatus.ACCEPTED,
      assignedRouteId: null,
      ...(input.pickupRequestIds?.length ? { id: { in: input.pickupRequestIds } } : {}),
    };
    const requests = await this.prisma.pickupRequest.findMany({ where, take: 40 });
    if (requests.length === 0) throw new BadRequestException('no_pickups_in_cluster');

    const route = await this.prisma.logisticsRoute.create({
      data: {
        routeCode: generateRouteCode(),
        state: 'RJ',
        date: new Date(input.date),
        warehouseId: input.warehouseId,
        cluster: input.cluster,
        driverUserId: input.driverUserId,
        distanceKm: input.distanceKm ?? 25,
        etaMinutes: input.etaMinutes ?? 90,
        stops: { clusters: [input.cluster], pickupIds: requests.map((r) => r.id) },
        status: RouteStatus.PLANNED,
        assignedBy: input.actorId,
      },
    });
    await this.prisma.pickupRequest.updateMany({
      where: { id: { in: requests.map((r) => r.id) } },
      data: { assignedRouteId: route.id, status: PickupStatus.PICKUP_SCHEDULED, warehouseId: input.warehouseId },
    });
    await this.audit.record({
      actorUserId: input.actorId,
      action: 'logistics:route_planned',
      targetType: 'logistics_route',
      targetId: route.routeCode,
      after: { cluster: input.cluster, pickups: requests.length },
    });
    return { routeId: route.id, routeCode: route.routeCode, picked: requests.length };
  }

  async listRoutes(date?: string, status?: string) {
    const where: Record<string, unknown> = {};
    if (date) where.date = new Date(date);
    if (status) where.status = status;
    return this.prisma.logisticsRoute.findMany({ where, orderBy: { date: 'desc' }, take: 100 });
  }

  async listPickups(opts: { warehouseId?: string; cluster?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (opts.warehouseId) where.warehouseId = opts.warehouseId;
    if (opts.cluster) where.cluster = opts.cluster;
    if (opts.status) where.status = opts.status;
    return this.prisma.pickupRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { crop: { select: { name: true } }, variety: { select: { name: true } } },
      take: 200,
    });
  }

  /** Driver/operator marks a route in transit. */
  async startRoute(routeId: string, actorId: string): Promise<{ ok: boolean }> {
    const route = await this.prisma.logisticsRoute.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('route_not_found');
    await this.prisma.logisticsRoute.update({ where: { id: routeId }, data: { status: RouteStatus.ACTIVE } });
    await this.audit.record({ actorUserId: actorId, action: 'logistics:route_started', targetType: 'logistics_route', targetId: route.routeCode });
    return { ok: true };
  }

  /** Each pickup completed with receipt proof (POD key). */
  async completePickup(pickupId: string, podKey: string, actorId: string): Promise<{ ok: boolean; status: string }> {
    const pickup = await this.prisma.pickupRequest.findUnique({ where: { id: pickupId } });
    if (!pickup) throw new NotFoundException('pickup_not_found');
    if (!['PICKUP_SCHEDULED', 'ACCEPTED'].includes(pickup.status)) throw new BadRequestException('pickup_not_actionable');
    await this.prisma.pickupRequest.update({ where: { id: pickupId }, data: { status: PickupStatus.COMPLETED, scheduledWindow: new Date() } });
    await this.audit.record({ actorUserId: actorId, action: 'logistics:pickup_completed', targetType: 'pickup_request', targetId: pickup.id, after: { podKey } });
    return { ok: true, status: PickupStatus.COMPLETED };
  }

  async completeRoute(routeId: string, podKey: string, actorId: string): Promise<{ ok: boolean }> {
    const route = await this.prisma.logisticsRoute.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('route_not_found');
    await this.prisma.logisticsRoute.update({ where: { id: routeId }, data: { status: RouteStatus.COMPLETED } });
    await this.audit.record({ actorUserId: actorId, action: 'logistics:route_completed', targetType: 'logistics_route', targetId: route.routeCode, after: { podKey } });
    return { ok: true };
  }
}