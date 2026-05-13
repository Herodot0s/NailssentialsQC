import prisma from './src/utils/prisma';
import { addDays, setHours, setMinutes, format } from 'date-fns';

async function main() {
  console.log('Seeding attendance data...');

  // Get all staff profiles
  const staffMembers = await prisma.staffProfile.findMany({
    include: {
      schedules: true,
    },
  });

  if (staffMembers.length === 0) {
    console.log('No staff members found to seed attendance for.');
    return;
  }

  const today = new Date(); // e.g. 2026-05-06
  const pastDays = 14;

  for (const staff of staffMembers) {
    for (let i = pastDays; i >= 0; i--) {
      const date = addDays(today, -i);

      // Get schedule for this day of week
      const dOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // matching the frontend logic (0-6 but adjusted)
      // wait, in database StaffSchedule is 0-6 or 1-7?
      // schema says: `day_of_week Int      // 0-6 (Sunday-Saturday)`
      const dbDayOfWeek = date.getDay();

      const schedule = staff.schedules.find((s) => s.day_of_week === dbDayOfWeek && s.is_active);

      if (!schedule) {
        // Off duty, skip
        continue;
      }

      // 10% chance to be absent (unless it's today)
      if (i > 0 && Math.random() < 0.1) {
        // absent
        const startOfDate = new Date(date);
        startOfDate.setHours(0, 0, 0, 0);

        await prisma.attendance.upsert({
          where: {
            uk_staff_date: {
              staff_id: staff.id,
              date: startOfDate,
            },
          },
          update: {
            check_in: null,
            check_out: null,
            tardiness_minutes: 0,
            deduction_amount: 500,
            scheduled_start: schedule.start_time,
            scheduled_end: schedule.end_time,
          },
          create: {
            staff_id: staff.id,
            date: startOfDate,
            check_in: null,
            check_out: null,
            tardiness_minutes: 0,
            deduction_amount: 500,
            scheduled_start: schedule.start_time,
            scheduled_end: schedule.end_time,
          },
        });
        continue;
      }

      // Present
      const [startH, startM] = schedule.start_time.split(':').map(Number);
      const [endH, endM] = schedule.end_time.split(':').map(Number);

      // Random arrival: between 15 mins before to 45 mins after
      const arrivalOffsetMins = Math.floor(Math.random() * 60) - 15;
      const checkInTime = new Date(date);
      checkInTime.setHours(startH, startM + arrivalOffsetMins, 0, 0);

      const tardiness = Math.max(0, arrivalOffsetMins);
      const deduction = tardiness > 0 ? Math.floor(tardiness / 15) * 50 : 0; // 50 per 15 mins late

      // Check out time
      const checkOutTime = new Date(date);
      const departOffsetMins = Math.floor(Math.random() * 30); // 0-30 mins after end
      checkOutTime.setHours(endH, endM + departOffsetMins, 0, 0);

      const startOfDate = new Date(date);
      startOfDate.setHours(0, 0, 0, 0);

      await prisma.attendance.upsert({
        where: {
          uk_staff_date: {
            staff_id: staff.id,
            date: startOfDate,
          },
        },
        update: {
          check_in: checkInTime,
          check_out: i === 0 ? null : checkOutTime, // If today, haven't checked out yet
          tardiness_minutes: tardiness,
          deduction_amount: deduction,
          scheduled_start: schedule.start_time,
          scheduled_end: schedule.end_time,
        },
        create: {
          staff_id: staff.id,
          date: startOfDate,
          check_in: checkInTime,
          check_out: i === 0 ? null : checkOutTime, // If today, haven't checked out yet
          tardiness_minutes: tardiness,
          deduction_amount: deduction,
          scheduled_start: schedule.start_time,
          scheduled_end: schedule.end_time,
        },
      });
    }
  }

  console.log('Attendance seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
