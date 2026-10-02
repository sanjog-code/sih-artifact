import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ENV } from '../../config/app.config';

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  createdAt: number;
}

export type JobProcessor = (data: Record<string, unknown>, job: QueueJob) => Promise<void>;

const MAX_ATTEMPTS = 4;

/**
 * Simple durable queue: Redis-backed (LPUSH/BRPOP) when REDIS_URL is configured,
 * with an in-process fallback so unit tests and demos run without Redis.
 * Processors are idempotent and jobs carry unique ids for replay protection.
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly log = new Logger('queue');
  private readonly redis: Redis | null;
  private readonly redisAvailable: boolean;
  private readonly processors = new Map<string, JobProcessor>();
  private readonly memoryQueues = new Map<string, QueueJob[]>();
  private readonly memorySeen = new Set<string>();
  private readonly timers: NodeJS.Timeout[] = [];
  private readonly redisSeen = new Set<string>();
  private started = false;

  constructor() {
    if (ENV.redisUrl) {
      try {
        this.redis = new Redis(ENV.redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: (t) => (t > 3 ? null : 100 * t),
        });
        void this.redis.connect().catch((err) => this.log.warn(`Queue redis unavailable: ${(err as Error).message}`));
        this.redisAvailable = true;
      } catch {
        this.redis = null;
        this.redisAvailable = false;
      }
    } else {
      this.redis = null;
      this.redisAvailable = false;
    }
  }

  register(name: string, processor: JobProcessor): void {
    if (this.processors.has(name)) throw new Error(`processor already registered for ${name}`);
    this.processors.set(name, processor);
    // Workers registered after start() must still begin polling.
    if (this.started) this.startWorker(name);
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    for (const name of this.processors.keys()) this.startWorker(name);
  }

  private startWorker(name: string): void {
    const processor = this.processors.get(name)!;
    // Poll loop: one iteration per tick, either BRPOP (redis) or drain memory.
    const tick = async (): Promise<void> => {
      if (this.redisAvailable && this.redis) {
        try {
          const item = await this.redis.brpop(this.redisKey(name), 2);
          if (item && item[1]) {
            const job = JSON.parse(item[1]) as QueueJob;
            await this.processWithRetry(name, job, processor);
          }
        } catch (err) {
          this.log.warn(`queue ${name} brpop: ${(err as Error).message}`);
        }
      } else {
        const q = this.memoryQueues.get(name);
        const job = q?.shift();
        if (job) await this.processWithRetry(name, job, processor);
      }
    };
    this.timers.push(setInterval(() => void tick(), 10) as unknown as NodeJS.Timeout);
  }

  private async processWithRetry(name: string, job: QueueJob, processor: JobProcessor): Promise<void> {
    try {
      await processor(job.data as Record<string, unknown>, job);
    } catch (err) {
      this.log.error(`queue ${name} job ${job.id} failed: ${(err as Error).message}`);
      if (job.attempts < MAX_ATTEMPTS) {
        const retry = { ...job, attempts: job.attempts + 1 };
        if (this.redisAvailable && this.redis) {
          try {
            await this.redis.lpush(this.redisKey(name), JSON.stringify(retry));
            return;
          } catch {
            /* fallthrough to memory */
          }
        }
        this.memoryQueues.get(name)?.push(retry);
      } else {
        this.log.error(`queue ${name} job ${job.id} permanently failed after ${MAX_ATTEMPTS} attempts`);
      }
    }
  }

  async enqueue(name: string, data: Record<string, unknown>, opts?: { jobId?: string }): Promise<{ id: string; queued: boolean }> {
    if (!this.processors.has(name)) throw new Error(`no processor for queue ${name}`);
    const id = opts?.jobId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    // Idempotency: skip if already enqueued or recently processed.
    if (this.redisAvailable && this.redis) {
      const added = await this.redis.set(this.dedupKey(id), '1', 'EX', 86400, 'NX').catch(() => 'FAIL');
      if (added === null || added === 'FAIL') return { id, queued: false };
    } else {
      if (this.memorySeen.has(id)) return { id, queued: false };
      this.memorySeen.add(id);
    }
    const job: QueueJob = { id, name, data, attempts: 0, createdAt: Date.now() };
    if (this.redisAvailable && this.redis) {
      await this.redis.lpush(this.redisKey(name), JSON.stringify(job)).catch(() => {
        // if redis write fails, fall back to memory
        this.memoryQueues.get(name)?.push(job);
      });
    } else {
      const q = this.memoryQueues.get(name) ?? [];
      q.push(job);
      this.memoryQueues.set(name, q);
    }
    return { id, queued: true };
  }

  private redisKey(name: string): string {
    return `${ENV.redisPrefix}queue:${name}`;
  }
  private dedupKey(id: string): string {
    return `${ENV.redisPrefix}qdone:${id}`;
  }

  async onModuleDestroy(): Promise<void> {
    this.started = false;
    for (const t of this.timers) clearInterval(t);
    this.timers.length = 0;
    this.redis?.disconnect();
  }

  get usesRedis(): boolean {
    return this.redisAvailable && !!this.redis;
  }
}