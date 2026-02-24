import { FacilitiesService } from './facilities.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class FacilitiesController {
    private readonly facilitiesService;
    constructor(facilitiesService: FacilitiesService);
    getFacilityTree(req: any): Promise<({
        floors: ({
            rooms: ({
                _count: {
                    assets: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
    })[]>;
    createBuilding(req: any, createBuildingDto: CreateBuildingDto): Promise<{
        floors: ({
            rooms: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
    }>;
    findAllBuildings(req: any): Promise<({
        floors: ({
            rooms: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
    })[]>;
    findOneBuilding(req: any, id: string): Promise<{
        floors: ({
            rooms: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
    }>;
    updateBuilding(req: any, id: string, updateBuildingDto: UpdateBuildingDto): Promise<{
        floors: ({
            rooms: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
    }>;
    removeBuilding(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
    }>;
    createFloor(req: any, createFloorDto: CreateFloorDto): Promise<{
        building: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
        };
        rooms: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    findAllFloors(req: any, buildingId?: string): Promise<({
        building: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
        };
        rooms: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    })[]>;
    findOneFloor(req: any, id: string): Promise<{
        building: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
        };
        rooms: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    updateFloor(req: any, id: string, updateFloorDto: UpdateFloorDto): Promise<{
        building: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
        };
        rooms: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            floorId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    removeFloor(req: any, id: string): Promise<{
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buildingId: string;
    }>;
    createRoom(req: any, createRoomDto: CreateRoomDto): Promise<{
        floor: {
            building: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        floorId: string;
    }>;
    findAllRooms(req: any, floorId?: string): Promise<({
        floor: {
            building: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        floorId: string;
    })[]>;
    findOneRoom(req: any, id: string): Promise<{
        floor: {
            building: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        floorId: string;
    }>;
    updateRoom(req: any, id: string, updateRoomDto: UpdateRoomDto): Promise<{
        floor: {
            building: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        floorId: string;
    }>;
    removeRoom(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        floorId: string;
    }>;
}
