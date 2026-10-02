/**
 * Integration-test environment defaults.
 * Real values come from the GitHub Actions postgres/redis services or docker-compose.
 */
process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? 'test-secret-at-least-32-characters-long!!!';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://farmlink:farmlink@localhost:5432/farmlink_test?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
process.env.STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? 'local';
process.env.STORAGE_LOCAL_ROOT = process.env.STORAGE_LOCAL_ROOT ?? '.data/test-uploads';
process.env.AUTH_OTP_PROVIDER = 'mock';
process.env.MOCK_OTP_CODE = '123456';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? 'http://localhost:3000';
process.env.WEBHOOK_SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET ?? 'test-webhook-signing-secret-32chars+';