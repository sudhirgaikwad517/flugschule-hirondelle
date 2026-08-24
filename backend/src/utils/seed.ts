import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@hirondelle.de';
  const password = 'admin';

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        name: 'Admin Hirondelle',
        email,
        password: passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`Admin user created: ${email} / ${password}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
