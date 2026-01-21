import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // මේක අනිවාර්යයෙන් උඩින්ම දාන්න

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Password එක Hash කරගමු
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 2. Tenant එක හදනවා හෝ තිබුණොත් ඒක ගන්නවා
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'alpha.fms.com' },
    update: {},
    create: {
      name: 'Alpha Industries',
      domain: 'alpha.fms.com',
    },
  });

  // 3. User ව හදනවා හෝ තිබුණොත් UPDATE කරනවා (පාස්වර්ඩ් එකත් එක්ක) 🔐
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alpha.com' },
    update: {
      password: hashedPassword, // දැනට ඉන්නවා නම් එයාගේ පාස්වර්ඩ් එකත් Hash කරලා Update කරනවා
    },
    create: {
      email: 'admin@alpha.com',
      password: hashedPassword, // අලුතින් හදනවා නම් Hash එක සේව් කරනවා
      firstName: 'Kamal',
      lastName: 'Perera',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Admin updated with hashed password: ${admin.email}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());