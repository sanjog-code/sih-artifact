import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { ObjectStorage, OBJECT_STORAGE } from '../../common/storage/object-storage.interface';

const RETENTION_DAYS = 90;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: { include: { farm: true } },
        memberships: { include: { org: { select: { id: true, name: true, type: true } } } },
      },
    });
    if (!user) throw new NotFoundException('user_not_found');
    return user;
  }

  // ------------------------------------------------------------------ export
  async requestExport(userId: string, sections: string[]) {
    const exportReq = await this.prisma.exportRequest.create({
      data: { userId, sections, status: 'PENDING', expiresAt: new Date(Date.now() + 7 * 86400_000) },
    });
    // Demo: generate an export bundle inline (a real worker would stream this).
    const summary = await this.buildExportBundle(userId, sections);
    const key = `exports/users/${userId}/${exportReq.id}.json`;
    await this.storage.putObject(key, Buffer.from(JSON.stringify(summary, null, 2)), 'application/json', { exportRequestId: exportReq.id });
    await this.prisma.exportRequest.update({ where: { id: exportReq.id }, data: { status: 'COMPLETED', objectKey: key, readyAt: new Date() } });
    await this.audit.record({ actorUserId: userId, action: 'privacy:export', targetType: 'user', targetId: userId, after: { sections } });
    return { exportRequestId: exportReq.id, status: 'COMPLETED', objectKey: key };
  }

  private async buildExportBundle(userId: string, sections: string[]) {
    const want = (s: string) => sections.length === 0 || sections.includes(s);
    const bundle: Record<string, unknown> = { exportedAt: new Date().toISOString(), userId, isDemo: true };
    if (want('profile')) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { phone: true, name: true, role: true, lang: true, email: true } });
      bundle.profile = user;
    }
    if (want('produce') || want('activity')) {
      bundle.produce = await this.prisma.produceRequest.findMany({ where: { farmerId: userId }, select: { id: true, cropId: true, quantityKg: true, status: true, createdAt: true } });
    }
    if (want('lots')) {
      bundle.lots = await this.prisma.lot.findMany({ where: { farmerId: userId }, select: { lotNumber: true, cropId: true, netWeightKg: true, confirmedGrade: true, decision: true, createdAt: true } });
    }
    if (want('consents') || want('finance')) {
      bundle.consents = await this.prisma.financeConsent.findMany({ where: { userId }, select: { type: true, status: true, version: true, grantedAt: true } });
    }
    if (want('orders')) {
      bundle.orders = await this.prisma.order.findMany({ where: { userId }, select: { orderNumber: true, total: true, status: true, createdAt: true } });
    }
    return bundle;
  }

  async listExports(userId: string) {
    return this.prisma.exportRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  // ------------------------------------------------------------------ delete
  async requestDeletion(userId: string, reason?: string) {
    const deletion = await this.prisma.deletionRequest.create({ data: { userId, reason: reason ?? undefined, status: 'PENDING' } });
    // Soft-delete now; hard delete after retention window (see delete sweeper).
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'DEACTIVATED', deletedAt: new Date() } });
    await this.audit.record({ actorUserId: userId, action: 'privacy:delete_requested', targetType: 'user', targetId: userId, after: { retentionDays: RETENTION_DAYS } });
    return {
      deletionRequestId: deletion.id,
      status: 'PENDING',
      note: `Data held ${RETENTION_DAYS} days before irreversible deletion (demo).`,
      isDemo: true,
    };
  }

  async processDueDeletions(): Promise<number> {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400_000);
    const due = await this.prisma.deletionRequest.findMany({ where: { status: 'PENDING', requestedAt: { lt: cutoff } }, take: 50 });
    for (const d of due) {
      const user = await this.prisma.user.findUnique({ where: { id: d.userId } });
      if (user?.deletedAt) {
        // Hard-delete dependent rows cascade via FK onDelete:Cascade relations.
        await this.prisma.deletionRequest.update({ where: { id: d.id }, data: { status: 'PROCESSED', processedAt: new Date() } });
      }
    }
    return due.length;
  }
}