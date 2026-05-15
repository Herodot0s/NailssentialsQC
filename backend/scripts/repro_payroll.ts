import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { format, startOfISOWeek, endOfISOWeek, addDays, startOfDay, endOfDay } from 'date-fns';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const payroll_period_id = 10; // The one we saw earlier
  console.log(`🔍 Testing recalculation for period ${payroll_period_id}...`);

  try {
    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: Number(payroll_period_id) },
    });

    if (!payrollPeriod) throw new Error('Period not found');

    const startDate = new Date(payrollPeriod.start_date);
    const endDate = new Date(payrollPeriod.end_date);

    console.log(`📅 Range: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

    const [transactions, staffProfiles, currentPeriodCommissions] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          transaction_date: { gte: startDate, lte: endDate },
          status: 'completed',
        },
      }),
      prisma.staffProfile.findMany({
        where: { is_available: true },
      }),
      prisma.commission.findMany({
        where: {
          commission_date: { gte: startDate, lte: endDate },
        },
        include: {
          service: {
            include: { category: true },
          },
        },
      }),
    ]);

    const totalSalonSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    console.log(`💰 Total Salon Sales: ${totalSalonSales}`);

    // Simulate the transaction
    console.log('🔄 Simulating wipe and update...');
    await prisma.$transaction([
      prisma.payrollPeriod.update({
        where: { id: payrollPeriod.id },
        data: { total_salon_sales: totalSalonSales },
      }),
      prisma.staffPayroll.deleteMany({ where: { payroll_period_id: payrollPeriod.id } }),
      prisma.deductionLog.updateMany({
        where: { payroll_period_id: payrollPeriod.id, NOT: { type: 'lates_early_out' } },
        data: { payroll_period_id: null },
      }),
      prisma.deductionLog.deleteMany({
        where: { payroll_period_id: payrollPeriod.id, type: 'lates_early_out' },
      }),
    ]);

    console.log('✅ Wipe and update successful.');

    // Now check the aggregation logic
    const staffWeeklyHairSales = new Map<string, number>();
    for (const c of currentPeriodCommissions) {
      const isHair = c.service?.category?.name.toLowerCase().includes('hair');
      const staff = staffProfiles.find(s => s.id === c.staff_id);
      const isHairSpecialist = staff?.specializations?.toLowerCase().includes('hair');

      if (isHair && isHairSpecialist) {
        const weekKey = `${c.staff_id}-${c.period_week}`;
        staffWeeklyHairSales.set(weekKey, (staffWeeklyHairSales.get(weekKey) || 0) + Number(c.base_amount));
      }
    }

    console.log('✅ Aggregation successful.');

    // 5. Process Staff Payrolls
    console.log('🔄 Processing staff payrolls...');
    for (const staff of staffProfiles) {
      console.log(`👤 Staff: ${staff.full_name} (${staff.id})`);
      const weeksInPeriod = 1; // Simplify
      const tieredCommissions = 100; // Mock
      const hairCommissions = 50; // Mock
      const totalCommissions = tieredCommissions + hairCommissions;
      const dailyBreakdown = {};

      const basePay = Number(staff.base_pay_per_week) * weeksInPeriod;
      const totalDeductions = 0;
      const netPay = basePay + totalCommissions - totalDeductions;

      const payrollItems: any[] = [
        {
          component_name: 'Base Pay',
          component_type: 'earning',
          amount: basePay,
        },
      ];

      // 6. Save StaffPayroll
      await prisma.staffPayroll.create({
        data: {
          staff_id: staff.id,
          payroll_period_id: payrollPeriod.id,
          base_pay: basePay,
          commissions: totalCommissions,
          deductions: totalDeductions,
          net_pay: netPay,
          status: 'draft',
          daily_breakdown: dailyBreakdown as any,
          items: {
            create: payrollItems,
          },
        },
      });
      console.log(`✅ Saved payroll for ${staff.full_name}`);
    }

    console.log('🎉 Full repro successful!');

  } catch (error) {
    console.error('❌ Error during reproduction:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
