import { SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getSettings(): Promise<{
        id: string;
        updatedAt: Date;
        isMaintenanceMode: boolean;
        maintenanceMessage: string | null;
    }>;
    toggleMaintenanceMode(data: {
        enabled: boolean;
        message?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        isMaintenanceMode: boolean;
        maintenanceMessage: string | null;
    }>;
    getAuditLogs(): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        target: string;
        performedBy: string;
        tenantName: string | null;
        metadata: string | null;
    }[]>;
}
