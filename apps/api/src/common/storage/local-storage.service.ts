import { createReadStream, existsSync, mkdirSync, promises as fsp } from 'node:fs';
import { join, extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { ENV } from '../../config/app.config';
import { signGetUrl, STORAGE_SIGNING_CONTEXT } from '../utils/crypto.util';
import type { ObjectMetadata, ObjectStorage, SignedUploadUrl, StoredObject } from './object-storage.interface';

/**
 * Local filesystem storage for development/CI. Private by default: objects are
 * only readable through the signed `/files/read` endpoint.
 */
export class LocalObjectStorage implements ObjectStorage {
  readonly driver = 'local' as const;
  private readonly root: string;

  constructor(root = ENV.storageLocalRoot) {
    this.root = join(process.cwd(), root);
    mkdirSync(this.root, { recursive: true });
  }

  private path(key: string): string {
    // prevent path traversal in object keys
    const safe = key.replace(/\.\.(\/|\\)/g, '').replace(/[\\/]/g, '/').replace(/^\/+/, '');
    return join(this.root, safe);
  }

  private ensureDir(p: string): void {
    const dir = p.slice(0, p.lastIndexOf('/'));
    if (dir) mkdirSync(join(this.root, dir), { recursive: true });
  }

  async putObject(key: string, data: Buffer, contentType: string, _metadata?: ObjectMetadata): Promise<StoredObject> {
    const full = this.path(key);
    this.ensureDir(key);
    await fsp.mkdir(full.slice(0, full.lastIndexOf('/')), { recursive: true });
    await fsp.writeFile(full, data);
    return { key, contentType, sizeBytes: data.length };
  }

  async getObject(key: string): Promise<Buffer | null> {
    const full = this.path(key);
    if (!existsSync(full)) return null;
    return fsp.readFile(full);
  }

  async deleteObject(key: string): Promise<void> {
    const full = this.path(key);
    if (existsSync(full)) await fsp.unlink(full);
  }

  async getSignedDownloadUrl(key: string, expiresSeconds = 3600): Promise<string> {
    const enc = encodeURIComponent(key);
    const { token, expires } = signGetUrl(`${STORAGE_SIGNING_CONTEXT}:${key}`, expiresSeconds * 1000);
    return `${ENV.apiPublicUrl}/files/read?key=${enc}&exp=${expires}&sig=${token}&ctx=read`;
  }

  async getSignedUploadUrl(_key: string, _contentType: string, expiresSeconds = 900): Promise<SignedUploadUrl> {
    // Local driver uploads go through the API; the preflight endpoint owns auth.
    return {
      url: `${ENV.apiPublicUrl}/uploads`,
      method: 'PUT',
      headers: {},
      expiresSeconds,
    };
  }

  generateKey(prefix: string, ext?: string): string {
    const name = `${Date.now()}-${randomBytes(8).toString('hex')}`;
    return ext ? `${prefix}/${name}${normalizeExt(ext)}` : `${prefix}/${name}`;
  }

  stream(key: string): { exists: boolean; path: string } {
    const full = this.path(key);
    return { exists: existsSync(full), path: full };
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    return createReadStream(this.path(key));
  }
}

function normalizeExt(e: string): string {
  return extname(e) ? e.toLowerCase() : `.${e.replace(/^\./, '').toLowerCase()}`;
}

export type { ObjectStorage } from './object-storage.interface';