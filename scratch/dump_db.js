
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const allSchedules = await prisma.staffSchedule.findMany({
    include: {
      staff: true
    }
  });

  console.log('Total Schedules:', allSchedules.length);
  allSchedules.forEach(s => {
    console.log(`Staff: ${s.staff.full_name} (ID: ${s.staff_id}), Day: ${s.day_of_week}, Time: ${s.start_time}-${s.end_time}, Active: ${s.is_active}`);
  });

  const allStaff = await prisma.staffProfile.findMany();
  console.log('All Staff Profiles:', allStaff.map(s => ({ id: s.id, name: s.full_name, baseline: s.scheduled_start })));
}

check();
