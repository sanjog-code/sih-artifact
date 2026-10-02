import { Controller, Get, Post, Query, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { UploadsService } from './uploads.service';
import { Permissions, CurrentUser, Public, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import type { SessionUser } from '@farmlink/shared';
import { UploadRateLimit, SearchRateLimit } from '../../common/guards/rate-limit.guard';

const readQ = z.object({
  key: z.string().min(1),
  exp: z.string().regex(/^\d+$/),
  sig: z.string().min(8),
  ctx: z.string().default('read'),
});

const docKindSchema = z.enum(['DOCUMENT', 'POD', 'DISPUTE', 'INTAKE', 'GRADING']);

@ApiTags('uploads')
@Controller()
@UseGuards(AuthGuard, RbacGuard)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  /**
   * Signed private-file readback. LocalObjectStorage only produces URLs for
   * this endpoint; S3 presigned URLs bypass the API entirely. Public but
   * cryptographically signed; rate-limited to prevent enumeration.
   */
  @Public()
  @Get('files/read')
  @RateLimit(SearchRateLimit)
  async read(@Query() q: unknown) {
    const parsed = readQ.safeParse(q ?? {});
    if (!parsed.success) return { ok: false, code: 'invalid_signed_url' };
    const result = await this.uploads.signedRead(parsed.data.key, parsed.data.exp, parsed.data.sig, parsed.data.ctx);
    return new StreamableFile(result.buffer, { type: result.mime });
  }

  @Post('uploads/image')
  @Permissions(PERMISSIONS.UPLOAD_CREATE)
  @RateLimit(UploadRateLimit)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadLotImage(@UploadedFile() file: { buffer: Buffer; mimetype: string; size: number; originalname: string }, @Query('lotId') lotId: string, @CurrentUser() user: SessionUser) {
    if (!file) return { ok: false, code: 'missing_file' };
    const result = await this.uploads.uploadLotImage({
      lotId,
      uploadedById: user.id,
      buffer: file.buffer,
      originalName: file.originalname,
      declaredMime: file.mimetype,
    });
    return { ok: true, ...result };
  }

  @Post('uploads/document')
  @Permissions(PERMISSIONS.UPLOAD_CREATE)
  @RateLimit(UploadRateLimit)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadDocument(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    @Query('kind') kind: string,
    @CurrentUser() user: SessionUser,
  ) {
    const parsedKind = docKindSchema.safeParse(kind ?? 'DOCUMENT');
    if (!file) return { ok: false, code: 'missing_file' };
    const result = await this.uploads.uploadDocument({
      ownerUserId: user.id,
      uploadedById: user.id,
      buffer: file.buffer,
      declaredMime: file.mimetype,
      kind: parsedKind.success ? parsedKind.data : 'DOCUMENT',
    });
    return { ok: true, ...result };
  }
}