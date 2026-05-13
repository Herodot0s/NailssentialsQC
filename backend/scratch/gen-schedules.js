const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- GENERATING STAFF SCHEDULES (USING STAFF PROFILE ID) ---');

  const staffProfiles = await prisma.staffProfile.findMany({
    include: { user: true },
  });

  console.log(`Found ${staffProfiles.length} staff profiles.`);

  for (const sp of staffProfiles) {
    console.log(
      `Processing profile: ${sp.full_name} (Profile ID: ${sp.id}, User: ${sp.user.username})`,
    );
    for (let day = 1; day <= 6; day++) {
      try {
        await prisma.staffSchedule.upsert({
          where: {
            staff_day_unique: {
              staff_id: sp.id,
              day_of_week: day,
            },
          },
          update: {
            start_time: '12:00',
            end_time: '22:00',
            is_active: true,
          },
          create: {
            staff_id: sp.id,
            day_of_week: day,
            start_time: '12:00',
            end_time: '22:00',
            is_active: true,
          },
        });
      } catch (err) {
        console.error(`Error for profile ${sp.id} day ${day}:`, err.message);
      }
    }
  }
  console.log('--- SCHEDULE GENERATION COMPLETED ---');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
