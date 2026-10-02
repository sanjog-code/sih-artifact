import { Global, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { QueueService } from '../../common/queue/queue.service';

@Injectable()
class ReservationSweeper implements OnModuleInit {
  private timer?: NodeJS.Timeout;
  constructor(private readonly inventory: InventoryService) {}
  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.inventory.expireStaleReservations().catch(() => undefined);
    }, 60_000);
    this.timer.unref?.();
  }
}

@Global()
@Module({
  controllers: [InventoryController],
  providers: [InventoryService, ReservationSweeper],
  exports: [InventoryService],
})
export class InventoryModule {}

export { QueueService };