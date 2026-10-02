import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueueService } from '../../common/queue/queue.service';
import { NotificationSender, MockSmsSender, MockEmailSender } from './senders';

export const NOTIFICATION_QUEUE = 'notification-send';

export interface NotifyInput {
  userId: string;
  channel: NotificationChannel;
  templateKey: string;
  data?: Record<string, string | number>;
  vars?: Record<string, string | number>;
}

@Injectable()
export class NotificationService {
  private readonly log = new Logger('notifications');

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
    private readonly sms: MockSmsSender,
    private readonly email: MockEmailSender,
  ) {}

  async notify(input: NotifyInput): Promise<{ notificationId: string }> {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { key: input.templateKey } });
    const user = await this.prisma.user.findUnique({ where: { id: input.userId }, select: { lang: true, phone: true, email: true } });
    const lang = (user?.lang ?? 'en') as 'en' | 'hi';
    const variants = (template?.variants as Record<string, { subject: string; body: string }>) ?? {};
    const render = (key: 'subject' | 'body'): string => {
      const text = (variants[lang] ?? variants['en'] ?? {})[key] ?? input.templateKey;
      return (text ?? '').replace(/\{(\w+)\}/g, (_, k: string) => String(input.vars?.[k] ?? input.data?.[k] ?? ''));
    };

    const body = render('body');
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        channel: input.channel,
        templateKey: input.templateKey,
        title: render('subject').slice(0, 200),
        body: body.slice(0, 2000),
        data: (input.data ?? {}) as Prisma.InputJsonValue,
        status: 'QUEUED',
      },
    });

    await this.queue.enqueue(NOTIFICATION_QUEUE, { notificationId: notification.id }, { jobId: `notif-${notification.id}` });
    return { notificationId: notification.id };
  }

  async dispatch(notificationId: string): Promise<void> {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n || n.status !== 'QUEUED') return;
    const sender: NotificationSender | null = n.channel === 'EMAIL' ? this.email : n.channel === 'SMS' ? this.sms : null;
    if (sender) {
      await sender.send({ to: n.userId, templateKey: n.templateKey, body: n.body });
      await this.prisma.notification.update({ where: { id: n.id }, data: { status: 'SENT', sentAt: new Date(), externalRef: `mock:${n.id}` } });
    } else {
      await this.prisma.notification.update({ where: { id: n.id }, data: { status: 'SENT', sentAt: new Date() } });
    }
  }

  async listForUser(userId: string, opts: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total, page: opts.page, pageSize: opts.pageSize };
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { readAt: new Date() } });
  }

  async upsertTemplate(input: { key: string; channel: NotificationChannel; variants: Record<string, { subject: string; body: string }>; isActive: boolean }): Promise<void> {
    await this.prisma.notificationTemplate.upsert({
      where: { key: input.key },
      create: input as never,
      update: { channel: input.channel, variants: JSON.parse(JSON.stringify(input.variants)), isActive: input.isActive, version: { increment: 1 } },
    });
  }
}

export type { NotificationChannel, NotificationStatus };