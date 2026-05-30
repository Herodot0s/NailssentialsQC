import prisma from './src/utils/prisma';

async function verifyCrud() {
  console.log('--- STARTING CUSTOMER DB CRUD VALIDATION ---');
  let testUserId: number | null = null;
  let testProfileId: number | null = null;

  try {
    // 1. CREATE CUSTOMER
    console.log('Step 1: Creating customer...');
    const username = 'test_crud_cust_' + Date.now();
    const email = `test_crud_${Date.now()}@example.com`;

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        phone: '0912345678',
        role: 'customer',
        is_active: true,
        customer_profile: {
          create: {
            full_name: 'CRUD Test Customer',
            allergies: 'Acrylic monomer',
            notes: 'Prefer warm water wash.',
          },
        },
      },
      include: {
        customer_profile: true,
      },
    });

    testUserId = newUser.id;
    testProfileId = newUser.customer_profile?.id || null;

    console.log('✔ Customer created successfully!');
    console.log(`- User ID: ${testUserId}`);
    console.log(`- Profile ID: ${testProfileId}`);
    console.log(`- Name: ${newUser.customer_profile?.full_name}`);
    console.log(`- Allergies: ${newUser.customer_profile?.allergies}`);

    // 2. READ CUSTOMER
    console.log('\nStep 2: Reading customer...');
    const readUser = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { customer_profile: true },
    });
    if (!readUser || !readUser.customer_profile) {
      throw new Error('Read failed: Customer user or profile not found');
    }
    console.log('✔ Customer read successfully!');
    console.log(`- Retrieved Email: ${readUser.email}`);

    // 3. UPDATE CUSTOMER
    console.log('\nStep 3: Updating customer...');
    const updatedUser = await prisma.user.update({
      where: { id: testUserId },
      data: {
        phone: '0987654321',
        is_active: false,
        customer_profile: {
          update: {
            full_name: 'CRUD Test Customer Updated',
            allergies: 'Acrylic monomer, Latex',
            notes: 'Prefer warm water wash, square shape nails only.',
          },
        },
      },
      include: {
        customer_profile: true,
      },
    });
    console.log('✔ Customer updated successfully!');
    console.log(`- New Name: ${updatedUser.customer_profile?.full_name}`);
    console.log(`- New Phone: ${updatedUser.phone}`);
    console.log(`- New Allergies: ${updatedUser.customer_profile?.allergies}`);
    console.log(`- Active Status: ${updatedUser.is_active}`);

    // 4. DELETE CUSTOMER (Cascade Verification)
    console.log('\nStep 4: Deleting customer and checking cascade...');
    await prisma.user.delete({
      where: { id: testUserId },
    });

    const checkUser = await prisma.user.findUnique({ where: { id: testUserId } });
    const checkProfile = await prisma.customerProfile.findFirst({ where: { user_id: testUserId } });

    if (checkUser !== null || checkProfile !== null) {
      throw new Error('Delete failed: User or profile still exists in database');
    }
    console.log('✔ Customer deleted successfully! Cascade delete confirmed.');
    console.log('--- ALL DB CRUD VALIDATIONS PASSED ---');
  } catch (error) {
    console.error('❌ DB CRUD Validation Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCrud();
