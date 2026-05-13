const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- DB TEST ---');
    const packages = await prisma.servicePackage.findMany({
      include: {
        items: {
          include: {
            service: {
              include: { category: { select: { name: true } } },
            },
          },
        },
        appointment_items: { select: { id: true } },
      },
    });
    console.log('Success! Count:', packages.length);
    if (packages.length > 0) {
      console.log('Sample Name:', packages[0].name);
      console.log('Items Count:', packages[0].items.length);
    }
  } catch (err) {
    console.error('Error details:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
