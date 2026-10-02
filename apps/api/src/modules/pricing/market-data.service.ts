import { Injectable } from '@nestjs/common';
import type { MarketSnapshot } from '@farmlink/shared';
import { mockMarketSnapshot } from '@farmlink/shared';

export interface MarketDataProvider {
  readonly provider: string;
  getSnapshot(opts: { cropCode: string; season: string; state: string; district?: string }): Promise<MarketSnapshot>;
}

/** Deterministic local mock market-data feed. Swap for API-Watch / mandi APIs later. */
@Injectable()
export class MockMarketDataProvider implements MarketDataProvider {
  readonly provider = 'mock';
  async getSnapshot(opts: { cropCode: string; season: string; state: string; district?: string }): Promise<MarketSnapshot> {
    return mockMarketSnapshot(opts);
  }
}

@Injectable()
export class MarketDataService {
  constructor(private readonly provider: MockMarketDataProvider) {}
  async snapshot(opts: { cropCode: string; season: string; state: string; district?: string }): Promise<MarketSnapshot> {
    return this.provider.getSnapshot(opts);
  }
}