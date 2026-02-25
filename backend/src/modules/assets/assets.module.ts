import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { SubscriptionModule } from '../shared/subscription/subscription.module';
import { StorageModule } from '../shared/storage/storage.module';

@Module({
  imports: [SubscriptionModule, StorageModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}