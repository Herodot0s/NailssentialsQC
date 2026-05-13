import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';

interface DailyData {
  date: string;
  total: number;
  categories: Record<string, number>;
  services: Record<string, number>;
}

export const getPayrollReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query; // YYYY-MM-DD

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Start date and end date are required' });
    }

    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));

    // 1. Get all staff profiles
    const staffProfiles = await prisma.staffProfile.findMany({
      orderBy: { full_name: 'asc' },
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
        _count: { id: true },
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
        _count: { id: true },
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
        netPay,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        report,
      },
    });
  } catch (error: unknown) {
    console.error('Get payroll report error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate payroll report';
    return res.status(500).json({ success: false, message });
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
        status: 'completed',
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Appointment counts by source
    const onlineAppointments = await prisma.appointment.count({
      where: {
        appointment_date: start,
        is_walk_in: false,
        status: 'completed',
      },
    });

    const walkInAppointments = await prisma.appointment.count({
      where: {
        appointment_date: start,
        is_walk_in: true,
        status: 'completed',
      },
    });

    // Sales by Category
    const serviceStats = await prisma.commission.groupBy({
      by: ['service_id'],
      where: {
        commission_date: { gte: start, lte: end },
      },
      _sum: { base_amount: true },
      _count: { id: true },
    });

    // Fetch service names for the stats (batch fetch to avoid N+1)
    const serviceIds = [...new Set(serviceStats.map((stat) => stat.service_id))];
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    const statsWithNames = serviceStats.map((stat) => ({
      name: serviceMap.get(stat.service_id)?.name || 'Unknown',
      amount: Number(stat._sum.base_amount || 0),
      count: stat._count.id,
    }));

    // D-08, D-09 fallback logic for the sales target
    let dynamicTarget = 8000.0; // Default fallback

    try {
      // 1. Query the currently active PayrollPeriod
      const activePeriod = await prisma.payrollPeriod.findFirst({
        where: { is_locked: false },
        orderBy: { start_date: 'desc' },
      });

      if (activePeriod && (activePeriod as any).sales_target !== null) {
        dynamicTarget = Number((activePeriod as any).sales_target);
      } else {
        // 2. Query SystemSettings
        const systemSetting = await (prisma as any).systemSettings.findUnique({
          where: { key: 'global_sales_target' },
        });
        if (systemSetting) {
          dynamicTarget = parseFloat(systemSetting.value);
        }
      }
    } catch (e) {
      console.error('Failed to fetch dynamic sales target, using fallback 8000:', e);
    }

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: Number(salesData._sum.amount || 0),
        transactionCount: salesData._count.id,
        onlineCount: onlineAppointments,
        walkInCount: walkInAppointments,
        serviceBreakdown: statsWithNames,
        target: dynamicTarget,
      },
    });
  } catch (error: unknown) {
    console.error('Get daily sales stats error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch sales stats';
    return res.status(500).json({ success: false, message });
  }
};

export const getHistoricalAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Date range required' });
    }

    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));

    const commissions = await prisma.commission.findMany({
      where: {
        commission_date: { gte: start, lte: end },
      },
      include: {
        service: {
          include: { category: true },
        },
      },
    });

    // Create a map of date -> category -> total
    const dailyData: Record<string, DailyData> = {};
    const interval = eachDayOfInterval({ start, end });

    interval.forEach((day) => {
      dailyData[format(day, 'yyyy-MM-dd')] = {
        date: format(day, 'MMM dd'),
        total: 0,
        categories: {},
        services: {},
      };
    });

    commissions.forEach((comm) => {
      const dateKey = format(comm.commission_date, 'yyyy-MM-dd');
      if (dailyData[dateKey]) {
        const catName = comm.service.category.name;
        const svcName = comm.service.name;
        const amount = Number(comm.base_amount);

        dailyData[dateKey].total += amount;

        if (!dailyData[dateKey].categories[catName]) dailyData[dateKey].categories[catName] = 0;
        dailyData[dateKey].categories[catName] += amount;

        if (!dailyData[dateKey].services[svcName]) dailyData[dateKey].services[svcName] = 0;
        dailyData[dateKey].services[svcName] += amount;
      }
    });

    return res.status(200).json({
      success: true,
      data: Object.values(dailyData),
    });
  } catch (error: unknown) {
    console.error('Get historical analytics error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch historical analytics';
    return res.status(500).json({ success: false, message });
  }
};
