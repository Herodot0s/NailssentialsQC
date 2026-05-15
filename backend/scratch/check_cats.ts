import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.serviceCategory.findMany();
  console.log('CATS:', cats);
}
main().finally(() => prisma.$disconnect());
