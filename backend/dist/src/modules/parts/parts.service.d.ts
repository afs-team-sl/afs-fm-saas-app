import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
export declare class PartsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreatePartDto): Promise<{
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
    findAll(tenantId: string): Promise<({
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
    findLowStock(tenantId: string): Promise<{
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
    findOne(id: string, tenantId: string): Promise<{
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
            quantity: number;
            workOrderId: string;
            partId: string;
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
    update(id: string, tenantId: string, dto: UpdatePartDto): Promise<{
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
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    deductStock(partId: string, quantity: number, tenantId: string): Promise<{
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
    addStock(partId: string, quantity: number, tenantId: string): Promise<{
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
