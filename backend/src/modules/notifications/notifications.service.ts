import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Get latest 5 notifications for a user
  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  // Mark a notification as read
  async markAsRead(notificationId: string, userId: string) {
    // Verify the notification belongs to the user
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      count: result.count,
    };
  }

  // Helper method to create a notification (can be called from other services)
  async createNotification(
    userId: string,
    message: string,
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR',
    tenantId?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
        type,
        tenantId,
      },
    });
  }
}
