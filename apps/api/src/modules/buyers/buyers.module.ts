import { Module } from '@nestjs/common';
import { RfqController } from './rfq.controller';
import { RfqService } from './rfq.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [RfqController],
  providers: [RfqService],
  exports: [RfqService],
})
export class BuyersModule {}