const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'staff' },
    include: { staff_profile: true }
  });

  console.log('--- Staff Users ---');
  users.forEach(u => {
    console.log(`User ID: ${u.id}, Username: ${u.username}, StaffProfileID: ${u.staff_profile?.id}`);
  });

  const appointments = await prisma.appointment.findMany({
    include: {
      items: {
        include: {
          staff: true
        }
      }
    }
  });

  console.log('\n--- Appointments ---');
  appointments.forEach(a => {
    console.log(`Apt ID: ${a.id}, Date: ${a.appointment_date.toISOString()}, Status: ${a.status}`);
    a.items.forEach(i => {
      console.log(`  - Item ID: ${i.id}, Service: ${i.service_id}, Staff ID: ${i.staff_id}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
