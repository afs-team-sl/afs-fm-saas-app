import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MaintenancePlansService } from './maintenance-plans.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('maintenance-plans')
@UseGuards(JwtAuthGuard)
export class MaintenancePlansController {
  constructor(private readonly maintenancePlansService: MaintenancePlansService) {}

  @Post()
  create(@Body() createMaintenancePlanDto: CreateMaintenancePlanDto, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.maintenancePlansService.create(createMaintenancePlanDto, tenantId);
  }

  @Get()
  findAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.maintenancePlansService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.maintenancePlansService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaintenancePlanDto: UpdateMaintenancePlanDto, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.maintenancePlansService.update(id, updateMaintenancePlanDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.maintenancePlansService.remove(id, tenantId);
  }

  /**
   * POST /maintenance-plans/:id/generate
   * Trigger manual work order generation for a specific plan
   */
  @Post(':id/generate')
  triggerGeneration(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.maintenancePlansService.triggerManualGeneration(id, tenantId);
  }
}
