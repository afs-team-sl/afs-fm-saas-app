import { PrismaService } from '../../common/prisma/prisma.service';
export declare class SystemService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        id: string;
        updatedAt: Date;
        isMaintenanceMode: boolean;
        maintenanceMessage: string | null;
    }>;
    toggleMaintenanceMode(enabled: boolean, message?: string): Promise<{
        id: string;
        updatedAt: Date;
        isMaintenanceMode: boolean;
        maintenanceMessage: string | null;
    }>;
    getAuditLogs(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        target: string;
        performedBy: string;
        tenantName: string | null;
        metadata: string | null;
    }[]>;
    createAuditLog(data: {
        action: string;
        target: string;
        performedBy: string;
        tenantName?: string;
        metadata?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        target: string;
        performedBy: string;
        tenantName: string | null;
        metadata: string | null;
    }>;
}
