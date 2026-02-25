import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateSupplierDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        contactPerson: string | null;
    }>;
    findAll(): Promise<({
        parts: {
            id: string;
            name: string;
            partNumber: string;
        }[];
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        contactPerson: string | null;
    })[]>;
    findOne(id: string): Promise<{
        parts: {
            id: string;
            name: string;
            partNumber: string;
            stockLevel: number;
            unitPrice: number;
        }[];
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        contactPerson: string | null;
    }>;
    update(id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        contactPerson: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        contactPerson: string | null;
    }>;
}
