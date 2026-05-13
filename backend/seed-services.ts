import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

async function seedServices() {
  try {
    console.log('=== RESETTING SERVICE MENU ===\n');

    // Step 1: Delete all ServicePackages and ServicePackageItems first
    const deletedPackageItems = await prisma.servicePackageItem.deleteMany({});
    console.log(`✓ Deleted ${deletedPackageItems.count} ServicePackageItem rows`);

    const deletedPackages = await prisma.servicePackage.deleteMany({});
    console.log(`✓ Deleted ${deletedPackages.count} ServicePackage rows`);

    // Step 2: Delete exhibits (references service_id)
    const deletedExhibits = await prisma.exhibit.deleteMany({});
    console.log(`✓ Deleted ${deletedExhibits.count} Exhibit rows`);

    // Step 3: Delete Reviews (references appointment_item_id) before AppointmentItems
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`✓ Deleted ${deletedReviews.count} Review rows`);

    // Step 4: Delete AppointmentItems (references service_id) before we can delete services
    const deletedAppointmentItems = await prisma.appointmentItem.deleteMany({});
    console.log(`✓ Deleted ${deletedAppointmentItems.count} AppointmentItem rows`);

    // Step 5: Delete Commissions (references service_id) before we can delete services
    const deletedCommissions = await prisma.commission.deleteMany({});
    console.log(`✓ Deleted ${deletedCommissions.count} Commission rows`);

    // Step 6: Now safe to delete all Services
    const deletedServices = await prisma.service.deleteMany({});
    console.log(`✓ Deleted ${deletedServices.count} Service rows`);

    // Step 7: Delete all ServiceCategories
    const deletedCategories = await prisma.serviceCategory.deleteMany({});
    console.log(`✓ Deleted ${deletedCategories.count} ServiceCategory rows`);

    console.log('\n--- Creating New Categories ---\n');

    // Step 7: Create only the 4 allowed categories
    const catNails = await prisma.serviceCategory.upsert({
      where: { name: 'Nails' },
      update: {},
      create: {
        name: 'Nails',
        description: 'Nail services and addons',
      },
    });
    console.log(`✓ Category: Nails (ID: ${catNails.id})`);

    const catHandSpa = await prisma.serviceCategory.upsert({
      where: { name: 'Hand Spa' },
      update: {},
      create: {
        name: 'Hand Spa',
        description: 'Luxurious hand treatments and spa services',
      },
    });
    console.log(`✓ Category: Hand Spa (ID: ${catHandSpa.id})`);

    const catFootSpa = await prisma.serviceCategory.upsert({
      where: { name: 'Foot Spa' },
      update: {},
      create: {
        name: 'Foot Spa',
        description: 'Relaxing foot treatments and spa services',
      },
    });
    console.log(`✓ Category: Foot Spa (ID: ${catFootSpa.id})`);

    const catWaxing = await prisma.serviceCategory.upsert({
      where: { name: 'Waxing & Threading' },
      update: {},
      create: {
        name: 'Waxing & Threading',
        description: 'Hair removal services',
      },
    });
    console.log(`✓ Category: Waxing & Threading (ID: ${catWaxing.id})`);

    console.log('\n══════════════════════════════════════');
    console.log('  SERVICE MENU RESET COMPLETE');
    console.log('══════════════════════════════════════');
    console.log('  Categories created: 4');
    console.log('    - Nails');
    console.log('    - Hand Spa');
    console.log('    - Foot Spa');
    console.log('    - Waxing & Threading');
    console.log('  Services created: 0 (add via manager account)');
    console.log('  All packages deleted');
    console.log('  All old categories/services deleted');
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
