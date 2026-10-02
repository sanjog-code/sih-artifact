import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getRequest } from '../guards/request.util';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = getRequest(context);
    const id = request.headers['x-request-id'] as string | undefined;
    request.id = (id ?? randomUUID()).slice(0, 64);
    request.res?.setHeader('x-request-id', request.id);
    return next.handle().pipe(tap());
  }
}