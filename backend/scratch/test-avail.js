const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parse, addMinutes, startOfDay, endOfDay, areIntervalsOverlapping } = require('date-fns');

const getFullDate = (dateStr, timeStr) => {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
};

async function main() {
  const dateStr = '2026-05-06'; // Tomorrow
  const OPERATING_HOURS = { start: 12, end: 22 };
  const allSlots = [];
  for (let h = OPERATING_HOURS.start; h < OPERATING_HOURS.end; h++) {
    allSlots.push(`${h.toString().padStart(2, '0')}:00`);
  }

  const technicians = await prisma.staffProfile.findMany({ where: { is_available: true } });
  console.log('Techs:', technicians.length);

  const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const appointmentItems = await prisma.appointmentItem.findMany({
    where: {
      appointment: {
        appointment_date: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      },
      status: { in: ['pending', 'confirmed', 'in_progress'] },
    },
  });
  console.log('Conflicts:', appointmentItems.length);

  const results = allSlots.map((slotTime) => {
    const slotStart = getFullDate(dateStr, slotTime);
    const slotEnd = addMinutes(slotStart, 59);

    const availableTechnicians = technicians.filter((tech) => {
      const techItems = appointmentItems.filter((item) => item.staff_id === tech.id);
      const hasConflict = techItems.some((item) => {
        const itemStart = getFullDate(dateStr, item.start_time);
        const itemEnd = getFullDate(dateStr, item.end_time);
        return areIntervalsOverlapping(
          { start: slotStart, end: slotEnd },
          { start: itemStart, end: itemEnd },
        );
      });
      return !hasConflict;
    });

    return { time: slotTime, available: availableTechnicians.length > 0 };
  });

  console.log('Results (first 5):', results.slice(0, 5));
}

main().finally(() => prisma.$disconnect());
