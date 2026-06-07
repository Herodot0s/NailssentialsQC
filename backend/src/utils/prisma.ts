import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config(); // First try local .env
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Then try root .env
dotenv.config({ path: path.join(__dirname, '../../../.env') }); // Then try one more level up just in case

/**
 * Prisma client singleton to prevent multiple instances in serverless environments.
 */
const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    console.error('[prisma]: DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = global.prisma ?? prismaClientSingleton();

export default prisma;

global.prisma = prisma;
