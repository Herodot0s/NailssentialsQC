
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const userId = 1; // Assuming user ID 1 is the staff member in the screenshot
  const staffProfile = await prisma.staffProfile.findFirst({
    where: { user: { role: 'staff' } },
    include: { user: true }
  });

  if (!staffProfile) {
    console.log('No staff profile found');
    return;
  }

  console.log('Testing for Staff:', staffProfile.full_name, '(User ID:', staffProfile.user_id, ')');
  console.log('Baseline in DB:', staffProfile.scheduled_start, 'to', staffProfile.scheduled_end);

  const now = new Date();
  const manilaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayStr = manilaTime.toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00Z');
  const dayOfWeek = today.getUTCDay();

  console.log('Manila Today Str:', todayStr);
  console.log('Day of Week:', dayOfWeek);

  const daySchedule = await prisma.staffSchedule.findUnique({
    where: {
      staff_day_unique: {
        staff_id: staffProfile.id,
        day_of_week: dayOfWeek,
      },
    },
  });

  if (daySchedule) {
    console.log('Found Day Schedule:', daySchedule.start_time, 'to', daySchedule.end_time, '(Active:', daySchedule.is_active, ')');
  } else {
    console.log('No Day Schedule found');
  }

  const finalStart = daySchedule && daySchedule.is_active ? daySchedule.start_time : staffProfile.scheduled_start;
  console.log('Final Scheduled Start:', finalStart);
}

test().finally(() => prisma.$disconnect());
