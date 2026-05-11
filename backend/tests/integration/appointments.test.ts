import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';
import { format, addDays } from 'date-fns';

describe('Appointment Integration Tests', () => {
  let customerToken: string;
  let staffToken: string;
  let managerToken: string;
  let customerId: number;
  let staffId: number;
  let serviceId: number;
  let categoryId: number;

  beforeEach(async () => {
    // 0. Create category
    const category = await prisma.serviceCategory.upsert({
      where: { name: 'Nails' },
      update: {},
      create: { name: 'Nails', description: 'Nail services' }
    });
    categoryId = category.id;

    // 1. Create a service
    const service = await prisma.service.create({
      data: {
        name: 'Manicure ' + Date.now(), // Unique name to avoid conflicts
        description: 'Basic manicure',
        price: 500,
        duration_minutes: 30,
        category_id: categoryId,
      },
    });
    serviceId = service.id;

    // 2. Create a customer
    const email = `customer_${Date.now()}@example.com`;
    const customerUserResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Customer',
        email: email,
        password: 'Password123!',
        phone: Math.random().toString().slice(2, 12),
      });
    customerToken = customerUserResponse.body.data.tokens.accessToken;
    const customerProfile = await prisma.customerProfile.findFirst({
      where: { user: { email: email } }
    });
    customerId = customerProfile!.id;
  });

  // Helper to get staff token (properly)
  const getTokensForRole = async (role: 'staff' | 'manager', email: string, name: string) => {
    const bcrypt = require('bcrypt');
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        username: email.split('@')[0] + Date.now(),
        password_hash: hashedPassword,
        role: role,
        email: email,
      }
    });

    if (role === 'staff') {
      const profile = await prisma.staffProfile.create({
        data: {
          user_id: user.id,
          full_name: name,
        }
      });
      staffId = profile.id;
    }

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: email,
        password: password,
      });
    
    return response.body.data.tokens.accessToken;
  };

  describe('Task 1: Appointment Creation and Availability Tests', () => {
    beforeEach(async () => {
      staffToken = await getTokensForRole('staff', `staff_${Date.now()}@example.com`, 'Test Staff');
      managerToken = await getTokensForRole('manager', `manager_${Date.now()}@example.com`, 'Test Manager');
    });

    describe('POST /api/v1/appointments', () => {
      it('should successfully create an appointment as a customer', async () => {
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1);
        const payload = {
          date: appointmentDate.toISOString(),
          items: [
            {
              serviceId: serviceId,
              staffId: staffId,
              startTime: '14:00',
            }
          ],
          notes: 'Looking forward to it',
        };

        const response = await request(app)
          .post('/api/v1/appointments')
          .set('Authorization', `Bearer ${customerToken}`)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.customer_id).toBe(customerId);
        
        // Verify in DB
        const appointment = await prisma.appointment.findUnique({
          where: { id: response.body.data.id },
          include: { items: true }
        });
        expect(appointment).toBeDefined();
        expect(appointment!.items.length).toBe(1);
        expect(appointment!.items[0].service_id).toBe(serviceId);
        expect(appointment!.items[0].staff_id).toBe(staffId);
      });

      it('should successfully create a walk-in appointment as a manager', async () => {
        const appointmentDate = new Date().toISOString();
        const payload = {
          date: appointmentDate,
          isWalkIn: true,
          items: [
            {
              serviceId: serviceId,
              staffId: staffId,
              startTime: '10:00',
            }
          ],
        };

        const response = await request(app)
          .post('/api/v1/appointments')
          .set('Authorization', `Bearer ${managerToken}`)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.is_walk_in).toBe(true);
        expect(response.body.data.status).toBe('in_progress');

        const appointment = await prisma.appointment.findUnique({
          where: { id: response.body.data.id },
          include: { customer: true }
        });
        expect(appointment!.customer.full_name).toBe('Walk-in Customer');
      });

      it('should fail validation for invalid dates', async () => {
        const payload = {
          date: 'invalid-date',
          items: [
            {
              serviceId: serviceId.toString(),
              staffId: staffId.toString(),
              startTime: '14:00',
            }
          ],
        };

        const response = await request(app)
          .post('/api/v1/appointments')
          .set('Authorization', `Bearer ${customerToken}`)
          .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/v1/appointments/availability', () => {
      it('should return availability slots', async () => {
        const date = format(addDays(new Date(), 2), 'yyyy-MM-dd');
        const response = await request(app)
          .get(`/api/v1/appointments/availability?date=${date}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        
        // Verify all slots are available since no appointments booked
        const allAvailable = response.body.data.every((slot: any) => slot.available === true);
        expect(allAvailable).toBe(true);
      });

      it('should mark slot as unavailable when ALL available staff are booked', async () => {
        const date = format(addDays(new Date(), 3), 'yyyy-MM-dd');
        const startTime = '14:00';

        // 1. Find all currently available technicians
        const technicians = await prisma.staffProfile.findMany({
          where: { is_available: true }
        });

        // 2. Book an appointment for EVERY technician at the same time
        for (const tech of technicians) {
          await prisma.appointment.create({
            data: {
              customer_id: customerId,
              appointment_date: new Date(date),
              status: 'confirmed',
              items: {
                create: {
                  service_id: serviceId,
                  staff_id: tech.id,
                  start_time: startTime,
                  end_time: '14:30',
                  price_at_booking: 500,
                  status: 'confirmed',
                }
              }
            }
          });
        }

        const response = await request(app)
          .get(`/api/v1/appointments/availability?date=${date}`);

        expect(response.status).toBe(200);
        const slot14 = response.body.data.find((s: any) => s.time === '14:00');
        expect(slot14.available).toBe(false);
      });
    });
  });

  describe('Task 2: Appointment Completion and Commission Tests', () => {
    let appointmentId: number;

    beforeEach(async () => {
      // Re-setup with proper tokens
      staffToken = await getTokensForRole('staff', `staff_comp_${Date.now()}@example.com`, 'Comp Staff');
      managerToken = await getTokensForRole('manager', `manager_comp_${Date.now()}@example.com`, 'Comp Manager');

      // 1. Service
      const service = await prisma.service.create({
        data: {
          name: 'Premium Manicure ' + Date.now(),
          description: 'Top tier manicure',
          price: 1000,
          duration_minutes: 60,
          category_id: categoryId,
        },
      });
      serviceId = service.id;

      // 2. Create an appointment to complete
      const appointmentDate = format(new Date(), 'yyyy-MM-dd');
      const appointment = await prisma.appointment.create({
        data: {
          customer_id: customerId,
          appointment_date: new Date(appointmentDate),
          status: 'confirmed',
          items: {
            create: {
              service_id: serviceId,
              staff_id: staffId,
              start_time: '10:00',
              end_time: '11:00',
              price_at_booking: 1000,
              status: 'confirmed',
            }
          }
        }
      });
      appointmentId = appointment.id;
    });

    it('should successfully complete an appointment and create transaction/commissions', async () => {
      const response = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ paymentMethod: 'cash' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify Appointment Status
      const updatedAppt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { items: true }
      });
      expect(updatedAppt!.status).toBe('completed');
      expect(updatedAppt!.items[0].status).toBe('completed');

      // Verify Transaction
      const transaction = await prisma.transaction.findFirst({
        where: { appointment_id: appointmentId }
      });
      expect(transaction).toBeDefined();
      expect(transaction!.amount.toNumber()).toBe(1000);
      expect(transaction!.payment_method).toBe('cash');
      expect(transaction!.receipt_number).toMatch(/^REC-\d{6}-\d{4}$/);

      // Verify Commission
      const commission = await prisma.commission.findFirst({
        where: { transaction_id: transaction!.id }
      });
      expect(commission).toBeDefined();
      expect(commission!.staff_id).toBe(staffId);
      expect(commission!.base_amount.toNumber()).toBe(1000);
      // Default rate should be 5% (0.05) since no previous sales
      expect(commission!.commission_rate.toNumber()).toBe(5);
      expect(commission!.commission_amount.toNumber()).toBe(50);

      // Verify System Log
      const systemLog = await prisma.systemLog.findFirst({
        where: {
          action: 'COMMISSIONS_CREATED',
          entity_id: appointmentId
        }
      });
      expect(systemLog).toBeDefined();
    });

    it('should calculate higher commission rate when specialty quota is met', async () => {
      // Setup: Create 6000 worth of sales for this staff this month
      // We need to create completed commissions for this staff
      const dummyTransaction = await prisma.transaction.create({
        data: {
          amount: 6000,
          payment_method: 'cash',
          status: 'completed',
          receipt_number: 'DUMMY-' + Date.now(),
          appointment_id: appointmentId // Using same appt as placeholder
        }
      });

      await prisma.commission.create({
        data: {
          transaction_id: dummyTransaction.id,
          staff_id: staffId,
          service_id: serviceId,
          base_amount: 6000,
          commission_rate: 5,
          commission_amount: 300,
          commission_date: new Date(),
          period_week: 1,
          period_month: new Date().getMonth() + 1,
          period_year: new Date().getFullYear(),
        }
      });

      const response = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ paymentMethod: 'gcash' });

      expect(response.status).toBe(200);
      const commission = await prisma.commission.findFirst({
        where: { 
          transaction_id: response.body.data.transaction.id,
          staff_id: staffId
        }
      });
      // Rate should be 20% (Specially Quota met)
      expect(commission!.commission_rate.toNumber()).toBe(20);
      expect(commission!.commission_amount.toNumber()).toBe(200);
    });

    it('should rollback transaction if completion fails (e.g. invalid data)', async () => {
      // Let's try to pass an invalid payment method that's not in the enum
      // This should cause Prisma to throw when creating the transaction
      const response = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ paymentMethod: 'INVALID_METHOD' });

      expect(response.status).toBe(400);

      // Verify no transaction was created for this appointment
      // Wait, there might be other transactions if tests run in parallel,
      // but findFirst with appointment_id should be specific to this test's appt.
      const transaction = await prisma.transaction.findFirst({
        where: { appointment_id: appointmentId }
      });
      expect(transaction).toBeNull();

      // Verify appointment is still 'confirmed'
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });
      expect(appt!.status).toBe('confirmed');
    });
  });
});
