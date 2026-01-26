import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            tenantId: string | null;
            type: import(".prisma/client").$Enums.UserNotificationType;
            message: string;
            isRead: boolean;
            userId: string;
        }[];
        unreadCount: number;
    }>;
    markAsRead(req: any, notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string | null;
        type: import(".prisma/client").$Enums.UserNotificationType;
        message: string;
        isRead: boolean;
        userId: string;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
        count: number;
    }>;
}
