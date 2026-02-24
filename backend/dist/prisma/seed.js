"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Starting AFS Nexus Global Seed...');
    const superPassword = '123@Super';
    const hashedSuperPassword = await bcrypt.hash(superPassword, 10);
    const orgAdminPassword = 'password123';
    const hashedOrgPassword = await bcrypt.hash(orgAdminPassword, 10);
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
            role: client_1.UserRole.SUPER_ADMIN,
            tenantId: null,
        },
    });
    console.log(`✅ SUPER_ADMIN Deployed: ${superAdmin.email}`);
    console.log('--------------------------------------------------');
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
    const MASTER_USER_ID = "2930b04c-4b14-4540-a6fc-002093679b8b";
    const admin = await prisma.user.upsert({
        where: { id: MASTER_USER_ID },
        update: {
            password: hashedOrgPassword,
            email: 'admin@alpha.com',
            firstName: 'Kamal',
            lastName: 'Perera',
            role: client_1.UserRole.ADMIN,
            tenantId: tenant.id,
        },
        create: {
            id: MASTER_USER_ID,
            email: 'admin@alpha.com',
            password: hashedOrgPassword,
            firstName: 'Kamal',
            lastName: 'Perera',
            role: client_1.UserRole.ADMIN,
            tenantId: tenant.id,
        },
    });
    console.log(`✅ Org Admin Ready: ${admin.email}`);
    const TEST_USER_ID = "3a40c15d-6e9a-4f7b-9c2d-1e8f3a4b5c6d";
    const testAdmin = await prisma.user.upsert({
        where: { id: TEST_USER_ID },
        update: {
            password: hashedOrgPassword,
            email: 'testadmin@gmail.com',
            firstName: 'Test',
            lastName: 'Admin',
            role: client_1.UserRole.ADMIN,
            tenantId: tenant.id,
        },
        create: {
            id: TEST_USER_ID,
            email: 'testadmin@gmail.com',
            password: hashedOrgPassword,
            firstName: 'Test',
            lastName: 'Admin',
            role: client_1.UserRole.ADMIN,
            tenantId: tenant.id,
        },
    });
    console.log(`✅ Test Admin Ready: ${testAdmin.email}`);
    console.log('--------------------------------------------------');
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
                type: notif.type,
                userId: admin.id,
                tenantId: tenant.id,
            },
        });
    }
    console.log(`✅ System Notifications Broadcasted.`);
    console.log('--------------------------------------------------');
    console.log(`🔥 AFS NEXUS PLATFORM INITIALIZED!`);
    console.log(`   SUPER_ADMIN: ${SUPER_ADMIN_EMAIL} / ${superPassword}`);
    console.log(`   ORG_ADMIN  : admin@alpha.com / ${orgAdminPassword}`);
    console.log(`   TEST_ADMIN : testadmin@gmail.com / ${orgAdminPassword}`);
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
//# sourceMappingURL=seed.js.map