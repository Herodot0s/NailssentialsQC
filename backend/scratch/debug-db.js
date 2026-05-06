const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true } });
  console.log('Users:', users);
  
  const schedules = await prisma.staffSchedule.findMany();
  console.log('Schedules:', schedules);
}

main().finally(() => prisma.$disconnect());
