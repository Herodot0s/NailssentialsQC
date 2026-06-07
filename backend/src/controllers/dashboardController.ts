import { Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { startOfISOWeek, endOfISOWeek, format } from 'date-fns';
import { getCurrentUser, sendSuccess, sendError } from '../utils/apiHelpers';

const getManilaToday = () => {
  const now = new Date();
  const manilaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayStr = manilaTime.toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00Z');
  const dayOfWeek = today.getUTCDay();
  return { today, dayOfWeek };
};

const getDatePart = (dateStr: string) => {
  return dateStr.split('T')[0];
};

/**
 * Consolidated Staff Dashboard Endpoint
 * Returns: attendance status, recent logs, appointments (paginated), commission summary, my payrolls, and list of staff
 */
export const getStaffDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }
    const userId = currentUser.userId;

    // 1. Resolve Staff Profile
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { user_id: userId },
    });

    if (!staffProfile) {
      return sendError(res, 'STAFF_NOT_FOUND', 'Staff profile not found', 404);
    }

    const { today, dayOfWeek } = getManilaToday();

    // 2. Fetch all dashboard dependencies in parallel
    const [
      attendance,
      daySchedule,
      attendanceLogs,
      appointments,
      dailyCommissions,
      weeklyCommissions,
      payrolls,
      commissionsList,
      allStaffList,
    ] = await Promise.all([
      // Current attendance status
      prisma.attendance.findUnique({
        where: {
          uk_staff_date: {
            staff_id: staffProfile.id,
            date: today,
          },
        },
      }),
      // Staff schedule for today
      prisma.staffSchedule.findUnique({
        where: {
          staff_day_unique: {
            staff_id: staffProfile.id,
            day_of_week: dayOfWeek,
          },
        },
      }),
      // Last 5 attendance logs
      prisma.attendance.findMany({
        where: { staff_id: staffProfile.id },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      // paginated appointments (limit 20)
      prisma.appointment.findMany({
        where: {
          items: { some: { staff_id: staffProfile.id } },
        },
        take: 21, // take 21 to calculate hasMore
        orderBy: { appointment_date: 'desc' },
        include: {
          customer: true,
          items: { include: { service: true, staff: true } },
          transactions: true,
          addons: { include: { addon: true } },
        },
      }),
      // Daily commissions
      prisma.commission.aggregate({
        where: {
          staff_id: staffProfile.id,
          commission_date: {
            gte: new Date(`${getDatePart(today.toISOString())}T00:00:00Z`),
            lte: new Date(`${getDatePart(today.toISOString())}T23:59:59Z`),
          },
        },
        _sum: { commission_amount: true },
      }),
      // Weekly commissions
      prisma.commission.aggregate({
        where: {
          staff_id: staffProfile.id,
          commission_date: {
            gte: startOfISOWeek(today),
            lte: endOfISOWeek(today),
          },
        },
        _sum: { commission_amount: true },
      }),
      // Staff payroll records
      prisma.staffPayroll.findMany({
        where: { staff_id: staffProfile.id },
        include: {
          period: true,
          items: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      // Recent commissions (take 50)
      prisma.commission.findMany({
        where: { staff_id: staffProfile.id },
        include: {
          service: true,
          transaction: {
            include: {
              appointment: {
                include: { customer: true },
              },
            },
          },
        },
        orderBy: { commission_date: 'desc' },
        take: 50,
      }),
      // Active staff list
      prisma.user.findMany({
        where: {
          role: { in: ['staff', 'manager'] },
          is_active: true,
        },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          username: true,
          role: true,
          profile_picture_url: true,
          staff_profile: {
            select: {
              id: true,
              full_name: true,
              specializations: true,
              scheduled_start: true,
              scheduled_end: true,
            },
          },
        },
      }),
    ]);

    // 3. Format attendance details
    const scheduledStart =
      daySchedule && daySchedule.is_active ? daySchedule.start_time : staffProfile.scheduled_start;
    const scheduledEnd =
      daySchedule && daySchedule.is_active ? daySchedule.end_time : staffProfile.scheduled_end;

    const formattedAttendanceLogs = attendanceLogs.map((log) => ({
      id: log.id,
      date: log.date.toISOString().split('T')[0],
      checkIn: log.check_in
        ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '-',
      checkOut: log.check_out
        ? new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null,
      status: log.tardiness_minutes > 0 ? `Late (${log.tardiness_minutes}m)` : 'On Time',
    }));

    // 4. Format appointments (pagination wrapper)
    const hasMoreAppointments = appointments.length > 20;
    const appointmentItems = hasMoreAppointments ? appointments.slice(0, 20) : appointments;
    const nextAppointmentsCursor = hasMoreAppointments ? appointmentItems[appointmentItems.length - 1].id.toString() : null;

    // 5. Format staff list
    const formattedStaffList = allStaffList.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      fullName: u.staff_profile?.full_name,
      staffProfileId: u.staff_profile?.id,
      specializations: u.staff_profile?.specializations,
      profilePictureUrl: u.profile_picture_url,
    }));

    return res.status(200).json({
      success: true,
      data: {
        staffName: staffProfile.full_name,
        staffId: staffProfile.id,
        attendanceStatus: {
          isCheckedIn: !!attendance?.check_in && !attendance?.check_out,
          checkInTime: attendance?.check_in
            ? new Date(attendance.check_in).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null,
          checkInRaw: attendance?.check_in?.toISOString() || null,
          checkOutTime: attendance?.check_out
            ? new Date(attendance.check_out).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null,
          checkOutRaw: attendance?.check_out?.toISOString() || null,
          date: today.toISOString().split('T')[0],
          scheduledStart: attendance?.scheduled_start || scheduledStart,
          scheduledEnd: attendance?.scheduled_end || scheduledEnd,
        },
        attendanceLogs: formattedAttendanceLogs,
        appointments: {
          items: appointmentItems,
          nextCursor: nextAppointmentsCursor,
          hasMore: hasMoreAppointments,
        },
        commissionSummary: {
          today: Number(dailyCommissions._sum.commission_amount || 0),
          thisWeek: Number(weeklyCommissions._sum.commission_amount || 0),
        },
        payrolls: payrolls,
        commissionsList: commissionsList,
        staffList: formattedStaffList,
      },
    });
  } catch (error: unknown) {
    console.error('Get staff dashboard error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch staff dashboard data';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

/**
 * Consolidated Manager Dashboard Endpoint
 * Returns: daily sales stats, staff list (with sensitive info), reviews, attendance records, service categories, and appointments (paginated)
 */
export const getManagerDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'manager') {
      return sendError(res, 'FORBIDDEN', 'Manager permission required', 403);
    }

    const { startDate, endDate } = req.query; // For attendance date range
    const attendanceStart = startDate ? new Date(String(startDate)) : undefined;

    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T00:00:00Z`);
    const end = new Date(`${dateStr}T23:59:59Z`);
    const dbDateToday = start;

    // 1. Fetch dependencies in parallel
    const [
      salesData,
      onlineAppointmentsCount,
      walkInAppointmentsCount,
      serviceStats,
      allStaffUsers,
      reviews,
      attendanceRecords,
      categories,
      appointments,
    ] = await Promise.all([
      // Sales aggregate
      prisma.transaction.aggregate({
        where: {
          transaction_date: { gte: start, lte: end },
          status: 'completed',
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Online appointments completed count
      prisma.appointment.count({
        where: {
          appointment_date: dbDateToday,
          is_walk_in: false,
          status: 'completed',
        },
      }),
      // Walk-in appointments completed count
      prisma.appointment.count({
        where: {
          appointment_date: dbDateToday,
          is_walk_in: true,
          status: 'completed',
        },
      }),
      // Service stats groupBy
      prisma.commission.groupBy({
        by: ['service_id'],
        where: {
          commission_date: dbDateToday,
        },
        _sum: { base_amount: true },
        _count: { id: true },
      }),
      // Staff members list (all fields since role is manager)
      prisma.user.findMany({
        where: { role: { in: ['staff', 'manager'] } },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          is_active: true,
          created_at: true,
          sss_number: true,
          tin_number: true,
          gov_id: true,
          profile_picture_url: true,
          staff_profile: {
            select: {
              id: true,
              full_name: true,
              specializations: true,
              base_pay_per_week: true,
              daily_target: true,
              scheduled_start: true,
              scheduled_end: true,
            },
          },
        },
      }),
      // Reviews list
      prisma.review.findMany({
        include: {
          customer: { select: { full_name: true } },
          staff: { select: { full_name: true } },
          appointment_item: { include: { service: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      // Attendance records
      prisma.attendance.findMany({
        where: attendanceStart ? { date: { gte: attendanceStart } } : {},
        include: { staff: true },
        orderBy: { date: 'desc' },
      }),
      // Service categories
      prisma.serviceCategory.findMany({
        include: { services: true },
      }),
      // Appointments (paginated first 20)
      prisma.appointment.findMany({
        take: 21,
        orderBy: { appointment_date: 'desc' },
        include: {
          customer: true,
          items: { include: { service: true, staff: true } },
          transactions: true,
          addons: { include: { addon: true } },
        },
      }),
    ]);

    // 2. Fetch service names for serviceStats
    const serviceIds = [...new Set(serviceStats.map((stat) => stat.service_id))];
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    const serviceBreakdown = serviceStats.map((stat) => ({
      name: serviceMap.get(stat.service_id)?.name || 'Unknown',
      amount: Number(stat._sum.base_amount || 0),
      count: stat._count.id,
    }));

    // 3. Query the dynamic sales target
    let dynamicTarget = 8000.0;
    try {
      const activePeriod = await prisma.payrollPeriod.findFirst({
        where: { is_locked: false },
        orderBy: { start_date: 'desc' },
      });
      if (activePeriod && (activePeriod as any).sales_target !== null) {
        dynamicTarget = Number((activePeriod as any).sales_target);
      } else {
        const systemSetting = await (prisma as any).systemSettings.findUnique({
          where: { key: 'global_sales_target' },
        });
        if (systemSetting) {
          dynamicTarget = parseFloat(systemSetting.value);
        }
      }
    } catch (e) {
      console.error('Failed to fetch dynamic sales target:', e);
    }

    // 4. Format staff list with manager access
    const formattedStaffList = allStaffUsers.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      fullName: u.staff_profile?.full_name,
      staffProfileId: u.staff_profile?.id,
      specializations: u.staff_profile?.specializations,
      profilePictureUrl: u.profile_picture_url,
      email: u.email,
      phone: u.phone,
      isActive: u.is_active,
      basePayPerWeek: u.staff_profile?.base_pay_per_week,
      dailyTarget: u.staff_profile?.daily_target,
      sssNumber: u.sss_number,
      pagIbigNumber: u.tin_number,
      createdAt: u.created_at,
      scheduledStart: u.staff_profile?.scheduled_start,
      scheduledEnd: u.staff_profile?.scheduled_end,
    }));

    // 5. Format appointments
    const hasMoreAppointments = appointments.length > 20;
    const appointmentItems = hasMoreAppointments ? appointments.slice(0, 20) : appointments;
    const nextAppointmentsCursor = hasMoreAppointments ? appointmentItems[appointmentItems.length - 1].id.toString() : null;

    return res.status(200).json({
      success: true,
      data: {
        salesStats: {
          totalRevenue: Number(salesData._sum.amount || 0),
          transactionCount: salesData._count.id,
          onlineCount: onlineAppointmentsCount,
          walkInCount: walkInAppointmentsCount,
          serviceBreakdown: serviceBreakdown,
          target: dynamicTarget,
        },
        staffMembers: formattedStaffList,
        reviews: reviews,
        attendance: attendanceRecords,
        categories: categories,
        appointments: {
          items: appointmentItems,
          nextCursor: nextAppointmentsCursor,
          hasMore: hasMoreAppointments,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Get manager dashboard error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch manager dashboard data';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};
