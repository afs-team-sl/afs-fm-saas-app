import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('facilities')
@UseGuards(JwtAuthGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // ========== FACILITY TREE ==========

  @Get('tree')
  async getFacilityTree(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.getFacilityTree(tenantId);
  }

  // ========== BUILDING ENDPOINTS ==========

  @Post('buildings')
  async createBuilding(@Request() req, @Body() createBuildingDto: CreateBuildingDto) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.createBuilding(tenantId, createBuildingDto);
  }

  @Get('buildings')
  async findAllBuildings(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.findAllBuildings(tenantId);
  }

  @Get('buildings/:id')
  async findOneBuilding(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.findOneBuilding(id, tenantId);
  }

  @Patch('buildings/:id')
  async updateBuilding(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.updateBuilding(id, tenantId, updateBuildingDto);
  }

  @Delete('buildings/:id')
  async removeBuilding(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.removeBuilding(id, tenantId);
  }

  // ========== FLOOR ENDPOINTS ==========

  @Post('floors')
  async createFloor(@Request() req, @Body() createFloorDto: CreateFloorDto) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.createFloor(tenantId, createFloorDto);
  }

  @Get('floors')
  async findAllFloors(@Request() req, @Query('buildingId') buildingId?: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.findAllFloors(tenantId, buildingId);
  }

  @Get('floors/:id')
  async findOneFloor(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.findOneFloor(id, tenantId);
  }

  @Patch('floors/:id')
  async updateFloor(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.updateFloor(id, tenantId, updateFloorDto);
  }

  @Delete('floors/:id')
  async removeFloor(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.removeFloor(id, tenantId);
  }

  // ========== ROOM ENDPOINTS ==========

  @Post('rooms')
  async createRoom(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.createRoom(tenantId, createRoomDto);
  }

  @Get('rooms')
  async findAllRooms(@Request() req, @Query('floorId') floorId?: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.findAllRooms(tenantId, floorId);
  }

  @Get('rooms/:id')
  async findOneRoom(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.findOneRoom(id, tenantId);
  }

  @Patch('rooms/:id')
  async updateRoom(
    @Request() req,
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.updateRoom(id, tenantId, updateRoomDto);
  }

  @Delete('rooms/:id')
  async removeRoom(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.facilitiesService.removeRoom(id, tenantId);
  }
}
