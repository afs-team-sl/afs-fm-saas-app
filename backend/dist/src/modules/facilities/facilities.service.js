"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let FacilitiesService = class FacilitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBuilding(tenantId, createBuildingDto) {
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
    async findAllBuildings(tenantId) {
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
    async findOneBuilding(id, tenantId) {
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
            throw new common_1.NotFoundException(`Building with ID ${id} not found`);
        }
        if (building.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return building;
    }
    async updateBuilding(id, tenantId, updateBuildingDto) {
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
    async removeBuilding(id, tenantId) {
        await this.findOneBuilding(id, tenantId);
        return this.prisma.building.delete({
            where: { id },
        });
    }
    async createFloor(tenantId, createFloorDto) {
        const building = await this.prisma.building.findUnique({
            where: { id: createFloorDto.buildingId },
        });
        if (!building) {
            throw new common_1.NotFoundException(`Building with ID ${createFloorDto.buildingId} not found`);
        }
        if (building.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.floor.create({
            data: createFloorDto,
            include: {
                building: true,
                rooms: true,
            },
        });
    }
    async findAllFloors(tenantId, buildingId) {
        const where = {};
        if (buildingId) {
            const building = await this.prisma.building.findUnique({
                where: { id: buildingId },
            });
            if (!building || building.tenantId !== tenantId) {
                throw new common_1.ForbiddenException('Access denied');
            }
            where.buildingId = buildingId;
        }
        else {
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
    async findOneFloor(id, tenantId) {
        const floor = await this.prisma.floor.findUnique({
            where: { id },
            include: {
                building: true,
                rooms: true,
            },
        });
        if (!floor) {
            throw new common_1.NotFoundException(`Floor with ID ${id} not found`);
        }
        if (floor.building.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return floor;
    }
    async updateFloor(id, tenantId, updateFloorDto) {
        await this.findOneFloor(id, tenantId);
        if (updateFloorDto.buildingId) {
            const building = await this.prisma.building.findUnique({
                where: { id: updateFloorDto.buildingId },
            });
            if (!building || building.tenantId !== tenantId) {
                throw new common_1.ForbiddenException('Access denied');
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
    async removeFloor(id, tenantId) {
        await this.findOneFloor(id, tenantId);
        return this.prisma.floor.delete({
            where: { id },
        });
    }
    async createRoom(tenantId, createRoomDto) {
        const floor = await this.prisma.floor.findUnique({
            where: { id: createRoomDto.floorId },
            include: { building: true },
        });
        if (!floor) {
            throw new common_1.NotFoundException(`Floor with ID ${createRoomDto.floorId} not found`);
        }
        if (floor.building.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
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
    async findAllRooms(tenantId, floorId) {
        const where = {};
        if (floorId) {
            const floor = await this.prisma.floor.findUnique({
                where: { id: floorId },
                include: { building: true },
            });
            if (!floor || floor.building.tenantId !== tenantId) {
                throw new common_1.ForbiddenException('Access denied');
            }
            where.floorId = floorId;
        }
        else {
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
    async findOneRoom(id, tenantId) {
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
            throw new common_1.NotFoundException(`Room with ID ${id} not found`);
        }
        if (room.floor.building.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return room;
    }
    async updateRoom(id, tenantId, updateRoomDto) {
        await this.findOneRoom(id, tenantId);
        if (updateRoomDto.floorId) {
            const floor = await this.prisma.floor.findUnique({
                where: { id: updateRoomDto.floorId },
                include: { building: true },
            });
            if (!floor || floor.building.tenantId !== tenantId) {
                throw new common_1.ForbiddenException('Access denied');
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
    async removeRoom(id, tenantId) {
        await this.findOneRoom(id, tenantId);
        return this.prisma.room.delete({
            where: { id },
        });
    }
    async getFacilityTree(tenantId) {
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
};
exports.FacilitiesService = FacilitiesService;
exports.FacilitiesService = FacilitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FacilitiesService);
//# sourceMappingURL=facilities.service.js.map