const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staffProfile.findMany({
    include: { user: true }
  });
  const services = await prisma.service.findMany({
    take: 5
  });
  const customers = await prisma.customerProfile.findMany({
    take: 2
  });

  console.log('--- STAFF ---');
  staff.forEach(s => console.log(`${s.id}: ${s.full_name} (${s.user.role})`));
  console.log('\n--- SERVICES ---');
  services.forEach(s => console.log(`${s.id}: ${s.name} - ${s.price}`));
  console.log('\n--- CUSTOMERS ---');
  customers.forEach(c => console.log(`${c.id}: ${c.full_name}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
