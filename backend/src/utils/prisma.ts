import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton to prevent multiple instances in serverless environments.
 * This pattern ensures that a single Prisma instance is reused across hot reloads in development
 * and function invocations in serverless deployments.
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = global.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
