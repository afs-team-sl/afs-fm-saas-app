import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Prisma } from '@prisma/client';
import { SubscriptionService } from '../shared/subscription/subscription.service';
import { StorageService } from '../shared/storage/storage.service';
export declare class AssetsService {
    private prisma;
    private subscriptionService;
    private storageService;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService, storageService: StorageService);
    create(data: CreateAssetDto & {
        tenantId: string;
    }): Promise<{
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    }>;
    findAll(tenantId: string): Promise<({
        room: ({
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
        }) | null;
    } & {
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    })[]>;
    findByStatus(tenantId: string, status: string): Promise<{
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    }[]>;
    findByCategory(tenantId: string, category: string): Promise<{
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    }[]>;
    findByRoom(tenantId: string, roomId: string): Promise<({
        room: ({
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
        }) | null;
    } & {
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    })[]>;
    findByLocation(tenantId: string, location: string): Promise<({
        room: ({
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
        }) | null;
    } & {
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    })[]>;
    getUniqueLocations(tenantId: string): Promise<(string | null)[]>;
    findOne(id: string, tenantId: string): Promise<{
        latestReadings: string | number | true | Prisma.JsonObject | Prisma.JsonArray | null;
        room: ({
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
        }) | null;
        workOrders: ({
            assignedTo: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            title: string;
            description: string | null;
            priority: import(".prisma/client").$Enums.WorkOrderPriority;
            assetId: string;
            assignedToId: string | null;
            completionNote: string | null;
            startedAt: Date | null;
            dueDate: Date | null;
            laborHours: number | null;
            checklistData: Prisma.JsonValue | null;
            legacyId: string | null;
        })[];
        documents: {
            id: string;
            name: string;
            createdAt: Date;
            assetId: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    }>;
    update(id: string, tenantId: string, dto: UpdateAssetDto): Promise<{
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    }>;
    remove(id: string, tenantId: string, userEmail?: string): Promise<{
        id: string;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        site: string | null;
        location: string | null;
        customId: string | null;
        assetNumber: string | null;
        manufacturer: string | null;
        modelNumber: string | null;
        installYear: number | null;
        filterSize: string | null;
        beltSize: string | null;
        notes: string | null;
        department: string | null;
        image: string | null;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        roomId: string | null;
    }>;
    createBulk(tenantId: string, assets: CreateAssetDto[]): Promise<{
        count: number;
        message: string;
    }>;
    removeAll(tenantId: string): Promise<{
        count: number;
        message: string;
    }>;
    uploadImage(assetId: string, tenantId: string, file: Express.Multer.File): Promise<string>;
    uploadDocument(assetId: string, tenantId: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        assetId: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    getDocuments(assetId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        assetId: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }[]>;
    deleteDocument(assetId: string, documentId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
