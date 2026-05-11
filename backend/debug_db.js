async function main() {
  const prisma = require('./src/utils/prisma').default;

  const staff = await prisma.staffProfile.findMany({ take: 5 });
  console.log('--- Staff Profiles ---');
  staff.forEach(s => console.log(`id=${s.id} user_id=${s.user_id} name=${s.full_name}`));

  const apts = await prisma.appointment.findMany({
    include: { items: { include: { staff: true } }, customer: true },
    orderBy: { id: 'desc' },
    take: 10
  });
  console.log('\n--- Recent Appointments ---');
  if (apts.length === 0) { console.log('No appointments'); process.exit(0); }
  apts.forEach(a => {
    console.log(`ID=${a.id} date=${a.appointment_date} status=${a.status} customer=${a.customer?.full_name || 'N/A'}`);
    a.items.forEach(i => console.log(`  item: staff_id=${i.staff_id} staff=${i.staff?.full_name} service=${i.service?.name || 'N/A'}`));
  });
}
main().catch(console.error).finally(() => process.exit(0));