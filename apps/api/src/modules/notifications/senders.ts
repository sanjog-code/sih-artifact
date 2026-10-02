export interface NotificationSender {
  readonly name: string;
  send(input: { to: string; templateKey: string; body: string }): Promise<void>;
}

/** Local mock senders: log-only, never touch external gateways. */
export class MockSmsSender implements NotificationSender {
  readonly name = 'mock-sms';
  async send(): Promise<void> {}
}

export class MockEmailSender implements NotificationSender {
  readonly name = 'mock-email';
  async send(): Promise<void> {}
}

export class MockPushSender implements NotificationSender {
  readonly name = 'mock-push';
  async send(): Promise<void> {}
}