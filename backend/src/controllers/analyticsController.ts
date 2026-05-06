import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  eachMonthOfInterval, format, differenceInDays
} from 'date-fns';

// ─── Staff Performance ─────────────────────────────────────────────────────

export const getStaffPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));

    // Aggregate revenue & commission per staff
    const commissionAgg = await prisma.commission.groupBy({
      by: ['staff_id'],
      where: {
        commission_date: { gte: start, lte: end },
      },
      _sum: { base_amount: true, commission_amount: true },
      _count: { id: true },
    });

    // Get staff names
    const staffProfiles = await prisma.staffProfile.findMany();
    const staffMap = new Map(staffProfiles.map(s => [s.id, s.full_name]));

    // Category breakdown per staff
    const commissions = await prisma.commission.findMany({
      where: { commission_date: { gte: start, lte: end } },
      include: { service: { include: { category: true } }, staff: true },
    });

    const categoryBreakdownMap: Record<number, Record<string, number>> = {};
    commissions.forEach(c => {
      if (!categoryBreakdownMap[c.staff_id]) categoryBreakdownMap[c.staff_id] = {};
      const catName = c.service.category.name;
      const amount = Number(c.base_amount);
      categoryBreakdownMap[c.staff_id][catName] = (categoryBreakdownMap[c.staff_id][catName] || 0) + amount;
    });

    const data = commissionAgg
      .map(agg => ({
        staffId: agg.staff_id,
        fullName: staffMap.get(agg.staff_id) || 'Unknown',
        revenue: Number(agg._sum.base_amount || 0),
        commission: Number(agg._sum.commission_amount || 0),
        serviceCount: agg._count.id,
        categoryBreakdown: categoryBreakdownMap[agg.staff_id] || {},
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    console.error('Get staff performance error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch staff performance';
    return res.status(500).json({ success: false, message });
  }
};

// ─── Retention Analytics ────────────────────────────────────────────────────

export const getRetentionAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));

    // All completed appointments in the range
    const appointmentsInRange = await prisma.appointment.findMany({
      where: {
        status: 'completed',
        appointment_date: { gte: start, lte: end },
      },
      select: { customer_id: true, appointment_date: true },
    });

    // Unique customers in the range
    const customerLastVisit: Record<number, Date> = {};
    appointmentsInRange.forEach(a => {
      const existing = customerLastVisit[a.customer_id];
      if (!existing || a.appointment_date > existing) {
        customerLastVisit[a.customer_id] = a.appointment_date;
      }
    });

    const uniqueCustomerIds = Object.keys(customerLastVisit).map(Number);
    const totalCustomers = uniqueCustomerIds.length;

    // Check for repeat visits within 60 days after their last visit in range
    let returningCount = 0;
    if (uniqueCustomerIds.length > 0) {
      // For each customer, check if they have a follow-up appointment within 60 days
      const followUpAppointments = await prisma.appointment.findMany({
        where: {
          status: 'completed',
          customer_id: { in: uniqueCustomerIds },
          appointment_date: {
            gt: end,
            lte: new Date(end.getTime() + 60 * 24 * 60 * 60 * 1000),
          },
        },
        select: { customer_id: true },
      });

      const returnedCustomers = new Set(followUpAppointments.map(a => a.customer_id));
      returningCount = returnedCustomers.size;
    }

    const retentionRate = totalCustomers > 0
      ? Math.round((returningCount / totalCustomers) * 100)
      : 0;

    // New vs Returning — first-ever visit per customer
    const firstVisits = await prisma.appointment.groupBy({
      by: ['customer_id'],
      where: { status: 'completed' },
      _min: { appointment_date: true },
    });

    const firstVisitMap = new Map(
      firstVisits.map(fv => [fv.customer_id, fv._min.appointment_date])
    );

    let newCustomers = 0;
    let returningCustomers = 0;
    uniqueCustomerIds.forEach(cid => {
      const firstVisit = firstVisitMap.get(cid);
      if (firstVisit && firstVisit >= start && firstVisit <= end) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    });

    // Trend — monthly retention rates
    const trend: { month: string; rate: number }[] = [];
    try {
      const months = eachMonthOfInterval({ start, end });
      for (const monthStart of months) {
        const monthEnd = endOfMonth(monthStart);
        const monthAppts = appointmentsInRange.filter(
          a => a.appointment_date >= monthStart && a.appointment_date <= monthEnd
        );
        const monthCustomers = new Set(monthAppts.map(a => a.customer_id));
        const monthTotal = monthCustomers.size;

        // Simplified trend: ratio of returning customers within that month
        let monthRate = 0;
        if (monthTotal > 0) {
          const customerVisitCounts: Record<number, number> = {};
          monthAppts.forEach(a => {
            customerVisitCounts[a.customer_id] = (customerVisitCounts[a.customer_id] || 0) + 1;
          });
          const repeaters = Object.values(customerVisitCounts).filter(c => c > 1).length;
          monthRate = Math.round((repeaters / monthTotal) * 100);
        }

        trend.push({ month: format(monthStart, 'MMM yyyy'), rate: monthRate });
      }
    } catch {
      // If date range is too small for interval, skip trend
    }

    // Top customers — most visits in range
    const customerVisitCounts: Record<number, number> = {};
    appointmentsInRange.forEach(a => {
      customerVisitCounts[a.customer_id] = (customerVisitCounts[a.customer_id] || 0) + 1;
    });

    const topCustomerIds = Object.entries(customerVisitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => Number(id));

    const customerProfiles = await prisma.customerProfile.findMany({
      where: { id: { in: topCustomerIds } },
    });
    const customerNameMap = new Map(customerProfiles.map(c => [c.id, c.full_name]));

    const topCustomers = topCustomerIds.map(cid => ({
      name: customerNameMap.get(cid) || 'Unknown',
      visitCount: customerVisitCounts[cid],
      lastVisit: customerLastVisit[cid]
        ? format(customerLastVisit[cid], 'yyyy-MM-dd')
        : '',
    }));

    return res.status(200).json({
      success: true,
      data: {
        retentionRate,
        totalCustomers,
        returningCustomers,
        newCustomers,
        trend,
        topCustomers,
      },
    });
  } catch (error: unknown) {
    console.error('Get retention analytics error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch retention analytics';
    return res.status(500).json({ success: false, message });
  }
};

// ─── KPI Summary ────────────────────────────────────────────────────────────

export const getKpiSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Today's revenue
    const todaySales = await prisma.transaction.aggregate({
      where: {
        transaction_date: { gte: todayStart, lte: todayEnd },
        status: 'completed',
      },
      _sum: { amount: true },
    });
    const todayRevenue = Number(todaySales._sum.amount || 0);

    // Month revenue (startDate to endDate)
    const monthSales = await prisma.transaction.aggregate({
      where: {
        transaction_date: { gte: start, lte: end },
        status: 'completed',
      },
      _sum: { amount: true },
    });
    const monthRevenue = Number(monthSales._sum.amount || 0);

    // Active staff
    const activeStaff = await prisma.staffProfile.count({
      where: { is_available: true },
    });

    // Month appointments
    const monthAppointments = await prisma.appointment.count({
      where: {
        status: 'completed',
        appointment_date: { gte: start, lte: end },
      },
    });

    // Trend calculation — compare with previous period of same duration
    const periodDays = differenceInDays(end, start) || 1;
    const prevStart = startOfDay(new Date(start.getTime() - periodDays * 24 * 60 * 60 * 1000));
    const prevEnd = endOfDay(new Date(start.getTime() - 1));

    const prevMonthSales = await prisma.transaction.aggregate({
      where: {
        transaction_date: { gte: prevStart, lte: prevEnd },
        status: 'completed',
      },
      _sum: { amount: true },
    });
    const prevMonthRevenue = Number(prevMonthSales._sum.amount || 0);

    const prevTodaySales = await prisma.transaction.aggregate({
      where: {
        transaction_date: {
          gte: startOfDay(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
          lte: endOfDay(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
        },
        status: 'completed',
      },
      _sum: { amount: true },
    });
    const prevTodayRevenue = Number(prevTodaySales._sum.amount || 0);

    const prevAppointments = await prisma.appointment.count({
      where: {
        status: 'completed',
        appointment_date: { gte: prevStart, lte: prevEnd },
      },
    });

    const calcTrend = (current: number, previous: number): number | null => {
      if (previous === 0) return current > 0 ? 100 : null;
      return Math.round(((current - previous) / previous) * 100);
    };

    return res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        monthRevenue,
        activeStaff,
        monthAppointments,
        todayRevenueTrend: calcTrend(todayRevenue, prevTodayRevenue),
        monthRevenueTrend: calcTrend(monthRevenue, prevMonthRevenue),
        monthAppointmentsTrend: calcTrend(monthAppointments, prevAppointments),
      },
    });
  } catch (error: unknown) {
    console.error('Get KPI summary error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch KPI summary';
    return res.status(500).json({ success: false, message });
  }
};
