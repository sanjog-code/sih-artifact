import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { RfqService } from './rfq.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { rfqCreateSchema, negotiationSchema } from '@farmlink/shared';

const idParam = z.string().min(1);

@ApiTags('rfq')
@Controller('rfq')
@UseGuards(AuthGuard, RbacGuard)
export class RfqController {
  constructor(private readonly rfq: RfqService) {}

  @Post('create')
  @Permissions(PERMISSIONS.BUYER_RFQ_CREATE)
  @RateLimit(MutationRateLimit)
  async create(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = rfqCreateSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.rfq.create(user.id, parsed.data);
  }

  @Get('mine')
  @Permissions(PERMISSIONS.BUYER_RFQ_CREATE)
  async mine(@CurrentUser() user: SessionUser) {
    return this.rfq.listForBuyer(user.id);
  }

  @Get('matches')
  @Permissions(PERMISSIONS.LOT_VIEW_OWN)
  async matches(@CurrentUser() user: SessionUser) {
    return this.rfq.matchingForLots(user.id);
  }

  /** Farmer or buyer counters / proposes a price for a lot-FARMER side. */
  @Post('respond')
  @Permissions(PERMISSIONS.LOT_VIEW_OWN)
  @RateLimit(MutationRateLimit)
  async respond(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = negotiationSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.rfq.respond(user.id, user.role, parsed.data);
  }

  /** Buyer accepts an offer; stock is reserved for the bulk channel. */
  @Post('accept/:negotiationId')
  @Permissions(PERMISSIONS.BUYER_RFQ_CREATE)
  @RateLimit(MutationRateLimit)
  async accept(@Param('negotiationId') negotiationId: string, @CurrentUser() user: SessionUser) {
    return this.rfq.acceptOffer(user.id, idParam.parse(negotiationId));
  }
}