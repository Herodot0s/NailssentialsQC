import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { startOfDay, endOfDay } from 'date-fns';

export const getPayrollReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query; // YYYY-MM-DD

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));

    // 1. Get all staff profiles
    const staffProfiles = await prisma.staffProfile.findMany({
      orderBy: { full_name: 'asc' }
    });

    const report = [];

    for (const staff of staffProfiles) {
      // 2. Aggregate commissions
      const commissionData = await prisma.commission.aggregate({
        where: {
          staff_id: staff.id,
          commission_date: {
            gte: start,
            lte: end,
          },
        },
        _sum: { commission_amount: true },
        _count: { id: true }
      });

      // 3. Aggregate attendance deductions
      const attendanceData = await prisma.attendance.aggregate({
        where: {
          staff_id: staff.id,
          date: {
            gte: start,
            lte: end,
          },
        },
        _sum: { deduction_amount: true },
        _count: { id: true }
      });

      const totalCommission = Number(commissionData._sum.commission_amount || 0);
      const totalDeduction = Number(attendanceData._sum.deduction_amount || 0);
      const netPay = totalCommission - totalDeduction;

      report.push({
        staffId: staff.id,
        fullName: staff.full_name,
        commissionCount: commissionData._count.id,
        totalCommission,
        attendanceCount: attendanceData._count.id,
        totalDeduction,
        netPay
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        report
      }
    });

  } catch (error: any) {
    console.error('Get payroll report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate payroll report' });
  }
};

export const getDailySalesStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Total Sales
    const salesData = await prisma.transaction.aggregate({
      where: {
        transaction_date: { gte: start, lte: end },
        status: 'completed'
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Appointment counts by source
    const onlineAppointments = await prisma.appointment.count({
      where: {
        appointment_date: start,
        is_walk_in: false,
        status: 'completed'
      }
    });

    const walkInAppointments = await prisma.appointment.count({
      where: {
        appointment_date: start,
        is_walk_in: true,
        status: 'completed'
      }
    });

    // Sales by Category
    const serviceStats = await prisma.commission.groupBy({
      by: ['service_id'],
      where: {
        commission_date: { gte: start, lte: end }
      },
      _sum: { base_amount: true },
      _count: { id: true }
    });

    // Fetch service names for the stats
    const statsWithNames = await Promise.all(serviceStats.map(async (stat) => {
       const service = await prisma.service.findUnique({ where: { id: stat.service_id } });
       return {
         name: service?.name || 'Unknown',
         amount: Number(stat._sum.base_amount || 0),
         count: stat._count.id
       };
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: Number(salesData._sum.amount || 0),
        transactionCount: salesData._count.id,
        onlineCount: onlineAppointments,
        walkInCount: walkInAppointments,
        serviceBreakdown: statsWithNames,
        target: 8000 // From PRD
      }
    });

  } catch (error: any) {
    console.error('Get daily sales stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch sales stats' });
  }
};
