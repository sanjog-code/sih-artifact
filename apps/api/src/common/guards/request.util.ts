import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export function getRequest<T extends Request = Request>(context: ExecutionContext): T {
  return context.switchToHttp().getRequest<T>();
}

export function getResponse(context: ExecutionContext): Response {
  return context.switchToHttp().getResponse<Response>();
}

export function clientIp(request: Request): string {
  const fwd = request.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0]!.trim();
  return request.ip ?? '0.0.0.0';
}