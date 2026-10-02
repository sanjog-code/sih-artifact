import { Module } from '@nestjs/common';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { MarketDataService, MockMarketDataProvider } from './market-data.service';

@Module({
  controllers: [PricingController],
  providers: [PricingService, MarketDataService, MockMarketDataProvider],
  exports: [PricingService, MarketDataService],
})
export class PricingModule {}