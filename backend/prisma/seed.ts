import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting AFS Nexus Global Seed...');

  // 1. Passwords කලින්ම Hash කරගමු 🔐
  const superPassword = '123@Super';
  const hashedSuperPassword = await bcrypt.hash(superPassword, 10);
  
  const orgAdminPassword = 'password123';
  const hashedOrgPassword = await bcrypt.hash(orgAdminPassword, 10);

  // ============================================================
  // 1. Create GLOBAL SUPER_ADMIN (AFS Nexus Owner)
  // ============================================================
  const SUPER_ADMIN_ID = "f7b3c1e0-9d4a-4b2e-8f3a-1c5d6e7f8a9b";
  const SUPER_ADMIN_EMAIL = "afsnexus@gmail.com";

  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      password: hashedSuperPassword,
    },
    create: {
      id: SUPER_ADMIN_ID,
      email: SUPER_ADMIN_EMAIL,
      password: hashedSuperPassword,
      firstName: 'AFS',
      lastName: 'Nexus',
      role: UserRole.SUPER_ADMIN,
      tenantId: null, 
    },
  });

  console.log(`✅ SUPER_ADMIN Deployed: ${superAdmin.email}`);
  console.log('--------------------------------------------------');

  // ============================================================
  // 2. Create Sample Organization (Alpha Industries)
  // ============================================================
  const MASTER_TENANT_ID = "05642b69-8f04-44d0-b74c-27c9db4b4969";
  const MASTER_JOIN_CODE = "ALPHA789";
  
  const tenant = await prisma.tenant.upsert({
    where: { id: MASTER_TENANT_ID },
    update: {
      joinCode: MASTER_JOIN_CODE
    },
    create: {
      id: MASTER_TENANT_ID,
      name: 'Alpha Industries',
      domain: 'alpha.fms.com',
      joinCode: MASTER_JOIN_CODE,
    },
  });

  console.log(`✅ Organization Ready: ${tenant.name} [Code: ${MASTER_JOIN_CODE}]`);

  // ============================================================
  // 3. Create Sample Organization Admin
  // ============================================================
  const MASTER_USER_ID = "2930b04c-4b14-4540-a6fc-002093679b8b";

  const admin = await prisma.user.upsert({
    where: { id: MASTER_USER_ID }, // Use ID as the unique identifier
    update: {
      password: hashedOrgPassword,
      email: 'admin@alpha.com',
      firstName: 'Kamal',
      lastName: 'Perera',
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
    create: {
      id: MASTER_USER_ID,
      email: 'admin@alpha.com',
      password: hashedOrgPassword,
      firstName: 'Kamal',
      lastName: 'Perera',
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Org Admin Ready: ${admin.email}`);
  console.log('--------------------------------------------------');

  // ============================================================
  // 4. Create Initial System Notifications
  // ============================================================
  // පරණ ඒවා මකලා අලුතින් දාමු පටලැවෙන්නේ නැති වෙන්න
  await prisma.notification.deleteMany({ where: { tenantId: tenant.id } });

  const sampleNotifications = [
    { message: 'Welcome to AFS Nexus! Global infrastructure active.', type: 'SUCCESS' },
    { message: 'Azure Database migration successful', type: 'INFO' },
    { message: 'Security protocols updated to version 1.0', type: 'WARNING' },
  ];

  for (const notif of sampleNotifications) {
    await prisma.notification.create({
      data: {
        message: notif.message,
        type: notif.type as any,
        userId: admin.id, // Send notifications to the org admin
        tenantId: tenant.id, // Alpha Industries එකට විතරයි
      },
    });
  }

  console.log(`✅ System Notifications Broadcasted.`);
  console.log('--------------------------------------------------');
  console.log(`🔥 AFS NEXUS PLATFORM INITIALIZED!`);
  console.log(`   SUPER_ADMIN: ${SUPER_ADMIN_EMAIL} / ${superPassword}`);
  console.log(`   ORG_ADMIN  : admin@alpha.com / ${orgAdminPassword}`);
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