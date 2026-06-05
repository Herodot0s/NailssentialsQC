import prisma from './src/utils/prisma';
import bcrypt from 'bcrypt';

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
    // STEP 2: CREATE ACCOUNTS (MANAGERS & SYSTEM ACCOUNTS)
    // --------------------------------------------------
    console.log('\n[Step 2] Seeding manager accounts...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 2.1 Managers (Created without staff profiles to avoid showing as booking technicians)
    await prisma.user.create({
      data: {
        username: 'manager1',
        email: 'manager@nailssentials.com',
        password_hash: defaultPasswordHash,
        role: 'manager',
      },
    });

    await prisma.user.create({
      data: {
        username: 'test_manager',
        email: 'test_manager@nailssentialsqc.com',
        password_hash: defaultPasswordHash,
        role: 'manager',
      },
    });

    console.log('✔ Managers created (clean without StaffProfile relations).');

    // 2.2 House Artist Account (Non-bookable profile used solely to own portfolio exhibits)
    console.log('\n[Step 2.2] Seeding house artist for exhibits...');
    const houseArtistUser = await prisma.user.create({
      data: {
        username: 'nailssentials_artist',
        email: 'artist@nailssentials.com',
        password_hash: defaultPasswordHash,
        role: 'staff',
        is_active: true,
        staff_profile: {
          create: {
            full_name: 'Nailssentials Stylist',
            specializations: 'Nail Art & Spa Services',
            is_available: false, // Prevents showing up in booking calendar
            base_pay_per_week: 0.0,
            base_commission_rate: 0.0,
          },
        },
      },
      include: { staff_profile: true },
    });

    const artistProfile = houseArtistUser.staff_profile!;
    console.log('✔ House artist profile seeded (is_available = false).');

    // 2.3 System Walk-in Guest Profile (Required for walk-in bookings)
    console.log('\n[Step 2.3] Seeding system walk-in customer profile...');
    const walkInUser = await prisma.user.create({
      data: {
        username: 'walkin_guest',
        password_hash: defaultPasswordHash,
        role: 'customer',
        is_active: false,
      },
    });
    await prisma.customerProfile.create({
      data: {
        user_id: walkInUser.id,
        full_name: 'Walk-in Customer',
      },
    });
    console.log('✔ Walk-in Customer profile registered.');

    // --------------------------------------------------
    // STEP 3: CREATE SERVICE CATEGORIES
    // --------------------------------------------------
    console.log('\n[Step 3] Seeding service categories...');
    const catNails = await prisma.serviceCategory.create({
      data: { name: 'Nails', description: 'Nail extensions, gel manicures, and classic nail care' },
    });
    const catHandSpa = await prisma.serviceCategory.create({
      data: {
        name: 'Hand Spa',
        description: 'Nourishing treatments, massages, and scrubs for hands',
      },
    });
    const catFootSpa = await prisma.serviceCategory.create({
      data: { name: 'Foot Spa', description: 'Soothing foot spas, scrubs, and classic pedicures' },
    });
    const catWaxing = await prisma.serviceCategory.create({
      data: {
        name: 'Waxing & Threading',
        description: 'Gentle waxing and eyebrow mapping/threading',
      },
    });
    console.log('✔ 4 allowed categories seeded successfully.');

    // --------------------------------------------------
    // STEP 4: CREATE SERVICES
    // --------------------------------------------------
    console.log('\n[Step 4] Seeding salon services...');

    // Nails Category
    const svcClassicMani = await prisma.service.create({
      data: {
        name: 'Classic Manicure',
        category_id: catNails.id,
        price: 350.0,
        duration_minutes: 45,
        is_popular: true,
      },
    });
    const svcGelNails = await prisma.service.create({
      data: {
        name: 'Gel Nail Art',
        category_id: catNails.id,
        price: 800.0,
        duration_minutes: 90,
        is_popular: true,
      },
    });
    const svcFrenchTips = await prisma.service.create({
      data: {
        name: 'French Tips',
        category_id: catNails.id,
        price: 500.0,
        duration_minutes: 60,
        is_popular: false,
      },
    });
    const svcAcrylicExt = await prisma.service.create({
      data: {
        name: 'Acrylic Extension',
        category_id: catNails.id,
        price: 1200.0,
        duration_minutes: 90,
        is_popular: true,
      },
    });

    // Hand Spa Category
    const svcHandSpa = await prisma.service.create({
      data: {
        name: 'Hand Spa Treatment',
        category_id: catHandSpa.id,
        price: 450.0,
        duration_minutes: 45,
        is_popular: false,
      },
    });

    // Foot Spa Category
    const svcSpaPedi = await prisma.service.create({
      data: {
        name: 'Spa Pedicure',
        category_id: catFootSpa.id,
        price: 600.0,
        duration_minutes: 75,
        is_popular: true,
      },
    });
    const svcFootScrub = await prisma.service.create({
      data: {
        name: 'Foot Scrub & Polish',
        category_id: catFootSpa.id,
        price: 500.0,
        duration_minutes: 60,
        is_popular: false,
      },
    });

    // Waxing Category
    const svcUnderarmWax = await prisma.service.create({
      data: {
        name: 'Underarm Waxing',
        category_id: catWaxing.id,
        price: 300.0,
        duration_minutes: 20,
        is_popular: true,
      },
    });
    const svcEyebrowThread = await prisma.service.create({
      data: {
        name: 'Eyebrow Threading',
        category_id: catWaxing.id,
        price: 250.0,
        duration_minutes: 15,
        is_popular: false,
      },
    });

    console.log('✔ Services seeded under respective categories.');

    // --------------------------------------------------
    // STEP 5: SEED EXHIBITS (GALLERY PORTFOLIO)
    // --------------------------------------------------
    console.log('\n[Step 5] Seeding salon exhibits...');
    const exhibits = [
      {
        title: 'Midnight Bloom Gel Art',
        image_url:
          'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1200',
        staff_id: artistProfile.id,
        service_id: svcGelNails.id,
      },
      {
        title: 'Elegance French Tips',
        image_url:
          'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=1200',
        staff_id: artistProfile.id,
        service_id: svcFrenchTips.id,
      },
      {
        title: 'Golden Hour Ombré Nails',
        image_url:
          'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1200',
        staff_id: artistProfile.id,
        service_id: svcGelNails.id,
      },
      {
        title: 'Lavender Foot Spa Pedicure',
        image_url:
          'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=1200',
        staff_id: artistProfile.id,
        service_id: svcSpaPedi.id,
      },
      {
        title: 'Perfect Arch Eyebrow Threading',
        image_url:
          'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&q=80&w=1200',
        staff_id: artistProfile.id,
        service_id: svcEyebrowThread.id,
      },
    ];

    for (const ex of exhibits) {
      await prisma.exhibit.create({ data: ex });
    }
    console.log('✔ 5 high-quality exhibits seeded.');

    // --------------------------------------------------
    // STEP 6: SEED COMPENSATION & SALARY STRUCTURES
    // --------------------------------------------------
    console.log('\n[Step 6] Seeding salary components & structures...');

    // Earnings components
    const compBasic = await prisma.salaryComponent.create({
      data: { name: 'Basic Pay', type: 'earning', description: 'Weekly base salary component' },
    });
    const compCommission = await prisma.salaryComponent.create({
      data: {
        name: 'Commissions',
        type: 'earning',
        description: 'Commissions from completed appointments',
      },
    });

    // Deductions components
    const compLateDeduction = await prisma.salaryComponent.create({
      data: {
        name: 'Late Deductions',
        type: 'deduction',
        description: 'Deductions calculated based on tardiness minutes',
      },
    });
    const compAbsentDeduction = await prisma.salaryComponent.create({
      data: {
        name: 'Absenteeism',
        type: 'deduction',
        description: 'Flat deductions for unexcused absences',
      },
    });

    // Create a Standard Salon Structure
    const structureStandard = await prisma.salaryStructure.create({
      data: {
        name: 'Standard Stylist Package',
        description: 'Base pay ₱2500/week + 10% commission on services',
      },
    });

    // Map components to structure
    await prisma.salaryStructureComponent.createMany({
      data: [
        {
          salary_structure_id: structureStandard.id,
          salary_component_id: compBasic.id,
          amount: 2500.0,
        },
        {
          salary_structure_id: structureStandard.id,
          salary_component_id: compCommission.id,
          formula: 'COMMISSION_RATE * TOTAL_SALES',
        },
        {
          salary_structure_id: structureStandard.id,
          salary_component_id: compLateDeduction.id,
          formula: 'TARDINESS_MINUTES * 3.33',
        },
        {
          salary_structure_id: structureStandard.id,
          salary_component_id: compAbsentDeduction.id,
          amount: 500.0,
        },
      ],
    });

    console.log('✔ Compensation structures successfully initialized.');

    console.log('\n==================================================');
    console.log('  DATABASE SEEDING COMPLETED SUCCESSFULLY         ');
    console.log('==================================================');
    console.log('Credentials Summary:');
    console.log('  Manager:  manager1 / password123');
    console.log('  Manager:  test_manager / password123\n');
  } catch (error) {
    console.error('Fatal seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSalon();
