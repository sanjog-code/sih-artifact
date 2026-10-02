import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Grade, GradingStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { QueueService } from '../../common/queue/queue.service';
import {
  gradeFromImageMeta,
  mockImageMetaFromDimensions,
} from '@farmlink/shared';

export const GRADING_QUEUE = 'grading-candidate';

@Injectable()
export class GradingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly queue: QueueService,
  ) {}

  /**
   * Queue an asynchronous grading-candidate job for a lot.
   * Original images stay private; only pre-computed metadata drives the mock model.
   */
  async queueCandidate(lotId: string, imageObjectKeys: string[], reviewerId: string): Promise<{ runId: string }> {
    const lot = await this.prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) throw new NotFoundException('lot_not_found');

    const run = await this.prisma.gradingRun.create({
      data: {
        lotId,
        status: 'QUEUED',
        imageObjectKeys,
        imageMeta: { sourceImageKeys: imageObjectKeys.map((k) => keyFingerprint(k)) },
      },
    });

    // Update lot flags + inventory GRADING event happens on confirm to keep audit.
    await this.prisma.lot.update({ where: { id: lotId }, data: { gradingStatus: 'QUEUED' } });
    await this.audit.record({
      actorUserId: reviewerId,
      action: 'grading:queued',
      targetType: 'lot',
      targetId: lotId,
      after: { runId: run.id },
    });

    await this.queue.enqueue(
      GRADING_QUEUE,
      { runId: run.id, lotId, imageObjectKeys },
      { jobId: `grading-${run.id}` },
    );
    return { runId: run.id };
  }

  /** Runs the deterministic mock candidate model. Called by the queue worker. */
  async processCandidate(runId: string): Promise<void> {
    const run = await this.prisma.gradingRun.findUnique({ where: { id: runId } });
    if (!run || run.status === 'COMPLETED' || run.status === 'FAILED') return;

    await this.prisma.gradingRun.update({ where: { id: runId }, data: { status: 'PROCESSING', startedAt: new Date() } });

    try {
      // Deterministic simulated image metadata per key; a real deployment would
      // pass camera-assessed meta (dimensions, defects) instead of mock inputs.
      const metas = run.imageObjectKeys.map((key, i) => {
        const seed = hashKey(key);
        return mockImageMetaFromDimensions({
          width: 1024 + (seed % 1000),
          height: 768 + (seed % 500),
          byteSize: 200_000 + (seed % 800_000),
          defectCount: (seed + i) % 7,
          brightness: 90 + ((seed >> 3) % 120),
        });
      });
      const candidate = gradeFromImageMeta(
        metas.length > 0
          ? metas.reduce((a, b) => ({
              ...a,
              defectCount: a.defectCount + b.defectCount,
              objectAreaPct: (a.objectAreaPct + b.objectAreaPct) / 2,
              byteSize: a.byteSize + b.byteSize,
            }))
          : mockImageMetaFromDimensions({ width: 1024, height: 768, byteSize: 300_000 }),
      );

      await this.prisma.gradingRun.update({
        where: { id: runId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          modelVersion: candidate.modelVersion,
          candidateGrade: candidate.candidateGrade as Grade,
          candidateConfidence: candidate.confidence,
          defects: JSON.parse(JSON.stringify(candidate.defects)),
          imageMeta: candidate.imageMeta as object,
        },
      });
      await this.prisma.lot.update({
        where: { id: run.lotId },
        data: { gradingStatus: 'COMPLETED', modelGrade: candidate.candidateGrade as Grade },
      });
    } catch (err) {
      await this.prisma.gradingRun.update({
        where: { id: runId },
        data: { status: 'FAILED', error: truncate((err as Error).message, 500) },
      });
      throw err;
    }
  }

  /**
   * Human confirmation/override. An override (confirmed grade differing from
   * the model candidate) REQUIRES a reason, which is recorded in the audit trail.
   */
  async confirm(params: {
    lotId: string;
    confirmedGrade: Grade;
    gradingRunId?: string;
    source: 'MANUAL' | 'MODEL';
    overrideReason?: string;
    remarks?: string;
    reviewerId: string;
  }): Promise<{ confirmedGrade: Grade; overridden: boolean }> {
    const lot = await this.prisma.lot.findUnique({ where: { id: params.lotId } });
    if (!lot) throw new NotFoundException('lot_not_found');

    let candidateGrade: Grade | null = null;
    if (params.gradingRunId) {
      const run = await this.prisma.gradingRun.findUnique({ where: { id: params.gradingRunId } });
      if (!run || run.status !== 'COMPLETED') throw new BadRequestException('grading_run_not_completed');
      candidateGrade = run.candidateGrade;
    } else if (params.source === 'MODEL') {
      throw new BadRequestException('model_confirmation_requires_run');
    } else {
      candidateGrade = lot.modelGrade ?? null;
    }

    const overridden = candidateGrade !== null && candidateGrade !== params.confirmedGrade;
    if (overridden && params.source === 'MANUAL' && !params.overrideReason) {
      throw new BadRequestException('override_reason_required');
    }

    const previous = { manualGrade: lot.manualGrade, confirmedGrade: lot.confirmedGrade, overrideReason: lot.overrideReason };
    const confirmation = await this.prisma.gradeConfirmation.create({
      data: {
        lotId: lot.id,
        gradingRunId: params.gradingRunId ?? null,
        confirmedGrade: params.confirmedGrade,
        source: params.source === 'MODEL' ? 'MODEL' : 'MANUAL',
        overridden,
        overrideReason: params.overrideReason ?? null,
        remarks: params.remarks ?? null,
        reviewerId: params.reviewerId,
      },
    });
    await this.prisma.lot.update({
      where: { id: lot.id },
      data: {
        confirmedGrade: params.confirmedGrade,
        manualGrade: params.source === 'MANUAL' ? params.confirmedGrade : lot.manualGrade,
        gradeConfirmedAt: new Date(),
        gradingStatus: 'COMPLETED',
        overrideReason: params.overrideReason ?? lot.overrideReason,
        gradeRemarks: params.remarks ?? lot.gradeRemarks,
      },
    });

    // Append-only inventory event reflecting the grading outcome.
    await this.prisma.inventoryEvent.create({
      data: {
        lotId: lot.id,
        type: 'GRADING',
        direction: 'ADJUST',
        quantityDeltaKg: 0,
        prevBalanceKg: 0,
        postBalanceKg: 0,
        warehouseId: lot.warehouseId,
        storageLocationId: lot.storageLocationId,
        payload: { confirmedGrade: params.confirmedGrade, overridden, gradingRunId: params.gradingRunId ?? null },
        idempotencyKey: `evt-grade-${confirmation.id}`,
        createdById: params.reviewerId,
      },
    });

    await this.audit.record({
      actorUserId: params.reviewerId,
      action: 'grading:confirm',
      targetType: 'lot',
      targetId: lot.id,
      before: previous,
      after: {
        confirmedGrade: params.confirmedGrade,
        source: params.source,
        overridden,
        overrideReason: params.overrideReason ?? null,
        gradingRunId: params.gradingRunId ?? null,
      },
    });

    return { confirmedGrade: params.confirmedGrade, overridden };
  }

  async runsForLot(lotId: string) {
    return this.prisma.gradingRun.findMany({ where: { lotId }, orderBy: { queuedAt: 'desc' } });
  }

  async run(runId: string) {
    return this.prisma.gradingRun.findUnique({ where: { id: runId } });
  }
}

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

function keyFingerprint(key: string): string {
  return `sha256:${hashKey(key).toString(16)}:${key.length}`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) : s;
}

export type { Grade, GradingStatus };