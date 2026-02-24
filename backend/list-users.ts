import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  console.log('\n=== USERS IN DATABASE ===\n');
  const users = await prisma.user.findMany();
  
  users.forEach(user => {
    console.log(`📧 Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Tenant ID: ${user.tenantId || 'null (SUPER_ADMIN)'}`);
    console.log('---');
  });
  
  await prisma.$disconnect();
}

listUsers().catch(console.error);
