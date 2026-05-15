import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

async function inspect() {
  try {
    const categories = await prisma.serviceCategory.findMany();
    console.log('CATEGORIES_JSON:' + JSON.stringify(categories.map(c => ({ id: c.id, name: c.name }))));

    const staff = await prisma.staffProfile.findMany({
      include: { user: { select: { username: true } } }
    });
    console.log('STAFF_JSON:' + JSON.stringify(staff.map(s => ({ id: s.id, name: s.full_name, specs: s.specializations }))));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

inspect();
