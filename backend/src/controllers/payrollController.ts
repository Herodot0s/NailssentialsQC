import { Response } from 'express';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { sendError } from '../utils/apiHelpers';
import { logSystemAction } from '../utils/systemLog';
import { evaluatePayrollFormula } from '../utils/payrollEvaluator';

/**
 * Manager: Generate a new payroll period and calculate payroll for all staff.
 */
export const generatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date, payroll_period_id } = req.validatedBody || req.body;

    if (!payroll_period_id && (!start_date || !end_date)) {
      return sendError(res, 'MISSING_FIELDS', 'start_date and end_date are required', 400);
    }

    let startDate: Date;
    let endDate: Date;
    let payrollPeriod: any;

    // 1. Identify or Create Payroll Period
    if (payroll_period_id) {
      payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id: Number(payroll_period_id) },
      });
      if (!payrollPeriod) return sendError(res, 'NOT_FOUND', 'Payroll period not found', 404);
      if (payrollPeriod.is_locked) return sendError(res, 'LOCKED', 'Cannot recalculate a locked period', 400);
      startDate = new Date(payrollPeriod.start_date);
      endDate = new Date(payrollPeriod.end_date);
    } else {
      startDate = new Date(start_date);
      endDate = new Date(end_date);

      // Check for overlap
      const existingOverlap = await prisma.payrollPeriod.findFirst({
        where: {
          OR: [{ start_date: { lte: endDate }, end_date: { gte: startDate } }],
        },
      });

      if (existingOverlap) {
        // If it's an exact match, allow recalculation
        if (
          format(existingOverlap.start_date, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd') &&
          format(existingOverlap.end_date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')
        ) {
          payrollPeriod = existingOverlap;
          if (payrollPeriod.is_locked) return sendError(res, 'LOCKED', 'Cannot recalculate a locked period', 400);
        } else {
          return sendError(res, 'OVERLAP', 'Payroll period overlaps with existing period', 400);
        }
      }
    }

    // 2. Fetch Data in Parallel
    const [transactions, staffProfiles, currentPeriodCommissions] = await Promise.all([
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
          commission_date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalSalonSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // 3. WIPE AND REGENERATE Logic
    if (payrollPeriod) {
      await prisma.$transaction([
        // Update total sales for existing period
        prisma.payrollPeriod.update({
          where: { id: payrollPeriod.id },
          data: { total_salon_sales: totalSalonSales },
        }),
        // Delete existing payrolls (items cascade)
        prisma.staffPayroll.deleteMany({ where: { payroll_period_id: payrollPeriod.id } }),
        // Detach manual deductions (keep them for regeneration)
        prisma.deductionLog.updateMany({
          where: { payroll_period_id: payrollPeriod.id, NOT: { type: 'lates_early_out' } },
          data: { payroll_period_id: null },
        }),
        // Delete tardiness deductions (will be recalculated)
        prisma.deductionLog.deleteMany({
          where: { payroll_period_id: payrollPeriod.id, type: 'lates_early_out' },
        }),
      ]);
    } else {
      // Create new period
      payrollPeriod = await prisma.payrollPeriod.create({
        data: {
          start_date: startDate,
          end_date: endDate,
          total_salon_sales: totalSalonSales,
          is_locked: false,
        },
      });
    }

    // 4. Aggregations
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const weeksInPeriod = Math.ceil(daysInPeriod / 7);

    // Group daily performance for daily_breakdown JSON
    const staffDailyBreakdown = new Map<number, Record<string, number>>();
    const staffTotalSales = new Map<number, number>();

    for (const c of currentPeriodCommissions) {
      const sId = c.staff_id;
      const dKey = format(c.commission_date, 'yyyy-MM-dd');

      if (!staffDailyBreakdown.has(sId)) staffDailyBreakdown.set(sId, {});
      const breakMap = staffDailyBreakdown.get(sId)!;
      breakMap[dKey] = (breakMap[dKey] || 0) + Number(c.base_amount);

      staffTotalSales.set(sId, (staffTotalSales.get(sId) || 0) + Number(c.base_amount));
    }

    // 5. Process Staff Payrolls
    for (const staff of staffProfiles) {
      const currentSales = staffTotalSales.get(staff.id) || 0;
      const dailyBreakdown = staffDailyBreakdown.get(staff.id) || {};

      const [manualDeductions, attendanceRecords] = await Promise.all([
        prisma.deductionLog.findMany({
          where: { staff_id: staff.id, payroll_period_id: null },
        }),
        prisma.attendance.findMany({
          where: { staff_id: staff.id, date: { gte: startDate, lte: endDate } },
        }),
      ]);

      const tardinessDeduction = attendanceRecords.reduce(
        (sum, a) => sum + Number(a.deduction_amount),
        0,
      );
      const manualDeductionTotal = manualDeductions.reduce((sum, d) => sum + Number(d.amount), 0);

      // --- Calculation Engine ---
      const basePay = Number(staff.base_pay_per_week) * weeksInPeriod;
      
      // Use direct fields from StaffProfile (Phase 8 simplicity)
      let commissionRate = Number(staff.base_commission_rate);
      if (!commissionRate || commissionRate === 0) {
        commissionRate = 0.08; // Default to 8% if not set
      }

      const totalCommissions = Math.round(currentSales * commissionRate * 100) / 100;
      const totalDeductions = tardinessDeduction + manualDeductionTotal;
      const netPay = basePay + totalCommissions - totalDeductions;

      const payrollItems: any[] = [
        {
          component_name: 'Base Pay',
          component_type: 'earning',
          amount: basePay,
        },
        {
          component_name: `${(commissionRate * 100).toFixed(0)}% Commission`,
          component_type: 'earning',
          amount: totalCommissions,
        },
      ];

      if (tardinessDeduction > 0) {
        payrollItems.push({
          component_name: 'Lates/Early Out',
          component_type: 'deduction',
          amount: tardinessDeduction,
        });
      }

      manualDeductions.forEach((d) => {
        payrollItems.push({
          component_name: (d.type || 'Deduction').replace(/_/g, ' ').toUpperCase(),
          component_type: 'deduction',
          amount: Number(d.amount),
          formula_used: 'Manual',
        });
      });

      // 6. Save StaffPayroll
      await prisma.staffPayroll.create({
        data: {
          staff_id: staff.id,
          payroll_period_id: payrollPeriod.id,
          base_pay: basePay,
          commissions: totalCommissions,
          deductions: totalDeductions,
          net_pay: netPay,
          status: 'draft',
          daily_breakdown: dailyBreakdown as any,
          items: {
            create: payrollItems,
          },
        },
      });

      // Link manual deductions to this period
      if (manualDeductions.length > 0) {
        await prisma.deductionLog.updateMany({
          where: { id: { in: manualDeductions.map((d) => d.id) } },
          data: { payroll_period_id: payrollPeriod.id },
        });
      }

      // Re-create tardiness logs (historical snapshot for this period)
      for (const att of attendanceRecords.filter((a) => Number(a.deduction_amount) > 0)) {
        await prisma.deductionLog.create({
          data: {
            staff_id: staff.id,
            payroll_period_id: payrollPeriod.id,
            type: 'lates_early_out',
            amount: att.deduction_amount,
            notes: `Tardiness on ${format(att.date, 'yyyy-MM-dd')}`,
          },
        });
      }
    }

    await logSystemAction(
      req as AuthRequest,
      'PAYROLL_GENERATED',
      'PayrollPeriod',
      payrollPeriod.id,
      { message: `Generated/Recalculated payroll for period ${payrollPeriod.id}` },
    );

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
      data: { items, nextCursor, hasMore },
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
      return res
        .status(400)
        .json({ success: false, message: 'staff_id, type, and amount are required' });
    }

    const validTypes = ['cash_advance', 'loan', 'uniform', 'reloan', 'lates_early_out', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid deduction type' });
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

    await logSystemAction(req as AuthRequest, 'DEDUCTION_ADDED', 'Deduction', deduction.id, {
      message: 'Added payroll deduction',
    });

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

    await logSystemAction(req as AuthRequest, 'PAYROLL_LOCKED', 'PayrollPeriod', Number(id), {
      message: 'Locked payroll period',
    });

    return res.status(200).json({ success: true, data: updatedPeriod });
  } catch (error: unknown) {
    console.error('Lock payroll error:', error);
    return res.status(500).json({ success: false, message: 'Failed to lock payroll period' });
  }
};

/**
 * Manager: Export payroll data to Excel.
 */
export const exportPayrollExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.validatedParams ?? {};
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: Number(id) },
      include: {
        payrolls: {
          include: {
            staff: true,
            items: true,
          },
        },
        deductions: true,
      },
    });

    if (!period) {
      return res.status(404).json({ success: false, message: 'Payroll period not found' });
    }

    const commissions = await prisma.commission.findMany({
      where: {
        staff_id: { in: period.payrolls.map((p) => p.staff_id) },
        commission_date: { gte: period.start_date, lte: period.end_date },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');

    const days = eachDayOfInterval({ start: period.start_date, end: period.end_date });
    const dateHeaders = days.map((day) => format(day, 'MMM d'));

    // 1. Header row
    const headerRow = [
      'Staff Name',
      ...dateHeaders,
      'Total Sales',
      'Commission Pay',
      'Basic Pay',
      'Gross Pay',
      'CA',
      'Loan',
      'Uniform',
      'Reloan',
      'Lates/Early Out',
      'Total Deductions',
      'Net Pay',
    ];

    const titleRow = worksheet.addRow([
      `PAYROLL REPORT: ${format(period.start_date, 'MMMM d')} - ${format(
        period.end_date,
        'MMMM d, yyyy',
      )}`,
    ]);
    titleRow.font = { bold: true, size: 14 };

    if (!period.is_locked) {
      const draftRow = worksheet.addRow(['*** DRAFT - NOT FINALIZED ***']);
      draftRow.font = { color: { argb: 'FFFF0000' }, bold: true };
    }

    worksheet.addRow([]); // Spacer

    const header = worksheet.addRow(headerRow);
    header.font = { bold: true };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 2. Staff Rows
    period.payrolls.forEach((p) => {
      const staffDailySales = commissions
        .filter((c) => c.staff_id === p.staff_id)
        .reduce((acc, c) => {
          const dateKey = format(c.commission_date, 'yyyy-MM-dd');
          acc[dateKey] = (acc[dateKey] || 0) + Number(c.base_amount);
          return acc;
        }, {} as Record<string, number>);

      const rowData: (string | number)[] = [p.staff.full_name];

      let totalSales = 0;
      days.forEach((day) => {
        const sales = staffDailySales[format(day, 'yyyy-MM-dd')] || 0;
        rowData.push(sales > 0 ? sales : 0);
        totalSales += sales;
      });

      const commPay = p.commissions;
      const basicPay = p.base_pay;
      const grossPay = Number(commPay) + Number(basicPay);

      // Deductions
      const getDeduction = (type: string) => {
        return period.deductions
          .filter((d) => d.staff_id === p.staff_id && d.type === type)
          .reduce((sum, d) => sum + Number(d.amount), 0);
      };

      const ca = getDeduction('cash_advance');
      const loan = getDeduction('loan');
      const uniform = getDeduction('uniform');
      const reloan = getDeduction('reloan');
      const lates = getDeduction('lates_early_out');

      const totalDeductions = p.deductions;
      const netPay = p.net_pay;

      rowData.push(
        totalSales,
        Number(commPay),
        Number(basicPay),
        grossPay,
        ca > 0 ? -ca : 0,
        loan > 0 ? -loan : 0,
        uniform > 0 ? -uniform : 0,
        reloan > 0 ? -reloan : 0,
        lates > 0 ? -lates : 0,
        totalDeductions > 0 ? -totalDeductions : 0,
        Number(netPay),
      );

      const row = worksheet.addRow(rowData);

      // Highlight net pay
      row.getCell(rowData.length).font = { bold: true };
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, i) => {
      column.width = i === 0 ? 25 : 12;
    });

    // Filename
    let filename = `Payroll_Report_${format(period.start_date, 'yyyy-MM-dd')}.xlsx`;
    if (!period.is_locked) {
      filename = `[DRAFT]_` + filename;
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
    res.end();
  } catch (error: unknown) {
    console.error('Export payroll error:', error);
    const message = error instanceof Error ? error.message : 'Failed to export payroll';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Manager: Get all deduction logs.
 */
export const getDeductions = async (req: AuthRequest, res: Response) => {
  try {
    const deductions = await prisma.deductionLog.findMany({
      include: { staff: { select: { full_name: true } } },
      orderBy: { created_at: 'desc' }
    });
    return res.status(200).json({ success: true, data: deductions });
  } catch (error) {
    console.error('Get deductions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch deductions' });
  }
};

/**
 * Manager: Delete a deduction log.
 */
export const deleteDeduction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const idNum = parseInt(idStr as string);
    
    // Check if deduction is already part of a payroll period
    const existing = await prisma.deductionLog.findUnique({ where: { id: idNum } });
    if (!existing) return res.status(404).json({ success: false, message: 'Deduction not found' });
    if (existing.payroll_period_id) return res.status(400).json({ success: false, message: 'Cannot delete deduction linked to a payroll period' });
    
    await prisma.deductionLog.delete({ where: { id: idNum } });
    await logSystemAction(req as AuthRequest, 'DEDUCTION_DELETED', 'Deduction', idNum, { message: 'Deleted payroll deduction' });
    
    return res.status(200).json({ success: true, message: 'Deduction deleted successfully' });
  } catch (error) {
    console.error('Delete deduction error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete deduction' });
  }
};

/**
 * Manager: Generate next payroll period dates
 */
export const generateNextPeriod = async (req: AuthRequest, res: Response) => {
  try {
    const latestPeriod = await prisma.payrollPeriod.findFirst({
      orderBy: { end_date: 'desc' },
    });

    let newStartDate: Date;
    let newEndDate: Date;

    if (latestPeriod) {
      newStartDate = new Date(latestPeriod.end_date);
      newStartDate.setDate(newStartDate.getDate() + 1);
    } else {
      const { start_date } = req.body;
      if (!start_date) {
        return res.status(400).json({ success: false, message: 'start_date is required when no previous periods exist' });
      }
      newStartDate = new Date(start_date);
    }

    newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 6);

    const newPeriod = await prisma.payrollPeriod.create({
      data: {
        start_date: newStartDate,
        end_date: newEndDate,
        total_salon_sales: 0,
        is_locked: false,
      }
    });

    await logSystemAction(req as AuthRequest, 'PERIOD_GENERATED', 'PayrollPeriod', newPeriod.id, {
      message: 'Generated next payroll period',
    });

    return res.status(201).json({ success: true, data: newPeriod });
  } catch (error) {
    console.error('Generate next period error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate next period' });
  }
};

