import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendSuccess, sendError } from '../utils/apiHelpers';
import { logSystemAction } from '../utils/systemLog';

/**
 * Manager: Generate a new payroll period and calculate payroll for all staff.
 */
export const generatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.validatedBody || req.body;

    if (!start_date || !end_date) {
      return sendError(res, 'MISSING_FIELDS', 'start_date and end_date are required', 400);
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Calculate previous month's date range for divide-by-4 rule (synchronous, needed before parallel queries)
    const lastMonth = subMonths(startDate, 1);
    const prevMonthStart = startOfMonth(lastMonth);
    const prevMonthEnd = endOfMonth(lastMonth);

    // Group all independent DB queries in Promise.all (per D-06, D-07)
    const [existingPeriod, transactions, staffProfiles, prevMonthCommissions] = await Promise.all([
      prisma.payrollPeriod.findFirst({
        where: {
          OR: [
            { start_date: { lte: endDate }, end_date: { gte: startDate } },
          ],
        },
      }),
      prisma.transaction.findMany({
        where: {
          transaction_date: { gte: startDate, lte: endDate },
          status: 'completed',
        },
      }),
      prisma.staffProfile.findMany({
        where: { is_available: true },
      }),
      prisma.commission.findMany({
        where: {
          commission_date: {
            gte: prevMonthStart,
            lte: prevMonthEnd,
          },
        },
      }),
    ]);

    if (existingPeriod) {
      return res.status(400).json({ success: false, message: 'Payroll period overlaps with existing period' });
    }

    // Post-processing: compute total salon sales after parallel queries (per D-07)
    const totalSalonSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Create payroll period
    const payrollPeriod = await prisma.payrollPeriod.create({
      data: {
        start_date: startDate,
        end_date: endDate,
        total_salon_sales: totalSalonSales,
        is_locked: false,
      },
    });

    // Calculate weeks in period for base pay
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const weeksInPeriod = Math.ceil(daysInPeriod / 7);

    // Sum by staff for divide-by-4 calculation
    const prevMonthCommissionsByStaff = new Map<number, number>();
    for (const c of prevMonthCommissions) {
      const staffId = c.staff_id;
      prevMonthCommissionsByStaff.set(
        staffId,
        (prevMonthCommissionsByStaff.get(staffId) || 0) + Number(c.commission_amount)
      );
    }

    for (const staff of staffProfiles) {
      // Base pay calculation
      const basePay = Number(staff.base_pay_per_week) * weeksInPeriod;

      // "Divide by 4" rule: Use previous month's total commissions / 4
      const prevMonthTotal = prevMonthCommissionsByStaff.get(staff.id) || 0;
      const totalCommissions = Math.round((prevMonthTotal / 4) * 100) / 100;

      // Parallel fetch for per-staff queries (per D-06)
      const [manualDeductions, attendanceRecords] = await Promise.all([
        prisma.deductionLog.findMany({
          where: {
            staff_id: staff.id,
            payroll_period_id: null,
          },
        }),
        prisma.attendance.findMany({
          where: {
            staff_id: staff.id,
            date: { gte: startDate, lte: endDate },
          },
        }),
      ]);

      const tardinessDeduction = attendanceRecords.reduce((sum, a) => sum + Number(a.deduction_amount), 0);
      const manualDeductionTotal = manualDeductions.reduce((sum, d) => sum + Number(d.amount), 0);
      const totalDeductions = tardinessDeduction + manualDeductionTotal;

      // Net pay
      const netPay = basePay + totalCommissions - totalDeductions;

      // Create staff payroll entry
      await prisma.staffPayroll.create({
        data: {
          staff_id: staff.id,
          payroll_period_id: payrollPeriod.id,
          base_pay: basePay,
          commissions: totalCommissions,
          deductions: totalDeductions,
          net_pay: netPay,
          status: 'draft',
        },
      });

      // Link manual deductions to this payroll period
      if (manualDeductions.length > 0) {
        await prisma.deductionLog.updateMany({
          where: { id: { in: manualDeductions.map(d => d.id) } },
          data: { payroll_period_id: payrollPeriod.id },
        });
      }

      // Log tardiness deductions
      for (const att of attendanceRecords.filter(a => Number(a.deduction_amount) > 0)) {
        await prisma.deductionLog.create({
          data: {
            staff_id: staff.id,
            payroll_period_id: payrollPeriod.id,
            type: 'Tardiness',
            amount: att.deduction_amount,
            notes: `Tardiness on ${format(att.date, 'yyyy-MM-dd')}`,
          },
        });
      }

      // Mark this staff's previous month commissions as paid
      if (prevMonthCommissionsByStaff.get(staff.id)) {
        await prisma.commission.updateMany({
          where: {
            staff_id: staff.id,
            is_paid: false,
          },
          data: { is_paid: true },
        });
      }
    }

    await logSystemAction(req as AuthRequest, 'PAYROLL_GENERATED', 'PayrollPeriod', payrollPeriod.id, { message: 'Generated payroll for period' });

    return res.status(201).json({ success: true, data: payrollPeriod });
  } catch (error: unknown) {
    console.error('Generate payroll error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate payroll';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Manager: Get all payroll periods with summary.
 */
export const getPayrollPeriods = async (req: AuthRequest, res: Response) => {
  try {
    // Pagination params (D-10)
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const where: Prisma.PayrollPeriodWhereInput = {};
    if (cursor) {
      where.id = { gt: cursor }; // D-09
    }

    const periods = await prisma.payrollPeriod.findMany({
      where,
      take: limit + 1, // D-12
      orderBy: { id: 'asc' },
      include: {
        payrolls: {
          include: { staff: { select: { full_name: true } } },
        },
      },
    });

    const hasMore = periods.length > limit;
    const items = hasMore ? periods.slice(0, limit) : periods;
    const nextCursor = hasMore ? items[items.length - 1].id.toString() : null;

    // D-11: Response wrapper
    return res.status(200).json({
      success: true,
      data: { items, nextCursor, hasMore }
    });
  } catch (error: unknown) {
    console.error('Get payroll periods error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll periods' });
  }
};

/**
 * Manager: Get details of a specific payroll period.
 */
export const getPayrollDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.validatedParams ?? {};
    const period = await prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        payrolls: {
          include: { staff: { select: { full_name: true, specializations: true } } },
        },
        deductions: {
          include: { staff: { select: { full_name: true } } },
        },
      },
    });

    if (!period) {
      return res.status(404).json({ success: false, message: 'Payroll period not found' });
    }

    return res.status(200).json({ success: true, data: period });
  } catch (error: unknown) {
    console.error('Get payroll details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll details' });
  }
};

/**
 * Manager: Add a manual deduction for a staff member.
 */
export const addDeduction = async (req: AuthRequest, res: Response) => {
  try {
    const { staff_id, payroll_period_id, type, amount, notes } = req.body;

    if (!staff_id || !type || !amount) {
      return res.status(400).json({ success: false, message: 'staff_id, type, and amount are required' });
    }

    const staff = await prisma.staffProfile.findUnique({
      where: { id: parseInt(staff_id) },
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const deduction = await prisma.deductionLog.create({
      data: {
        staff_id: parseInt(staff_id),
        payroll_period_id: payroll_period_id ? parseInt(payroll_period_id) : null,
        type,
        amount: parseFloat(amount),
        notes,
      },
    });

    await logSystemAction(req as AuthRequest, 'DEDUCTION_ADDED', 'Deduction', deduction.id, { message: 'Added payroll deduction' });

    return res.status(201).json({ success: true, data: deduction });
  } catch (error: unknown) {
    console.error('Add deduction error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add deduction' });
  }
};

/**
 * Staff/Manager: Get own payroll records.
 */
export const getMyPayroll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { staff_profile: true },
    });
    const staffProfile = (user as { staff_profile?: { id: number } | null }).staff_profile;

    if (!staffProfile) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    const payrolls = await prisma.staffPayroll.findMany({
      where: { staff_id: staffProfile.id },
      include: { period: true },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ success: true, data: payrolls });
  } catch (error: unknown) {
    console.error('Get my payroll error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll records' });
  }
};

/**
 * Manager: Lock a payroll period to prevent further changes.
 */
export const lockPayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.validatedParams ?? {};
    const period = await prisma.payrollPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      return res.status(404).json({ success: false, message: 'Payroll period not found' });
    }

    if (period.is_locked) {
      return res.status(400).json({ success: false, message: 'Payroll period is already locked' });
    }

    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id },
      data: { is_locked: true },
    });

    await logSystemAction(req as AuthRequest, 'PAYROLL_LOCKED', 'PayrollPeriod', Number(id), { message: 'Locked payroll period' });

    return res.status(200).json({ success: true, data: updatedPeriod });
  } catch (error: unknown) {
    console.error('Lock payroll error:', error);
    return res.status(500).json({ success: false, message: 'Failed to lock payroll period' });
  }
};
