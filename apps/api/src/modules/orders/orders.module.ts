import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
class OrderSweeper implements OnModuleInit {
  constructor(private readonly orders: OrdersService, private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    // Demo-only: expire abandoned PENDING_PAYMENT demo orders every 5 min.
    const timer = setInterval(() => void this.orders.expireAbandonedOrders(), 5 * 60 * 1000);
    timer.unref?.();
  }
}

@Module({
  imports: [InventoryModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderSweeper],
  exports: [OrdersService],
})
export class OrdersModule {}