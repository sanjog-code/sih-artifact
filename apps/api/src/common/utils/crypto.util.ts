import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { ENV } from '../../config/app.config';

/** Never log the outputs of this file. */

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function hmacHex(secret: string, input: string): string {
  return createHmac('sha256', secret).update(input, 'utf8').digest('hex');
}

export function constantTimeEquals(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function randomHex(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function randomToken(length = 32): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('base64url')
    .slice(0, length);
}

/** Deterministic OTP (demo mock uses a fixed code; real providers generate + deliver). */
export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

/** Store only a salted hash of an OTP — never the plaintext. */
export function hashOtp(otp: string, salt: string): string {
  return sha256Hex(`${salt}:${otp}`);
}

export function generateOtpSalt(): string {
  return randomHex(16);
}

/** HMAC-signed access URL (used by the local storage driver for private files). */
export function signGetUrl(payload: string, expiresMs: number): { token: string; expires: number } {
  const expires = Date.now() + expiresMs;
  const token = hmacHex(ENV.sessionSecret, `${payload}:${expires}`);
  return { token, expires };
}

export function verifyGetUrl(payload: string, expires: number, token: string): boolean {
  if (expires < Date.now()) return false;
  return constantTimeEquals(token, hmacHex(ENV.sessionSecret, `${payload}:${expires}`));
}

export const STORAGE_SIGNING_CONTEXT = '/files/read';

/** Stable CSRF token stored in a cookie; length matches csrf settings. */
export function generateCsrfToken(): string {
  return randomBytes(24).toString('base64url');
}

export function generateShortCode(len = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = randomBytes(len);
  for (let i = 0; i < len; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

export function deterministicHash(input: string): string {
  return sha256Hex(input);
}