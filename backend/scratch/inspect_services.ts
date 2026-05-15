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
    const services = await prisma.service.findMany({
      include: { category: true }
    });
    console.log('SERVICES_JSON:' + JSON.stringify(services.map(s => ({ id: s.id, name: s.name, category: s.category.name }))));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

inspect();
