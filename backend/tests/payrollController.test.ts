import request from 'supertest';
import app from '../src/index';
import prisma from '../src/utils/prisma';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';

describe('Payroll Controller Tests', () => {
  let managerToken: string;
  let staffId: number;
  let managerUserId: number;

  beforeEach(async () => {
    // Clean database tables in correct dependency order
    await prisma.deductionLog.deleteMany({});
    await prisma.staffPayrollItem.deleteMany({});
    await prisma.staffPayroll.deleteMany({});
    await prisma.payrollPeriod.deleteMany({});
    await prisma.salaryStructureAssignment.deleteMany({});
    await prisma.salaryStructureComponent.deleteMany({});
    await prisma.salaryStructure.deleteMany({});
    await prisma.salaryComponent.deleteMany({});
    await prisma.commission.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.appointmentItem.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.staffProfile.deleteMany({});
    await prisma.customerProfile.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.serviceCategory.deleteMany({});

    // 1. Create a Manager User
    const managerPayload = {
      fullName: 'Payroll Manager',
      email: `manager_${Math.random().toString(36).substring(7)}@example.com`,
      password: 'Password123',
      phone: `09${Math.random().toString().slice(2, 10)}`,
    };

    const managerRegister = await request(app).post('/api/v1/auth/register').send(managerPayload);
    managerUserId = managerRegister.body.data.user.id;

    await prisma.user.update({
      where: { id: managerUserId },
      data: { role: 'manager' },
    });

    const managerLogin = await request(app).post('/api/v1/auth/login').send({
      identifier: managerPayload.email,
      password: managerPayload.password,
    });
    managerToken = managerLogin.body.data.tokens.accessToken;

    // Make sure customer profile exists for the manager
    await prisma.customerProfile.upsert({
      where: { user_id: managerUserId },
      update: { full_name: 'Payroll Manager' },
      create: {
        user_id: managerUserId,
        full_name: 'Payroll Manager',
      },
    });

    // 2. Create a Staff User
    const staffPayload = {
      fullName: 'Hair Technician',
      email: `staff_${Math.random().toString(36).substring(7)}@example.com`,
      password: 'Password123',
      phone: `09${Math.random().toString().slice(2, 10)}`,
    };

    const staffRegister = await request(app).post('/api/v1/auth/register').send(staffPayload);
    const staffUserId = staffRegister.body.data.user.id;

    await prisma.user.update({
      where: { id: staffUserId },
      data: { role: 'staff' },
    });

    // Delete customer profile automatically created for staff during registration
    await prisma.customerProfile.deleteMany({
      where: { user_id: staffUserId },
    });

    const staffProfile = await prisma.staffProfile.create({
      data: {
        user_id: staffUserId,
        full_name: 'Hair Technician',
        base_pay_per_week: 1000,
        is_available: true,
        specializations: 'hair cuts, hair styling',
      },
    });
    staffId = staffProfile.id;
  });

  describe('Weekly Hair Specialization Quota', () => {
    it('should calculate hair specialization commissions at 10% when weekly sales are under 6000', async () => {
      // 1. Create a Hair service category
      const category = await prisma.serviceCategory.create({
        data: { name: 'Hair Services' },
      });

      const service = await prisma.service.create({
        data: {
          name: 'Premium Haircut',
          category_id: category.id,
          duration_minutes: 60,
          price: 5000,
        },
      });

      // 2. Setup a transaction and appointment
      const managerCustomer = await prisma.customerProfile.findUnique({
        where: { user_id: managerUserId },
      });

      const appointment = await prisma.appointment.create({
        data: {
          customer_id: managerCustomer!.id,
          appointment_date: new Date(),
          status: 'completed',
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          appointment_id: appointment.id,
          amount: 5000,
          payment_method: 'cash',
          status: 'completed',
          receipt_number: 'REC-HAIR-101',
        },
      });

      // Create commission record under 6k (e.g. 5000 base_amount)
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

      await prisma.commission.create({
        data: {
          staff_id: staffId,
          transaction_id: transaction.id,
          service_id: service.id,
          base_amount: 5000,
          commission_rate: 10,
          commission_amount: 500, // 10% fallback
          commission_date: addDays(startDate, 2),
          period_week: 1,
          period_month: startDate.getMonth() + 1,
          period_year: startDate.getFullYear(),
        },
      });

      // Generate payroll
      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      expect(response.status).toBe(201);

      const payroll = await prisma.staffPayroll.findFirst({
        where: { staff_id: staffId },
        include: { items: true },
      });

      // Expect commission to be 5000 * 10% = 500
      expect(Number(payroll?.commissions)).toBe(500);
      expect(payroll?.items.some((item) => item.component_name === 'Hair Specialty Commission' && Number(item.amount) === 500)).toBe(true);
    });

    it('should calculate hair specialization commissions at 20% when weekly sales hit 6000 or more', async () => {
      const category = await prisma.serviceCategory.create({
        data: { name: 'Hair Services' },
      });

      const service = await prisma.service.create({
        data: {
          name: 'Premium Hair Treatment',
          category_id: category.id,
          duration_minutes: 90,
          price: 7000,
        },
      });

      const managerCustomer = await prisma.customerProfile.findUnique({
        where: { user_id: managerUserId },
      });

      const appointment = await prisma.appointment.create({
        data: {
          customer_id: managerCustomer!.id,
          appointment_date: new Date(),
          status: 'completed',
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          appointment_id: appointment.id,
          amount: 7000,
          payment_method: 'cash',
          status: 'completed',
          receipt_number: 'REC-HAIR-202',
        },
      });

      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

      await prisma.commission.create({
        data: {
          staff_id: staffId,
          transaction_id: transaction.id,
          service_id: service.id,
          base_amount: 7000,
          commission_rate: 10,
          commission_amount: 700,
          commission_date: addDays(startDate, 2),
          period_week: 1,
          period_month: startDate.getMonth() + 1,
          period_year: startDate.getFullYear(),
        },
      });

      // Generate payroll
      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      expect(response.status).toBe(201);

      const payroll = await prisma.staffPayroll.findFirst({
        where: { staff_id: staffId },
        include: { items: true },
      });

      // Expect commission to be 7000 * 20% = 1400 (quota unlocked)
      expect(Number(payroll?.commissions)).toBe(1400);
      expect(payroll?.items.some((item) => item.component_name === 'Hair Specialty Commission' && Number(item.amount) === 1400)).toBe(true);
    });
  });

  describe('Salary Structure Assignments with Dynamic Formulas', () => {
    it('should calculate payroll using dynamic formulas', async () => {
      // 1. Create a Salary Component for Earning (Sales Bonus)
      const earningComponent = await prisma.salaryComponent.create({
        data: {
          name: 'Sales Bonus',
          type: 'earning',
          description: '10% of total sales',
        },
      });

      // 2. Create a Salary Component for Deduction (Formula-based Tax)
      const deductionComponent = await prisma.salaryComponent.create({
        data: {
          name: 'Custom Tax',
          type: 'deduction',
          description: '5% of base salary',
        },
      });

      // 3. Create a Salary Structure
      const structure = await prisma.salaryStructure.create({
        data: {
          name: 'Senior Stylist Structure',
          description: 'Structure with performance formulas',
          is_active: true,
        },
      });

      // Attach components to structure with formulas
      await prisma.salaryStructureComponent.createMany({
        data: [
          {
            salary_structure_id: structure.id,
            salary_component_id: earningComponent.id,
            formula: 'total_sales * 0.10',
          },
          {
            salary_structure_id: structure.id,
            salary_component_id: deductionComponent.id,
            formula: 'base * 0.05',
          },
        ],
      });

      // 4. Assign structure to the Staff profile
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

      await prisma.salaryStructureAssignment.create({
        data: {
          staff_id: staffId,
          salary_structure_id: structure.id,
          base_pay: 2000, // Weekly base pay override
          effective_from: addDays(startDate, -5),
          is_active: true,
        },
      });

      // Setup standard service, category, appointment, transaction, commission so total_sales > 0
      const category = await prisma.serviceCategory.create({
        data: { name: 'Nails' },
      });

      const service = await prisma.service.create({
        data: {
          name: 'Manicure',
          category_id: category.id,
          duration_minutes: 30,
          price: 5000,
        },
      });

      const managerCustomer = await prisma.customerProfile.findUnique({
        where: { user_id: managerUserId },
      });

      const appointment = await prisma.appointment.create({
        data: {
          customer_id: managerCustomer!.id,
          appointment_date: new Date(),
          status: 'completed',
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          appointment_id: appointment.id,
          amount: 5000,
          payment_method: 'cash',
          status: 'completed',
          receipt_number: 'REC-NAIL-303',
        },
      });

      await prisma.commission.create({
        data: {
          staff_id: staffId,
          transaction_id: transaction.id,
          service_id: service.id,
          base_amount: 5000,
          commission_rate: 10,
          commission_amount: 500,
          commission_date: addDays(startDate, 2),
          period_week: 1,
          period_month: startDate.getMonth() + 1,
          period_year: startDate.getFullYear(),
        },
      });

      // Generate payroll
      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      expect(response.status).toBe(201);

      const payroll = await prisma.staffPayroll.findFirst({
        where: { staff_id: staffId },
        include: { items: true },
      });

      // Expected values:
      // Weeks in period = 1
      // Base pay = 2000 * 1 = 2000
      // Total sales = 5000
      // Sales Bonus (earning component) = 5000 * 0.10 = 500
      // Custom Tax (deduction component) = 2000 * 0.05 = 100
      // Non-hair commissions = 500
      // Total earnings = Base pay (2000) + Sales Bonus (500) + Commission (500) = 3000
      // Total deductions = Custom Tax (100)
      // Net pay = 3000 - 100 = 2900

      const salesBonusItem = payroll?.items.find((item) => item.component_name === 'Sales Bonus');
      const customTaxItem = payroll?.items.find((item) => item.component_name === 'Custom Tax');

      expect(salesBonusItem).toBeDefined();
      expect(Number(salesBonusItem?.amount)).toBe(500);

      expect(customTaxItem).toBeDefined();
      expect(Number(customTaxItem?.amount)).toBe(100);

      expect(Number(payroll?.base_pay)).toBe(2500); // 2000 base + 500 sales bonus earning
      expect(Number(payroll?.commissions)).toBe(500);
      expect(Number(payroll?.deductions)).toBe(100);
      expect(Number(payroll?.net_pay)).toBe(2900); // 2500 + 500 - 100 = 2900
    });
  });
});
