
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const staff = await prisma.staffProfile.findFirst({
    include: {
      schedules: true,
      user: true
    }
  });

  if (!staff) {
    console.log('No staff found');
    return;
  }

  console.log('Staff:', staff.full_name);
  console.log('Baseline:', staff.scheduled_start, 'to', staff.scheduled_end);
  console.log('Schedules:', staff.schedules.map(s => ({
    day: s.day_of_week,
    start: s.start_time,
    end: s.end_time,
    active: s.is_active
  })));

  const now = new Date();
  const manilaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const dateStr = manilaTime.toISOString().split('T')[0];
  const today = new Date(dateStr);
  console.log('Server Date Object (from Manila Str):', today.toISOString());
  console.log('Day of Week (UTCDay):', today.getUTCDay());

  const att = await prisma.attendance.findUnique({
    where: {
      uk_staff_date: {
        staff_id: staff.id,
        date: today
      }
    }
  });
  console.log('Today Attendance:', att ? { start: att.scheduled_start, end: att.scheduled_end } : 'None');
}

check();
