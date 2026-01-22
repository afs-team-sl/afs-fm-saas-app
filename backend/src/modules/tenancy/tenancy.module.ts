import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  controllers: [TenantsController], // <--- මේක මෙතන තියෙන්නම ඕනේ!
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenancyModule {}