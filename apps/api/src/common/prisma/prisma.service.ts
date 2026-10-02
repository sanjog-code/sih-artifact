import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FarmLinkLogger } from '../logger/farmlink-logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly log = new FarmLinkLogger('prisma');

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (err) {
      this.log.warn(`Database connection not available yet: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}