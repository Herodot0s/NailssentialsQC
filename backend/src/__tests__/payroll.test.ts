import { Request, Response } from 'express';
import { generatePayroll, getPayrollPeriods, addDeduction } from '../controllers/payrollController';
import prisma from '../utils/prisma';
import { mockStaffProfiles, mockCommissions, mockDeductionLogs, mockSalaryAssignments, mockAttendance, mockPayrollPeriod } from './payroll.mock';

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    payrollPeriod: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
    staffProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    commission: {
      findMany: jest.fn(),
    },
    deductionLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    salaryStructureAssignment: {
      findFirst: jest.fn(),
    },
    staffPayroll: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb),
  },
}));

// Mock system log
jest.mock('../utils/systemLog', () => ({
  logSystemAction: jest.fn(),
}));

describe('Payroll Controller Tests', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { sub: 1, role: 'manager' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('generatePayroll', () => {
    it('should generate payroll for all staff members', async () => {
      req.body = {
        start_date: '2026-05-25',
        end_date: '2026-05-31',
      };

      (prisma.payrollPeriod.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.staffProfile.findMany as jest.Mock).mockResolvedValue(mockStaffProfiles);
      (prisma.commission.findMany as jest.Mock).mockResolvedValue(mockCommissions);
      (prisma.payrollPeriod.create as jest.Mock).mockResolvedValue(mockPayrollPeriod);
      (prisma.deductionLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendance);
      (prisma.salaryStructureAssignment.findFirst as jest.Mock).mockResolvedValue(mockSalaryAssignments[0]);

      await generatePayroll(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: mockPayrollPeriod.id }),
        })
      );
    });
  });

  describe('addDeduction', () => {
    it('should add a manual deduction', async () => {
      req.body = {
        staff_id: 1,
        type: 'cash_advance',
        amount: 500,
        notes: 'Test deduction',
      };

      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(mockStaffProfiles[0]);
      (prisma.deductionLog.create as jest.Mock).mockResolvedValue(mockDeductionLogs[0]);

      await addDeduction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: mockDeductionLogs[0].id }),
        })
      );
    });
  });
});
