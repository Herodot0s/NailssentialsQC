import { PrismaClient, Role, AppointmentStatus, PaymentMethod, TransactionStatus } from '@prisma/client';
import { format, startOfDay, addDays, setHours, setMinutes } from 'date-fns';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Generating sample sales data for May 11 - 17, 2026...');

  const staff = await prisma.staffProfile.findMany({
    include: { user: true },
    where: { user: { role: 'staff', is_active: true } }
  });

  const services = await prisma.service.findMany({
    where: { is_active: true },
    take: 10
  });

  const customer = await prisma.customerProfile.findFirst();
  if (!customer) {
    console.error('❌ No customer found. Please create a customer first.');
    return;
  }

  if (staff.length === 0) {
    console.error('❌ No staff found. Please create staff first.');
    return;
  }

  if (services.length === 0) {
    console.error('❌ No services found. Please create services first.');
    return;
  }

  const startDate = new Date('2026-05-11');
  const endDate = new Date('2026-05-17');

  let totalGenerated = 0;

  for (let d = 0; d <= 6; d++) {
    const currentDate = addDays(startDate, d);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    console.log(`📅 Processing ${dateStr}...`);

    // Generate 3-5 appointments per day
    const numApps = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numApps; i++) {
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];
      
      const hour = 12 + Math.floor(Math.random() * 8); // 12 PM to 8 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      const endHour = hour + Math.floor((randomService.duration_minutes + minute) / 60);
      const endMinute = (randomService.duration_minutes + minute) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;

      // Create Appointment
      const appointment = await prisma.appointment.create({
        data: {
          customer_id: customer.id,
          appointment_date: currentDate,
          status: 'completed' as AppointmentStatus,
          is_walk_in: true,
          items: {
            create: {
              service_id: randomService.id,
              staff_id: randomStaff.id,
              status: 'completed' as AppointmentStatus,
              start_time: startTime,
              end_time: endTime,
              price_at_booking: randomService.price,
            }
          }
        },
        include: { items: true }
      });

      // Create Transaction
      const receiptNum = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const transaction = await prisma.transaction.create({
        data: {
          appointment_id: appointment.id,
          amount: randomService.price,
          payment_method: Math.random() > 0.3 ? 'cash' as PaymentMethod : 'gcash' as PaymentMethod,
          status: 'completed' as TransactionStatus,
          transaction_date: currentDate,
          receipt_number: receiptNum,
        }
      });

      // Create Commission
      // Use logic similar to payrollController.ts
      const rate = randomStaff.base_commission_rate || 0.10;
      const commissionAmount = Number(randomService.price) * Number(rate);

      await prisma.commission.create({
        data: {
          transaction_id: transaction.id,
          staff_id: randomStaff.id,
          service_id: randomService.id,
          base_amount: randomService.price,
          commission_rate: rate,
          commission_amount: commissionAmount,
          commission_date: currentDate,
          period_week: 20, // May 11-17 is week 20 of 2026
          period_month: 5,
          period_year: 2026,
          is_paid: false
        }
      });

      totalGenerated++;
    }
  }

  console.log(`✅ Successfully generated ${totalGenerated} sample sales!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
