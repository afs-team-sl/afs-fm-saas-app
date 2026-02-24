import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SubscriptionService } from '../shared/subscription/subscription.service';
export declare class AssetsService {
    private prisma;
    private subscriptionService;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService);
    create(data: CreateAssetDto & {
        tenantId: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    findAll(tenantId: string): Promise<({
        room: ({
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
        }) | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    })[]>;
    findByStatus(tenantId: string, status: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }[]>;
    findByCategory(tenantId: string, category: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        workOrders: ({
            assignedTo: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            priority: import(".prisma/client").$Enums.WorkOrderPriority;
            assetId: string;
            assignedToId: string | null;
            completionNote: string | null;
            dueDate: Date | null;
            startedAt: Date | null;
            laborHours: number | null;
        })[];
        room: ({
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
        }) | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    update(id: string, tenantId: string, dto: UpdateAssetDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    remove(id: string, tenantId: string, userEmail?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
        roomId: string | null;
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
    }>;
    createBulk(tenantId: string, assets: CreateAssetDto[]): Promise<{
        count: number;
        message: string;
    }>;
    removeAll(tenantId: string): Promise<{
        count: number;
        message: string;
    }>;
}
