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
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        workOrders: {
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
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
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
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
    }>;
}
