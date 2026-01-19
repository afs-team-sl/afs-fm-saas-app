import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Tenant එක හදනවා හෝ තිබුණොත් ඒක ගන්නවා (Upsert)
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'alpha.fms.com' }, // මේක තමයි බලන තැන
    update: {}, // තිබුණොත් මුකුත් වෙනස් කරන්න එපා
    create: {
      name: 'Alpha Industries',
      domain: 'alpha.fms.com',
    },
  });

  console.log(`✅ Tenant: ${tenant.name} (ID: ${tenant.id})`);

  // 2. User කෙනෙක් හදනවා හෝ තිබුණොත් ඒක ගන්නවා
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alpha.com' },
    update: {},
    create: {
      email: 'admin@alpha.com',
      password: 'password123', // පස්සේ මේක hash කරමු
      firstName: 'Kamal',
      lastName: 'Perera',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Admin: ${admin.email}`);
  console.log('🚀 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });