import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(createAssetDto: CreateAssetDto, tenantId: string): Promise<{
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
    findAll(tenantId: string, status?: string, category?: string): Promise<{
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
    update(id: string, tenantId: string, updateAssetDto: UpdateAssetDto): Promise<{
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
    remove(id: string, tenantId: string, req: any): Promise<{
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
    bulkCreate(assets: CreateAssetDto[], tenantId: string): Promise<{
        count: number;
        message: string;
    }>;
    removeAll(tenantId: string): Promise<{
        count: number;
        message: string;
    }>;
}
