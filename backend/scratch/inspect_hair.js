const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const categories = await prisma.serviceCategory.findMany();
  console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name })));

  const staff = await prisma.staffProfile.findMany({
    include: { user: true }
  });
  console.log('Staff Specializations:', staff.map(s => ({ id: s.id, name: s.full_name, specs: s.specializations })));

  await prisma.$disconnect();
}

inspect();
