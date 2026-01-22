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
    console.log('🚀 Starting Clean Global Seed with Join Codes...');
    const MASTER_TENANT_ID = "05642b69-8f04-44d0-b74c-27c9db4b4969";
    const MASTER_USER_ID = "2930b04c-4b14-4540-a6fc-002093679b8b";
    const MASTER_JOIN_CODE = "ALPHA789";
    const hashedDefaultPassword = await bcrypt.hash('password123', 10);
    const tenant = await prisma.tenant.upsert({
        where: { id: MASTER_TENANT_ID },
        update: {},
        create: {
            id: MASTER_TENANT_ID,
            name: 'Alpha Industries',
            domain: 'alpha.fms.com',
        },
    });
    console.log(`✅ Tenant created: ${tenant.name} | Join Code: ${MASTER_JOIN_CODE}`);
    const admin = await prisma.user.upsert({
        where: { id: MASTER_USER_ID },
        update: {
            password: hashedDefaultPassword,
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
//# sourceMappingURL=seed.js.map