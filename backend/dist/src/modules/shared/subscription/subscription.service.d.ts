import { PrismaService } from '../../../common/prisma/prisma.service';
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    validateAssetLimit(tenantId: string): Promise<void>;
    getRemainingAssets(tenantId: string): Promise<number>;
    getTenantUsage(tenantId: string): Promise<{
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        limit: number;
        currentCount: number;
        remaining: number;
        percentageUsed: number;
        isAtLimit: boolean;
    }>;
}
