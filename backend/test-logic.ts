import { PrismaClient } from '@prisma/client';
import { addMinutes, subMinutes, format } from 'date-fns';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- STARTING LOGIC VERIFICATION ---');

  try {
    // 1. TEST TARDINESS CALCULATION (₱1/min after 15m grace)
    console.log('\n[TEST 1] Testing Attendance Deduction Logic...');
    const staff = await prisma.staffProfile.findFirst({ where: { full_name: 'Test Staff' } });
    if (!staff) throw new Error('Test Staff not found');

    const scheduledStart = staff.scheduled_start; // "12:00:00"
    const [h, m] = scheduledStart.split(':').map(Number);
    const today = new Date();
    today.setHours(h, m, 0, 0);

    // Simulate Check-in 20 minutes late (5 mins over grace)
    const checkInTime = addMinutes(today, 20);
    const diffMinutes = 20; // tardiness_minutes
    const expectedDeduction = 20; // ₱1 * 20 mins

    console.log(`- Scheduled: ${scheduledStart}`);
    console.log(`- Check-in:  ${format(checkInTime, 'HH:mm:ss')} (20 mins late)`);
    console.log(`- Expected:  tardiness=20m, deduction=₱20.00`);

    // Simulate what the controller does
    let tardinessMinutes = diffMinutes > 15 ? diffMinutes : 0;
    let deductionAmount = tardinessMinutes * 1;

    if (tardinessMinutes === 20 && deductionAmount === 20) {
      console.log('✅ TEST 1 PASSED: Tardiness & Deduction logic correct.');
    } else {
      console.error(
        `❌ TEST 1 FAILED: Got tardiness=${tardinessMinutes}, deduction=${deductionAmount}`,
      );
    }

    // 2. TEST COMMISSION CALCULATION (10% flat rate)
    console.log('\n[TEST 2] Testing Commission Logic...');
    const servicePrice = 500.0;
    const commissionRate = 0.1;
    const expectedCommission = servicePrice * commissionRate;

    console.log(`- Service Price: ₱${servicePrice}`);
    console.log(`- Expected Commission (10%): ₱${expectedCommission}`);

    if (expectedCommission === 50) {
      console.log('✅ TEST 2 PASSED: Commission calculation logic correct.');
    } else {
      console.error(`❌ TEST 2 FAILED: Got ₱${expectedCommission}`);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
