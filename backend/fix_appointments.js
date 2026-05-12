async function main() {
  const prisma = require('./src/utils/prisma').default;

  // Show current appointmentItem staff_id values
  const items = await prisma.appointmentItem.findMany({
    include: { staff: { include: { user: true } }, appointment: { include: { customer: true } } }
  });
  console.log('BEFORE:');
  items.forEach(i => console.log(`  Item${i.id}: staff_id=${i.staff_id} (StaffProfile.id=${i.staff.id}, User.id=${i.staff.user_id}) -> ${i.staff.full_name} | Apt${i.appointment.id} customer=${i.appointment.customer.full_name}`));

  // All items need to point to StaffProfile.id=1 (Test Staff, user_id=2)
  const result = await prisma.appointmentItem.updateMany({
    where: { id: { in: items.map(i => i.id) } },
    data: { staff_id: 1 }
  });
  console.log(`\nUpdated ${result.count} items to staff_id=1 (Test Staff)`);

  // Verify
  const updated = await prisma.appointmentItem.findMany({ include: { staff: true, appointment: { include: { customer: true } } } });
  console.log('\nAFTER:');
  updated.forEach(i => console.log(`  Item${i.id}: staff_id=${i.staff_id} -> ${i.staff.full_name} | Apt${i.appointment.id} customer=${i.appointment.customer.full_name}`));
}
main().catch(console.error).finally(() => process.exit(0));