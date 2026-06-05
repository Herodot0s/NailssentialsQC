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

async function verifyBookingFlow() {
  console.log('==================================================');
  console.log('   STARTING CUSTOMER BOOKING FLOW VALIDATION      ');
  console.log('==================================================');

  // Track created entities for robust cleanup
  const createdUserIds: number[] = [];
  const createdCategoryIds: number[] = [];
  const createdServiceIds: number[] = [];
  const createdAddonIds: number[] = [];
  const createdPackageIds: number[] = [];
  const createdAppointmentIds: number[] = [];

  const prefix = 'QA_TEST_';

  try {
    // --------------------------------------------------
    // STEP 0: PREPARE SEED DATA
    // --------------------------------------------------
    console.log('\n[Step 0] Preparing seed data...');

    // 0.1 Service Category
    const categoryName = `${prefix}NailCare`;
    const category = await prisma.serviceCategory.upsert({
      where: { name: categoryName },
      update: { is_active: true },
      create: {
        name: categoryName,
        description: 'Nail care services for automated testing',
        is_active: true,
      },
    });
    createdCategoryIds.push(category.id);
    console.log(`✔ Service Category created: ${category.name} (ID: ${category.id})`);

    // 0.2 Services
    const serviceMani = await prisma.service.create({
      data: {
        name: `${prefix}Manicure`,
        category_id: category.id,
        description: 'Standard manicure service',
        price: 350.0,
        duration_minutes: 45,
        is_active: true,
      },
    });
    createdServiceIds.push(serviceMani.id);
    console.log(
      `✔ Service 1: ${serviceMani.name} (ID: ${serviceMani.id}, Duration: 45m, Price: 350)`,
    );

    const servicePedi = await prisma.service.create({
      data: {
        name: `${prefix}Pedicure`,
        category_id: category.id,
        description: 'Standard pedicure service',
        price: 450.0,
        duration_minutes: 60,
        is_active: true,
      },
    });
    createdServiceIds.push(servicePedi.id);
    console.log(
      `✔ Service 2: ${servicePedi.name} (ID: ${servicePedi.id}, Duration: 60m, Price: 450)`,
    );

    // 0.3 Addon
    const addonGel = await prisma.addon.create({
      data: {
        name: `${prefix}Gel_Upgrade`,
        description: 'Upgrade manicure or pedicure with gel polish',
        price: 150.0,
        is_active: true,
      },
    });
    createdAddonIds.push(addonGel.id);
    console.log(`✔ Addon: ${addonGel.name} (ID: ${addonGel.id}, Price: 150)`);

    // 0.4 Package
    const servicePackageCombo = await prisma.servicePackage.create({
      data: {
        name: `${prefix}Mani_Pedi_Combo`,
        description: 'Combo package for manicures and pedicures',
        price: 700.0,
        is_active: true,
        items: {
          create: [{ service_id: serviceMani.id }, { service_id: servicePedi.id }],
        },
      },
    });
    createdPackageIds.push(servicePackageCombo.id);
    console.log(
      `✔ Service Package: ${servicePackageCombo.name} (ID: ${servicePackageCombo.id}, Price: 700)`,
    );

    // 0.5 Technician (Staff User)
    const staffUsername = `qa_staff_${Date.now()}`;
    const staffClerkId = `qa_staff_clerk_${Date.now()}`;
    const staffUser = await prisma.user.create({
      data: {
        username: staffUsername,
        email: `${staffUsername}@example.com`,
        clerk_id: staffClerkId,
        role: 'staff',
        is_active: true,
        staff_profile: {
          create: {
            full_name: 'QA Test Staff Technician',
            is_available: true,
            base_commission_rate: 0.1, // 10%
          },
        },
      },
      include: { staff_profile: true },
    });
    createdUserIds.push(staffUser.id);
    const staffProfile = staffUser.staff_profile!;
    console.log(
      `✔ Staff User: ${staffUser.username} (User ID: ${staffUser.id}, Staff Profile ID: ${staffProfile.id})`,
    );

    // Setup schedule for the test date
    const testDateObj = addDays(new Date(), 2);
    const testDayOfWeek = testDateObj.getDay();
    const dateStr = format(testDateObj, 'yyyy-MM-dd');
    console.log(`Booking date set to: ${dateStr} (Day of week: ${testDayOfWeek})`);

    await prisma.staffSchedule.create({
      data: {
        staff_id: staffProfile.id,
        day_of_week: testDayOfWeek,
        start_time: '12:00:00',
        end_time: '22:00:00',
        is_active: true,
      },
    });
    console.log(`✔ Staff Schedule added for day ${testDayOfWeek} (12:00 PM - 10:00 PM)`);

    // 0.6 Seed Customer & Manager accounts (will be linked via authentication middleware)
    const customerClerkId = `qa_customer_clerk_${Date.now()}`;
    const customerUser = await prisma.user.create({
      data: {
        username: `qa_cust_${Date.now()}`,
        email: `qa_cust_${Date.now()}@example.com`,
        clerk_id: customerClerkId,
        role: 'customer',
        is_active: true,
        customer_profile: {
          create: {
            full_name: 'QA Customer User',
          },
        },
      },
    });
    createdUserIds.push(customerUser.id);
    console.log(
      `✔ Customer User pre-created (User ID: ${customerUser.id}, Clerk ID: ${customerClerkId})`,
    );

    const managerClerkId = `qa_manager_clerk_${Date.now()}`;
    const managerUser = await prisma.user.create({
      data: {
        username: `qa_mgr_${Date.now()}`,
        email: `qa_mgr_${Date.now()}@example.com`,
        clerk_id: managerClerkId,
        role: 'manager',
        is_active: true,
        staff_profile: {
          create: {
            full_name: 'QA Manager User',
            is_available: true,
          },
        },
      },
    });
    createdUserIds.push(managerUser.id);
    console.log(
      `✔ Manager User pre-created (User ID: ${managerUser.id}, Clerk ID: ${managerClerkId})`,
    );

    // --------------------------------------------------
    // STEP 1: BROWSE SERVICES
    // --------------------------------------------------
    console.log('\n[Step 1] Browsing Services...');
    const servicesRes = await request(app).get('/api/v1/services');
    if (servicesRes.status !== 200) {
      throw new Error(`Browse services failed with status: ${servicesRes.status}`);
    }
    const servicesList = servicesRes.body.data;
    const foundMani = servicesList.find((s: any) => s.id === serviceMani.id);
    const foundPedi = servicesList.find((s: any) => s.id === servicePedi.id);
    if (!foundMani || !foundPedi) {
      throw new Error('Could not find seeded manicure or pedicure in services list.');
    }
    console.log('✔ Successfully retrieved service list and confirmed seeded services exist.');

    // --------------------------------------------------
    // STEP 2: BROWSE ACTIVE PACKAGES
    // --------------------------------------------------
    console.log('\n[Step 2] Browsing Active Packages...');
    const packagesRes = await request(app).get('/api/v1/packages/active');
    if (packagesRes.status !== 200) {
      throw new Error(`Browse packages failed with status: ${packagesRes.status}`);
    }
    const packagesList = packagesRes.body.data;
    const foundCombo = packagesList.find((p: any) => p.id === servicePackageCombo.id);
    if (!foundCombo) {
      throw new Error('Could not find combo package in active packages list.');
    }
    console.log('✔ Successfully retrieved active packages and confirmed combo package exists.');

    // --------------------------------------------------
    // STEP 3: CHECK TECHNICIAN AVAILABILITY
    // --------------------------------------------------
    console.log('\n[Step 3] Checking Technician Availability...');
    const availabilityRes = await request(app).get(
      `/api/v1/appointments/availability?date=${dateStr}&duration=45`,
    );
    if (availabilityRes.status !== 200) {
      throw new Error(`Availability check failed with status: ${availabilityRes.status}`);
    }

    const slots = availabilityRes.body.data;
    const slot1400 = slots.find((s: any) => s.time === '14:00');
    if (
      !slot1400 ||
      !slot1400.available ||
      !slot1400.availableTechnicianIds.includes(staffProfile.id)
    ) {
      throw new Error(
        'Technician should be available at 14:00, but slot is unavailable or technician is missing.',
      );
    }
    console.log('✔ Successfully verified availability: technician is free at 14:00.');

    // --------------------------------------------------
    // STEP 4: BOOK APPOINTMENT (Happy Path - Single Service)
    // --------------------------------------------------
    console.log('\n[Step 4] Booking Single Service Appointment (Happy Path)...');
    const bookingRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        items: [
          {
            serviceId: serviceMani.id,
            staffId: staffUser.id, // Frontend passes User.id
            startTime: '14:00',
          },
        ],
        date: dateStr,
        notes: 'Single service test booking with Gel polish addon.',
        addons: [
          {
            addonId: addonGel.id,
            quantity: 1,
          },
        ],
      });

    if (bookingRes.status !== 201) {
      console.error('Booking response body:', bookingRes.body);
      throw new Error(`Single booking failed with status: ${bookingRes.status}`);
    }

    const singleApptId = bookingRes.body.data.id;
    createdAppointmentIds.push(singleApptId);
    console.log(`✔ Successfully booked single appointment (ID: ${singleApptId})`);

    // Verify in database
    const dbAppt = await prisma.appointment.findUnique({
      where: { id: singleApptId },
      include: { items: true, addons: true },
    });

    console.log('Retrieved dbAppt details:', JSON.stringify(dbAppt, null, 2));

    if (
      !dbAppt ||
      dbAppt.status !== 'pending' ||
      dbAppt.items.length !== 1 ||
      dbAppt.addons.length !== 1
    ) {
      throw new Error('Database appointment record does not match expected structure.');
    }
    console.log('✔ Database records validated successfully for single service appointment.');

    // --------------------------------------------------
    // STEP 5: ENFORCE COLLISION PREVENTION
    // --------------------------------------------------
    console.log('\n[Step 5] Checking Collision Prevention (Overlapping Booking)...');
    const overlapRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        items: [
          {
            serviceId: servicePedi.id,
            staffId: staffUser.id,
            startTime: '14:15', // Overlaps with 14:00 manicure (ends 14:45)
          },
        ],
        date: dateStr,
        notes: 'This booking should trigger a collision.',
      });

    if (overlapRes.status !== 400) {
      throw new Error(`Overlapping booking was not blocked! Status: ${overlapRes.status}`);
    }
    console.log('✔ Overlapping booking successfully blocked with 400 Bad Request.');
    console.log(`- Error details: ${overlapRes.body.error.message}`);

    // --------------------------------------------------
    // STEP 6: ENFORCE OPERATING HOURS CONSTRAINT
    // --------------------------------------------------
    console.log('\n[Step 6] Checking Operating Hours Constraints...');

    // 6.1 Booking before opening (12:00 PM)
    const earlyRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        items: [
          {
            serviceId: serviceMani.id,
            staffId: staffUser.id,
            startTime: '11:00', // Opens at 12:00 PM
          },
        ],
        date: dateStr,
      });

    if (earlyRes.status !== 400) {
      throw new Error(`Early booking was not blocked! Status: ${earlyRes.status}`);
    }
    console.log('✔ Early booking successfully blocked (11:00 AM starts before opening).');

    // 6.2 Booking ending after closing (10:00 PM)
    const lateRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        items: [
          {
            serviceId: servicePedi.id, // 60 minutes
            staffId: staffUser.id,
            startTime: '21:30', // Ends at 22:30, closing is 22:00
          },
        ],
        date: dateStr,
      });

    if (lateRes.status !== 400) {
      throw new Error(`Late booking was not blocked! Status: ${lateRes.status}`);
    }
    console.log('✔ Late booking successfully blocked (21:30 PM Pedicure extends past closing).');

    // --------------------------------------------------
    // STEP 7: ENFORCE PAST TIME CONSTRAINT
    // --------------------------------------------------
    console.log('\n[Step 7] Checking Past Time Constraints...');
    const pastRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        items: [
          {
            serviceId: serviceMani.id,
            staffId: staffUser.id,
            startTime: '14:00',
          },
        ],
        date: '2020-01-01',
      });

    if (pastRes.status !== 400) {
      throw new Error(`Past booking was not blocked! Status: ${pastRes.status}`);
    }
    console.log('✔ Past booking successfully blocked (Booking date 2020-01-01 is in the past).');

    // --------------------------------------------------
    // STEP 8: BOOK SERVICE PACKAGE (Combo Booking)
    // --------------------------------------------------
    console.log('\n[Step 8] Booking Service Package (Mani + Pedi Combo)...');

    // Tech is booked 14:00-14:45. Let's book package at 15:00 and 16:00
    const packageBookingRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        items: [
          {
            serviceId: serviceMani.id,
            staffId: staffUser.id,
            startTime: '15:00',
            packageId: servicePackageCombo.id,
          },
          {
            serviceId: servicePedi.id,
            staffId: staffUser.id,
            startTime: '16:00',
            packageId: servicePackageCombo.id,
          },
        ],
        date: dateStr,
        notes: 'Combo package booking test.',
      });

    if (packageBookingRes.status !== 201) {
      console.error(packageBookingRes.body);
      throw new Error(`Package booking failed with status: ${packageBookingRes.status}`);
    }

    const packageApptId = packageBookingRes.body.data.id;
    createdAppointmentIds.push(packageApptId);
    console.log(`✔ Successfully booked package appointment (ID: ${packageApptId})`);

    // Verify in database
    const dbPkgAppt = await prisma.appointment.findUnique({
      where: { id: packageApptId },
      include: { items: true },
    });

    if (!dbPkgAppt || dbPkgAppt.items.length !== 2) {
      throw new Error('Database package appointment record does not contain exactly 2 items.');
    }
    if (dbPkgAppt.items.some((item) => item.package_id !== servicePackageCombo.id)) {
      throw new Error('Package ID is missing from one or more child service items.');
    }
    console.log('✔ Database records validated successfully for package appointment.');

    // --------------------------------------------------
    // STEP 9: GET APPOINTMENTS (Customer List)
    // --------------------------------------------------
    console.log('\n[Step 9] Retrieving Customer Appointments...');
    const listRes = await request(app)
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerClerkId}`);

    if (listRes.status !== 200) {
      throw new Error(`Listing appointments failed with status: ${listRes.status}`);
    }
    const appts = listRes.body.data.items;
    const foundSingle = appts.find((a: any) => a.id === singleApptId);
    const foundPkg = appts.find((a: any) => a.id === packageApptId);
    if (!foundSingle || !foundPkg) {
      throw new Error('One or both booked appointments not found in customer list.');
    }
    console.log('✔ Successfully listed customer appointments and verified both show in history.');

    // --------------------------------------------------
    // STEP 10: CANCEL SINGLE APPOINTMENT (Customer Flow)
    // --------------------------------------------------
    console.log('\n[Step 10] Cancelling Single Appointment as Customer...');
    const cancelRes = await request(app)
      .patch(`/api/v1/appointments/${singleApptId}/cancel`)
      .set('Authorization', `Bearer ${customerClerkId}`)
      .send({
        reason: 'Decided to book a package instead.',
      });

    if (cancelRes.status !== 200) {
      console.error(cancelRes.body);
      throw new Error(`Cancellation failed with status: ${cancelRes.status}`);
    }

    // Verify status in DB
    const cancelledAppt = await prisma.appointment.findUnique({
      where: { id: singleApptId },
      include: { items: true },
    });
    if (cancelledAppt?.status !== 'cancelled') {
      throw new Error('Appointment status did not update to cancelled.');
    }
    if (cancelledAppt.items.some((item) => item.status !== 'cancelled')) {
      throw new Error('Child appointment items were not updated to cancelled.');
    }
    console.log('✔ Appointment successfully cancelled. Customer cancellation flow functional.');

    // --------------------------------------------------
    // STEP 11: COMPLETE PACKAGE APPOINTMENT (Manager Flow)
    // --------------------------------------------------
    console.log('\n[Step 11] Completing Package Appointment as Manager...');
    const completeRes = await request(app)
      .post(`/api/v1/appointments/${packageApptId}/complete`)
      .set('Authorization', `Bearer ${managerClerkId}`)
      .send({
        paymentMethod: 'cash',
        servicePhotoUrl: 'https://example.com/nails.jpg',
      });

    if (completeRes.status !== 200) {
      console.error(completeRes.body);
      throw new Error(`Completion failed with status: ${completeRes.status}`);
    }

    // Verify DB states: status, transaction, commissions
    const completedAppt = await prisma.appointment.findUnique({
      where: { id: packageApptId },
      include: {
        items: true,
        transactions: {
          include: { commissions: true },
        },
      },
    });

    if (completedAppt?.status !== 'completed') {
      throw new Error(`Appointment status is not completed. Got: ${completedAppt?.status}`);
    }
    if (completedAppt.transactions.length !== 1) {
      throw new Error('No transaction was created on appointment completion.');
    }

    const transaction = completedAppt.transactions[0];
    if (transaction.status !== 'completed' || transaction.payment_method !== 'cash') {
      throw new Error('Transaction properties are incorrect.');
    }

    // Verify commissions
    // Total price of services booked under package: Manicure (350) + Pedicure (450) = 800.
    // However, commission is computed based on actual amount billed or prices. Let's check:
    // In completeAppointment, commission is created per service item.
    // Let's verify commissions were created.
    if (transaction.commissions.length !== 2) {
      throw new Error(
        `Commissions were not created for all completed services. Got: ${transaction.commissions.length}`,
      );
    }

    console.log('✔ Appointment status is completed.');
    console.log(
      `✔ Transaction created: ID ${transaction.id}, Receipt: ${transaction.receipt_number}`,
    );
    console.log('✔ Commissions successfully calculated and saved:');
    transaction.commissions.forEach((comm, idx) => {
      console.log(
        `  - Commission ${idx + 1}: Staff ID ${comm.staff_id}, Rate: ${comm.commission_rate}, Amt: ${comm.commission_amount}`,
      );
    });

    console.log('\n==================================================');
    console.log('   ALL CUSTOMER BOOKING FLOW VALIDATIONS PASSED   ');
    console.log('==================================================');
  } catch (error) {
    console.error('\n❌ CUSTOMER BOOKING FLOW VALIDATION FAILED:');
    console.error(error);
  } finally {
    // --------------------------------------------------
    // STEP 12: CLEANUP
    // --------------------------------------------------
    console.log('\n[Cleanup] Removing seeded test database items...');
    try {
      if (createdAppointmentIds.length > 0) {
        // Cascade delete on AppointmentItem is active, but delete commissions & transactions first
        const txs = await prisma.transaction.findMany({
          where: { appointment_id: { in: createdAppointmentIds } },
        });
        const txIds = txs.map((t) => t.id);

        if (txIds.length > 0) {
          await prisma.commission.deleteMany({ where: { transaction_id: { in: txIds } } });
          await prisma.transaction.deleteMany({ where: { id: { in: txIds } } });
        }

        // Delete appointment addons
        await prisma.appointmentAddon.deleteMany({
          where: { appointment_id: { in: createdAppointmentIds } },
        });

        // Delete appointment items (just in case cascade is not ON on some setups)
        await prisma.appointmentItem.deleteMany({
          where: { appointment_id: { in: createdAppointmentIds } },
        });

        // Delete appointments
        await prisma.appointment.deleteMany({
          where: { id: { in: createdAppointmentIds } },
        });
        console.log(`- Cleaned up ${createdAppointmentIds.length} appointments and dependencies.`);
      }

      if (createdUserIds.length > 0) {
        // Delete staff schedules, profiles, customer profiles, users
        await prisma.staffSchedule.deleteMany({
          where: { staff: { user_id: { in: createdUserIds } } },
        });
        await prisma.staffProfile.deleteMany({
          where: { user_id: { in: createdUserIds } },
        });
        await prisma.customerProfile.deleteMany({
          where: { user_id: { in: createdUserIds } },
        });
        await prisma.systemLog.deleteMany({
          where: { user_id: { in: createdUserIds } },
        });
        await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        });
        console.log(`- Cleaned up ${createdUserIds.length} users and profiles.`);
      }

      if (createdPackageIds.length > 0) {
        await prisma.servicePackageItem.deleteMany({
          where: { package_id: { in: createdPackageIds } },
        });
        await prisma.servicePackage.deleteMany({
          where: { id: { in: createdPackageIds } },
        });
        console.log(`- Cleaned up ${createdPackageIds.length} service packages.`);
      }

      if (createdAddonIds.length > 0) {
        await prisma.addon.deleteMany({
          where: { id: { in: createdAddonIds } },
        });
        console.log(`- Cleaned up ${createdAddonIds.length} addons.`);
      }

      if (createdServiceIds.length > 0) {
        await prisma.service.deleteMany({
          where: { id: { in: createdServiceIds } },
        });
        console.log(`- Cleaned up ${createdServiceIds.length} services.`);
      }

      if (createdCategoryIds.length > 0) {
        await prisma.serviceCategory.deleteMany({
          where: { id: { in: createdCategoryIds } },
        });
        console.log(`- Cleaned up ${createdCategoryIds.length} service categories.`);
      }

      console.log('✔ Database cleanup completed.');
    } catch (cleanupErr) {
      console.error('❌ Error during cleanup:', cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  }
}

verifyBookingFlow();
