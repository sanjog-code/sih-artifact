import { randomBytes } from 'node:crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function code(len: number): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += CHARS[bytes[i]! % CHARS.length];
  return out;
}

const nowStamp = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

export const generateLotNumber = (): string => `FL-LOT-${nowStamp()}-${code(6)}`;
export const generateQrCode = (): string => `FL-QR-${code(10)}`;
export const generateOrderNumber = (): string => `FL-ORD-${nowStamp()}-${code(6)}`;
export const generateRfqNumber = (): string => `FL-RFQ-${nowStamp()}-${code(6)}`;
export const generateInvoiceNumber = (): string => `FL-INV-${nowStamp()}-${code(6)}`;
export const generateCaseNumber = (): string => `FL-FCX-${nowStamp()}-${code(6)}`;
export const generateRouteCode = (): string => `FL-RT-${nowStamp()}-${code(5)}`;
export const generateIdempotencyNonce = (): string => code(24);