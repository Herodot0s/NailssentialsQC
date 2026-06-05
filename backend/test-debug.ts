import prisma from './src/utils/prisma';

async function testDebug() {
  try {
    console.log('--- START TEST DEBUG ---');
    // Truncate tables first
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "users", "customer_profiles", "staff_profiles", "staff_schedules" CASCADE;',
    );
    console.log('✔ Truncated tables.');

    // 1. Create a user
    const email = 'test_staff@example.com';
    const user = await prisma.user.create({
      data: {
        username: 'test_staff',
        email,
        phone: '2222222222',
        clerk_id: 'clerk_test_staff',
        role: 'customer',
        is_active: true,
        customer_profile: {
          create: {
            full_name: 'Test Staff',
          },
        },
      },
    });
    console.log('✔ User created:', user.id);

    // 2. Update role
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'staff' },
    });
    console.log('✔ Role updated.');

    // 3. Delete customer profile
    await prisma.customerProfile.delete({ where: { user_id: user.id } });
    console.log('✔ Customer profile deleted.');

    // 4. Create staff profile
    const profile = await prisma.staffProfile.create({
      data: {
        user_id: user.id,
        full_name: 'Test Staff',
        base_pay_per_week: 2500,
        scheduled_start: '09:00:00',
        scheduled_end: '18:00:00',
      },
    });
    console.log('✔ Staff profile created successfully!', profile.id);
  } catch (error) {
    console.error('❌ Error during sequence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDebug();
