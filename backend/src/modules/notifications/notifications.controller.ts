import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGlobalNotificationDto } from './dto/create-global-notification.dto';
import { UpdateGlobalNotificationDto } from './dto/update-global-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== USER NOTIFICATIONS ====================

  @Get()
  @ApiOperation({ summary: 'Get latest notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully.' })
  async getNotifications(@Request() req) {
    const userId = req.user.sub;
    const tenantId = req.user.tenantId;
    return this.notificationsService.getUserNotifications(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  async markAllAsRead(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  // ==================== GLOBAL NOTIFICATIONS (SUPER ADMIN) ====================

  @Get('global/all')
  @ApiOperation({ summary: 'Get all global notifications (Super Admin only)' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Global notifications retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Super Admin can access.' })
  async getAllGlobalNotifications(
    @Request() req,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const tenantId = req.user.tenantId;
    const active = activeOnly === 'true';
    return this.notificationsService.getAllGlobalNotifications(active);
  }

  @Get('global/:id')
  @ApiOperation({ summary: 'Get a single global notification by ID' })
  @ApiResponse({ status: 200, description: 'Global notification retrieved.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async getGlobalNotification(@Param('id') id: string) {
    return this.notificationsService.getGlobalNotification(id);
  }

  @Post('global')
  @ApiOperation({ summary: 'Create a new global notification (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Global notification created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Super Admin can create.' })
  async createGlobalNotification(
    @Request() req,
    @Body() dto: CreateGlobalNotificationDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.notificationsService.createGlobalNotification(tenantId, dto);
  }

  @Patch('global/:id')
  @ApiOperation({ summary: 'Update a global notification (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Global notification updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Super Admin can update.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async updateGlobalNotification(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateGlobalNotificationDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.notificationsService.updateGlobalNotification(tenantId, id, dto);
  }

  @Delete('global/:id')
  @ApiOperation({ summary: 'Delete a global notification (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Global notification deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Super Admin can delete.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async deleteGlobalNotification(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.notificationsService.deleteGlobalNotification(tenantId, id);
  }
}
