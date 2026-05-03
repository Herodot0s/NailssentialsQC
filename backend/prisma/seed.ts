import { PrismaClient, Role, AppointmentStatus, PaymentMethod, TransactionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { addDays, subDays, format, startOfMonth, subMonths, getISOWeek, getMonth, getYear } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting V2 Comprehensive Seeding...');
  const saltRounds = 10;
  const hashedUserPassword = await bcrypt.hash('password123', saltRounds);

  // --- 1. SEED USERS & PROFILES ---
  console.log('Seeding Users...');
  
  // Customers
  const customerNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Elena Gilbert'];
  const customers = [];
  for (const name of customerNames) {
    const username = name.toLowerCase().replace(' ', '_');
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${username}@example.com`,
        password_hash: hashedUserPassword,
        role: Role.customer,
        customer_profile: {
          create: { full_name: name }
        }
      },
      include: { customer_profile: true }
    });
    customers.push(user.customer_profile!);
  }

  // Staff
  const staffData = [
    { name: 'Jane Doe', spec: 'Nails, Waxing', base: 2500, sss: '34-1234567-8', tin: '321-674-377-000' },
    { name: 'John Smith', spec: 'Hair, Lashes', base: 2800, sss: '34-8765432-1', tin: '444-555-666-000' },
    { name: 'Maria Garcia', spec: 'Nails, Lashes', base: 2500, sss: '34-9999999-0', tin: '111-222-333-000' }
  ];
  const staffProfiles = [];
  for (const s of staffData) {
    const username = s.name.toLowerCase().replace(' ', '_');
    const user = await prisma.user.upsert({
      where: { username },
      update: {
        sss_number: s.sss,
        tin_number: s.tin,
      },
      create: {
        username,
        email: `${username}@nails.com`,
        password_hash: hashedUserPassword,
        role: Role.staff,
        sss_number: s.sss,
        tin_number: s.tin,
        staff_profile: {
          create: {
            full_name: s.name,
            specializations: s.spec,
            base_pay_per_week: s.base,
            daily_target: 6000.00
          }
        }
      },
      include: { staff_profile: true }
    });
    staffProfiles.push(user.staff_profile!);
  }

  // Manager
  const manager = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: hashedUserPassword,
      role: Role.manager,
      staff_profile: {
        create: {
          full_name: 'Salon Owner',
          specializations: 'Management',
          base_pay_per_week: 5000
        }
      }
    }
  });

  // --- 2. SEED CATEGORIES & SERVICES ---
  console.log('Seeding Services...');
  const catData = [
    { name: 'Nails', services: [
      { name: 'Gel Manicure', price: 500, dur: 60 },
      { name: 'Pedicure', price: 400, dur: 45 },
      { name: 'Nail Art Luxe', price: 800, dur: 90 }
    ]},
    { name: 'Hair', services: [
      { name: 'Professional Haircut', price: 450, dur: 45 },
      { name: 'Keratin Treatment', price: 2500, dur: 120 },
      { name: 'Hair Color', price: 1800, dur: 150 }
    ]},
    { name: 'Waxing', services: [
      { name: 'Underarm Wax', price: 300, dur: 20 },
      { name: 'Full Leg Wax', price: 800, dur: 60 }
    ]}
  ];

  const allServices: any[] = [];
  for (const cat of catData) {
    const dbCat = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name }
    });

    for (const svc of cat.services) {
      const dbSvc = await prisma.service.upsert({
        where: { name_category_id: { name: svc.name, category_id: dbCat.id } },
        update: {},
        create: {
          name: svc.name,
          price: svc.price,
          duration_minutes: svc.dur,
          category_id: dbCat.id
        }
      });
      allServices.push(dbSvc);
    }
  }

  // --- 3. SEED HISTORICAL APPOINTMENTS, TRANSACTIONS, & COMMISSIONS ---
  console.log('Seeding Analytics Data (Last 30 Days)...');
  
  // Clear old data to ensure clean stats
  await prisma.commission.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.appointmentItem.deleteMany({});
  await prisma.appointment.deleteMany({});

  const today = new Date();
  
  // Create 50 random past appointments
  for (let i = 0; i < 50; i++) {
    const pastDate = subDays(today, Math.floor(Math.random() * 30));
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const status = i < 40 ? AppointmentStatus.completed : AppointmentStatus.cancelled;
    
    const apt = await prisma.appointment.create({
      data: {
        customer_id: customer.id,
        appointment_date: pastDate,
        status: status,
        is_walk_in: Math.random() > 0.7,
        notes: 'Seeded test appointment'
      }
    });

    if (status === AppointmentStatus.completed) {
      // Add 1-2 items per appointment
      const itemCount = Math.random() > 0.7 ? 2 : 1;
      let totalAmount = 0;
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        const svc = allServices[Math.floor(Math.random() * allServices.length)];
        const staff = staffProfiles[Math.floor(Math.random() * staffProfiles.length)];
        totalAmount += Number(svc.price);

        const item = await prisma.appointmentItem.create({
          data: {
            appointment_id: apt.id,
            service_id: svc.id,
            staff_id: staff.id,
            status: AppointmentStatus.completed,
            start_time: '10:00',
            end_time: '11:00',
            price_at_booking: svc.price
          }
        });
        items.push({ item, svc, staff });
      }

      // Create Transaction
      const trans = await prisma.transaction.create({
        data: {
          appointment_id: apt.id,
          amount: totalAmount,
          payment_method: Math.random() > 0.5 ? PaymentMethod.cash : PaymentMethod.gcash,
          status: TransactionStatus.completed,
          receipt_number: `REC-${format(pastDate, 'MMyyyy')}-${i.toString().padStart(4, '0')}`,
          transaction_date: pastDate
        }
      });

      // Create Commissions
      for (const entry of items) {
        await prisma.commission.create({
          data: {
            transaction_id: trans.id,
            staff_id: entry.staff.id,
            service_id: entry.svc.id,
            base_amount: entry.svc.price,
            commission_rate: 10,
            commission_amount: Number(entry.svc.price) * 0.1,
            commission_date: pastDate,
            period_week: getISOWeek(pastDate),
            period_month: getMonth(pastDate) + 1,
            period_year: getYear(pastDate)
          }
        });
      }
    }
  }

  // --- 4. SEED ATTENDANCE & PAYROLL ---
  console.log('Seeding HR Data...');
  
  for (const staff of staffProfiles) {
    // Last 7 days attendance
    for (let d = 0; d < 7; d++) {
      const date = subDays(today, d);
      const isLate = Math.random() > 0.8;
      const tardyMinutes = isLate ? 20 : 0;
      const deduction = isLate ? 5 : 0; // 20 - 15 = 5

      await prisma.attendance.upsert({
        where: { uk_staff_date: { staff_id: staff.id, date } },
        update: {},
        create: {
          staff_id: staff.id,
          date,
          check_in: isLate ? new Date(date.setHours(12, 20)) : new Date(date.setHours(12, 0)),
          check_out: new Date(date.setHours(20, 0)),
          tardiness_minutes: tardyMinutes,
          deduction_amount: deduction
        }
      });
    }
  }

  // --- 5. SEED REVIEWS ---
  console.log('Seeding Reviews...');
  const reviews = [
    { rating: 5, tags: ["Highly skilled", "Great conversation"] },
    { rating: 4, tags: ["Professional"] },
    { rating: 5, tags: ["Extremely hygienic", "Very gentle"] }
  ];

  const completedItems = await prisma.appointmentItem.findMany({ 
    where: { status: AppointmentStatus.completed },
    include: { appointment: true },
    take: 10 
  });

  for (let i = 0; i < Math.min(completedItems.length, reviews.length); i++) {
    const item = completedItems[i];
    const rev = reviews[i];
    await prisma.review.upsert({
      where: { appointment_item_id: item.id },
      update: {},
      create: {
        customer_id: item.appointment.customer_id,
        staff_id: item.staff_id,
        appointment_item_id: item.id,
        rating: rev.rating,
        tags: rev.tags,
        is_approved_for_public: i % 2 === 0
      }
    });
  }

  // --- 6. SEED MESSAGES ---
  console.log('Seeding Messages...');
  const systemUser = await prisma.user.findFirst({ where: { role: Role.manager } });
  if (systemUser) {
    for (const staff of staffProfiles) {
      await prisma.message.create({
        data: {
          sender_id: systemUser.id,
          receiver_id: staff.user_id,
          subject: 'Welcome to V2',
          body: 'Your payroll and commission tracking is now active. Please check your workspace.',
        }
      });
    }
  }

  // --- 7. SEED SYSTEM SETTINGS ---
  console.log('Seeding System Settings...');
  await (prisma as any).systemSettings.upsert({
    where: { key: 'global_sales_target' },
    update: {},
    create: {
      key: 'global_sales_target',
      value: '8000.00',
      description: 'Global monthly sales target fallback'
    }
  });

  console.log('Comprehensive Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
