import { PrismaClient, PublishStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with full roles and accounts...');

  const defaultPassword = 'Password123!';
  const password_hash = await bcrypt.hash(defaultPassword, 10);

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
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log('✓ Roles seeded.');

  const hqRole = await prisma.role.findUniqueOrThrow({ where: { code: 'HQ' } });
  const amRole = await prisma.role.findUniqueOrThrow({ where: { code: 'AM' } });
  const smRole = await prisma.role.findUniqueOrThrow({ where: { code: 'SM' } });
  const subSmRole = await prisma.role.findUniqueOrThrow({ where: { code: 'SUB_SM' } });

  // 2. Area & Store Sample Data
  const area = await prisma.area.upsert({
    where: { code: 'AREA-TK-01' },
    update: {},
    create: {
      code: 'AREA-TK-01',
      name: 'Tokyo Central Area',
      block: 'Kanto',
    },
  });

  const store = await prisma.store.upsert({
    where: { code: 'STORE-TK-001' },
    update: {},
    create: {
      code: 'STORE-TK-001',
      name: 'Rakusai Shinjuku Store',
      area_id: area.id,
      prefecture: 'Tokyo',
      address: '1-1-1 Shinjuku, Shinjuku-ku, Tokyo',
      publish_status: PublishStatus.published,
      allow_car_commute: true,
    },
  });
  console.log('✓ Master Area & Store seeded.');

  // 3. User Accounts
  // 3.1 HQ User
  const hqUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password_hash },
    create: {
      employee_code: 'HQ-001',
      email: 'admin@example.com',
      password_hash,
      full_name: 'HQ System Administrator',
      role_id: hqRole.id,
    },
  });

  // 3.2 AM User
  const amUser = await prisma.user.upsert({
    where: { email: 'am@example.com' },
    update: { password_hash },
    create: {
      employee_code: 'AM-001',
      email: 'am@example.com',
      password_hash,
      full_name: 'Tanaka Hiroshi (Area Manager)',
      role_id: amRole.id,
    },
  });

  // 3.3 SM User
  const smUser = await prisma.user.upsert({
    where: { email: 'sm@example.com' },
    update: { password_hash },
    create: {
      employee_code: 'SM-001',
      email: 'sm@example.com',
      password_hash,
      full_name: 'Sato Kenji (Store Manager)',
      role_id: smRole.id,
    },
  });

  // 3.4 SUB_SM User
  const subSmUser = await prisma.user.upsert({
    where: { email: 'sub_sm@example.com' },
    update: { password_hash },
    create: {
      employee_code: 'SUB-001',
      email: 'sub_sm@example.com',
      password_hash,
      full_name: 'Suzuki Yuka (Sub Store Manager)',
      role_id: subSmRole.id,
    },
  });
  console.log('✓ All 4 User accounts seeded.');

  // 4. Assignments
  // AM Assignment to Area
  await prisma.areaManagerAssignment.upsert({
    where: {
      area_id_am_user_id: {
        area_id: area.id,
        am_user_id: amUser.id,
      },
    },
    update: {},
    create: {
      area_id: area.id,
      am_user_id: amUser.id,
    },
  });

  // SM Assignment to Store (Primary)
  await prisma.storeManagerAssignment.upsert({
    where: {
      store_id_user_id: {
        store_id: store.id,
        user_id: smUser.id,
      },
    },
    update: { is_primary: true },
    create: {
      store_id: store.id,
      user_id: smUser.id,
      is_primary: true,
    },
  });

  // SUB_SM Assignment to Store (Secondary)
  await prisma.storeManagerAssignment.upsert({
    where: {
      store_id_user_id: {
        store_id: store.id,
        user_id: subSmUser.id,
      },
    },
    update: { is_primary: false },
    create: {
      store_id: store.id,
      user_id: subSmUser.id,
      is_primary: false,
    },
  });
  console.log('✓ Store & Area Manager assignments seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
