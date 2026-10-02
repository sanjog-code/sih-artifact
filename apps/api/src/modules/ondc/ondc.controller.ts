import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { OndcService } from './ondc.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

const actionSchema = z.object({ action: z.string().min(2).max(40), payload: z.record(z.string(), z.unknown()).default({}) });

@ApiTags('ondc')
@Controller('ondc')
@UseGuards(AuthGuard, RbacGuard)
export class OndcController {
  constructor(
    private readonly ondc: OndcService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('action')
  @Permissions(PERMISSIONS.ONDC_READY_MANAGE)
  @RateLimit(MutationRateLimit)
  async action(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = actionSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const res = await this.ondc.handleAction({ ...parsed.data, actorRole: user.role });
    return { ok: true, ...res, disclaimer: 'Demo ONDC adapter — not ONDC-certified, not production-compliant.' };
  }

  @Post('inbound')
  @Permissions(PERMISSIONS.ONDC_READY_MANAGE)
  @RateLimit(MutationRateLimit)
  async inbound(@Body() body: unknown) {
    const parsed = actionSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.ondc.inbound(parsed.data);
  }

  @Get('events')
  @Permissions(PERMISSIONS.ONDC_READY_MANAGE)
  async events() {
    return this.prisma.integrationEvent.findMany({ where: { provider: 'ONDC' }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}