import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { exportRequestSchema, deletionRequestSchema } from '@farmlink/shared';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: SessionUser) {
    return this.users.me(user.id);
  }

  @Post('privacy/export')
  @Permissions(PERMISSIONS.PRIVACY_EXPORT)
  @RateLimit(MutationRateLimit)
  async export(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = exportRequestSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.users.requestExport(user.id, parsed.data.sections);
  }

  @Get('privacy/exports')
  @Permissions(PERMISSIONS.PRIVACY_EXPORT)
  async exports(@CurrentUser() user: SessionUser) {
    return this.users.listExports(user.id);
  }

  @Post('privacy/delete')
  @Permissions(PERMISSIONS.PRIVACY_DELETE)
  @RateLimit(MutationRateLimit)
  async delete(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = deletionRequestSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.users.requestDeletion(user.id, 'account deletion requested by user');
  }
}