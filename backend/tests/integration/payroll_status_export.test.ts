import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import * as ExcelJS from 'exceljs';


describe('Payroll Status and Export Tests', () => {
  let managerToken: string;
  let staffId: number;
  let payrollPeriodId: number;
  let staffPayrollId: number;

  beforeAll(async () => {
    // 1. Create a Manager
    const managerResponse = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Payroll Manager',
      email: 'payroll_manager@example.com',
      password: 'Password123',
      phone: '1112223333',
    });

    await prisma.user.update({
      where: { id: managerResponse.body.data.user.id },
      data: { role: 'manager' },
    });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      identifier: 'payroll_manager@example.com',
      password: 'Password123',
    });
    managerToken = loginResponse.body.data.tokens.accessToken;

    // 2. Create a Staff Profile
    const staffResponse = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Payroll Staff',
      email: 'payroll_staff@example.com',
      password: 'Password123',
      phone: '4445556666',
    });

    const staffUserId = staffResponse.body.data.user.id;
    await prisma.user.update({
      where: { id: staffUserId },
      data: { role: 'staff' },
    });

    await prisma.customerProfile.deleteMany({
      where: { user_id: staffUserId },
    });

    await prisma.staffProfile.deleteMany({
      where: { user_id: staffUserId },
    });

    const staffProfile = await prisma.staffProfile.create({
      data: {
        user_id: staffUserId,
        full_name: 'Payroll Staff',
        base_pay_per_week: 1000,
        is_available: true,
      },
    });
    staffId = staffProfile.id;

    // 3. Generate a payroll period
    const startDate = new Date('2026-05-01');
    const endDate = new Date('2026-05-07');

    const periodResponse = await request(app)
      .post('/api/v1/payroll/generate')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

    payrollPeriodId = periodResponse.body.data.id;

    const staffPayroll = await prisma.staffPayroll.findFirst({
      where: { payroll_period_id: payrollPeriodId, staff_id: staffId },
    });
    staffPayrollId = staffPayroll!.id;
  });

  describe('Payroll Status Updates', () => {
    it('should lock a payroll period (manager only)', async () => {
      const response = await request(app)
        .post(`/api/v1/payroll/periods/${payrollPeriodId}/lock`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.is_locked).toBe(true);

      const updatedPeriod = await prisma.payrollPeriod.findUnique({
        where: { id: payrollPeriodId },
      });
      expect(updatedPeriod?.is_locked).toBe(true);
    });

    it('should fail to recalculate a locked period', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          payroll_period_id: payrollPeriodId,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('locked');
    });
  });

  describe('GET /api/v1/payroll/export/:id', () => {
    it('should export payroll data as Excel stream', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/export/${payrollPeriodId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.header['content-disposition']).toContain('attachment');
      expect(response.header['content-disposition']).toContain('.xlsx');

      // Verify ExcelJS was used
      expect(ExcelJS.Workbook).toHaveBeenCalled();
      const mockWorkbookInstance = (ExcelJS.Workbook as jest.Mock).mock.results[0].value;
      expect(mockWorkbookInstance.addWorksheet).toHaveBeenCalledWith('Payroll Report');
      expect(mockWorkbookInstance.xlsx.write).toHaveBeenCalled();
    });

    it('should return 404 for non-existent period export', async () => {
      const response = await request(app)
        .get('/api/v1/payroll/export/999999')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
