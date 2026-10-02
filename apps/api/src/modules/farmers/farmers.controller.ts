import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { FarmersService } from './farmers.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { declareProduceSchema, pickupRequestSchema, lotDecisionSchema } from '@farmlink/shared';

const idParam = z.string().min(1);
const pageQ = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
const profileUpdateSchema = z.object({ name: z.string().min(2).max(120).optional(), lang: z.enum(['en', 'hi']).optional(), cropsGrown: z.array(z.string().min(1)).max(20).optional() });

@ApiTags('farmers')
@Controller('farmers')
@UseGuards(AuthGuard, RbacGuard)
export class FarmersController {
  constructor(private readonly farmers: FarmersService) {}

  @Get('profile')
  @Permissions(PERMISSIONS.FARMER_PROFILE_READ)
  async profile(@CurrentUser() user: SessionUser) {
    return this.farmers.profile(user.id);
  }

  @Put('profile')
  @Permissions(PERMISSIONS.FARMER_PROFILE_WRITE)
  @RateLimit(MutationRateLimit)
  async updateProfile(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = profileUpdateSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.farmers.updateProfile(user.id, parsed.data);
  }

  @Post('produce/declare')
  @Permissions(PERMISSIONS.PRODUCE_DECLARE)
  @RateLimit(MutationRateLimit)
  async declare(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = declareProduceSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.farmers.declareProduce(user.id, {
      cropId: parsed.data.cropId,
      varietyId: parsed.data.varietyId,
      quantityKg: parsed.data.estimatedQuantityKg,
      expectedHarvestDate: parsed.data.expectedHarvestDate,
      cluster: parsed.data.preferredCluster,
      preferredLanguage: parsed.data.preferredLanguage,
    });
  }

  @Get('produce/declarations')
  @Permissions(PERMISSIONS.PRODUCE_DECLARE)
  async declarations(@CurrentUser() user: SessionUser) {
    return this.farmers.myDeclarations(user.id);
  }

  @Post('pickup-request')
  @Permissions(PERMISSIONS.PICKUP_REQUEST)
  @RateLimit(MutationRateLimit)
  async pickupRequest(@Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = pickupRequestSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.farmers.requestPickup(user.id, {
      cropId: parsed.data.cropId,
      varietyId: parsed.data.varietyId,
      quantityKg: parsed.data.quantityKg,
      note: parsed.data.notes,
    });
  }

  @Get('pickups')
  @Permissions(PERMISSIONS.PICKUP_REQUEST)
  async pickups(@CurrentUser() user: SessionUser) {
    return this.farmers.myPickups(user.id);
  }

  @Get('lots')
  @Permissions(PERMISSIONS.LOT_VIEW_OWN)
  async lots(@CurrentUser() user: SessionUser, @Query() q: unknown) {
    const parsed = pageQ.safeParse(q ?? {});
    return this.farmers.myLots(user.id, parsed.success ? parsed.data : { page: 1, pageSize: 20 });
  }

  @Post('lots/:id/decision')
  @Permissions(PERMISSIONS.LOT_DECISION)
  @RateLimit(MutationRateLimit)
  async decide(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = lotDecisionSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.farmers.decide(user.id, idParam.parse(id), parsed.data.decision, parsed.data.note);
  }

  @Get('dashboard')
  @Permissions(PERMISSIONS.LOT_VIEW_OWN)
  async dashboard(@CurrentUser() user: SessionUser) {
    return this.farmers.dashboard(user.id);
  }
}