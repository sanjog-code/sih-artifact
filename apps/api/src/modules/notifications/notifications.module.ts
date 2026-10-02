import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { NotificationService, NOTIFICATION_QUEUE } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { MockSmsSender, MockEmailSender, MockPushSender } from './senders';
import { QueueService } from '../../common/queue/queue.service';

@Injectable()
class NotificationWorker implements OnModuleInit {
  constructor(
    private readonly queue: QueueService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit(): void {
    this.queue.register(NOTIFICATION_QUEUE, async (data) => {
      const notificationId = String(data.notificationId ?? '');
      if (!notificationId) return;
      await this.notifications.dispatch(notificationId);
    });
    this.queue.start();
  }
}

@Module({
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationWorker, QueueService, MockSmsSender, MockEmailSender, MockPushSender],
  exports: [NotificationService],
})
export class NotificationsModule {}