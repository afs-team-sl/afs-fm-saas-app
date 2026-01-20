import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
export declare class WorkOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly includeRelations;
    create(tenantId: string, dto: CreateWorkOrderDto): Promise<{
        asset: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            serialNo: string | null;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
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
    }>;
    findAll(tenantId: string): Promise<({
        asset: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            serialNo: string | null;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
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
    })[]>;
    findByStatus(tenantId: string, status: string): Promise<({
        asset: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            serialNo: string | null;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
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
    })[]>;
    findByPriority(tenantId: string, priority: string): Promise<({
        asset: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            serialNo: string | null;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
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
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        asset: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            serialNo: string | null;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
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
    }>;
    update(id: string, tenantId: string, dto: UpdateWorkOrderDto): Promise<{
        asset: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            serialNo: string | null;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
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
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
}
