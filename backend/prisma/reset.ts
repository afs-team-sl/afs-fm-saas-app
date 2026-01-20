import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@alpha.com'; // ඔයාට මතක නැති ඒ ඊමේල් එක මෙතනට දාන්න
  const newPassword = 'password123'; // අලුත් පාස්වර්ඩ් එක

  console.log(`🔐 Resetting password for ${email}...`);

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword },
  });

  console.log('✅ Password reset successful! You can now login with: password123');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());