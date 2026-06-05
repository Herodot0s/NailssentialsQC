import Module from 'module';

// Intercept require to mock @clerk/express before loading the app
const originalRequire = Module.prototype.require;
(Module.prototype as any).require = function (this: any, id: string) {
  if (id === '@clerk/express') {
    return {
      clerkMiddleware: () => (req: any, res: any, next: any) => {
        next();
      },
      getAuth: (req: any) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return { userId: authHeader.substring(7) };
        }
        return { userId: undefined };
      },
      clerkClient: {
        users: {
          getUser: async (userId: string) => {
            let role = 'customer';
            if (userId.includes('manager')) role = 'manager';
            else if (userId.includes('staff')) role = 'staff';

            return {
              id: userId,
              emailAddresses: [
                {
                  id: 'primary-email',
                  emailAddress: `${userId}@example.com`,
                  verification: { status: 'verified' },
                },
              ],
              primaryEmailAddressId: 'primary-email',
              firstName: 'Mock',
              lastName: role.toUpperCase(),
              publicMetadata: { role },
            };
          },
          updateUserMetadata: async (userId: string, data: any) => {
            return {};
          },
        },
      },
    };
  }
  return originalRequire.apply(this, arguments as any);
};

// Now import dependencies
import request from 'supertest';
import app from './src/index';
import prisma from './src/utils/prisma';
import { format, addDays } from 'date-fns';

async function verifyWalkInFlow() {
  console.log('==================================================');
  console.log('   STARTING WALK-IN APPOINTMENT FLOW VALIDATION   ');
  console.log('==================================================');

  // Track created entities for cleanup
  let createdAppointmentId: number | null = null;
  let seededStaffUserId: number | null = null;
  let seededStaffProfileId: number | null = null;
  let seededServiceId: number | null = null;
  let seededCategoryId: number | null = null;

  const prefix = 'WALKIN_QA_';

  try {
    // --------------------------------------------------
    // STEP 1: PREPARE SEED DATA
    // --------------------------------------------------
    console.log('\n[Step 1] Preparing test service, category, and staff...');

    // 1.1 Category
    const category = await prisma.serviceCategory.create({
      data: {
        name: `${prefix}Waxing`,
        description: 'Test Waxing Category for Walk-ins',
      },
    });
    seededCategoryId = category.id;

    // 1.2 Service
    const service = await prisma.service.create({
      data: {
        name: `${prefix}UnderarmWax`,
        category_id: category.id,
        price: 350.0,
        duration_minutes: 30,
        is_active: true,
      },
    });
    seededServiceId = service.id;

    // 1.3 Staff user & profile
    const staffUser = await prisma.user.create({
      data: {
        username: `${prefix}staff_user`,
        email: `${prefix}staff@example.com`,
        role: 'staff',
        is_active: true,
      },
    });
    seededStaffUserId = staffUser.id;

    const staffProfile = await prisma.staffProfile.create({
      data: {
        user_id: staffUser.id,
        full_name: 'Walkin Staff Agent',
        base_pay_per_week: 2500.0,
        base_commission_rate: 0.1,
        is_available: true,
      },
    });
    seededStaffProfileId = staffProfile.id;

    // 1.4 Seed active schedule for staff on the current day
    const bookingDate = addDays(new Date(), 1); // tomorrow to avoid past time validation
    const dbDayOfWeek = bookingDate.getDay();

    await prisma.staffSchedule.create({
      data: {
        staff_id: staffProfile.id,
        day_of_week: dbDayOfWeek,
        start_time: '12:00',
        end_time: '22:00',
        is_active: true,
      },
    });

    console.log('✔ Seed data setup complete.');

    // --------------------------------------------------
    // STEP 2: CREATE WALK-IN BOOKING AS MANAGER
    // --------------------------------------------------
    console.log('\n[Step 2] Booking a Walk-in Appointment via API...');
    const bookingDateStr = format(bookingDate, 'yyyy-MM-dd');
    const startTimeStr = '14:00';

    const bookingPayload = {
      date: bookingDateStr,
      isWalkIn: true,
      items: [
        {
          serviceId: service.id,
          staffId: staffUser.id, // Frontend passes User.id
          startTime: startTimeStr,
        },
      ],
      notes: 'Testing walkthrough walk-in booking',
    };

    const bookingResponse = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', 'Bearer qa_manager_user') // 'manager' is mocked in Clerk
      .send(bookingPayload);

    if (bookingResponse.status !== 201) {
      throw new Error(
        `Booking failed with status ${bookingResponse.status}: ${JSON.stringify(bookingResponse.body)}`,
      );
    }

    const appointment = bookingResponse.body.data;
    createdAppointmentId = appointment.id;

    console.log('✔ Walk-in Appointment booked successfully!');
    console.log(`- Appointment ID: ${appointment.id}`);
    console.log(`- Status: ${appointment.status} (Expected: in_progress)`);
    console.log(`- Is Walk-In: ${appointment.is_walk_in} (Expected: true)`);

    // Verify status is immediately in_progress
    if (appointment.status !== 'in_progress') {
      throw new Error(
        `Expected walk-in status to be 'in_progress', but got '${appointment.status}'`,
      );
    }

    // Verify it resolved to the guest walk-in customer profile
    const dbAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: { customer: true },
    });
    console.log(`- Customer Profile resolved to: "${dbAppointment?.customer.full_name}"`);
    if (dbAppointment?.customer.full_name !== 'Walk-in Customer') {
      throw new Error(
        `Expected Customer profile to be 'Walk-in Customer', but got '${dbAppointment?.customer.full_name}'`,
      );
    }

    // --------------------------------------------------
    // STEP 3: COMPLETE WALK-IN BOOKING AS STAFF
    // --------------------------------------------------
    console.log('\n[Step 3] Completing Walk-in Appointment via API...');
    const completionPayload = {
      paymentMethod: 'cash',
      servicePhotoUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    };

    const completeResponse = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/complete`)
      .set('Authorization', 'Bearer qa_staff_user') // 'staff' is mocked in Clerk
      .send(completionPayload);

    if (completeResponse.status !== 200) {
      throw new Error(
        `Completion failed with status ${completeResponse.status}: ${JSON.stringify(completeResponse.body)}`,
      );
    }

    console.log('✔ Walk-in Appointment completed successfully!');

    // --------------------------------------------------
    // STEP 4: VERIFY TRANSACTION AND COMMISSIONS
    // --------------------------------------------------
    console.log('\n[Step 4] Verifying generated Transaction and Commissions...');
    const transaction = await prisma.transaction.findFirst({
      where: { appointment_id: appointment.id },
    });
    if (!transaction) {
      throw new Error('No transaction was created for the completed walk-in!');
    }
    console.log(
      `✔ Transaction created: ID ${transaction.id}, Receipt: ${transaction.receipt_number}, Amount: ₱${transaction.amount}`,
    );

    const commissions = await prisma.commission.findMany({
      where: { transaction_id: transaction.id },
    });
    if (commissions.length === 0) {
      throw new Error('No commissions were generated for the walk-in service!');
    }

    console.log('✔ Commission successfully generated for the staff technician:');
    for (const comm of commissions) {
      console.log(
        `  - Staff ID: ${comm.staff_id}, Rate: ${comm.commission_rate}, Calculated Amount: ₱${comm.commission_amount}`,
      );
    }

    console.log('\n==================================================');
    console.log('   ALL WALK-IN APPOINTMENT FLOW VALIDATIONS PASSED ');
    console.log('==================================================');
  } catch (error) {
    console.error('\n❌ Walk-in flow validation failed:', error);
  } finally {
    // --------------------------------------------------
    // STEP 5: CLEAN UP SEEDED DATA
    // --------------------------------------------------
    console.log('\n[Step 5] Cleaning up seeded test database items...');

    if (createdAppointmentId) {
      await prisma.commission.deleteMany({
        where: { transaction: { appointment_id: createdAppointmentId } },
      });
      await prisma.transaction.deleteMany({
        where: { appointment_id: createdAppointmentId },
      });
      await prisma.appointmentItem.deleteMany({
        where: { appointment_id: createdAppointmentId },
      });
      await prisma.appointment.deleteMany({
        where: { id: createdAppointmentId },
      });
      console.log('- Cleaned up test appointment, transactions, and commissions.');
    }

    if (seededStaffProfileId) {
      await prisma.staffSchedule.deleteMany({ where: { staff_id: seededStaffProfileId } });
      await prisma.staffProfile.deleteMany({ where: { id: seededStaffProfileId } });
    }
    if (seededStaffUserId) {
      await prisma.user.deleteMany({ where: { id: seededStaffUserId } });
    }
    if (seededServiceId) {
      await prisma.service.deleteMany({ where: { id: seededServiceId } });
    }
    if (seededCategoryId) {
      await prisma.serviceCategory.deleteMany({ where: { id: seededCategoryId } });
    }

    console.log('✔ Database cleanup completed.');
    await prisma.$disconnect();
  }
}

verifyWalkInFlow();
