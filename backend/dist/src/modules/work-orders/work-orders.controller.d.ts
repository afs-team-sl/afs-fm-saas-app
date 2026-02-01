import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddWorkOrderPartDto } from '../parts/dto/add-work-order-part.dto';
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    create(createWorkOrderDto: CreateWorkOrderDto, tenantId: string): Promise<{
        parts: ({
            part: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
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
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
    }>;
    findAll(tenantId: string, status?: string, priority?: string, req?: any): Promise<({
        parts: ({
            part: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
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
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
    })[]>;
    findOverdue(tenantId: string, req?: any): Promise<({
        parts: ({
            part: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
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
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        parts: ({
            part: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
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
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
    }>;
    update(id: string, tenantId: string, updateWorkOrderDto: UpdateWorkOrderDto): Promise<{
        parts: ({
            part: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
            };
        } & {
            id: string;
            createdAt: Date;
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
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
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    addPart(id: string, tenantId: string, addPartDto: AddWorkOrderPartDto): Promise<{
        part: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            partNumber: string;
            stockLevel: number;
            minStock: number;
            unitPrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        partId: string;
        quantity: number;
        workOrderId: string;
    }>;
    getWorkOrderParts(id: string, tenantId: string): Promise<({
        part: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            partNumber: string;
            stockLevel: number;
            minStock: number;
            unitPrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        partId: string;
        quantity: number;
        workOrderId: string;
    })[]>;
    removePart(id: string, partId: string, tenantId: string): Promise<{
        message: string;
    }>;
    uploadAttachment(id: string, tenantId: string, req: any, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        workOrderId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploadedBy: string | null;
    }>;
    getAttachments(id: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        workOrderId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploadedBy: string | null;
    }[]>;
    deleteAttachment(id: string, attachmentId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
