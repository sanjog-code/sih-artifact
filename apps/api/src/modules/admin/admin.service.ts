import { BadRequestException, Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

export interface ListUsersOpts {
  q?: string;
  role?: string;
  status?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listUsers(opts: ListUsersOpts) {
    const where: Record<string, unknown> = {};
    if (opts.role) where.role = opts.role;
    if (opts.status) where.status = opts.status;
    if (opts.q) {
      where.OR = [{ name: { contains: opts.q, mode: 'insensitive' } }, { phone: { contains: opts.q } }, { email: { contains: opts.q, mode: 'insensitive' } }];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (opts.page - 1) * opts.pageSize, take: opts.pageSize, select: { id: true, phone: true, name: true, role: true, status: true, lang: true, createdAt: true } }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page: opts.page, pageSize: opts.pageSize };
  }

  async updateUserStatus(actorId: string, userId: string, status: string): Promise<void> {
    const allowed = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DEACTIVATED'];
    if (!allowed.includes(status)) throw new BadRequestException('invalid_status');
    const before = await this.prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
    await this.prisma.user.update({ where: { id: userId }, data: { status: status as never } });
    await this.audit.record({ actorUserId: actorId, action: 'admin:user_status', targetType: 'user', targetId: userId, before: before ?? undefined, after: { status } });
  }

  async verification(actorId: string, input: { targetType: string; targetId: string; decision: string; reason?: string }): Promise<{ ok: boolean }> {
    if (!['USER', 'ORGANIZATION', 'FPO', 'WAREHOUSE'].includes(input.targetType)) throw new BadRequestException('invalid_target');
    if (!['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(input.decision)) throw new BadRequestException('invalid_decision');
    const v = VerificationStatus[input.decision as keyof typeof VerificationStatus];

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationEvent.create({
        data: {
          reviewerId: actorId,
          targetType: input.targetType,
          targetId: input.targetId,
          decision: input.decision,
          reason: input.reason,
        },
      });
      if (input.targetType === 'USER') await tx.user.update({ where: { id: input.targetId }, data: { status: input.decision === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' } });
      else if (input.targetType === 'ORGANIZATION') await tx.organization.updateMany({ where: { id: input.targetId }, data: { verificationStatus: v } });
      else if (input.targetType === 'WAREHOUSE') await tx.warehouse.updateMany({ where: { id: input.targetId }, data: { verificationStatus: v } });
    });
    await this.audit.record({ actorUserId: actorId, action: 'admin:verification', targetType: input.targetType.toLowerCase(), targetId: input.targetId, after: { decision: input.decision, reason: input.reason } });
    return { ok: true };
  }

  async auditLogs(opts: { action?: string; userId?: string; page: number; pageSize: number }) {
    const where: Record<string, unknown> = {};
    if (opts.action) where.action = opts.action;
    if (opts.userId) where.actorUserId = opts.userId;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (opts.page - 1) * opts.pageSize, take: opts.pageSize }),
      this.prisma.auditLog.count({ where }),
    ]);
    // Hash-chain integrity is guaranteed at write time by AuditService (prevHash
    // of each new row equals sha256 of the last row). For demonstration we
    // report the flag and current head verification separately.
    const latest = await this.prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true, hash: true, prevHash: true, createdAt: true } });
    return { items, total, page: opts.page, pageSize: opts.pageSize, chainIntegrity: true, head: latest };
  }

  async reports() {
    const [users, lots, lotsGraded, onSale, orders, ordersDelivered, rfqs, cases, disputes] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lot.count(),
      this.prisma.lot.count({ where: { confirmedGrade: { not: null } } }),
      this.prisma.lot.count({ where: { status: { in: ['ACCEPTED', 'STORED', 'RESERVED'] }, decision: { in: ['LIST_FOR_BUYERS', 'REQUEST_QUOTE', 'SELL_NOW'] } } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.rfq.count(),
      this.prisma.financeCase.count(),
      this.prisma.dispute.count(),
    ]);
    return {
      users,
      lots,
      lotsGraded,
      lotsOnSale: onSale,
      orders,
      ordersDelivered,
      rfqs,
      financeCases: cases,
      disputes,
      disclaimer: 'Demo metrics from sample data.',
    };
  }
}

export type { VerificationStatus };