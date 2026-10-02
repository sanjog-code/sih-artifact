import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { NotificationService } from './notification.service';
import { Permissions, CurrentUser } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';

const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard, RbacGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  @Permissions(PERMISSIONS.NOTIFICATION_VIEW_OWN)
  async list(@CurrentUser() user: SessionUser, @Query() q: unknown) {
    const parsed = listParamsSchema.safeParse(q ?? {});
    return this.notifications.listForUser(user.id, parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }

  @Patch(':id/read')
  @Permissions(PERMISSIONS.NOTIFICATION_VIEW_OWN)
  async read(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    const parsed = z.string().min(1).safeParse(id);
    if (!parsed.success) return { ok: false, code: 'validation_error' };
    await this.notifications.markRead(user.id, parsed.data);
    return { ok: true };
  }
}