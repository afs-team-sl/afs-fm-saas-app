import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    create(createWorkOrderDto: CreateWorkOrderDto, tenantId: string): Promise<{
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
    findAll(tenantId: string, status?: string, priority?: string): Promise<({
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
    update(id: string, tenantId: string, updateWorkOrderDto: UpdateWorkOrderDto): Promise<{
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
