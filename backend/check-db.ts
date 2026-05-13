import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
  try {
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    const categoryCount = await prisma.serviceCategory.count();
    const exhibitCount = await (prisma as any).exhibit.count();

    console.log(`Database Statistics:`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Services: ${serviceCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Exhibits: ${exhibitCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({ select: { username: true, role: true } });
      console.log('Available Users:', users);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
