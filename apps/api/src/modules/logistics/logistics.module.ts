import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [WarehouseModule],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}