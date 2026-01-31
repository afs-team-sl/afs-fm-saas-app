import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AnnouncementType } from '@prisma/client';

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
      userId: adminUser.id,
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

  // Create a global announcement (tenantId = null for global)
  async createAnnouncement(message: string, type?: AnnouncementType) {
    const announcement = await this.prisma.announcement.create({
      data: {
        message,
        type: type || 'INFO',
        isActive: true,
        tenantId: null, // Global announcement
      },
    });

    console.log(`📢 Global announcement created: "${message}" (Type: ${announcement.type})`);

    return {
      message: 'Announcement created successfully',
      announcement,
    };
  }

  // Get all active announcements (global + tenant-specific)
  async getActiveAnnouncements(tenantId: string | null) {
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { tenantId: null }, // Global announcements
          { tenantId: tenantId }, // Tenant-specific announcements
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Delete an announcement
  async deleteAnnouncement(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    await this.prisma.announcement.delete({
      where: { id },
    });

    console.log(`🗑️  Announcement deleted: "${announcement.message}"`);

    return {
      message: 'Announcement deleted successfully',
    };
  }

  /**
   * Delete a tenant and all its cascading data
   * WARNING: This is a destructive operation that removes:
   * - All users belonging to the tenant
   * - All assets
   * - All work orders
   * - All parts
   * - All maintenance plans
   * - All buildings/floors/rooms
   * - All notifications
   * Prisma's onDelete: Cascade handles this automatically
   */
  async remove(id: string) {
    // Check if tenant exists
    const tenant = await this.prisma.tenant.findUnique({
    }

    console.log(`🗑️  Deleting tenant: ${tenant.name}`);
    console.log(`   - ${tenant._count.users} users`);
    console.log(`   - ${tenant._count.assets} assets`);
    console.log(`   - ${tenant._count.workOrders} work orders`);

    // Delete the tenant - Prisma will cascade delete all related data
    await this.prisma.tenant.delete({
      where: { id },
    });

    console.log(`✅ Tenant "${tenant.name}" and all related data deleted successfully`);

    return {
      message: `Tenant "${tenant.name}" deleted successfully`,
      deletedCounts: {
        users: tenant._count.users,
        assets: tenant._count.assets,
        workOrders: tenant._count.workOrders,
      },
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