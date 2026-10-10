import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ENV } from './config/app.config';
import { FarmLinkLogger } from './common/logger/farmlink-logger';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  // ------------------------------------------------------------------ plumbing
  app.setGlobalPrefix(ENV.apiPrefix);
  app.useLogger(new FarmLinkLogger('bootstrap'));
  app.enableShutdownHooks();

  // Trust proxy for clientIp() and secure cookies behind reverse proxies.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'img-src': ["'self'", 'data:'],
          'style-src': ["'self'", "'unsafe-inline'"],
          'script-src': ["'self'"],
          'connect-src': ["'self'", ENV.apiPublicUrl.replace(/\/$/, '')],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  app.enableCors({
    origin: ENV.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-request-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalInterceptors(new RequestIdInterceptor());

  // -------------------------------------------------------------------- swagger
  const config = new DocumentBuilder()
    .setTitle('FarmLink API')
    .setDescription('FarmLink — Direct produce marketplace connecting farmers, warehouses, and buyers with explainable price intelligence.')
    .setVersion('0.1.0')
    .addCookieAuth('__fl_session')
    .addTag('auth', 'OTP, demo login, session, secure actions')
    .addTag('farmers', 'produce declaration, pickup requests, lots, decisions, dashboard')
    .addTag('warehouse', 'intake, offline sync, lots, storage')
    .addTag('grading', 'optical grade candidates and confirmation with audit trail')
    .addTag('inventory', 'balances, reservations, corrections, events')
    .addTag('pricing', 'explainable price insights, market status, policy')
    .addTag('finance', 'consent, e-NWR enquiry, partner case workflow')
    .addTag('market', 'catalogue, search, prices, traceability')
    .addTag('orders', 'cart, checkout, mock payment, dispatch, POD, disputes, reviews')
    .addTag('rfq', 'bulk buyer RFQs and negotiation')
    .addTag('logistics', 'cluster routes, pickups, POD')
    .addTag('notifications', 'notification inbox')
    .addTag('uploads', 'magic-byte validated image/document uploads, signed reads')
    .addTag('webhooks', 'signed inbound events, outbound deliveries')
    .addTag('ondc', 'protocol-lite ONDC adapter (demo, not certified)')
    .addTag('admin', 'users, verification, audits, reports')
    .addTag('users', 'me, privacy export/delete')
    .addTag('ivr', 'IVR flows')
    .addTag('health', 'liveness/readiness')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Global prefix auto-applies to the Swagger UI route in Nest >= 8.
  SwaggerModule.setup('docs', app, document);

  await app.listen(ENV.apiPort, '0.0.0.0');
}

void bootstrap();