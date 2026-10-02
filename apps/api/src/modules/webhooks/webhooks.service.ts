import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IntegrationDirection, IntegrationEventStatus, IntegrationProviderEnum, Prisma } from '@prisma/client';
import { sha256Hex, randomHex, hmacHex, constantTimeEquals } from '../../common/utils/crypto.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CacheService } from '../../common/redis/cache.service';
import { QueueService } from '../../common/queue/queue.service';
import { ENV } from '../../config/app.config';

export const WEBHOOK_DELIVERY_QUEUE = 'webhook-delivery';

/** Deterministic canonical JSON: stable key order so signatures match. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v as Record<string, unknown>).sort().reduce((acc: Record<string, unknown>, key) => {
        acc[key] = (v as Record<string, unknown>)[key];
        return acc;
      }, {});
    }
    return v;
  });
}

const TIMESTAMP_HEADER = 'farmlink-timestamp';
const NONCE_HEADER = 'farmlink-nonce';
const SIGNATURE_HEADER = 'farmlink-signature';
const EVENT_HEADER = 'farmlink-event';
const MAX_CLOCK_SKEW_SECONDS = ENV.webhookToleranceMs / 1000;

export interface EndpointInput {
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive?: boolean;
}

type WebhookHandler = (payload: Record<string, unknown>) => Promise<void>;

@Injectable()
export class WebhooksService {
  private readonly log = new Logger('webhooks');
  private readonly inboundHandlers = new Map<string, WebhookHandler>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly audit: AuditService,
    private readonly queue: QueueService,
  ) {}

  onModuleInit(): void {
    this.queue.register(WEBHOOK_DELIVERY_QUEUE, async (data) => {
      const deliveryId = String(data.deliveryId ?? '');
      if (deliveryId) await this.deliverOne(deliveryId);
    });
    this.queue.start();
  }

  // ------------------------------------------------------------------ outbound
  async createEndpoint(input: EndpointInput, createdBy: string) {
    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        name: input.name,
        url: input.url,
        secret: input.secret ?? randomHex(32),
        events: input.events,
        isActive: input.isActive ?? true,
        createdBy,
      },
    });
    await this.audit.record({ actorUserId: createdBy, action: 'webhook:endpoint_created', targetType: 'webhook_endpoint', targetId: endpoint.id });
    // Storing secret in DB is demo-only; real deployments use managed secrets.
    return { endpointId: endpoint.id, note: 'secret stored in DB (demo); use Vault/KMS in production' };
  }

  async emit(eventType: string, payload: Record<string, unknown>, opts?: { idempotencyKey?: string; provider?: IntegrationProviderEnum }): Promise<number> {
    const _events = payload['events'] as string[] | undefined; // trustworthy payloads carry a typed envelope
    const idem = opts?.idempotencyKey ?? `evt-${randomHex(8)}-${eventType}`;
    const event = await this.prisma.integrationEvent.create({
      data: {
        provider: opts?.provider ?? IntegrationProviderEnum.ONDC,
        direction: IntegrationDirection.OUTBOUND,
        eventType,
        payload: payload as Prisma.InputJsonValue,
        status: IntegrationEventStatus.QUEUED,
        idempotencyKey: idem,
      },
    });

    const endpoints = await this.prisma.webhookEndpoint.findMany({ where: { isActive: true, events: { has: eventType } } });
    let delivered = 0;
    for (const endpoint of endpoints) {
      const nonce = randomHex(16);
      const payloadHash = sha256Hex(JSON.stringify(payload));
      await this.prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          eventType,
          payloadHash,
          nonce,
          status: IntegrationEventStatus.QUEUED,
        },
      }).then(async (d) => {
        delivered++;
        await this.queue.enqueue(WEBHOOK_DELIVERY_QUEUE, { deliveryId: d.id }, { jobId: `del-${d.id}` });
      }).catch((err) => this.log.warn(`webhook delivery skip: ${(err as Error).message}`));
    }
    if (delivered === 0) await this.prisma.integrationEvent.update({ where: { id: event.id }, data: { status: IntegrationEventStatus.FAILED, lastError: 'no_endpoints' } });
    return delivered;
  }

  private async deliverOne(deliveryId: string): Promise<void> {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { endpoint: true },
    });
    if (!delivery || delivery.status === IntegrationEventStatus.DELIVERED) return;

    const integration = await this.prisma.integrationEvent.findFirst({ where: { direction: IntegrationDirection.OUTBOUND }, orderBy: { createdAt: 'desc' } });
    const payload = {
      event: delivery.eventType,
      timestamp: new Date().toISOString(),
      nonce: delivery.nonce,
      data: integration?.payload ?? {},
    };
    const body = canonicalJson(payload);
    const ts = String(Date.now());
    const signature = hmacHex(delivery.endpoint.secret, `${ts}.${delivery.nonce}.${body}`);

    let ok = false;
    let lastError = '';
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const res = await fetch(delivery.endpoint.url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            [TIMESTAMP_HEADER]: ts,
            [NONCE_HEADER]: delivery.nonce,
            [SIGNATURE_HEADER]: signature,
            [EVENT_HEADER]: delivery.eventType,
            'user-agent': 'farmlink-webhook/1.0',
          },
          body,
        });
        ok = res.ok;
        if (!ok) lastError = `HTTP ${res.status}`;
      } catch (err) {
        lastError = (err as Error).message;
      }
      if (!ok && attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
    }

    await this.prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: ok ? IntegrationEventStatus.DELIVERED : IntegrationEventStatus.FAILED,
        attempts: { increment: 1 },
        lastError: ok ? undefined : lastError,
        deliveredAt: ok ? new Date() : undefined,
      },
    });
    await this.audit.record({ action: `webhook:${ok ? 'sent' : 'delivery_failed'}`, targetType: 'webhook_delivery', targetId: delivery.id, after: { ok, lastError } });
  }

  async deliveries(opts: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({ orderBy: { createdAt: 'desc' }, skip: (opts.page - 1) * opts.pageSize, take: opts.pageSize, include: { endpoint: { select: { name: true, url: true } } } }),
      this.prisma.webhookDelivery.count(),
    ]);
    return { items, total };
  }

  // -------------------------------------------------------------------- inbound
  registerInboundHandler(eventType: string, handler: WebhookHandler): void {
    this.inboundHandlers.set(eventType, handler);
  }

  /** Replay-resistant inbound verification: HMAC + timestamp + one-time nonce. */
  async receiveInbound(input: { rawBody: string; event: string; timestamp: string; nonce: string; signature: string }): Promise<{ received: boolean }> {
    const now = Date.now();
    const ts = Number(input.timestamp);
    if (!Number.isFinite(ts) || Math.abs(now - ts) / 1000 > MAX_CLOCK_SKEW_SECONDS) throw new BadRequestException('stale_timestamp');

    const claimed = await this.cache.incr(`webhook_in:${input.nonce}`);
    if (claimed > 1) throw new BadRequestException('replay_detected');
    await this.cache.expire(`webhook_in:${input.nonce}`, 600);

    const expected = hmacHex(ENV.webhookSigningSecret, `${input.timestamp}.${input.nonce}.${canonicalJson(JSON.parse(input.rawBody))}`);
    if (!constantTimeEquals(expected, input.signature)) throw new BadRequestException('invalid_signature');

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(input.rawBody) as Record<string, unknown>;
    } catch {
      throw new BadRequestException('invalid_json');
    }

    if (this.inboundHandlers.has(input.event)) {
      await this.inboundHandlers.get(input.event)!(payload);
    } else {
      // Async intake for unhandled or future events (e.g. e-NWR status).
      await this.prisma.integrationEvent.create({
        data: {
          provider: IntegrationProviderEnum.ONDC,
          direction: IntegrationDirection.INBOUND,
          eventType: input.event,
          payload: payload as Prisma.InputJsonValue,
          status: IntegrationEventStatus.QUEUED,
          idempotencyKey: `in-${input.nonce}`,
        },
      });
    }
    await this.audit.record({ action: 'webhook:received', targetType: 'integration_event', targetId: input.event, after: { event: input.event, nonce: input.nonce } });
    return { received: true };
  }
}

export type { Prisma };