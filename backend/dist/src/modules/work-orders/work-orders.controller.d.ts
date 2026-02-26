import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddWorkOrderPartDto } from '../parts/dto/add-work-order-part.dto';
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    create(createWorkOrderDto: CreateWorkOrderDto, tenantId: string): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        tenantId: string;
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
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
            tenantId: string;
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
            roomId: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                tenantId: string;
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
                uom: string;
                supplierId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        tenantId: string;
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        assetId: string;
        assignedToId: string | null;
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findAll(tenantId: string, status?: string, priority?: string, req?: any): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        tenantId: string;
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
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
            tenantId: string;
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
            roomId: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                tenantId: string;
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
                uom: string;
                supplierId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        tenantId: string;
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        assetId: string;
        assignedToId: string | null;
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findOverdue(tenantId: string, req?: any): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        tenantId: string;
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
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
            tenantId: string;
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
            roomId: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                tenantId: string;
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
                uom: string;
                supplierId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        tenantId: string;
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        assetId: string;
        assignedToId: string | null;
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        asset: {
            room: ({
                floor: {
                    building: {
                        tenantId: string;
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
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
            tenantId: string;
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
            roomId: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                tenantId: string;
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
                uom: string;
                supplierId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        tenantId: string;
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        assetId: string;
        assignedToId: string | null;
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    }>;
    update(id: string, tenantId: string, updateWorkOrderDto: UpdateWorkOrderDto): Promise<{
        asset: {
            room: ({
                floor: {
                    building: {
                        tenantId: string;
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
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
            tenantId: string;
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
            roomId: string | null;
        };
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        parts: ({
            part: {
                tenantId: string;
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                partNumber: string;
                stockLevel: number;
                minStock: number;
                unitPrice: number;
                uom: string;
                supplierId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            workOrderId: string;
            partId: string;
        })[];
    } & {
        tenantId: string;
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import(".prisma/client").$Enums.WorkOrderPriority;
        assetId: string;
        assignedToId: string | null;
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    addPart(id: string, tenantId: string, addPartDto: AddWorkOrderPartDto): Promise<{
        part: {
            tenantId: string;
            id: string;
            name: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            partNumber: string;
            stockLevel: number;
            minStock: number;
            unitPrice: number;
            uom: string;
            supplierId: string | null;
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
            tenantId: string;
            id: string;
            name: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            partNumber: string;
            stockLevel: number;
            minStock: number;
            unitPrice: number;
            uom: string;
            supplierId: string | null;
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
    uploadAttachment(id: string, tenantId: string, req: any, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        workOrderId: string;
        fileName: string;
        uploadedBy: string | null;
    }>;
    getAttachments(id: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        workOrderId: string;
        fileName: string;
        uploadedBy: string | null;
    }[]>;
    deleteAttachment(id: string, attachmentId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
