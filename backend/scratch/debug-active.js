const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const now = new Date();
    console.log('--- ACTIVE PACKAGES TEST ---');
    console.log('Current time:', now.toISOString());
    const packages = await prisma.servicePackage.findMany({
      where: {
        is_active: true,
        OR: [{ valid_from: null }, { valid_from: { lte: now } }],
        AND: [
          {
            OR: [{ valid_until: null }, { valid_until: { gte: now } }],
          },
        ],
      },
    });
    console.log('Found:', packages.length);
    if (packages.length > 0) {
      console.log('Sample:', packages[0].name, 'is_active:', packages[0].is_active);
    } else {
      const all = await prisma.servicePackage.findMany();
      console.log('All packages in DB:', all.length);
      if (all.length > 0) {
        console.log(
          'Sample from ALL:',
          all[0].name,
          'is_active:',
          all[0].is_active,
          'from:',
          all[0].valid_from,
          'until:',
          all[0].valid_until,
        );
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
