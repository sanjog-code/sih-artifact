import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { AuthGuard } from './common/guards/auth.guard';
import { RbacGuard } from './common/guards/rbac.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Feature modules
import { GradingModule } from './modules/grading/grading.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MarketModule } from './modules/market/market.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { OndcModule } from './modules/ondc/ondc.module';
import { AdminModule } from './modules/admin/admin.module';
import { FarmersModule } from './modules/farmers/farmers.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { IvrModule } from './modules/ivr/ivr.module';

@Module({
  imports: [
    // ---- Globals (auth, inventory, storage)
    AuthModule,
    InventoryModule,
    // ---- Feature modules
    GradingModule,
    WarehouseModule,
    LogisticsModule,
    CatalogueModule,
    FarmersModule,
    PricingModule,
    MarketModule,
    FinanceModule,
    NotificationsModule,
    OrdersModule,
    BuyersModule,
    UploadsModule,
    WebhooksModule,
    OndcModule,
    AdminModule,
    UsersModule,
    IvrModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}