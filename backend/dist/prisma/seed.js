"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const tenant = await prisma.tenant.upsert({
        where: { domain: 'alpha.fms.com' },
        update: {},
        create: {
            name: 'Alpha Industries',
            domain: 'alpha.fms.com',
        },
    });
    console.log(`✅ Tenant: ${tenant.name} (ID: ${tenant.id})`);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@alpha.com' },
        update: {},
        create: {
            email: 'admin@alpha.com',
            password: 'password123',
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
//# sourceMappingURL=seed.js.map