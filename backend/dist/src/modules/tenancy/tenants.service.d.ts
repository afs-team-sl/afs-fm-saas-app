import { PrismaService } from '../../common/prisma/prisma.service';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        _count: {
            users: number;
            assets: number;
            workOrders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
    })[]>;
}
