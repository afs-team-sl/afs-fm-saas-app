"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verifyIds() {
    console.log('\n🔍 Verifying Super Admin Configuration...\n');
    try {
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
        console.log('\n' + '='.repeat(80));
        console.log('📋 COPY THIS TO YOUR frontend/.env FILE:');
        console.log('='.repeat(80));
        console.log(`VITE_SUPER_TENANT_ID=${tenant.id}`);
        console.log(`VITE_SYSTEM_SUPER_USER_ID=${admin.id}`);
        console.log('='.repeat(80));
        console.log('\n🧪 VERIFICATION:');
        const match = admin.tenantId === tenant.id;
        console.log(`   User's TenantId matches Tenant ID: ${match ? '✅' : '❌'}`);
        if (!match) {
            console.error('\n⚠️  WARNING: User is not part of Alpha Industries!');
        }
        console.log('\n✅ Verification complete!\n');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
verifyIds();
//# sourceMappingURL=verify-super-admin-ids.js.map