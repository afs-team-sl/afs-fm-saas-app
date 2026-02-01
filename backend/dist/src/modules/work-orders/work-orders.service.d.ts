import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddWorkOrderPartDto } from '../parts/dto/add-work-order-part.dto';
import { StorageService } from '../shared/storage/storage.service';
export declare class WorkOrdersService {
    private readonly prisma;
    private readonly storageService;
    constructor(prisma: PrismaService, storageService: StorageService);
    private readonly includeRelations;
    create(tenantId: string, dto: CreateWorkOrderDto): Promise<{
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
    findAll(tenantId: string, userId?: string, role?: string): Promise<({
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
    findByStatus(tenantId: string, status: string): Promise<({
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
    findByPriority(tenantId: string, priority: string): Promise<({
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
    update(id: string, tenantId: string, dto: UpdateWorkOrderDto): Promise<{
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
    findOverdue(tenantId: string, role?: string, userId?: string): Promise<({
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
    addPart(workOrderId: string, tenantId: string, dto: AddWorkOrderPartDto): Promise<{
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
    getWorkOrderParts(workOrderId: string, tenantId: string): Promise<({
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
    removePart(workOrderId: string, workOrderPartId: string, tenantId: string): Promise<{
        message: string;
    }>;
    addAttachment(workOrderId: string, tenantId: string, file: Express.Multer.File, uploadedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        workOrderId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploadedBy: string | null;
    }>;
    getAttachments(workOrderId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        workOrderId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploadedBy: string | null;
    }[]>;
    deleteAttachment(attachmentId: string, workOrderId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
