const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.user.findMany({
    where: { role: { in: ['staff', 'manager'] } },
    include: { staff_profile: true }
  });
  console.log('Staff Count:', staff.length);
  staff.forEach(s => {
    console.log(`- ${s.username}: Profile? ${!!s.staff_profile}, Name: ${s.staff_profile?.full_name}`);
  });
}

main().finally(() => prisma.$disconnect());
