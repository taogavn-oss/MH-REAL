import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Roles (HQ, AM, SM, SUB_SM)
  const rolesData = [
    { code: 'HQ', name: 'Headquarters', description: 'HQ admin' },
    { code: 'AM', name: 'Area Manager', description: 'Manager for areas' },
    { code: 'SM', name: 'Store Manager', description: 'Primary store manager' },
    { code: 'SUB_SM', name: 'Sub Store Manager', description: 'Secondary store manager' },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded.');

  // 2. Admin User (HQ)
  const hqRole = await prisma.role.findUnique({ where: { code: 'HQ' } });
  if (hqRole) {
    const defaultPassword = 'Password123!';
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        employee_code: 'HQ-001',
        email: 'admin@example.com',
        password_hash,
        full_name: 'System Admin',
        role_id: hqRole.id,
      },
    });
    console.log('Admin user seeded (admin@example.com / Password123!)');
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
