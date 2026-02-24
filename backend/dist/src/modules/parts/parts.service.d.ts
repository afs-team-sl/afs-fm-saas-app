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
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }[]>;
    findLowStock(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
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
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
    update(id: string, tenantId: string, dto: UpdatePartDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
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
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
    addStock(partId: string, quantity: number, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        partNumber: string;
        stockLevel: number;
        minStock: number;
        unitPrice: number;
    }>;
}
