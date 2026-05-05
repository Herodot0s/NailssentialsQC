import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServices() {
  try {
    // Users & staff already exist from prior run. Just add services + exhibits.
    
    const staffProfiles = await prisma.staffProfile.findMany({ select: { id: true, full_name: true } });
    console.log('Found staff:', staffProfiles.map(s => `${s.id}: ${s.full_name}`));

    if (staffProfiles.length === 0) {
      console.error('No staff found. Run full seed first.');
      return;
    }

    // Create Service Categories (upsert to handle re-runs)
    const catNails = await prisma.serviceCategory.upsert({
      where: { name: 'Nail Art' },
      update: {},
      create: { name: 'Nail Art', description: 'Creative nail designs' },
    });
    const catManicure = await prisma.serviceCategory.upsert({
      where: { name: 'Manicure' },
      update: {},
      create: { name: 'Manicure', description: 'Hand and nail care' },
    });
    const catPedicure = await prisma.serviceCategory.upsert({
      where: { name: 'Pedicure' },
      update: {},
      create: { name: 'Pedicure', description: 'Foot and toe care' },
    });
    console.log('✓ Categories ready');

    // Create Services
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
    console.log('✓ Services created');

    // Create Exhibits
    const exhibits = [
      {
        title: 'Midnight Bloom Collection',
        image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[0].id,
        service_id: svcGelNails.id,
      },
      {
        title: 'French Elegance Reimagined',
        image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles.length > 1 ? staffProfiles[1].id : staffProfiles[0].id,
        service_id: svcFrenchTips.id,
      },
      {
        title: 'Golden Hour Ombré',
        image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[0].id,
        service_id: svcGelNails.id,
      },
      {
        title: 'Crystal Lattice Design',
        image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles.length > 2 ? staffProfiles[2].id : staffProfiles[0].id,
        service_id: svcClassicMani.id,
      },
      {
        title: 'Cherry Blossom Spring Set',
        image_url: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles.length > 1 ? staffProfiles[1].id : staffProfiles[0].id,
        service_id: svcSpaPedi.id,
      },
      {
        title: 'Minimalist Geometry',
        image_url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[0].id,
        service_id: svcFrenchTips.id,
      },
    ];

    for (const ex of exhibits) {
      const created = await prisma.exhibit.create({ data: ex });
      console.log(`✓ Exhibit: "${created.title}" (ID: ${created.id})`);
    }

    console.log('\n══════════════════════════════════════');
    console.log('  SEED COMPLETE');
    console.log('══════════════════════════════════════');
    console.log(`  6 exhibits seeded across 4 services`);
    console.log('\nLogin Credentials:');
    console.log('  Manager:  manager1 / manager123');
    console.log('  Staff:    janedoe / staff123');
    console.log('  Customer: testcustomer / customer123');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();
