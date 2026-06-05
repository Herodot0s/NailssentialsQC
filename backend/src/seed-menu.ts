import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- STARTING MENU SEEDING ---');

  // 1. Define Categories
  const categories = [
    { name: 'Nail Services', description: 'Manicures, Pedicures, and Extensions' },
    { name: 'Spa Services', description: 'Hand and Foot Spa, Paraffin' },
    { name: 'Hair Services', description: 'Haircut, Treatment, Color, and Rebond' },
    { name: 'Waxing & Threading', description: 'Face and Body Hair Removal' },
    { name: 'Eyelash Services', description: 'Extensions, Lift, and Removal' },
    { name: 'Addons', description: 'Nail arts and removals' },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    });
  }

  const catMap: Record<string, number> = {};
  const allCats = await prisma.serviceCategory.findMany();
  allCats.forEach((c) => (catMap[c.name] = c.id));

  // 2. Define Services
  const services = [
    // Nail Services
    { category: 'Nail Services', name: 'Classic Manicure', price: 170, duration: 30 },
    { category: 'Nail Services', name: 'Classic Pedicure', price: 200, duration: 45 },
    { category: 'Nail Services', name: 'Gel Manicure', price: 470, duration: 60 },
    { category: 'Nail Services', name: 'Gel Pedicure', price: 570, duration: 60 },
    { category: 'Nail Services', name: 'Nail Extension (Any Length)', price: 1400, duration: 120 },
    { category: 'Nail Services', name: 'Biab Overlay Short', price: 700, duration: 90 },
    { category: 'Nail Services', name: 'Biab Overlay Long', price: 850, duration: 105 },
    { category: 'Nail Services', name: 'Biab Overlay Extra Long', price: 1000, duration: 120 },
    { category: 'Nail Services', name: 'Kids Manicure', price: 150, duration: 20 },
    { category: 'Nail Services', name: 'Kids Pedicure', price: 180, duration: 30 },
    { category: 'Nail Services', name: 'Kids Footspa', price: 250, duration: 30 },

    // Spa Services
    { category: 'Spa Services', name: 'Classic Foot Spa', price: 350, duration: 45 },
    { category: 'Spa Services', name: 'Classic Hand Spa', price: 300, duration: 30 },
    { category: 'Spa Services', name: 'Foot Paraffin Wax', price: 450, duration: 40 },
    { category: 'Spa Services', name: 'Hand Paraffin Wax', price: 400, duration: 30 },
    {
      category: 'Spa Services',
      name: 'Package: Classic Foot spa with pedicure',
      price: 500,
      duration: 75,
    },
    {
      category: 'Spa Services',
      name: 'Package: Foot Spa with Foot Paraffin Wax',
      price: 750,
      duration: 90,
    },

    // Hair Services (Single)
    { category: 'Hair Services', name: 'Haircut', price: 199, duration: 30 },
    { category: 'Hair Services', name: 'Hair Iron', price: 299, duration: 30 },
    { category: 'Hair Services', name: 'Hair Blowdry', price: 249, duration: 30 },
    { category: 'Hair Services', name: 'Hair Spa Organic', price: 699, duration: 60 },
    { category: 'Hair Services', name: 'Balayage with Hair Treatment', price: 3499, duration: 240 },

    // Hair Services (Variants)
    { category: 'Hair Services', name: 'Hair Highlights (Short)', price: 499, duration: 90 },
    { category: 'Hair Services', name: 'Hair Highlights (Medium)', price: 799, duration: 120 },
    { category: 'Hair Services', name: 'Hair Highlights (Long)', price: 999, duration: 150 },
    { category: 'Hair Services', name: 'Hair Color (Roots)', price: 499, duration: 60 },
    { category: 'Hair Services', name: 'Hair Color (Short)', price: 799, duration: 90 },
    { category: 'Hair Services', name: 'Hair Color (Medium)', price: 899, duration: 120 },
    { category: 'Hair Services', name: 'Hair Color (Long)', price: 999, duration: 150 },
    { category: 'Hair Services', name: 'Hair Rebond (Short)', price: 999, duration: 180 },
    { category: 'Hair Services', name: 'Hair Rebond (Medium)', price: 1599, duration: 210 },
    { category: 'Hair Services', name: 'Hair Rebond (Long)', price: 1999, duration: 240 },

    // Waxing & Threading (Female Prices)
    { category: 'Waxing & Threading', name: 'Eyebrow Shading', price: 150, duration: 15 },
    { category: 'Waxing & Threading', name: 'Eyebrow Threading', price: 250, duration: 20 },
    { category: 'Waxing & Threading', name: 'Eyebrow Waxing', price: 250, duration: 20 },
    { category: 'Waxing & Threading', name: 'Upper Lip Threading', price: 200, duration: 15 },
    { category: 'Waxing & Threading', name: 'Under Arm Waxing', price: 250, duration: 30 },
    { category: 'Waxing & Threading', name: 'Brazilian Wax', price: 800, duration: 45 },
    { category: 'Waxing & Threading', name: 'Full Legs', price: 700, duration: 60 },

    // Eyelash Services
    { category: 'Eyelash Services', name: 'Classic Eyelash', price: 499, duration: 60 },
    { category: 'Eyelash Services', name: 'Volume Eyelash', price: 799, duration: 90 },
    { category: 'Eyelash Services', name: 'Cat Eye Eyelash', price: 999, duration: 90 },
    { category: 'Eyelash Services', name: 'Hybrid Eyelash', price: 1099, duration: 120 },
    { category: 'Eyelash Services', name: 'Lash Lift', price: 649, duration: 45 },

    // Addons
    { category: 'Addons', name: 'Nail Art (Chrome/Cat eye/Ombre)', price: 200, duration: 20 },
    { category: 'Addons', name: 'Soft Gel Extension Removal', price: 150, duration: 30 },
    { category: 'Addons', name: 'Gel Removal (In-House)', price: 0, duration: 15 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: {
        name_category_id: {
          name: s.name,
          category_id: catMap[s.category],
        },
      },
      update: {
        price: s.price,
        duration_minutes: s.duration,
      },
      create: {
        name: s.name,
        price: s.price,
        duration_minutes: s.duration,
        category_id: catMap[s.category],
      },
    });
  }

  console.log(`✓ Seeded ${services.length} services across ${categories.length} categories.`);
  console.log('--- MENU SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
