import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing ServicePackage query...');
    const packages = await prisma.servicePackage.findMany({
      include: {
        items: {
          include: {
            service: {
              include: { category: { select: { name: true } } }
            }
          }
        },
        appointment_items: { select: { id: true } }
      },
      orderBy: { display_order: 'asc' }
    });
    console.log('Query successful. Count:', packages.length);
    console.log('Data sample:', JSON.stringify(packages.slice(0, 1), null, 2));
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
