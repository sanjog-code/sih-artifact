import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  errors?: unknown[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly log = new Logger('exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ id?: string; url?: string; method?: string }>();
    const requestId = request.id;

    const body: ErrorBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_error',
      message: 'Something went wrong. Please retry.',
      requestId,
    };

    if (exception instanceof ZodError) {
      body.statusCode = HttpStatus.BAD_REQUEST;
      body.code = 'validation_error';
      body.message = 'Validation failed';
      body.errors = exception.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const status = exception.getStatus();
      body.statusCode = status;
      if (typeof res === 'string') {
        body.message = res;
        body.code = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        body.message = typeof r.message === 'string' ? r.message : typeof r.message === 'object' && Array.isArray(r.message) ? r.message.join(', ') : exception.message;
        body.code = typeof r.code === 'string' ? r.code : typeof r.message === 'string' ? r.message : 'http_error';
        if (Array.isArray(r.message)) body.errors = r.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        body.statusCode = HttpStatus.CONFLICT;
        body.code = 'duplicate_resource';
        body.message = 'Resource already exists';
      } else if (exception.code === 'P2025') {
        body.statusCode = HttpStatus.NOT_FOUND;
        body.code = 'not_found';
        body.message = 'Resource not found';
      } else if (exception.code === 'P2034') {
        body.statusCode = HttpStatus.CONFLICT;
        body.code = 'conflict_retry';
        body.message = 'Concurrent update conflict. Please retry.';
      } else {
        body.statusCode = HttpStatus.BAD_REQUEST;
        body.code = 'database_error';
        body.message = 'Invalid database operation';
      }
    } else if (exception instanceof Error) {
      if (isLikelyOversell(exception)) {
        body.statusCode = HttpStatus.CONFLICT;
        body.code = 'insufficient_stock';
        body.message = 'Requested quantity exceeds available stock';
      }
    }

    // Safe logging: never log request bodies, headers, or PII.
    if (body.statusCode >= 500) {
      this.log.error(
        `request=${requestId} ${request.method} ${request.url} -> ${body.statusCode} :: ${(exception as Error)?.message ?? 'unknown'}`,
      );
    }

    response.status(body.statusCode).json(body);
  }
}

function isLikelyOversell(e: Error): boolean {
  return /oversell|insufficient|stock/i.test(e.message);
}