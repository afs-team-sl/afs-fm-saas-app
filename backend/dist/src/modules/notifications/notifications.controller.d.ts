import { NotificationsService } from './notifications.service';
import { CreateGlobalNotificationDto } from './dto/create-global-notification.dto';
import { UpdateGlobalNotificationDto } from './dto/update-global-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
        notifications: {
            id: string;
            tenantId: string | null;
            createdAt: Date;
            message: string;
            type: import(".prisma/client").$Enums.UserNotificationType;
            isRead: boolean;
            userId: string | null;
        }[];
        unreadCount: number;
    }>;
    markAsRead(req: any, notificationId: string): Promise<{
        id: string;
        tenantId: string | null;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.UserNotificationType;
        isRead: boolean;
        userId: string | null;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
        count: number;
    }>;
    getAllGlobalNotifications(req: any, activeOnly?: string): Promise<{
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
    createGlobalNotification(req: any, dto: CreateGlobalNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }>;
    updateGlobalNotification(req: any, id: string, dto: UpdateGlobalNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }>;
    deleteGlobalNotification(req: any, id: string): Promise<{
        message: string;
        id: string;
    }>;
}
