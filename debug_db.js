const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Try to find the generated client
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  console.log('Checking for date:', today.toISOString().split('T')[0]);

  const staff = await prisma.staffProfile.findMany({
    include: {
      user: {
        select: {
          username: true,
          role: true
        }
      }
    }
  });

  console.log('\n--- Staff Profiles ---');
  staff.forEach(s => {
    console.log(`ID: ${s.id}, Name: ${s.full_name}, User: ${s.user.username}, Role: ${s.user.role}`);
  });

  const appointments = await prisma.appointment.findMany({
    include: {
      items: {
        include: {
          service: true,
          staff: true
        }
      },
      customer: true
    }
  });

  console.log('\n--- All Appointments ---');
  if (appointments.length === 0) {
    console.log('No appointments found in database.');
  } else {
    appointments.forEach(a => {
      console.log(`ID: ${a.id}, Date: ${a.appointment_date.toISOString().split('T')[0]}, Customer: ${a.customer.full_name}, Status: ${a.status}`);
      a.items.forEach(i => {
        console.log(`  - Item ID: ${i.id}, Service: ${i.service.name}, Staff: ${i.staff.full_name} (ID: ${i.staff_id}), Status: ${i.status}`);
      });
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
