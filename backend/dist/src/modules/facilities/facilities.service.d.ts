import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class FacilitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    createBuilding(tenantId: string, createBuildingDto: CreateBuildingDto): Promise<{
        floors: ({
            rooms: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                floorId: string;
            }[];
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string | null;
    }>;
    findAllBuildings(tenantId: string): Promise<({
        floors: ({
            rooms: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                floorId: string;
            }[];
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string | null;
    })[]>;
    findOneBuilding(id: string, tenantId: string): Promise<{
        floors: ({
            rooms: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                floorId: string;
            }[];
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string | null;
    }>;
    updateBuilding(id: string, tenantId: string, updateBuildingDto: UpdateBuildingDto): Promise<{
        floors: ({
            rooms: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                floorId: string;
            }[];
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string | null;
    }>;
    removeBuilding(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string | null;
    }>;
    createFloor(tenantId: string, createFloorDto: CreateFloorDto): Promise<{
        building: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
        };
        rooms: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    findAllFloors(tenantId: string, buildingId?: string): Promise<({
        building: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
        };
        rooms: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    })[]>;
    findOneFloor(id: string, tenantId: string): Promise<{
        building: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
        };
        rooms: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    updateFloor(id: string, tenantId: string, updateFloorDto: UpdateFloorDto): Promise<{
        building: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
        };
        rooms: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    removeFloor(id: string, tenantId: string): Promise<{
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    createRoom(tenantId: string, createRoomDto: CreateRoomDto): Promise<{
        floor: {
            building: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                address: string | null;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        floorId: string;
    }>;
    findAllRooms(tenantId: string, floorId?: string): Promise<({
        floor: {
            building: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                address: string | null;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        floorId: string;
    })[]>;
    findOneRoom(id: string, tenantId: string): Promise<{
        floor: {
            building: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                address: string | null;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        floorId: string;
    }>;
    updateRoom(id: string, tenantId: string, updateRoomDto: UpdateRoomDto): Promise<{
        floor: {
            building: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                address: string | null;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        floorId: string;
    }>;
    removeRoom(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        floorId: string;
    }>;
    getFacilityTree(tenantId: string): Promise<({
        floors: ({
            rooms: ({
                _count: {
                    assets: number;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                floorId: string;
            })[];
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buildingId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string | null;
    })[]>;
}
