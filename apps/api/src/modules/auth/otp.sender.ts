import { Injectable } from '@nestjs/common';
import { ENV } from '../../config/app.config';
import { FarmLinkLogger } from '../../common/logger/farmlink-logger';

export interface OtpSendParams {
  identifier: string;
  channel: 'phone' | 'email';
  purpose: 'LOGIN' | 'SECURE_ACTION';
  code: string;
  lang?: 'en' | 'hi';
}

export interface OtpSender {
  readonly provider: string;
  send(p: OtpSendParams): Promise<void>;
  readonly mockCode?: string;
}

/** Demo provider: deterministic OTP, logs it as a console hint, never transmits. */
@Injectable()
export class MockOtpSender implements OtpSender {
  readonly provider = 'mock';
  readonly mockCode: string;
  private readonly log = new FarmLinkLogger('otp');
  constructor(code: string = ENV.mockOtpCode) {
    this.mockCode = code;
  }

  async send(p: OtpSendParams): Promise<void> {
    this.log.warn(`[DEMO OTP] channel=${p.channel} purpose=${p.purpose} code=${this.mockCode}`);
  }
}

/** Real SMS provider skeleton — wired from env, disabled by default. */
@Injectable()
export class TwilioOtpSender implements OtpSender {
  readonly provider = 'twilio';
  async send(_p: OtpSendParams): Promise<void> {
    throw new Error('TwilioOtpSender requires real credentials; not configured in the demo');
  }
}

export function buildOtpSender(): OtpSender {
  if (ENV.otpProvider === 'mock') return new MockOtpSender();
  if (ENV.otpProvider === 'twilio') return new TwilioOtpSender();
  return new MockOtpSender();
}