/**
 * Typed environment configuration. External credentials are optional and
 * disabled by default (mock providers are used unless overridden).
 */
export interface AppEnv {
  nodeEnv: string;
  appEnv: string;
  logLevel: string;
  logPretty: boolean;
  apiPort: number;
  apiPrefix: string;
  apiPublicUrl: string;
  webPublicUrl: string;
  corsOrigins: string[];

  databaseUrl: string;
  redisUrl: string | undefined;
  redisPrefix: string;

  sessionSecret: string;
  sessionTtlSeconds: number;
  otpProvider: 'mock' | string;
  mockOtpCode: string;
  cookieSecure: boolean;
  cookieDomain: string | undefined;
  csrfCookieName: string;

  storageDriver: 'local' | 's3';
  storageLocalRoot: string;
  s3: {
    endpoint?: string;
    region: string;
    bucket?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    forcePathStyle: boolean;
    kmsKeyId?: string;
    uploadExpiresSeconds: number;
    downloadExpiresSeconds: number;
  };

  mapsProvider: string;
  marketDataProvider: string;
  paymentsProvider: string;
  telephonyProvider: string;
  ondcProvider: string;
  financeProvider: string;

  webhookSigningSecret: string;
  webhookToleranceMs: number;

  uploadMaxBytes: number;
}

const num = (v: string | undefined, d: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const list = (v: string | undefined): string[] =>
  v
    ? v
        .split(',')
        .map((s) => s.trim().replace(/\/$/, ''))
        .filter(Boolean)
    : [];

export function loadEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  const appEnv = env.APP_ENV ?? 'local';
  return {
    nodeEnv: env.NODE_ENV ?? 'development',
    appEnv,
    logLevel: env.LOG_LEVEL ?? (appEnv === 'test' ? 'silent' : 'info'),
    logPretty: env.LOG_PRETTY !== 'false',
    apiPort: num(env.API_PORT, 4000),
    apiPrefix: env.API_PREFIX ?? '/api/v1',
    apiPublicUrl: env.API_PUBLIC_URL ?? 'http://localhost:4000/api/v1',
    webPublicUrl: env.WEB_PUBLIC_URL ?? 'http://localhost:3000',
    corsOrigins: list(env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000'),
    databaseUrl: env.DATABASE_URL ?? 'postgresql://farmlink:farmlink@localhost:5432/farmlink?schema=public',
    redisUrl: env.REDIS_URL || undefined,
    redisPrefix: env.REDIS_PREFIX ?? 'farmlink:',
    sessionSecret: env.SESSION_SECRET ?? 'dev-only-change-me-session-secret',
    sessionTtlSeconds: num(env.SESSION_TTL_SECONDS, 7 * 24 * 3600),
    otpProvider: env.AUTH_OTP_PROVIDER ?? 'mock',
    mockOtpCode: env.MOCK_OTP_CODE ?? '123456',
    cookieSecure: env.COOKIE_SECURE === 'true' || appEnv !== 'local',
    cookieDomain: env.COOKIE_DOMAIN || undefined,
    csrfCookieName: env.CSRF_COOKIE_NAME ?? '_farmlink_csrf',
    storageDriver: env.STORAGE_DRIVER === 's3' ? 's3' : 'local',
    storageLocalRoot: env.STORAGE_LOCAL_ROOT ?? './storage-local',
    s3: {
      endpoint: env.S3_ENDPOINT || undefined,
      region: env.S3_REGION ?? 'ap-south-1',
      bucket: env.S3_BUCKET || undefined,
      accessKeyId: env.S3_ACCESS_KEY_ID || undefined,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY || undefined,
      forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
      kmsKeyId: env.S3_KMS_KEY_ID || undefined,
      uploadExpiresSeconds: num(env.S3_UPLOAD_EXPIRES_SECONDS, 900),
      downloadExpiresSeconds: num(env.S3_DOWNLOAD_EXPIRES_SECONDS, 3600),
    },
    mapsProvider: env.MAPS_PROVIDER ?? 'mock',
    marketDataProvider: env.MARKET_DATA_PROVIDER ?? 'mock',
    paymentsProvider: env.PAYMENTS_PROVIDER ?? 'mock',
    telephonyProvider: env.TELEPHONY_PROVIDER ?? 'mock',
    ondcProvider: env.ONDC_PROVIDER ?? 'mock',
    financeProvider: env.FINANCE_PROVIDER ?? 'mock',
    webhookSigningSecret: env.WEBHOOK_SIGNING_SECRET ?? 'dev-webhook-secret-change-me',
    webhookToleranceMs: num(env.WEBHOOK_TOLERANCE_MS, 5 * 60 * 1000),
    uploadMaxBytes: num(env.UPLOAD_MAX_BYTES, 10 * 1024 * 1024),
  };
}

export const ENV = loadEnv();
export const isProd = () => ENV.appEnv === 'prod' || ENV.appEnv === 'staging';