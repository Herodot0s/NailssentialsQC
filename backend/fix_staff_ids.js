async function main() {
  const prisma = require('./src/utils/prisma').default;

  // Fix: appointments where staff_id is User.id instead of StaffProfile.id
  const items = await prisma.appointmentItem.findMany({
    include: { staff: true, appointment: true },
    where: { staff_id: { gt: 0 } },
  });

  let fixed = 0;
  for (const item of items) {
    // staff.user_id is the User.id; staff.id is StaffProfile.id
    // If staff_id matches the StaffProfile.id directly, it's already correct
    // If staff_id matches staff.user_id, we need to keep it as-is since appointments already use StaffProfile.id
    // Actually let me re-check: the seed has staff_id=2 for appointments, and StaffProfile id=2 belongs to Test Manager user_id=3
    // So staff_id=2 means StaffProfile.id=2, which is correct
    // The problem is when a customer books with User.id passed as staffId
    console.log(
      `Item ${item.id}: staff_id=${item.staff_id}, staff.user_id=${item.staff?.user_id}, staff.id=${item.staff?.id}`,
    );
  }

  // Now let's check the User.id vs StaffProfile.id mapping
  const users = await prisma.user.findMany({ where: { role: { in: ['staff', 'manager'] } } });
  console.log('\n--- User -> StaffProfile mapping ---');
  for (const u of users) {
    const sp = await prisma.staffProfile.findUnique({ where: { user_id: u.id } });
    console.log(`User.id=${u.id} (${u.username}) -> StaffProfile.id=${sp?.id} (${sp?.full_name})`);
  }

  // Fix: update appointmentItems where staff_id is a User.id (not a StaffProfile.id)
  for (const item of items) {
    // If staff.user_id == item.staff_id, then the appointmentItem stores User.id, needs fix
    if (item.staff && item.staff.user_id === item.staff_id) {
      console.log(
        `Fixing appointmentItem ${item.id}: staff_id ${item.staff_id} (User.id) -> ${item.staff.id} (StaffProfile.id)`,
      );
      await prisma.appointmentItem.update({
        where: { id: item.id },
        data: { staff_id: item.staff.id },
      });
      fixed++;
    }
  }
  console.log(`\nFixed ${fixed} appointmentItems`);
}
main()
  .catch(console.error)
  .finally(() => process.exit(0));
