import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { demoLoginSchema, otpRequestSchema, otpVerifySchema } from '@farmlink/shared';
import { AuthService } from './auth.service';
import { Public, CurrentUser, RateLimit, SkipCsrf } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { AuthRateLimit, OtpRateLimit } from '../../common/guards/rate-limit.guard';
import type { SessionUser } from '@farmlink/shared';
import { ENV } from '../../config/app.config';
import { generateCsrfToken } from '../../common/utils/crypto.util';
import { clientIp } from '../../common/guards/request.util';

const SESSION_COOKIE = '__fl_session';
const CSRF_COOKIE = ENV.csrfCookieName;

@ApiTags('auth')
@Controller('auth')
@UseGuards(AuthGuard, RbacGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setAuthCookies(res: Response, sessionToken: string): void {
    const opts = {
      httpOnly: true,
      secure: ENV.cookieSecure,
      sameSite: 'lax' as const,
      domain: ENV.cookieDomain,
      path: '/',
      maxAge: ENV.sessionTtlSeconds * 1000,
    };
    res.cookie(SESSION_COOKIE, sessionToken, opts);
    // CSRF cookie is readable by JS (double-submit). Not HttpOnly.
    res.cookie(CSRF_COOKIE, generateCsrfToken(), { ...opts, httpOnly: false });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(SESSION_COOKIE, { domain: ENV.cookieDomain, path: '/' });
    res.clearCookie(CSRF_COOKIE, { domain: ENV.cookieDomain, path: '/' });
  }

  @Public()
  @SkipCsrf()
  @RateLimit(OtpRateLimit)
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() body: unknown) {
    const parsed = otpRequestSchema.safeParse(body);
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.auth.requestOtp(parsed.data);
  }

  @Public()
  @SkipCsrf()
  @RateLimit(AuthRateLimit)
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const parsed = otpVerifySchema.safeParse(body);
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const result = await this.auth.verifyOtp(parsed.data, {
      ip: clientIp(req),
      ua: req.headers['user-agent'] ?? undefined,
      requestId: req.id,
    });
    if (parsed.data.purpose === 'LOGIN' && result.user) {
      this.setAuthCookies(res, result.sessionToken);
      return { ok: true, user: result.user };
    }
    // Secure-action confirmation
    return { ok: true, secureToken: result.sessionToken, expiresIn: 600 };
  }

  @Public()
  @SkipCsrf()
  @RateLimit(AuthRateLimit)
  @Post('demo/login')
  @HttpCode(HttpStatus.OK)
  async demoLogin(@Body() body: unknown) {
    const parsed = demoLoginSchema.safeParse(body);
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.auth.loginDemo(parsed.data);
  }

  @Public()
  @RateLimit({ limit: 30, windowSeconds: 60, keyPrefix: 'rl:session' })
  @Get('session')
  @HttpCode(HttpStatus.OK)
  async session(@Req() req: Request) {
    // AuthGuard rejects unauthenticated calls; reaching here means valid session.
    const user = req.user as SessionUser;
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: SessionUser, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(user.id, { ip: clientIp(req), requestId: req.id });
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Post('secure-action/request')
  @HttpCode(HttpStatus.OK)
  @RateLimit(OtpRateLimit)
  async requestSecureAction(@CurrentUser() user: SessionUser, @Body() _body: { action: string; resourceId: string }) {
    return this.auth.requestOtp({
      identifier: user.phone ?? user.email ?? '',
      channel: 'phone',
      purpose: 'SECURE_ACTION',
      lang: user.lang,
    });
  }

  @Post('secure-action/confirm')
  @HttpCode(HttpStatus.OK)
  @RateLimit(AuthRateLimit)
  async confirmSecureAction(
    @CurrentUser() user: SessionUser,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsed = otpVerifySchema.safeParse({ ...(body as object), identifier: user.phone, channel: 'phone', purpose: 'SECURE_ACTION' });
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    const result = await this.auth.verifyOtp(parsed.data, {
      ip: clientIp(req),
      ua: req.headers['user-agent'] ?? undefined,
      requestId: req.id,
    });
    return { ok: true, secureToken: result.sessionToken, expiresIn: 600 };
  }
}