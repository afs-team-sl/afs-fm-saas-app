import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.systemSettings.findUnique({
      where: { id: 'system' }
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: {
          id: 'system',
          isMaintenanceMode: false,
          maintenanceMessage: null
        }
      });
    }

    return settings;
  }

  async toggleMaintenanceMode(enabled: boolean, message?: string) {
    const settings = await this.getSettings();
    
    return this.prisma.systemSettings.update({
      where: { id: 'system' },
      data: {
        isMaintenanceMode: enabled,
        maintenanceMessage: message || null
      }
    });
  }

  async getAuditLogs(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async createAuditLog(data: {
    action: string;
    target: string;
    performedBy: string;
    tenantName?: string;
    metadata?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
