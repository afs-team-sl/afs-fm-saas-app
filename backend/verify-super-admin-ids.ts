/**
 * 🔍 SUPER ADMIN ID VERIFICATION SCRIPT
 * 
 * Run this to get the EXACT IDs you need in your frontend .env file
 * 
 * Usage:
 *   npx ts-node verify-super-admin-ids.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyIds() {
  console.log('\n🔍 Verifying Super Admin Configuration...\n');
  
  try {
    // 1. Find the Alpha Industries tenant
    const tenant = await prisma.tenant.findFirst({
      where: { domain: 'alpha.fms.com' }
    });

    if (!tenant) {
      console.error('❌ ERROR: Alpha Industries tenant not found!');
      console.log('Run: npx prisma db seed');
      process.exit(1);
    }

    console.log('✅ TENANT FOUND:');
    console.log(`   Name: ${tenant.name}`);
    console.log(`   Domain: ${tenant.domain}`);
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Type: ${typeof tenant.id}`);
    console.log(`   Length: ${tenant.id.length}`);

    // 2. Find the admin user
    const admin = await prisma.user.findFirst({
      where: { 
        email: 'admin@alpha.com',
        tenantId: tenant.id 
      }
    });

    if (!admin) {
      console.error('\n❌ ERROR: Admin user not found!');
      console.log('Run: npx prisma db seed');
      process.exit(1);
    }

    console.log('\n✅ ADMIN USER FOUND:');
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Type: ${typeof admin.id}`);
    console.log(`   Length: ${admin.id.length}`);
    console.log(`   TenantId: ${admin.tenantId}`);

    // 3. Generate the .env file content
    console.log('\n' + '='.repeat(80));
    console.log('📋 COPY THIS TO YOUR frontend/.env FILE:');
    console.log('='.repeat(80));
    console.log(`VITE_SUPER_TENANT_ID=${tenant.id}`);
    console.log(`VITE_SYSTEM_SUPER_USER_ID=${admin.id}`);
    console.log('='.repeat(80));

    // 4. Verification check
    console.log('\n🧪 VERIFICATION:');
    const match = admin.tenantId === tenant.id;
    console.log(`   User's TenantId matches Tenant ID: ${match ? '✅' : '❌'}`);
    
    if (!match) {
      console.error('\n⚠️  WARNING: User is not part of Alpha Industries!');
    }

    console.log('\n✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyIds();
