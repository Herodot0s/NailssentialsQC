import prisma from '../../src/utils/prisma';

/**
 * Truncates all tables in the public schema of the database,
 * except for the Prisma migrations table.
 * Uses CASCADE to handle foreign key constraints.
 */
export const truncateAllTables = async () => {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' 
    AND tablename != '_prisma_migrations';
  `;

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
  }
};
