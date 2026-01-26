import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
export declare class PartsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreatePartDto): Promise<{
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
    findAll(tenantId: string): Promise<{
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
    findLowStock(tenantId: string): Promise<{
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
    update(id: string, tenantId: string, dto: UpdatePartDto): Promise<{
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
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    deductStock(partId: string, quantity: number, tenantId: string): Promise<{
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
    addStock(partId: string, quantity: number, tenantId: string): Promise<{
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
