export type UserRole = 'farmer' | 'buyer' | 'consumer' | 'admin';

export interface SessionPayload {
  userId: string;
  role: UserRole;
  phone: string;
  issuedAt: number;
  expiresAt: number;
}

const JWT_SECRET = process.env.SESSION_SECRET || 'fasal-matrix-secure-auth-secret-key-32chars-min!!';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof buffer === 'string') {
    bytes = new TextEncoder().encode(buffer);
  } else if (buffer instanceof Uint8Array) {
    bytes = buffer;
  } else {
    bytes = new Uint8Array(buffer);
  }

  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getHmacSignature(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return base64UrlEncode(sigBuffer);
}

/**
 * Sign session payload into tamper-proof HMAC SHA-256 token using Web Crypto
 */
export async function signSessionToken(payload: Omit<SessionPayload, 'issuedAt' | 'expiresAt'>): Promise<string> {
  const now = Date.now();
  const fullPayload: SessionPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = await getHmacSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify session token and return verified payload, or null if invalid/expired using Web Crypto
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    const expectedSignature = await getHmacSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);

    // Constant-time length and value check
    if (signature.length !== expectedSignature.length) {
      return null;
    }

    let mismatch = 0;
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
