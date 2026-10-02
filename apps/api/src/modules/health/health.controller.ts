import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { Public } from '../../common/decorators/auth.decorators';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Public()
  @Get()
  liveness() {
    return {
      status: 'ok',
      service: 'farmlink-api',
      version: process.env.npm_package_version ?? '0.1.0',
      time: new Date().toISOString(),
      demo: true,
    };
  }

  @Public()
  @Get('ready')
  async readiness() {
    let db = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    return { status: db ? 'ok' : 'degraded', dependencies: { postgres: db, redis: this.cache.available } };
  }
}