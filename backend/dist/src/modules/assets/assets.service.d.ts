import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
    }[]>;
    findByStatus(tenantId: string, status: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        serialNo: string | null;
        status: import(".prisma/client").$Enums.AssetStatus;
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
    update(id: string, tenantId: string, dto: UpdateAssetDto): Promise<{
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
