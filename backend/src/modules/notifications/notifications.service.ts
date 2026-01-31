import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGlobalNotificationDto } from './dto/create-global-notification.dto';
import { UpdateGlobalNotificationDto } from './dto/update-global-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private readonly SUPER_TENANT_ID = process.env.SUPER_TENANT_ID || '05642b69-8f04-44d0-b74c-27c9db4b4969';

  // Get latest 5 notifications for a user (includes both tenant-specific and global)
  async getUserNotifications(userId: string, tenantId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        OR: [
          { tenantId: tenantId },  // Tenant-specific notifications
          { tenantId: null },      // Global system-wide notifications
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,  // Increased to show more notifications
    });

    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        OR: [
          { tenantId: tenantId },
          { tenantId: null },
        ],
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

  // ==================== GLOBAL NOTIFICATIONS (SUPER ADMIN ONLY) ====================

  /**
   * Verify if the given tenant ID belongs to Super Admin
   */
  private verifySuperAdmin(tenantId: string) {
    if (tenantId?.trim() !== this.SUPER_TENANT_ID?.trim()) {
      throw new ForbiddenException('Access Denied: Only Super Admin can manage global notifications');
    }
  }

  /**
   * Get all global notifications (with optional filtering)
   */
  async getAllGlobalNotifications(activeOnly: boolean = false) {
    const where = activeOnly ? { isActive: true } : {};
    
    return this.prisma.globalNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single global notification by ID
   */
  async getGlobalNotification(id: string) {
    const notification = await this.prisma.globalNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Global notification with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Create a new global notification (Super Admin only)
   * Also creates user notifications for all active users with tenantId: null for system-wide visibility
   */
  async createGlobalNotification(tenantId: string, dto: CreateGlobalNotificationDto) {
    this.verifySuperAdmin(tenantId);

    const notification = await this.prisma.globalNotification.create({
      data: {
        message: dto.message,
        type: dto.type || 'INFO',
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    console.log(`📢 Global notification created: "${notification.message}" (Type: ${notification.type})`);

    // Create user notifications for all active users (system-wide broadcast)
    if (notification.isActive) {
      const allUsers = await this.prisma.user.findMany({
        select: { id: true },
      });

      // Convert GlobalNotification type to UserNotification type
      const userNotificationType = this.mapGlobalToUserNotificationType(dto.type || 'INFO');

      // Batch create notifications for all users with tenantId: null (global)
      await this.prisma.notification.createMany({
        data: allUsers.map((user) => ({
          userId: user.id,
          message: dto.message,
          type: userNotificationType,
          tenantId: null,  // NULL = Global system-wide notification
          isRead: false,
        })),
      });

      console.log(`📬 Created ${allUsers.length} user notifications for global broadcast`);
    }

    return notification;
  }

  /**
   * Map GlobalNotification type to UserNotification type
   */
  private mapGlobalToUserNotificationType(
    type: 'INFO' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE',
  ): 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' {
    switch (type) {
      case 'CRITICAL':
        return 'ERROR';
      case 'MAINTENANCE':
      case 'WARNING':
        return 'WARNING';
      default:
        return 'INFO';
    }
  }

  /**
   * Update an existing global notification (Super Admin only)
   */
  async updateGlobalNotification(
    tenantId: string,
    id: string,
    dto: UpdateGlobalNotificationDto,
  ) {
    this.verifySuperAdmin(tenantId);

    // Check if notification exists
    const existing = await this.prisma.globalNotification.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Global notification with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {};
    if (dto.message !== undefined) updateData.message = dto.message;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.expiresAt !== undefined) {
      updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    const updated = await this.prisma.globalNotification.update({
      where: { id },
      data: updateData,
    });

    console.log(`✏️ Global notification updated: ID ${id}`);

    return updated;
  }

  /**
   * Delete a global notification (Super Admin only)
   */
  async deleteGlobalNotification(tenantId: string, id: string) {
    this.verifySuperAdmin(tenantId);

    // Check if notification exists
    const existing = await this.prisma.globalNotification.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Global notification with ID ${id} not found`);
    }

    await this.prisma.globalNotification.delete({
      where: { id },
    });

    console.log(`🗑️ Global notification deleted: ID ${id}`);

    return {
      message: 'Global notification deleted successfully',
      id,
    };
  }
}
