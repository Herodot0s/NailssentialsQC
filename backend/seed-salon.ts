import prisma from './src/utils/prisma';
import bcrypt from 'bcrypt';
import { addDays } from 'date-fns';

async function seedSalon() {
  try {
    console.log('==================================================');
    console.log('   SEEDING NAILSSENTIALSQC DATABASE FOR SALON     ');
    console.log('==================================================\n');

    // --------------------------------------------------
    // STEP 1: CLEAN UP EXISTING TABLES
    // --------------------------------------------------
    console.log('[Step 1] Cleaning up existing database records...');

    await prisma.systemLog.deleteMany({});
    await prisma.deductionLog.deleteMany({});
    await prisma.staffPayrollItem.deleteMany({});
    await prisma.staffPayroll.deleteMany({});
    await prisma.payrollPeriod.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.staffSchedule.deleteMany({});
    await prisma.salaryStructureAssignment.deleteMany({});
    await prisma.salaryStructureComponent.deleteMany({});
    await prisma.salaryStructure.deleteMany({});
    await prisma.salaryComponent.deleteMany({});
    await prisma.appointmentAddon.deleteMany({});
    await prisma.appointmentItem.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.exhibit.deleteMany({});
    await prisma.commission.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.servicePackageItem.deleteMany({});
    await prisma.servicePackage.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.serviceCategory.deleteMany({});
    await prisma.addon.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.siteSettings.deleteMany({});
    await prisma.siteContent.deleteMany({});
    await prisma.systemSettings.deleteMany({});
    await prisma.customerProfile.deleteMany({});
    await prisma.staffProfile.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✔ All existing database tables cleared successfully.');

    // --------------------------------------------------
    // STEP 2: CREATE ACCOUNTS (MANAGER, STAFF, CUSTOMERS)
    // --------------------------------------------------
    console.log('\n[Step 2] Seeding user accounts & profiles...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 2.1 Managers
    const manager1 = await prisma.user.create({
      data: {
        username: 'manager1',
        email: 'manager@nailssentials.com',
        password_hash: defaultPasswordHash,
        role: 'manager',
        staff_profile: {
          create: {
            full_name: 'Maria Santos',
            specializations: 'Management, High-End Nail Art',
            base_pay_per_week: 5000.00,
            base_commission_rate: 0.15,
          },
        },
      },
      include: { staff_profile: true },
    });

    const testManager = await prisma.user.create({
      data: {
        username: 'test_manager',
        email: 'test_manager@nailssentialsqc.com',
        password_hash: defaultPasswordHash,
        role: 'manager',
        staff_profile: {
          create: {
            full_name: 'Sophia Lim',
            specializations: 'Operations & Styling',
            base_pay_per_week: 5000.00,
            base_commission_rate: 0.15,
          },
        },
      },
    });

    console.log('✔ Managers created.');

    // 2.2 Staff
    const staffAccounts = [
      { username: 'sarah_tech', email: 'sarah_tech@nailssentialsqc.com', name: 'Sarah Santos', specs: 'Gel Nails, Nail Art' },
      { username: 'angela_nails', email: 'angela_nails@nailssentialsqc.com', name: 'Angela Cruz', specs: 'Manicure, Pedicure, Gel Polish' },
      { username: 'liza_wax', email: 'liza_wax@nailssentialsqc.com', name: 'Liza Reyes', specs: 'Body Waxing, Eyebrow Threading' },
      { username: 'janedoe', email: 'jane@nailssentials.com', name: 'Jane Doe', specs: 'Nail Art, Acrylic Extensions' },
      { username: 'anareyes', email: 'ana@nailssentials.com', name: 'Ana Reyes', specs: 'Hand & Foot Spa, Massages' },
      { username: 'test_staff', email: 'test_staff@nailssentialsqc.com', name: 'Staff Tester', specs: 'General Salon Services' },
    ];

    const staffProfiles = [];
    for (const s of staffAccounts) {
      const staffUser = await prisma.user.create({
        data: {
          username: s.username,
          email: s.email,
          password_hash: defaultPasswordHash,
          role: 'staff',
          staff_profile: {
            create: {
              full_name: s.name,
              specializations: s.specs,
              base_pay_per_week: 2500.00,
              base_commission_rate: 0.10,
            },
          },
        },
        include: { staff_profile: true },
      });
      if (staffUser.staff_profile) {
        staffProfiles.push(staffUser.staff_profile);
      }
    }
    console.log('✔ Staff accounts created.');

    // 2.3 Customers
    const customerAccounts = [
      { username: 'testcustomer', email: 'customer@test.com', name: 'Alice Smith' },
      { username: 'charlie_brown', email: 'charlie_brown@example.com', name: 'Charlie Brown' },
      { username: 'diana_prince', email: 'diana_prince@example.com', name: 'Diana Prince' },
      { username: 'test_customer', email: 'test_customer@nailssentialsqc.com', name: 'Customer Tester' },
    ];

    for (const c of customerAccounts) {
      await prisma.user.create({
        data: {
          username: c.username,
          email: c.email,
          password_hash: defaultPasswordHash,
          role: 'customer',
          customer_profile: {
            create: {
              full_name: c.name,
            },
          },
        },
      });
    }
    console.log('✔ Customer accounts created.');

    // --------------------------------------------------
    // STEP 3: CREATE STAFF SCHEDULES
    // --------------------------------------------------
    console.log('\n[Step 3] Seeding staff schedules...');
    for (const profile of staffProfiles) {
      for (let day = 0; day <= 6; day++) {
        await prisma.staffSchedule.create({
          data: {
            staff_id: profile.id,
            day_of_week: day,
            start_time: '12:00',
            end_time: '22:00',
            is_active: true,
          },
        });
      }
    }
    console.log('✔ Active schedules (12:00 PM - 10:00 PM) seeded for all staff.');

    // --------------------------------------------------
    // STEP 4: CREATE SERVICE CATEGORIES
    // --------------------------------------------------
    console.log('\n[Step 4] Seeding service categories...');
    const catNails = await prisma.serviceCategory.create({
      data: { name: 'Nails', description: 'Nail extensions, gel manicures, and classic nail care' },
    });
    const catHandSpa = await prisma.serviceCategory.create({
      data: { name: 'Hand Spa', description: 'Nourishing treatments, massages, and scrubs for hands' },
    });
    const catFootSpa = await prisma.serviceCategory.create({
      data: { name: 'Foot Spa', description: 'Soothing foot spas, scrubs, and classic pedicures' },
    });
    const catWaxing = await prisma.serviceCategory.create({
      data: { name: 'Waxing & Threading', description: 'Gentle waxing and eyebrow mapping/threading' },
    });
    console.log('✔ 4 allowed categories seeded successfully.');

    // --------------------------------------------------
    // STEP 5: CREATE SERVICES
    // --------------------------------------------------
    console.log('\n[Step 5] Seeding salon services...');
    
    // Nails Category
    const svcClassicMani = await prisma.service.create({
      data: { name: 'Classic Manicure', category_id: catNails.id, price: 350.00, duration_minutes: 45, is_popular: true },
    });
    const svcGelNails = await prisma.service.create({
      data: { name: 'Gel Nail Art', category_id: catNails.id, price: 800.00, duration_minutes: 90, is_popular: true },
    });
    const svcFrenchTips = await prisma.service.create({
      data: { name: 'French Tips', category_id: catNails.id, price: 500.00, duration_minutes: 60, is_popular: false },
    });
    const svcAcrylicExt = await prisma.service.create({
      data: { name: 'Acrylic Extension', category_id: catNails.id, price: 1200.00, duration_minutes: 90, is_popular: true },
    });

    // Hand Spa Category
    const svcHandSpa = await prisma.service.create({
      data: { name: 'Hand Spa Treatment', category_id: catHandSpa.id, price: 450.00, duration_minutes: 45, is_popular: false },
    });

    // Foot Spa Category
    const svcSpaPedi = await prisma.service.create({
      data: { name: 'Spa Pedicure', category_id: catFootSpa.id, price: 600.00, duration_minutes: 75, is_popular: true },
    });
    const svcFootScrub = await prisma.service.create({
      data: { name: 'Foot Scrub & Polish', category_id: catFootSpa.id, price: 500.00, duration_minutes: 60, is_popular: false },
    });

    // Waxing Category
    const svcUnderarmWax = await prisma.service.create({
      data: { name: 'Underarm Waxing', category_id: catWaxing.id, price: 300.00, duration_minutes: 20, is_popular: true },
    });
    const svcEyebrowThread = await prisma.service.create({
      data: { name: 'Eyebrow Threading', category_id: catWaxing.id, price: 250.00, duration_minutes: 15, is_popular: false },
    });

    console.log('✔ Services seeded under respective categories.');

    // --------------------------------------------------
    // STEP 6: SEED EXHIBITS (GALLERY PORTFOLIO)
    // --------------------------------------------------
    console.log('\n[Step 6] Seeding salon exhibits...');
    const exhibits = [
      {
        title: 'Midnight Bloom Gel Art',
        image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[0].id, // Sarah Santos
        service_id: svcGelNails.id,
      },
      {
        title: 'Elegance French Tips',
        image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[1].id, // Angela Cruz
        service_id: svcFrenchTips.id,
      },
      {
        title: 'Golden Hour Ombré Nails',
        image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[3].id, // Jane Doe
        service_id: svcGelNails.id,
      },
      {
        title: 'Lavender Foot Spa Pedicure',
        image_url: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[4].id, // Ana Reyes
        service_id: svcSpaPedi.id,
      },
      {
        title: 'Perfect Arch Eyebrow Threading',
        image_url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&q=80&w=1200',
        staff_id: staffProfiles[2].id, // Liza Reyes
        service_id: svcEyebrowThread.id,
      },
    ];

    for (const ex of exhibits) {
      await prisma.exhibit.create({ data: ex });
    }
    console.log('✔ 5 high-quality exhibits seeded.');

    // --------------------------------------------------
    // STEP 7: SEED COMPENSATION & SALARY STRUCTURES
    // --------------------------------------------------
    console.log('\n[Step 7] Seeding salary components & structures...');
    
    // Earnings components
    const compBasic = await prisma.salaryComponent.create({
      data: { name: 'Basic Pay', type: 'earning', description: 'Weekly base salary component' },
    });
    const compCommission = await prisma.salaryComponent.create({
      data: { name: 'Commissions', type: 'earning', description: 'Commissions from completed appointments' },
    });

    // Deductions components
    const compLateDeduction = await prisma.salaryComponent.create({
      data: { name: 'Late Deductions', type: 'deduction', description: 'Deductions calculated based on tardiness minutes' },
    });
    const compAbsentDeduction = await prisma.salaryComponent.create({
      data: { name: 'Absenteeism', type: 'deduction', description: 'Flat deductions for unexcused absences' },
    });

    // Create a Standard Salon Structure
    const structureStandard = await prisma.salaryStructure.create({
      data: { name: 'Standard Stylist Package', description: 'Base pay ₱2500/week + 10% commission on services' },
    });

    // Map components to structure
    await prisma.salaryStructureComponent.createMany({
      data: [
        { salary_structure_id: structureStandard.id, salary_component_id: compBasic.id, amount: 2500.00 },
        { salary_structure_id: structureStandard.id, salary_component_id: compCommission.id, formula: 'COMMISSION_RATE * TOTAL_SALES' },
        { salary_structure_id: structureStandard.id, salary_component_id: compLateDeduction.id, formula: 'TARDINESS_MINUTES * 3.33' },
        { salary_structure_id: structureStandard.id, salary_component_id: compAbsentDeduction.id, amount: 500.00 },
      ],
    });

    // Assign structure to all staff
    const today = new Date();
    for (const staff of staffProfiles) {
      await prisma.salaryStructureAssignment.create({
        data: {
          staff_id: staff.id,
          salary_structure_id: structureStandard.id,
          base_pay: staff.base_pay_per_week,
          effective_from: addDays(today, -30),
          is_active: true,
        },
      });
    }
    console.log('✔ Compensation models and salary structure assignments completed.');

    // --------------------------------------------------
    // STEP 8: SEED ATTENDANCE RECORDS (PAST 14 DAYS)
    // --------------------------------------------------
    console.log('\n[Step 8] Seeding staff attendance records (past 14 days)...');
    const pastDays = 14;

    for (const staff of staffProfiles) {
      for (let i = pastDays; i >= 0; i--) {
        const date = addDays(today, -i);
        const dbDayOfWeek = date.getDay();

        // Check schedule
        const schedule = await prisma.staffSchedule.findFirst({
          where: { staff_id: staff.id, day_of_week: dbDayOfWeek, is_active: true },
        });

        if (!schedule) continue; // Off duty

        // 5% chance to be absent (unless it's today)
        if (i > 0 && Math.random() < 0.05) {
          const startOfDate = new Date(date);
          startOfDate.setHours(0, 0, 0, 0);

          await prisma.attendance.create({
            data: {
              staff_id: staff.id,
              date: startOfDate,
              check_in: null,
              check_out: null,
              tardiness_minutes: 0,
              deduction_amount: 500.00,
              scheduled_start: '12:00',
              scheduled_end: '22:00',
              notes: 'Unexcused Absence',
            },
          });
          continue;
        }

        // Present
        const checkInTime = new Date(date);
        // Random arrival: between 10 mins before to 25 mins after 12:00
        const arrivalOffsetMins = Math.floor(Math.random() * 35) - 10;
        checkInTime.setHours(12, arrivalOffsetMins, 0, 0);

        const tardiness = Math.max(0, arrivalOffsetMins);
        const deduction = tardiness > 0 ? tardiness * 3.33 : 0;

        const checkOutTime = new Date(date);
        // Random departure: 0-15 mins after 22:00
        const departOffsetMins = Math.floor(Math.random() * 15);
        checkOutTime.setHours(22, departOffsetMins, 0, 0);

        const startOfDate = new Date(date);
        startOfDate.setHours(0, 0, 0, 0);

        await prisma.attendance.create({
          data: {
            staff_id: staff.id,
            date: startOfDate,
            check_in: checkInTime,
            check_out: i === 0 ? null : checkOutTime, // Today has not checked out yet
            tardiness_minutes: tardiness,
            deduction_amount: deduction,
            scheduled_start: '12:00',
            scheduled_end: '22:00',
          },
        });
      }
    }
    console.log('✔ Attendance history successfully populated.');

    console.log('\n==================================================');
    console.log('  DATABASE SEEDING COMPLETED SUCCESSFULLY         ');
    console.log('==================================================');
    console.log('Credentials Summary:');
    console.log('  Manager:  manager1 / password123');
    console.log('  Staff:    sarah_tech / password123');
    console.log('  Staff:    angela_nails / password123');
    console.log('  Customer: testcustomer / password123\n');
  } catch (error) {
    console.error('Fatal seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSalon();
