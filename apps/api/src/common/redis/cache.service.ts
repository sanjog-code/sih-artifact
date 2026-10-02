import { Redis } from 'ioredis';
import { ENV } from '../../config/app.config';
import { FarmLinkLogger } from '../logger/farmlink-logger';

/**
 * Cache / rate-limit abstraction over Redis with an in-memory fallback so the
 * platform boots and unit tests run without a Redis server. Real deployments
 * always supply REDIS_URL (docker-compose, managed Redis, etc.).
 */
export interface CacheBackend {
  available: boolean;
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

interface MemoryEntry {
  value: unknown;
  expiry: number; // epoch ms
}

export class MemoryCacheBackend implements CacheBackend {
  available = true;
  private readonly store = new Map<string, MemoryEntry>();

  private prune(): void {
    const now = Date.now();
    for (const [k, v] of this.store) if (v.expiry && v.expiry <= now) this.store.delete(k);
  }
  async get(key: string): Promise<unknown> {
    this.prune();
    return this.store.get(key)?.value;
  }
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    this.store.set(key, { value, expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
  }
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
  async incr(key: string): Promise<number> {
    const val = (Number(await this.get(key)) || 0) + 1;
    await this.set(key, val);
    return val;
  }
  async expire(key: string, ttlSeconds: number): Promise<void> {
    const v = this.store.get(key);
    if (v) v.expiry = Date.now() + ttlSeconds * 1000;
  }
  async ttl(key: string): Promise<number> {
    const v = this.store.get(key);
    if (!v) return -2;
    return v.expiry ? Math.max(0, Math.ceil((v.expiry - Date.now()) / 1000)) : -1;
  }
}

export class RedisCacheBackend implements CacheBackend {
  available = false;
  private readonly client: Redis | null = null;
  private readonly memory = new MemoryCacheBackend();
  private readonly prefix: string;
  private readonly log = new FarmLinkLogger('redis');

  constructor(url?: string, prefix = 'farmlink:') {
    this.prefix = prefix;
    if (!url) {
      this.log.warn('REDIS_URL not set — using in-memory cache fallback');
      return;
    }
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy: (times) => (times > 3 ? null : 100 * times),
      });
      // mark synchronous availability path below; do not wait on startup.
      this.available = false;
      void this.client
        .connect()
        .then(() => {
          this.available = true;
        })
        .catch((err) => {
          this.log.warn(`Redis unavailable (${(err as Error).message}) — using in-memory fallback`);
          this.available = false;
        });
    } catch (err) {
      this.log.warn(`Redis init failed (${(err as Error).message}) — using in-memory fallback`);
    }
  }

  get clientInstance(): Redis | null {
    return this.client;
  }

  private key(k: string): string {
    return this.prefix + k;
  }

  private async withRedis<T>(fn: (r: Redis) => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.client && this.available && this.client.status === 'ready') {
      try {
        return await fn(this.client);
      } catch {
        return fallback();
      }
    }
    return fallback();
  }

  async get(key: string): Promise<unknown> {
    return this.withRedis(async (r) => JSON.parse((await r.get(this.key(key))) ?? 'null'), () => this.memory.get(key));
  }
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const j = JSON.stringify(value);
    await this.withRedis(
      async (r) => {
        if (ttlSeconds) await r.set(this.key(key), j, 'EX', ttlSeconds);
        else await r.set(this.key(key), j);
      },
      () => this.memory.set(key, value, ttlSeconds),
    );
  }
  async del(key: string): Promise<void> {
    await this.withRedis(async (r) => void r.del(this.key(key)), () => this.memory.del(key));
  }
  async incr(key: string): Promise<number> {
    return this.withRedis(async (r) => r.incr(this.key(key)), () => this.memory.incr(key));
  }
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.withRedis(async (r) => void r.expire(this.key(key), ttlSeconds), () => this.memory.expire(key, ttlSeconds));
  }
  async ttl(key: string): Promise<number> {
    return this.withRedis(async (r) => r.ttl(this.key(key)), () => this.memory.ttl(key));
  }

  close(): void {
    this.client?.disconnect();
  }
}

export class CacheService {
  private readonly backend: CacheBackend;
  constructor(url?: string, prefix?: string) {
    this.backend = new RedisCacheBackend(url ?? ENV.redisUrl, prefix ?? ENV.redisPrefix);
  }
  get available(): boolean {
    return this.backend.available;
  }
  async get<T>(key: string): Promise<T | undefined> {
    return (await this.backend.get(key)) as T | undefined;
  }
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    return this.backend.set(key, value, ttlSeconds);
  }
  async del(key: string): Promise<void> {
    return this.backend.del(key);
  }
  async incr(key: string): Promise<number> {
    return this.backend.incr(key);
  }
  async expire(key: string, ttlSeconds: number): Promise<void> {
    return this.backend.expire(key, ttlSeconds);
  }
  async ttl(key: string): Promise<number> {
    return this.backend.ttl(key);
  }

  /**
   * Fixed-window rate limiter that decays naturally. Redis-backed in production.
   */
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    const countKey = `rl:${key}`;
    const ttl = await this.ttl(countKey);
    if (ttl < 0) await this.set(countKey, 0, windowSeconds);
    const count = await this.incr(countKey);
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const retryAfterSeconds = allowed ? 0 : Math.max(1, await this.ttl(countKey));
    return { allowed, remaining, retryAfterSeconds };
  }
}