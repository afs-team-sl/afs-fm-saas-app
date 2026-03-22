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
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findAll(tenantId: string, userId?: string, role?: string): Promise<({
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findByStatus(tenantId: string, status: string): Promise<({
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findByPriority(tenantId: string, priority: string): Promise<({
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
        completionNote: string | null;
        startedAt: Date | null;
        dueDate: Date | null;
        laborHours: number | null;
        checklistData: import("@prisma/client/runtime/library").JsonValue | null;
        legacyId: string | null;
    }>;
    update(id: string, tenantId: string, dto: UpdateWorkOrderDto): Promise<{
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
        parts: ({
            part: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
        asset: {
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
            department: string | null;
            image: string | null;
            costCenter: string | null;
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
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string | null;
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
        partId: string;
        quantity: number;
        workOrderId: string;
    }>;
    getWorkOrderParts(workOrderId: string, tenantId: string): Promise<({
        part: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string | null;
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
