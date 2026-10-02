import type { LoggerService } from '@nestjs/common';
import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';
import { ENV } from '../../config/app.config';

/**
 * Structured logger with mandatory PII/sensitive-data redaction.
 * Request bodies, passwords, OTPs and tokens are never logged.
 */
const REDACT = [
  'password',
  'passwordHash',
  'password_hash',
  'otp',
  'code',
  'token',
  'accessToken',
  'refreshToken',
  'jwt',
  'authorization',
  'cookie',
  'set-cookie',
  'x-csrf-token',
  'secret',
  'sessionSecret',
  'phone',
  'email',
  'address',
  'gstin',
  'pan',
  'aadhaar',
  'pin',
  'pinCode',
  'bankAccount',
  'ifsc',
  'consent.text',
  'payload.card',
  'card.number',
  'apiKey',
  'api_key',
  'privateKey',
  'private_key',
];

function buildPino(): PinoLogger {
  const pretty = ENV.logPretty && !ENV.nodeEnv.startsWith('test');
  return pino({
    level: ENV.logLevel,
    redact: { paths: REDACT, censor: '[REDACTED]' },
    base: { service: 'farmlink-api', env: ENV.appEnv },
    ...(pretty
      ? { transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } } }
      : {}),
  });
}

export class FarmLinkLogger implements LoggerService {
  private readonly logger: PinoLogger;

  constructor(context?: string) {
    this.logger = buildPino();
    if (context) this.logger = this.logger.child({ ctx: context });
  }

  static of(context: string): FarmLinkLogger {
    return new FarmLinkLogger(context);
  }

  log(message: string, context?: string): void {
    this.logger.info(this.withCtx(message, context));
  }
  error(message: string, trace?: string, _context?: string): void {
    this.logger.error({ err: trace ? { message: trace } : undefined, msg: message });
  }
  warn(message: string, context?: string): void {
    this.logger.warn(this.withCtx(message, context));
  }
  debug(message: string, context?: string): void {
    this.logger.debug(this.withCtx(message, context));
  }
  verbose(message: string, context?: string): void {
    this.logger.trace(this.withCtx(message, context));
  }

  child(bindings: Record<string, unknown>): FarmLinkLogger {
    const child = new FarmLinkLogger();
    child.logger_bind(child.logger.child(bindings));
    return child;
  }

  private logger_bind(l: PinoLogger): void {
    (this as unknown as { logger: PinoLogger }).logger = l;
  }

  private withCtx(message: string, context?: string): { msg: string; ctx?: string } {
    return context ? { msg: message, ctx: context } : { msg: message };
  }
}

export const logger = new FarmLinkLogger('app');