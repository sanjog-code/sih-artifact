import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { ObjectStorage, OBJECT_STORAGE } from '../../common/storage/object-storage.interface';
import { verifyGetUrl, STORAGE_SIGNING_CONTEXT } from '../../common/utils/crypto.util';

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_DOC_BYTES = 15 * 1024 * 1024;

/** Minimal magic-byte sniffing; never trusts client-provided content-type alone. */
export function sniffImageMime(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.slice(0, 4).equals(Buffer.from('RIFF')) && buf.slice(8, 12).equals(Buffer.from('WEBP'))) return 'image/webp';
  return null;
}

const DOC_ALLOWED = new Map<string, string>([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
]);

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    private readonly audit: AuditService,
  ) {}

  async uploadLotImage(input: { lotId: string; uploadedById: string; buffer: Buffer; originalName?: string; declaredMime?: string }) {
    const size = input.buffer.length;
    if (size > MAX_IMAGE_BYTES) throw new BadRequestException('image_too_large');
    const mime = sniffImageMime(input.buffer);
    if (!mime) throw new BadRequestException('invalid_image_type');

    const lot = await this.prisma.lot.findUnique({ where: { id: input.lotId }, select: { id: true } });
    if (!lot) throw new BadRequestException('lot_not_found');

    const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp';
    const key = this.storage.generateKey(`lots/${input.lotId}`, ext);
    await this.storage.putObject(key, input.buffer, mime, { lotId: input.lotId });

    const image = await this.prisma.lotImage.create({
      data: {
        lotId: input.lotId,
        kind: 'GRADING',
        bucket: this.storage.driver,
        objectKey: key,
        mime,
        sizeBytes: size,
        uploadedById: input.uploadedById,
        captureMeta: { declaredMime: input.declaredMime, originalName: input.originalName ?? null },
        isPrivate: true,
      },
    });
    const url = await this.storage.getSignedDownloadUrl(key);
    await this.audit.record({ actorUserId: input.uploadedById, action: 'upload:lot_image', targetType: 'lot', targetId: input.lotId, after: { imageId: image.id, mime, size } });
    return { imageId: image.id, mime, sizeBytes: size, url, isDemo: true };
  }

  async uploadDocument(input: { ownerUserId: string; uploadedById: string; buffer: Buffer; declaredMime?: string; kind: string }) {
    const size = input.buffer.length;
    if (size > MAX_DOC_BYTES) throw new BadRequestException('document_too_large');
    let mime = '';
    const sniffed = sniffImageMime(input.buffer);
    if (sniffed) {
      mime = sniffed;
    } else if (input.buffer.slice(0, 4).toString('latin1') === '%PDF') {
      mime = 'application/pdf';
    } else {
      mime = input.declaredMime ?? '';
    }
    const ext = DOC_ALLOWED.get(mime) ?? 'bin';
    if (!DOC_ALLOWED.has(mime)) throw new BadRequestException('invalid_document_type');

    const key = this.storage.generateKey(`docs/${input.ownerUserId}`, ext);
    await this.storage.putObject(key, input.buffer, mime, { owner: input.ownerUserId });
    const doc = await this.prisma.document.create({
      data: {
        ownerUserId: input.ownerUserId,
        kind: input.kind as 'DOCUMENT' | 'POD' | 'DISPUTE' | 'INTAKE' | 'GRADING',
        bucket: this.storage.driver,
        objectKey: key,
        mime,
        sizeBytes: size,
        uploadedById: input.uploadedById,
        isPrivate: true,
      },
    });
    await this.audit.record({ actorUserId: input.uploadedById, action: 'upload:document', targetType: 'document', targetId: doc.id });
    return { documentId: doc.id, mime, sizeBytes: size, isDemo: true };
  }

  /** Signed read handler: honest expiry + constant-time signature check. */
  async signedRead(key: string, exp: string, sig: string, _ctx = 'read') {
    const expires = Number(exp);
    if (!Number.isFinite(expires)) throw new UnauthorizedException('bad_exp');
    if (!verifyGetUrl(`${STORAGE_SIGNING_CONTEXT}:${key}`, expires, sig)) {
      throw new UnauthorizedException('invalid_signature');
    }
    const data = await this.storage.getObject(key);
    if (!data) throw new BadRequestException('object_not_found');
    return { buffer: data, mime: this.mimeForKey(key) };
  }

  private mimeForKey(key: string): string {
    const lower = key.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
  }
}