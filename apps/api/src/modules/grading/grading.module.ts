import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueueService } from '../../common/queue/queue.service';
import { GradingController } from './grading.controller';
import { GRADING_QUEUE, GradingService } from './grading.service';

@Injectable()
class GradingWorker implements OnModuleInit {
  constructor(
    private readonly queue: QueueService,
    private readonly grading: GradingService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    // Async grading-candidate jobs: mock model processes camera metadata offline.
    this.queue.register(GRADING_QUEUE, async (data) => {
      const runId = String(data.runId ?? '');
      if (!runId) return;
      await this.grading.processCandidate(runId);
    });
    this.queue.start();
  }
}

@Module({
  controllers: [GradingController],
  providers: [GradingService, GradingWorker, QueueService],
  exports: [GradingService],
})
export class GradingModule {}