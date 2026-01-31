import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGlobalNotificationDto } from './dto/create-global-notification.dto';
import { UpdateGlobalNotificationDto } from './dto/update-global-notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly SUPER_TENANT_ID;
    getUserNotifications(userId: string, tenantId: string): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            tenantId: string | null;
            message: string;
            type: import(".prisma/client").$Enums.UserNotificationType;
            isRead: boolean;
            userId: string;
        }[];
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string | null;
        message: string;
        type: import(".prisma/client").$Enums.UserNotificationType;
        isRead: boolean;
        userId: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
        count: number;
    }>;
    createNotification(userId: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR', tenantId?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string | null;
        message: string;
        type: import(".prisma/client").$Enums.UserNotificationType;
        isRead: boolean;
        userId: string;
    }>;
    private verifySuperAdmin;
    getAllGlobalNotifications(activeOnly?: boolean): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }[]>;
    getGlobalNotification(id: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }>;
    createGlobalNotification(tenantId: string, dto: CreateGlobalNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }>;
    private mapGlobalToUserNotificationType;
    updateGlobalNotification(tenantId: string, id: string, dto: UpdateGlobalNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }>;
    deleteGlobalNotification(tenantId: string, id: string): Promise<{
        message: string;
        id: string;
    }>;
}
