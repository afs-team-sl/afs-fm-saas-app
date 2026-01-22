import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';

@Module({
  imports: [PrismaModule, UsersModule, AssetsModule, WorkOrdersModule, AuthModule, TenancyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
