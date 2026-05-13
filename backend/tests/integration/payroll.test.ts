import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

describe('Payroll Integration Tests', () => {
  let managerToken: string;
  let staffId: number;

  beforeEach(async () => {
    // 1. Create a Manager
    const managerResponse = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Manager User',
      email: 'manager@example.com',
      password: 'Password123',
      phone: '1234567890',
    });

    // Manually promote to manager in DB
    await prisma.user.update({
      where: { id: managerResponse.body.data.user.id },
      data: { role: 'manager' },
    });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      identifier: 'manager@example.com',
      password: 'Password123',
    });
    managerToken = loginResponse.body.data.tokens.accessToken;

    // 2. Create a Staff Profile
    const staffResponse = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Staff User',
      email: 'staff@example.com',
      password: 'Password123',
      phone: '0987654321',
    });

    const staffUserId = staffResponse.body.data.user.id;
    await prisma.user.update({
      where: { id: staffUserId },
      data: { role: 'staff' },
    });

    // We need to move the profile from customer to staff
    await prisma.customerProfile.delete({
      where: { user_id: staffUserId },
    });

    const staffProfile = await prisma.staffProfile.create({
      data: {
        user_id: staffUserId,
        full_name: 'Staff User',
        base_pay_per_week: 1000,
        is_available: true,
      },
    });
    staffId = staffProfile.id;
  });

  describe('POST /api/v1/payroll/generate', () => {
    it('should generate payroll with correct calculations', async () => {
      // 1. Setup previous month commissions
      // To create a commission, we need a service and a transaction
      const category = await prisma.serviceCategory.create({
        data: { name: 'Test Category' },
      });

      const service = await prisma.service.create({
        data: {
          name: 'Test Service',
          category_id: category.id,
          duration_minutes: 30,
          price: 1000,
        },
      });

      const customer = await prisma.customerProfile.create({
        data: {
          user_id: (await prisma.user.findFirst({ where: { role: 'manager' } }))!.id, // Reuse manager user for simplicity
          full_name: 'Test Customer',
        },
      });

      const appointment = await prisma.appointment.create({
        data: {
          customer_id: customer.id,
          appointment_date: new Date(),
          status: 'completed',
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          appointment_id: appointment.id,
          amount: 1000,
          payment_method: 'cash',
          status: 'completed',
          receipt_number: 'REC-001',
        },
      });

      const today = new Date();
      const lastMonth = subMonths(today, 1);
      const prevMonthStart = startOfMonth(lastMonth);

      await prisma.commission.create({
        data: {
          staff_id: staffId,
          transaction_id: transaction.id,
          service_id: service.id,
          base_amount: 1000,
          commission_rate: 40,
          commission_amount: 400, // Should result in 100 commission for the period (400/4)
          commission_date: prevMonthStart,
          period_week: 1,
          period_month: prevMonthStart.getMonth() + 1,
          period_year: prevMonthStart.getFullYear(),
          is_paid: false,
        },
      });

      // 2. Setup a deduction
      await prisma.deductionLog.create({
        data: {
          staff_id: staffId,
          type: 'Advance',
          amount: 50,
          notes: 'Advance payment',
        },
      });

      // 3. Generate payroll for a 1-week period
      const startDate = startOfMonth(today);
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000 + 3600000); // 6 days + 1 hour to ensure > 6 days

      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const payrollPeriodId = response.body.data.id;

      // 4. Verify staff payroll entry
      const staffPayroll = await prisma.staffPayroll.findFirst({
        where: { payroll_period_id: payrollPeriodId, staff_id: staffId },
      });

      expect(staffPayroll).toBeDefined();
      // base_pay = 1000 * 1 = 1000
      // commissions = 400 / 4 = 100
      // deductions = 50
      // net_pay = 1000 + 100 - 50 = 1050

      expect(Number(staffPayroll?.base_pay)).toBe(1000);
      expect(Number(staffPayroll?.commissions)).toBe(100);
      expect(Number(staffPayroll?.deductions)).toBe(50);
      expect(Number(staffPayroll?.net_pay)).toBe(1050);

      // 5. Verify Audit Log
      const auditLog = await prisma.systemLog.findFirst({
        where: { action: 'PAYROLL_GENERATED' },
      });
      expect(auditLog).toBeDefined();

      // 6. Verify Commissions marked as paid
      const commission = await prisma.commission.findFirst({
        where: { staff_id: staffId },
      });
      expect(commission?.is_paid).toBe(true);
    });

    it('should reject overlapping payroll periods', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('overlap');
    });
  });

  describe('Payroll Locking and Export', () => {
    let periodId: number;

    beforeEach(async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      periodId = response.body.data.id;
    });

    it('should lock a payroll period', async () => {
      const response = await request(app)
        .patch(`/api/v1/payroll/periods/${periodId}/lock`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.is_locked).toBe(true);

      // Verify audit log
      const auditLog = await prisma.systemLog.findFirst({
        where: { action: 'PAYROLL_LOCKED', target_id: periodId },
      });
      expect(auditLog).toBeDefined();
    });

    it('should fail to lock an already locked period', async () => {
      await request(app)
        .patch(`/api/v1/payroll/periods/${periodId}/lock`)
        .set('Authorization', `Bearer ${managerToken}`);

      const response = await request(app)
        .patch(`/api/v1/payroll/periods/${periodId}/lock`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already locked');
    });

    it('should export payroll to Excel', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/export/${periodId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.body).toBeDefined();
    });
  });
});
