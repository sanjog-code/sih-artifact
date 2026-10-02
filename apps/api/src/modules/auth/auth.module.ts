import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { ENV } from '../../config/app.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { buildOtpSender } from './otp.sender';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: ENV.sessionSecret,
      signOptions: { expiresIn: ENV.sessionTtlSeconds, algorithm: 'HS256' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    CacheService,
    AuditService,
    { provide: 'OTP_SENDER', useFactory: () => buildOtpSender() },
  ],
  exports: [AuthService, JwtModule, PrismaService, CacheService, AuditService],
})
export class AuthModule {
  constructor() {
    if (ENV.sessionSecret.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters in non-local environments');
    }
  }
}