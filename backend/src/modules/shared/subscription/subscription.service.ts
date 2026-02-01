import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SUBSCRIPTION_LIMITS } from '../../../common/config/subscription.config';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validates if a tenant can create more assets based on their subscription plan.
   * Throws ForbiddenException if the limit is reached.
   */
  async validateAssetLimit(tenantId: string): Promise<void> {
    // Fetch tenant with asset count
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Get the limit for the tenant's plan
    const limit = SUBSCRIPTION_LIMITS[tenant.plan];
    const currentCount = tenant._count.assets;

    // Check if limit is reached
    if (currentCount >= limit) {
      throw new ForbiddenException(
        `Plan limit exceeded. Your ${tenant.plan} plan allows up to ${limit} assets. ` +
        `You currently have ${currentCount} assets. Please upgrade your plan to add more.`
      );
    }
  }

  /**
   * Get remaining asset slots for a tenant
   */
  async getRemainingAssets(tenantId: string): Promise<number> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const limit = SUBSCRIPTION_LIMITS[tenant.plan];
    const currentCount = tenant._count.assets;

    return limit === Infinity ? Infinity : limit - currentCount;
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const limit = SUBSCRIPTION_LIMITS[tenant.plan];
    const currentCount = tenant._count.assets;
    const remaining = limit === Infinity ? Infinity : limit - currentCount;
    const percentageUsed = limit === Infinity ? 0 : (currentCount / limit) * 100;

    return {
      plan: tenant.plan,
      limit,
      currentCount,
      remaining,
      percentageUsed: Math.round(percentageUsed),
      isAtLimit: currentCount >= limit,
    };
  }
}
