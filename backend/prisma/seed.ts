import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('Seeding test accounts...');
  const saltRounds = 10;
  const hashedUserPassword = await bcrypt.hash('password123', saltRounds);

  // 1. Test Customer
  const customerUser = await prisma.user.upsert({
    where: { username: 'test_customer' },
    update: {},
    create: {
      username: 'test_customer',
      password_hash: hashedUserPassword,
      role: Role.customer,
      customer_profile: {
        create: {
          full_name: 'Test Customer',
          notes: 'Regular customer'
        }
      }
    }
  });

  // 2. Test Staff (Technician)
  const staffUser = await prisma.user.upsert({
    where: { username: 'test_staff' },
    update: {},
    create: {
      username: 'test_staff',
      password_hash: hashedUserPassword,
      role: Role.staff,
      staff_profile: {
        create: {
          full_name: 'Test Staff',
          specializations: 'Nail Art',
          daily_target: 6000.00
        }
      }
    }
  });

  // 3. Test Manager
  const managerUser = await prisma.user.upsert({
    where: { username: 'test_manager' },
    update: {},
    create: {
      username: 'test_manager',
      password_hash: hashedUserPassword,
      role: Role.manager,
      staff_profile: {
        create: {
          full_name: 'Test Manager',
          specializations: 'Management',
          daily_target: 0.00
        }
      }
    }
  });

  console.log('Test accounts created successfully!');

  // 4. Categories
  const categories = [
    { name: 'Nails', description: 'Manicure, pedicure, and nail art services' },
    { name: 'Hair', description: 'Hair styling, treatment, and coloring' },
    { name: 'Waxing', description: 'Hair removal services' },
    { name: 'Lashes', description: 'Eyelash extensions and lift' },
  ];

  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
  }

  // Fetch created categories to get IDs
  const dbCategories = await prisma.serviceCategory.findMany();
  const catMap = Object.fromEntries(dbCategories.map(c => [c.name, c.id]));

  // 5. Services
  const services = [
    // Nails
    { category_id: catMap['Nails'], name: 'Gel Manicure', description: 'Long-lasting gel polish with cleaning', duration_minutes: 60, price: 500, is_popular: true },
    { category_id: catMap['Nails'], name: 'Pedicure', description: 'Relaxing foot soak and cleaning', duration_minutes: 45, price: 400 },
    { category_id: catMap['Nails'], name: 'Nail Art', description: 'Custom designs per nail', duration_minutes: 30, price: 100 },
    
    // Hair
    { category_id: catMap['Hair'], name: 'Hair Spa', description: 'Deep conditioning treatment', duration_minutes: 60, price: 800 },
    { category_id: catMap['Hair'], name: 'Haircut', description: 'Professional styling and cut', duration_minutes: 45, price: 350 },
    
    // Waxing
    { category_id: catMap['Waxing'], name: 'Underarm Wax', description: 'Smooth hair removal', duration_minutes: 20, price: 250 },
    { category_id: catMap['Waxing'], name: 'Full Leg Wax', description: 'Complete leg hair removal', duration_minutes: 45, price: 600 },
    
    // Lashes
    { category_id: catMap['Lashes'], name: 'Classic Extensions', description: 'Natural-looking lash set', duration_minutes: 90, price: 1200, is_popular: true },
    { category_id: catMap['Lashes'], name: 'Lash Lift', description: 'Semi-permanent curl for natural lashes', duration_minutes: 60, price: 800 },
  ];

  console.log('Seeding services...');
  for (const svc of services) {
    // Upsert using name and category_id
    await prisma.service.upsert({
      where: { 
        name_category_id: {
          name: svc.name,
          category_id: svc.category_id
        }
      },
      update: {
        description: svc.description,
        duration_minutes: svc.duration_minutes,
        price: svc.price,
        is_popular: svc.is_popular
      },
      create: svc,
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
