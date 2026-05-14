import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { format } from 'date-fns';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPayroll() {
  console.log('--- Starting Payroll Generation Test ---');

  try {
    // 1. Find a period or create one
    let period = await prisma.payrollPeriod.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!period) {
      console.log('No period found. Creating a test period...');
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const end = new Date();
      
      period = await prisma.payrollPeriod.create({
        data: {
          start_date: start,
          end_date: end,
          total_salon_sales: 0,
          is_locked: false,
        }
      });
    }

    console.log(`Testing with period ID: ${period.id} (${format(period.start_date, 'yyyy-MM-dd')} to ${format(period.end_date, 'yyyy-MM-dd')})`);

    // Let's simulate the controller logic for one staff
    const staff = await prisma.staffProfile.findFirst({
      where: { is_available: true }
    });

    if (!staff) {
      console.log('No available staff found for testing.');
      return;
    }

    console.log(`Testing for staff: ${staff.full_name}`);
    
    // Check daily breakdown field
    const payroll = await prisma.staffPayroll.findFirst({
      where: { payroll_period_id: period.id, staff_id: staff.id },
      include: { items: true }
    });

    if (payroll) {
      console.log('Existing payroll found:');
      console.log(`- Base Pay: ${payroll.base_pay}`);
      console.log(`- Commissions: ${payroll.commissions}`);
      console.log(`- Net Pay: ${payroll.net_pay}`);
      console.log(`- Daily Breakdown: ${JSON.stringify(payroll.daily_breakdown)}`);
      console.log(`- Items: ${payroll.items.map(i => i.component_name).join(', ')}`);
    } else {
      console.log('No payroll record found for this period/staff. Run generatePayroll via UI or API first.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testPayroll();
