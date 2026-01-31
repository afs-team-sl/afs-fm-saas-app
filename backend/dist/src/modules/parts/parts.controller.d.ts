import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
export declare class PartsController {
    private readonly partsService;
    constructor(partsService: PartsService);
    create(req: any, createPartDto: CreatePartDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
    findAll(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }[]>;
    findLowStock(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
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
            partId: string;
            quantity: number;
            workOrderId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
    update(id: string, req: any, updatePartDto: UpdatePartDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    restock(id: string, req: any, quantity: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
}
