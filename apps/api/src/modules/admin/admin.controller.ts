import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AdminService } from './admin.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { verificationDecisionSchema } from '@farmlink/shared';

const idParam = z.string().min(1);
const listQ = z.object({ q: z.string().optional(), role: z.string().optional(), status: z.string().optional(), action: z.string().optional(), userId: z.string().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RbacGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  @Permissions(PERMISSIONS.ADMIN_USER_MANAGE)
  async users(@Query() q: unknown) {
    const parsed = listQ.safeParse(q ?? {});
    return this.admin.listUsers(parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }

  @Post('users/:id/status')
  @Permissions(PERMISSIONS.ADMIN_USER_MANAGE)
  @RateLimit(MutationRateLimit)
  async userStatus(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = z.object({ status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'DEACTIVATED']) }).safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    await this.admin.updateUserStatus(user.id, idParam.parse(id), parsed.data.status);
    return { ok: true };
  }

  @Post('verification')
  @Permissions(PERMISSIONS.ADMIN_VERIFICATION)
  @RateLimit(MutationRateLimit)
  async verification(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = verificationDecisionSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.admin.verification(user.id, parsed.data);
  }

  @Get('audits')
  @Permissions(PERMISSIONS.ADMIN_AUDIT)
  async audits(@Query() q: unknown) {
    const parsed = listQ.safeParse(q ?? {});
    return this.admin.auditLogs(parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }

  @Get('reports')
  @Permissions(PERMISSIONS.ADMIN_REPORTS)
  async reports() {
    return this.admin.reports();
  }
}