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
    create(tenantId: string, dto: CreateWorkOrderDto): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
    findAll(tenantId: string, userId?: string, role?: string): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
    findByStatus(tenantId: string, status: string): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
    findByPriority(tenantId: string, priority: string): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
    update(id: string, tenantId: string, dto: UpdateWorkOrderDto): Promise<{
        asset: {
            room: ({
                floor: {
                    building: {
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
    findOverdue(tenantId: string, role?: string, userId?: string): Promise<({
        asset: {
            room: ({
                floor: {
                    building: {
                        id: string;
                        name: string;
                        tenantId: string;
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
            tenantId: string;
            roomId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                location: string | null;
                tenantId: string;
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
        id: string;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        tenantId: string;
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
    addPart(workOrderId: string, tenantId: string, dto: AddWorkOrderPartDto): Promise<{
        part: {
            id: string;
            name: string;
            location: string | null;
            tenantId: string;
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
    getWorkOrderParts(workOrderId: string, tenantId: string): Promise<({
        part: {
            id: string;
            name: string;
            location: string | null;
            tenantId: string;
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
    removePart(workOrderId: string, workOrderPartId: string, tenantId: string): Promise<{
        message: string;
    }>;
    addAttachment(workOrderId: string, tenantId: string, file: Express.Multer.File, uploadedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        workOrderId: string;
        fileName: string;
        uploadedBy: string | null;
    }>;
    getAttachments(workOrderId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        workOrderId: string;
        fileName: string;
        uploadedBy: string | null;
    }[]>;
    deleteAttachment(attachmentId: string, workOrderId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
