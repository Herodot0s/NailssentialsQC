import { updateStaff } from './src/controllers/staffController';
import prisma from './src/utils/prisma';

async function run() {
  const staff = await prisma.user.findFirst({
    where: { role: { in: ['staff', 'manager'] } },
    include: { staff_profile: true }
  });

  if (!staff || !staff.staff_profile) {
    console.log("No staff found to test.");
    return;
  }

  console.log(`Original Rate: ${staff.staff_profile.base_commission_rate}, Tier: ${staff.staff_profile.commission_tier}`);

  const req = {
    user: { role: 'manager' },
    params: { id: staff.id.toString() },
    body: {
      fullName: staff.staff_profile.full_name,
      baseCommissionRate: 0.15,
      commissionTier: 2,
      basePayPerWeek: 3000,
      dailyTarget: 5000,
      username: staff.username
    }
  } as any;

  const res = {
    status: (code: number) => ({
      json: (data: any) => {
        console.log(`\nResponse Code: ${code}`);
        console.log(`Response Data:`, JSON.stringify(data, null, 2));
      }
    })
  } as any;

  console.log("Calling updateStaff with manager permissions...");
  await updateStaff(req, res);
}

run().then(() => process.exit(0)).catch(console.error);
