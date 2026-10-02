export interface CartClearResult {
  cleared: number;
}

export interface OfflineSyncAccepted {
  accepted: boolean;
  idempotencyKey: string;
}