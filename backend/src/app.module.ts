import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { PartsModule } from './modules/parts/parts.module';
import { MaintenancePlansModule } from './modules/maintenance-plans/maintenance-plans.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SystemModule } from './modules/system/system.module';
import { SubscriptionModule } from './modules/shared/subscription/subscription.module';
import { MaintenanceModeGuard } from './common/guards/maintenance-mode.guard';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    AssetsModule,
    WorkOrdersModule,
    AuthModule,
    TenancyModule,
    PartsModule,
    MaintenancePlansModule,
    FacilitiesModule,
    NotificationsModule,
    SystemModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceModeGuard,
    },
  ],
})
export class AppModule {}
