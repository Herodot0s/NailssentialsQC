const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const technicians = await prisma.staffProfile.findMany();
  console.log('Technicians availability:');
  technicians.forEach(t => {
    console.log(`- ${t.full_name}: is_available=${t.is_available}`);
  });
}

main().finally(() => prisma.$disconnect());
