import { Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { StorageModule } from '../shared/storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
