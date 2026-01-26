import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationType } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // පද්ධතියේ ඉන්න ඔක්කොම Tenants ලා සහ එයාලගේ Stats ගන්නවා
  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            assets: true,
            workOrders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // එක Tenant එකක් ID එකෙන් ගන්නවා
  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            assets: true,
            workOrders: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  // Tenant එකක නම Update කරනවා (Admins Only)
  async update(id: string, data: { name: string }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { name: data.name },
      include: {
        _count: {
          select: {
            users: true,
            assets: true,
            workOrders: true,
          },
        },
      },
    });
  }

  // Generate impersonation token for a tenant's admin
  async generateImpersonationToken(tenantId: string) {
    // Find the tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Find an ADMIN user for this tenant
    const adminUser = await this.prisma.user.findFirst({
      where: {
        tenantId: tenantId,
        role: 'ADMIN',
      },
    });

    if (!adminUser) {
      throw new NotFoundException(`No admin user found for tenant ${tenant.name}`);
    }

    // Generate JWT token for the admin user
    const payload = {
      sub: adminUser.id,
      email: adminUser.email,
      tenantId: adminUser.tenantId,
      role: adminUser.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    console.log(`🎭 Impersonation token generated for ${adminUser.email} (${tenant.name})`);

    return {
      access_token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
    };
  }

  // Create a broadcast notification
  async createBroadcast(message: string, type?: NotificationType) {
    const notification = await this.prisma.globalNotification.create({
      data: {
        message,
        type: type || 'INFO',
        isActive: true,
      },
    });

    console.log(`📢 Broadcast created: "${message}" (Type: ${notification.type})`);

    return {
      message: 'Broadcast sent successfully',
      notification,
    };
  }

  // Get all active notifications
  async getActiveNotifications() {
    return this.prisma.globalNotification.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}