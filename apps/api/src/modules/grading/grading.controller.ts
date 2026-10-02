import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { GradingService } from './grading.service';
import { Permissions, CurrentUser, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { MutationRateLimit } from '../../common/guards/rate-limit.guard';
import { gradingRunSchema, gradeConfirmationSchema } from '@farmlink/shared';

const idParam = z.string().min(1);

@ApiTags('grading')
@Controller('grading')
@UseGuards(AuthGuard, RbacGuard)
export class GradingController {
  constructor(
    private readonly grading: GradingService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('lots/:id/queue')
  @Permissions(PERMISSIONS.WAREHOUSE_GRADE)
  @RateLimit(MutationRateLimit)
  async queue(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = gradingRunSchema.safeParse({ ...(body as object), lotId: id });
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const images = await this.prisma.lotImage.findMany({
      where: { lotId: id, id: { in: parsed.data.imageIds } },
      select: { objectKey: true },
    });
    if (images.length === 0) return { ok: false, code: 'no_images' };
    const run = await this.grading.queueCandidate(id, images.map((i) => i.objectKey).slice(0, 12), user.id);
    return { ok: true, ...run };
  }

  @Get('lots/:id/runs')
  @Permissions(PERMISSIONS.WAREHOUSE_GRADE)
  async runs(@Param('id') id: string) {
    return this.grading.runsForLot(idParam.parse(id));
  }

  @Get('runs/:runId')
  @Permissions(PERMISSIONS.WAREHOUSE_GRADE)
  async run(@Param('runId') runId: string) {
    return this.grading.run(idParam.parse(runId));
  }

  @Post('lots/:id/confirm')
  @Permissions(PERMISSIONS.WAREHOUSE_GRADE)
  @RateLimit(MutationRateLimit)
  async confirm(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: SessionUser) {
    const parsed = gradeConfirmationSchema.safeParse({ ...(body as object), lotId: id });
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    // Operating staff must always be human-confirmed; source MANUAL with reason enforced above.
    const result = await this.grading.confirm({ ...parsed.data, reviewerId: user.id });
    return { ok: true, ...result };
  }
}