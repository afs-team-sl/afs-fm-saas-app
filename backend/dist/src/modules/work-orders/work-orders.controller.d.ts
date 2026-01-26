import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddWorkOrderPartDto } from '../parts/dto/add-work-order-part.dto';
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    create(createWorkOrderDto: CreateWorkOrderDto, tenantId: string): Promise<{
        asset: {
            id: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            category: string;
            serialNo: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        completionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
        assignedToId: string | null;
    }>;
    findAll(tenantId: string, status?: string, priority?: string, req?: any): Promise<({
        asset: {
            id: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            category: string;
            serialNo: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        completionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
        assignedToId: string | null;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        asset: {
            id: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            category: string;
            serialNo: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        completionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
        assignedToId: string | null;
    }>;
    update(id: string, tenantId: string, updateWorkOrderDto: UpdateWorkOrderDto): Promise<{
        asset: {
            id: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            category: string;
            serialNo: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                name: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        completionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
        assignedToId: string | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    addPart(id: string, tenantId: string, addPartDto: AddWorkOrderPartDto): Promise<{
        part: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            partNumber: string;
            stockLevel: number;
            minStock: number;
            unitPrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        quantity: number;
        workOrderId: string;
        partId: string;
    }>;
    getWorkOrderParts(id: string, tenantId: string): Promise<({
        part: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            name: string;
            partNumber: string;
            stockLevel: number;
            minStock: number;
            unitPrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        quantity: number;
        workOrderId: string;
        partId: string;
    })[]>;
    removePart(id: string, partId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
