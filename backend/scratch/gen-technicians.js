const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('--- GENERATING SAMPLE TECHNICIANS ---');
  const saltRounds = 10;
  const hashedUserPassword = await bcrypt.hash('password123', saltRounds);

  const staffData = [
    { name: 'Sarah Miller', spec: 'Nails, Eyelashes', username: 'sarah_tech' },
    { name: 'Michael Chen', spec: 'Hair Styling, Color', username: 'michael_hair' },
    { name: 'Liza Ramos', spec: 'Waxing, Nails', username: 'liza_wax' },
    { name: 'Angela Cruz', spec: 'Nails, Spa', username: 'angela_nails' }
  ];

  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        username: s.username,
        email: `${s.username}@nailssentialsqc.com`,
        password_hash: hashedUserPassword,
        role: Role.staff,
        staff_profile: {
          create: {
            full_name: s.name,
            specializations: s.spec,
            base_pay_per_week: 2500,
            daily_target: 6000
          }
        }
      },
      include: { staff_profile: true }
    });
    console.log(`Created/Ensured technician: ${s.name} (${s.username})`);
  }

  // Also check if existing staff from ACCOUNTS.md have profiles
  const existingStaff = await prisma.user.findMany({ where: { role: Role.staff, staff_profile: null } });
  for (const u of existingStaff) {
    await prisma.staffProfile.create({
      data: {
        user_id: u.id,
        full_name: u.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        specializations: 'General Tech',
        base_pay_per_week: 2500,
        daily_target: 6000
      }
    });
    console.log(`Added missing profile for existing staff: ${u.username}`);
  }

  console.log('--- TECHNICIAN GENERATION COMPLETED ---');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
