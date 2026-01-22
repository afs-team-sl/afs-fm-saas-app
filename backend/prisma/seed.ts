import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Clean Global Seed with Join Codes...');

  // 1. අපේ පද්ධතියේ ප්‍රධාන IDs සහ රහස් කේත
  const MASTER_TENANT_ID = "05642b69-8f04-44d0-b74c-27c9db4b4969";
  const MASTER_USER_ID = "2930b04c-4b14-4540-a6fc-002093679b8b";
  const MASTER_JOIN_CODE = "ALPHA789"; // අලුත් යූසර්ලාට සිස්ටම් එකට එන්න දෙන කේතය 🔑
  
  const hashedDefaultPassword = await bcrypt.hash('password123', 10);

  // 2. Create or Update Global Tenant (Alpha Industries)
  const tenant = await prisma.tenant.upsert({
    where: { id: MASTER_TENANT_ID },
    update: {
      // joinCode: MASTER_JOIN_CODE // තිබුණොත් update කරනවා
    },
    create: {
      id: MASTER_TENANT_ID,
      name: 'Alpha Industries',
      domain: 'alpha.fms.com',
      // joinCode: MASTER_JOIN_CODE // අලුතින් හදද්දී මේක දානවා
    },
  });

  console.log(`✅ Tenant created: ${tenant.name} | Join Code: ${MASTER_JOIN_CODE}`);

  // 3. Create or Update THE Super Admin
  const admin = await prisma.user.upsert({
    where: { id: MASTER_USER_ID },
    update: {
      password: hashedDefaultPassword, // පර්සවර්ඩ් එක අමතක වුණොත් ආයේ reset වෙනවා
    },
    create: {
      id: MASTER_USER_ID,
      email: 'admin@alpha.com',
      password: hashedDefaultPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Super Admin created: ${admin.email}`);
  console.log('--------------------------------------------------');
  console.log(`🚀 SYSTEM READY: Use Join Code [${MASTER_JOIN_CODE}] for new members.`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });