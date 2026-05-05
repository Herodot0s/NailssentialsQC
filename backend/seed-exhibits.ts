import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAll() {
  try {
    console.log('Seeding database for UAT testing...\n');

    // 1. Create Manager User
    const managerHash = await bcrypt.hash('manager123', 10);
    const managerUser = await prisma.user.create({
      data: {
        username: 'manager1',
        email: 'manager@nailssentials.com',
        password_hash: managerHash,
        role: 'manager',
      },
    });
    const managerProfile = await prisma.staffProfile.create({
      data: {
        user_id: managerUser.id,
        full_name: 'Maria Santos',
        specializations: 'Management, Nail Art',
      },
    });
    console.log(`✓ Manager: manager1 / manager123 (ID: ${managerUser.id})`);

    // 2. Create Staff Users
    const staffHash = await bcrypt.hash('staff123', 10);
    const staff1User = await prisma.user.create({
      data: {
        username: 'janedoe',
        email: 'jane@nailssentials.com',
        password_hash: staffHash,
        role: 'staff',
      },
    });
    const staff1Profile = await prisma.staffProfile.create({
      data: {
        user_id: staff1User.id,
        full_name: 'Jane Doe',
        specializations: 'Gel Nails, Nail Art',
      },
    });

    const staff2User = await prisma.user.create({
      data: {
        username: 'anareyes',
        email: 'ana@nailssentials.com',
        password_hash: staffHash,
        role: 'staff',
      },
    });
    const staff2Profile = await prisma.staffProfile.create({
      data: {
        user_id: staff2User.id,
        full_name: 'Ana Reyes',
        specializations: 'Manicure, Pedicure, French Tips',
      },
    });
    console.log(`✓ Staff: janedoe / staff123, anareyes / staff123`);

    // 3. Create Customer
    const customerHash = await bcrypt.hash('customer123', 10);
    const customerUser = await prisma.user.create({
      data: {
        username: 'testcustomer',
        email: 'customer@test.com',
        password_hash: customerHash,
        role: 'customer',
      },
    });
    await prisma.customerProfile.create({
      data: {
        user_id: customerUser.id,
        full_name: 'Test Customer',
      },
    });
    console.log(`✓ Customer: testcustomer / customer123`);

    // 4. Create Service Categories
    const catNails = await prisma.serviceCategory.create({
      data: { name: 'Nail Art', description: 'Creative nail designs' },
    });
    const catManicure = await prisma.serviceCategory.create({
      data: { name: 'Manicure', description: 'Hand and nail care' },
    });
    const catPedicure = await prisma.serviceCategory.create({
      data: { name: 'Pedicure', description: 'Foot and toe care' },
    });
    console.log(`✓ Categories: Nail Art, Manicure, Pedicure`);

    // 5. Create Services
    const svcGelNails = await prisma.service.create({
      data: { name: 'Gel Nail Art', price: 800, duration_minutes: 90, category_id: catNails.id, is_popular: true },
    });
    const svcFrenchTips = await prisma.service.create({
      data: { name: 'French Tips', price: 500, duration_minutes: 60, category_id: catManicure.id, is_popular: true },
    });
    const svcClassicMani = await prisma.service.create({
      data: { name: 'Classic Manicure', price: 350, duration_minutes: 45, category_id: catManicure.id, is_popular: true },
    });
    const svcSpaPedi = await prisma.service.create({
      data: { name: 'Spa Pedicure', price: 600, duration_minutes: 75, category_id: catPedicure.id },
    });
    console.log(`✓ Services: Gel Nail Art, French Tips, Classic Manicure, Spa Pedicure`);

    // 6. Create Exhibits
    const exhibits = [
      {
        title: 'Midnight Bloom Collection',
        image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1200',
        staff_id: staff1Profile.id,
        service_id: svcGelNails.id,
      },
      {
        title: 'French Elegance Reimagined',
        image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=1200',
        staff_id: staff2Profile.id,
        service_id: svcFrenchTips.id,
      },
      {
        title: 'Golden Hour Ombré',
        image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1200',
        staff_id: staff1Profile.id,
        service_id: svcGelNails.id,
      },
      {
        title: 'Crystal Lattice Design',
        image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1200',
        staff_id: managerProfile.id,
        service_id: svcClassicMani.id,
      },
      {
        title: 'Cherry Blossom Spring Set',
        image_url: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=1200',
        staff_id: staff2Profile.id,
        service_id: svcSpaPedi.id,
      },
      {
        title: 'Minimalist Geometry',
        image_url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&q=80&w=1200',
        staff_id: staff1Profile.id,
        service_id: svcFrenchTips.id,
      },
    ];

    for (const ex of exhibits) {
      const created = await prisma.exhibit.create({ data: ex });
      console.log(`✓ Exhibit: "${created.title}" (ID: ${created.id})`);
    }

    console.log('\n══════════════════════════════════════');
    console.log('  DATABASE SEEDED SUCCESSFULLY');
    console.log('══════════════════════════════════════');
    console.log('\nLogin Credentials:');
    console.log('  Manager:  manager1 / manager123');
    console.log('  Staff 1:  janedoe / staff123');
    console.log('  Staff 2:  anareyes / staff123');
    console.log('  Customer: testcustomer / customer123');
    console.log(`\n  6 exhibits seeded across 4 services.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAll();
