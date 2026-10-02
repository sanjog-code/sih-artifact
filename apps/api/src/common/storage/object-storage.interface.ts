import type { Buffer } from 'node:buffer';

/** Nest DI token for the configured object storage implementation. */
export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export interface ObjectMetadata {
  contentType?: string;
  [k: string]: unknown;
}

export interface StoredObject {
  key: string;
  contentType: string;
  sizeBytes: number;
}

export interface SignedUploadUrl {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresSeconds: number;
}

export interface ObjectStorage {
  readonly driver: 'local' | 's3';
  putObject(key: string, data: Buffer, contentType: string, metadata?: ObjectMetadata): Promise<StoredObject>;
  getObject(key: string): Promise<Buffer | null>;
  deleteObject(key: string): Promise<void>;
  getSignedDownloadUrl(key: string, expiresSeconds?: number): Promise<string>;
  getSignedUploadUrl(key: string, contentType: string, expiresSeconds?: number): Promise<SignedUploadUrl>;
  generateKey(prefix: string, ext?: string): string;
}