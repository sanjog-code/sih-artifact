import { Module, OnModuleInit } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { QueueService } from '../../common/queue/queue.service';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, QueueService],
  exports: [WebhooksService],
})
export class WebhooksModule implements OnModuleInit {
  constructor(private readonly webhooks: WebhooksService) {}
  onModuleInit(): void {
    this.webhooks.onModuleInit();
  }
}