import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';
import { addDays } from 'date-fns';

describe('Salary Structure and Component Management Integration Tests', () => {
  let managerToken: string;
  let staffId: number;

  beforeEach(async () => {
    // 1. Create a Manager
    const managerResponse = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Manager User',
      email: 'manager_setup@example.com',
      password: 'Password123',
      phone: '1234567891',
    });

    await prisma.user.update({
      where: { id: managerResponse.body.data.user.id },
      data: { role: 'manager' },
    });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      identifier: 'manager_setup@example.com',
      password: 'Password123',
    });
    managerToken = loginResponse.body.data.tokens.accessToken;

    // 2. Create a Staff Profile
    const staffResponse = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Staff User',
      email: 'staff_setup@example.com',
      password: 'Password123',
      phone: '0987654322',
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

  describe('Salary Components', () => {
    it('should create and fetch salary components', async () => {
      const createResponse = await request(app)
        .post('/api/v1/payroll/components')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Travel Allowance',
          type: 'earning',
          description: 'Monthly travel allowance',
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data.name).toBe('Travel Allowance');

      const getResponse = await request(app)
        .get('/api/v1/payroll/components')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.some((c: any) => c.name === 'Travel Allowance')).toBe(true);
    });
  });

  describe('Salary Structures', () => {
    it('should create and fetch salary structures with components', async () => {
      // 1. Create component
      const componentResponse = await request(app)
        .post('/api/v1/payroll/components')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Rice Subsidy',
          type: 'earning',
          description: 'Rice subsidy',
        });

      const componentId = componentResponse.body.data.id;

      // 2. Create structure
      const structureResponse = await request(app)
        .post('/api/v1/payroll/structures')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Standard Package',
          description: 'Standard benefits package',
          is_active: true,
          components: [
            {
              salary_component_id: componentId,
              amount: 500,
            }
          ]
        });

      expect(structureResponse.status).toBe(201);
      expect(structureResponse.body.data.name).toBe('Standard Package');
      expect(structureResponse.body.data.components.length).toBe(1);

      // 3. Get structures
      const getResponse = await request(app)
        .get('/api/v1/payroll/structures')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.some((s: any) => s.name === 'Standard Package')).toBe(true);
    });
  });

  describe('Salary Structure Assignments', () => {
    it('should create and fetch assignments', async () => {
      // 1. Setup structure
      const componentResponse = await request(app)
        .post('/api/v1/payroll/components')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Internet Allowance',
          type: 'earning',
        });

      const componentId = componentResponse.body.data.id;

      const structureResponse = await request(app)
        .post('/api/v1/payroll/structures')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Remote Package',
          components: [{ salary_component_id: componentId, amount: 200 }]
        });

      const structureId = structureResponse.body.data.id;

      // 2. Create assignment
      const assignmentResponse = await request(app)
        .post('/api/v1/payroll/assignments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          staff_id: staffId,
          salary_structure_id: structureId,
          base_pay: 3000,
          effective_from: new Date().toISOString()
        });

      expect(assignmentResponse.status).toBe(201);
      expect(Number(assignmentResponse.body.data.base_pay)).toBe(3000);

      // 3. Get assignments
      const getResponse = await request(app)
        .get('/api/v1/payroll/assignments')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.some((a: any) => a.staff_id === staffId)).toBe(true);
    });
  });

  describe('Payroll Engine - Salary Structure Integration', () => {
    it('should apply assigned salary structure during payroll generation', async () => {
      // 1. Create structure with earning and deduction components
      const earningComp = await prisma.salaryComponent.create({
        data: { name: 'Earning Comp', type: 'earning' }
      });
      const deductionComp = await prisma.salaryComponent.create({
        data: { name: 'Deduction Comp', type: 'deduction' }
      });

      const structure = await prisma.salaryStructure.create({
        data: {
          name: 'Full Package',
          components: {
            create: [
              { salary_component_id: earningComp.id, amount: 500 },
              { salary_component_id: deductionComp.id, amount: 100 }
            ]
          }
        }
      });

      // 2. Assign to staff
      const effectiveDate = new Date();
      effectiveDate.setDate(effectiveDate.getDate() - 10); // 10 days ago

      await request(app)
        .post('/api/v1/payroll/assignments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          staff_id: staffId,
          salary_structure_id: structure.id,
          base_pay: 2000,
          effective_from: effectiveDate.toISOString()
        });

      // 3. Generate payroll
      const today = new Date();
      const startDate = addDays(today, -7);
      const endDate = today;

      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      expect(response.status).toBe(201);

      // 4. Verify payroll items and calculations
      const payroll = await prisma.staffPayroll.findFirst({
        where: { staff_id: staffId, payroll_period_id: response.body.data.id },
        include: { items: true }
      });

      expect(payroll).toBeDefined();

      // Weeks in period should be 1
      // base_pay from assignment is 2000
      // earning comp: 500
      // deduction comp: 100

      expect(Number(payroll?.base_pay)).toBe(2500);
      expect(Number(payroll?.deductions)).toBe(100);
      expect(Number(payroll?.net_pay)).toBe(2400);

      const itemNames = payroll?.items.map(i => i.component_name);
      expect(itemNames).toContain('Base Pay');
      expect(itemNames).toContain('Earning Comp');
      expect(itemNames).toContain('Deduction Comp');
    });
  });
});
