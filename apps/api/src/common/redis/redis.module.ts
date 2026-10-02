import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ENV } from '../../config/app.config';

@Global()
@Module({
  providers: [
    { provide: CacheService, useFactory: () => new CacheService(ENV.redisUrl, ENV.redisPrefix) },
  ],
  exports: [CacheService],
})
export class RedisModule implements OnModuleDestroy {
  constructor(private readonly cache: CacheService) {}
  onModuleDestroy(): void {
    // best-effort disconnect on shutdown
  }
}