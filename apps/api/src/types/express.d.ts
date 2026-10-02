import type { SessionUser } from '@farmlink/shared';
import type { JwtSession } from '../common/guards/auth.guard';

declare global {
  namespace Express {
    interface Request {
      /** populated by RequestIdInterceptor */
      id?: string;
      /** populated by AuthGuard */
      user?: SessionUser;
      /** populated by AuthGuard */
      jwtSession?: JwtSession;
      /** populated by cookie-parser */
      cookies?: Record<string, string | undefined>;
    }
  }
}

export {};