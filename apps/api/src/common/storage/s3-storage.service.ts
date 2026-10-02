import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from '../../config/app.config';
import { FarmLinkLogger } from '../logger/farmlink-logger';
import type { ObjectMetadata, ObjectStorage, SignedUploadUrl, StoredObject } from './object-storage.interface';

/**
 * S3-compatible object storage (AWS S3, MinIO, etc.). Private buckets by
 * design; objects are accessible via short-lived pre-signed URLs only.
 * Disabled unless STORAGE_DRIVER=s3 and valid credentials are provided.
 */
export class S3ObjectStorage implements ObjectStorage {
  readonly driver = 's3' as const;
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly log = new FarmLinkLogger('s3');

  constructor() {
    const { bucket } = ENV.s3;
    if (!bucket || !ENV.s3.accessKeyId || !ENV.s3.secretAccessKey) {
      this.bucket = '';
      this.client = null;
      this.log.warn('S3 credentials missing — uploads disabled. Use STORAGE_DRIVER=local.');
      return;
    }
    this.bucket = bucket;
    this.client = new S3Client({
      region: ENV.s3.region,
      endpoint: ENV.s3.endpoint || undefined,
      forcePathStyle: ENV.s3.forcePathStyle,
      credentials: {
        accessKeyId: ENV.s3.accessKeyId,
        secretAccessKey: ENV.s3.secretAccessKey,
      },
    });
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async putObject(key: string, data: Buffer, contentType: string, metadata?: ObjectMetadata): Promise<StoredObject> {
    this.requireClient();
    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
      Metadata: metadata ? (stripUndefined(metadata) as Record<string, string>) : undefined,
      ...(ENV.s3.kmsKeyId ? { ServerSideEncryption: 'aws:kms', SSEKMSKeyId: ENV.s3.kmsKeyId } : {}),
    };
    await this.client!.send(new PutObjectCommand(input));
    return { key, contentType, sizeBytes: data.length };
  }

  async getObject(key: string): Promise<Buffer | null> {
    this.requireClient();
    try {
      const res = await this.client!.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const body = res.Body as { transformToByteArray: () => Promise<Uint8Array> } | undefined;
      if (!body) return null;
      return Buffer.from(await body.transformToByteArray());
    } catch (err) {
      if ((err as { name?: string }).name === 'NoSuchKey') return null;
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    this.requireClient();
    await this.client!.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getSignedDownloadUrl(key: string, expiresSeconds = 3600): Promise<string> {
    this.requireClient();
    return getSignedUrl(
      this.client!,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresSeconds },
    );
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresSeconds = 900): Promise<SignedUploadUrl> {
    this.requireClient();
    const url = await getSignedUrl(
      this.client!,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: expiresSeconds },
    );
    return { url, method: 'PUT', headers: { 'Content-Type': contentType }, expiresSeconds };
  }

  generateKey(prefix: string, ext?: string): string {
    const name = `${Date.now()}-${randomBytes(8).toString('hex')}`;
    return ext ? `${prefix}/${name}${ext.toLowerCase()}` : `${prefix}/${name}`;
  }

  private requireClient(): void {
    if (!this.client) throw new Error('S3 storage not configured');
  }
}

function stripUndefined(o: ObjectMetadata): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && typeof v === 'string') out[k] = v;
  }
  return out;
}

export type { ObjectStorage } from './object-storage.interface';