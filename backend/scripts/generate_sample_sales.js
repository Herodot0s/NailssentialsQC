const { PrismaClient } = require('@prisma/client');
const { format, addDays } = require('date-fns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

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
    console.error('❌ No customer found.');
    return;
  }

  if (staff.length === 0) {
    console.error('❌ No staff found.');
    return;
  }

  const startDate = new Date('2026-05-11');
  let totalGenerated = 0;

  for (let d = 0; d <= 6; d++) {
    const currentDate = addDays(startDate, d);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    console.log(`📅 Processing ${dateStr}...`);

    const numApps = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numApps; i++) {
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];
      
      const hour = 12 + Math.floor(Math.random() * 8);
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      const endHour = hour + Math.floor((randomService.duration_minutes + minute) / 60);
      const endMinute = (randomService.duration_minutes + minute) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;

      const appointment = await prisma.appointment.create({
        data: {
          customer_id: customer.id,
          appointment_date: currentDate,
          status: 'completed',
          is_walk_in: true,
          items: {
            create: {
              service_id: randomService.id,
              staff_id: randomStaff.id,
              status: 'completed',
              start_time: startTime,
              end_time: endTime,
              price_at_booking: randomService.price,
            }
          }
        }
      });

      const receiptNum = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const transaction = await prisma.transaction.create({
        data: {
          appointment_id: appointment.id,
          amount: randomService.price,
          payment_method: Math.random() > 0.3 ? 'cash' : 'gcash',
          status: 'completed',
          transaction_date: currentDate,
          receipt_number: receiptNum,
        }
      });

      const rate = Number(randomStaff.base_commission_rate) || 0.10;
      const commissionAmount = Number(randomService.price) * rate;

      await prisma.commission.create({
        data: {
          transaction_id: transaction.id,
          staff_id: randomStaff.id,
          service_id: randomService.id,
          base_amount: randomService.price,
          commission_rate: rate,
          commission_amount: commissionAmount,
          commission_date: currentDate,
          period_week: 20,
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
