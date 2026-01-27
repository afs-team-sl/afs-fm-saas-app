import { PrismaService } from '../../common/prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserNotifications(userId: string): Promise<{
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
}
