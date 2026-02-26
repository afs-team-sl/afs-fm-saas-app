import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
export declare class PartsController {
    private readonly partsService;
    constructor(partsService: PartsService);
    create(req: any, createPartDto: CreatePartDto): Promise<{
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
    }>;
    findAll(req: any): Promise<({
        supplier: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
        } | null;
    } & {
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
    })[]>;
    findLowStock(req: any): Promise<{
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
    }[]>;
    findOne(id: string, req: any): Promise<{
        supplier: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            contactPerson: string | null;
        } | null;
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
    }>;
    update(id: string, req: any, updatePartDto: UpdatePartDto): Promise<{
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
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    restock(id: string, req: any, quantity: number): Promise<{
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
    }>;
}
