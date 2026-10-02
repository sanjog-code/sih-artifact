import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}