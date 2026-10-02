import { BadRequestException, Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { WebhooksService } from './webhooks.service';
import { Permissions, CurrentUser, Public, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { WebhookRateLimit } from '../../common/guards/rate-limit.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

const endpointSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().url(),
  events: z.array(z.string().min(1)).min(1),
  secret: z.string().min(16).optional(),
  isActive: z.boolean().default(true),
});
const pageQ = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooks: WebhooksService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Inbound event webhook: HMAC-signed + timestamped + nonce'd. Public endpoint,
   * cryptographically authenticated, replay-guarded.
   */
  @Public()
  @Post('receive')
  @RateLimit(WebhookRateLimit)
  async receive(
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    const event = headers['farmlink-event'] ?? headers['x-farmlink-event'];
    const timestamp = headers['farmlink-timestamp'];
    const nonce = headers['farmlink-nonce'];
    const signature = headers['farmlink-signature'];
    if (!event || !timestamp || !nonce || !signature) throw new BadRequestException('missing_webhook_headers');
    const raw = JSON.stringify(body ?? {});
    return this.webhooks.receiveInbound({ rawBody: raw, event, timestamp, nonce, signature });
  }

  @UseGuards(AuthGuard, RbacGuard)
  @Post('endpoints')
  @Permissions(PERMISSIONS.ADMIN_AUDIT)
  async createEndpoint(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = endpointSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.webhooks.createEndpoint(parsed.data, user.id);
  }

  @UseGuards(AuthGuard, RbacGuard)
  @Get('endpoints')
  @Permissions(PERMISSIONS.ADMIN_AUDIT)
  async listEndpoints() {
    return this.prisma.webhookEndpoint.findMany({ include: { _count: { select: { deliveries: true } } }, orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(AuthGuard, RbacGuard)
  @Get('deliveries')
  @Permissions(PERMISSIONS.ADMIN_AUDIT)
  async deliveries(@Query() q: unknown) {
    const parsed = pageQ.safeParse(q ?? {});
    return this.webhooks.deliveries(parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }
}