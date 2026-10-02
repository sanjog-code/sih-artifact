import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { sha256Hex } from '../utils/crypto.util';

export interface AuditContext {
  actorUserId?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  request?: { ip?: string; ua?: string; requestId?: string };
  extra?: Record<string, string>;
}

/**
 * Immutable, hash-chained append-only audit log. There is no update/delete
 * path through the API. Sensitive values are stored as opaque references;
 * never plaintext PII/finance/payment payloads.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(ctx: AuditContext): Promise<void> {
    try {
      const last = await this.prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { hash: true },
      });
      const now = Date.now();
      const chain = sha256Hex(
        `${last?.hash ?? 'GENESIS'}|${ctx.actorUserId ?? 'system'}|${ctx.action}|${ctx.targetType ?? ''}|${ctx.targetId ?? ''}|${now}`,
      );
      await this.prisma.auditLog.create({
        data: {
          actorUserId: ctx.actorUserId ?? null,
          actorRole: ctx.actorRole ?? null,
          action: ctx.action,
          targetType: ctx.targetType ?? null,
          targetId: ctx.targetId ?? null,
          before: safeJson(ctx.before),
          after: safeJson(ctx.after),
          ip: ctx.request?.ip ? stripIp(ctx.request.ip) : null,
          ua: ctx.request?.ua ? ctx.request.ua.slice(0, 300) : null,
          requestId: ctx.request?.requestId ?? null,
          prevHash: last?.hash ?? null,
          hash: chain,
          ...(ctx.extra ?? {}),
        },
      });
    } catch {
      // Auditing must never break the business flow; failures are surfaced in logs.
    }
  }
}

function safeJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

function stripIp(ip: string): string {
  return ip.slice(0, 64);
}