import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MaintenanceModeGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.url;

    // Exclude critical endpoints from maintenance mode check
    const excludedPaths = [
      '/auth/login',
      '/auth/register',
      '/system/settings',
      '/system/maintenance-mode',
    ];

    if (excludedPaths.some(excluded => path.startsWith(excluded))) {
      return true;
    }

    try {
      // Get system settings
      const settings = await this.prisma.systemSettings.findUnique({
        where: { id: 'system' }
      });

      // If maintenance mode is OFF or settings don't exist, allow all requests
      if (!settings || !settings.isMaintenanceMode) {
        return true;
      }

      // If maintenance mode is ON, only allow SUPER_ADMIN
      if (user && user.role === 'SUPER_ADMIN') {
        return true;
      }

      // Block all other requests
      throw new ServiceUnavailableException(
        settings.maintenanceMessage || 
        'System is currently under maintenance. Please try again later.'
      );
    } catch (error) {
      // If there's an error checking settings, allow the request
      // This prevents the guard from breaking the entire app
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      console.error('Maintenance mode guard error:', error);
      return true;
    }
  }
}
