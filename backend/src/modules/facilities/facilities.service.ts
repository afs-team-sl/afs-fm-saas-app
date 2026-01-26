import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  // ========== BUILDING CRUD ==========

  async createBuilding(tenantId: string, createBuildingDto: CreateBuildingDto) {
    return this.prisma.building.create({
      data: {
        ...createBuildingDto,
        tenantId,
      },
      include: {
        floors: {
          include: {
            rooms: true,
          },
        },
      },
    });
  }

  async findAllBuildings(tenantId: string) {
    return this.prisma.building.findMany({
      where: { tenantId },
      include: {
        floors: {
          include: {
            rooms: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBuilding(id: string, tenantId: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        floors: {
          include: {
            rooms: true,
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }

    // Tenant isolation check
    if (building.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return building;
  }

  async updateBuilding(id: string, tenantId: string, updateBuildingDto: UpdateBuildingDto) {
    // Check access
    await this.findOneBuilding(id, tenantId);

    return this.prisma.building.update({
      where: { id },
      data: updateBuildingDto,
      include: {
        floors: {
          include: {
            rooms: true,
          },
        },
      },
    });
  }

  async removeBuilding(id: string, tenantId: string) {
    // Check access
    await this.findOneBuilding(id, tenantId);

    return this.prisma.building.delete({
      where: { id },
    });
  }

  // ========== FLOOR CRUD ==========

  async createFloor(tenantId: string, createFloorDto: CreateFloorDto) {
    // Verify building belongs to tenant
    const building = await this.prisma.building.findUnique({
      where: { id: createFloorDto.buildingId },
    });

    if (!building) {
      throw new NotFoundException(`Building with ID ${createFloorDto.buildingId} not found`);
    }

    if (building.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.floor.create({
      data: createFloorDto,
      include: {
        building: true,
        rooms: true,
      },
    });
  }

  async findAllFloors(tenantId: string, buildingId?: string) {
    const where: any = {};

    if (buildingId) {
      // Verify building belongs to tenant
      const building = await this.prisma.building.findUnique({
        where: { id: buildingId },
      });

      if (!building || building.tenantId !== tenantId) {
        throw new ForbiddenException('Access denied');
      }

      where.buildingId = buildingId;
    } else {
      // Get all floors for tenant's buildings
      where.building = { tenantId };
    }

    return this.prisma.floor.findMany({
      where,
      include: {
        building: true,
        rooms: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneFloor(id: string, tenantId: string) {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: {
        building: true,
        rooms: true,
      },
    });

    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }

    // Tenant isolation check
    if (floor.building.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return floor;
  }

  async updateFloor(id: string, tenantId: string, updateFloorDto: UpdateFloorDto) {
    // Check access
    await this.findOneFloor(id, tenantId);

    // If buildingId is being updated, verify new building belongs to tenant
    if (updateFloorDto.buildingId) {
      const building = await this.prisma.building.findUnique({
        where: { id: updateFloorDto.buildingId },
      });

      if (!building || building.tenantId !== tenantId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return this.prisma.floor.update({
      where: { id },
      data: updateFloorDto,
      include: {
        building: true,
        rooms: true,
      },
    });
  }

  async removeFloor(id: string, tenantId: string) {
    // Check access
    await this.findOneFloor(id, tenantId);

    return this.prisma.floor.delete({
      where: { id },
    });
  }

  // ========== ROOM CRUD ==========

  async createRoom(tenantId: string, createRoomDto: CreateRoomDto) {
    // Verify floor belongs to tenant
    const floor = await this.prisma.floor.findUnique({
      where: { id: createRoomDto.floorId },
      include: { building: true },
    });

    if (!floor) {
      throw new NotFoundException(`Floor with ID ${createRoomDto.floorId} not found`);
    }

    if (floor.building.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.room.create({
      data: createRoomDto,
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async findAllRooms(tenantId: string, floorId?: string) {
    const where: any = {};

    if (floorId) {
      // Verify floor belongs to tenant
      const floor = await this.prisma.floor.findUnique({
        where: { id: floorId },
        include: { building: true },
      });

      if (!floor || floor.building.tenantId !== tenantId) {
        throw new ForbiddenException('Access denied');
      }

      where.floorId = floorId;
    } else {
      // Get all rooms for tenant's floors
      where.floor = {
        building: { tenantId },
      };
    }

    return this.prisma.room.findMany({
      where,
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneRoom(id: string, tenantId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    // Tenant isolation check
    if (room.floor.building.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return room;
  }

  async updateRoom(id: string, tenantId: string, updateRoomDto: UpdateRoomDto) {
    // Check access
    await this.findOneRoom(id, tenantId);

    // If floorId is being updated, verify new floor belongs to tenant
    if (updateRoomDto.floorId) {
      const floor = await this.prisma.floor.findUnique({
        where: { id: updateRoomDto.floorId },
        include: { building: true },
      });

      if (!floor || floor.building.tenantId !== tenantId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async removeRoom(id: string, tenantId: string) {
    // Check access
    await this.findOneRoom(id, tenantId);

    return this.prisma.room.delete({
      where: { id },
    });
  }

  // ========== FACILITY TREE ==========

  /**
   * Returns a nested JSON structure:
   * Buildings -> Floors -> Rooms
   * for the current tenant
   */
  async getFacilityTree(tenantId: string) {
    const buildings = await this.prisma.building.findMany({
      where: { tenantId },
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                _count: {
                  select: { assets: true },
                },
              },
            },
          },
          orderBy: { number: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return buildings;
  }
}
