import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
export declare class PartsController {
    private readonly partsService;
    constructor(partsService: PartsService);
    create(req: any, createPartDto: CreatePartDto): Promise<{
        id: string;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    findAll(req: any): Promise<{
        id: string;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }[]>;
    findLowStock(req: any): Promise<{
        id: string;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        workOrderParts: ({
            workOrder: {
                id: string;
                createdAt: Date;
                title: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
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
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    update(id: string, req: any, updatePartDto: UpdatePartDto): Promise<{
        id: string;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    restock(id: string, req: any, quantity: number): Promise<{
        id: string;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
}
