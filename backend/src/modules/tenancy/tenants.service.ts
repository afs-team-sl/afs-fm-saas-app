import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

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
}