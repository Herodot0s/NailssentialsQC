import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';

/**
 * Get current attendance status for the logged-in staff and recent history.
 */
export const getAttendanceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      });
    }

    const staffProfile = await prisma.staffProfile.findUnique({
      where: { user_id: userId },
    });

    if (!staffProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Staff profile not found' },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        uk_staff_date: {
          staff_id: staffProfile.id,
          date: today,
        },
      },
    });

    const logs = await prisma.attendance.findMany({
      where: { staff_id: staffProfile.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      date: log.date.toISOString().split('T')[0],
      checkIn: log.check_in ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      checkOut: log.check_out ? new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      status: log.tardiness_minutes > 0 ? `Late (${log.tardiness_minutes}m)` : 'On Time',
    }));

    return res.status(200).json({
      success: true,
      data: {
        status: {
          isCheckedIn: !!attendance?.check_in && !attendance?.check_out,
          checkInTime: attendance?.check_in ? new Date(attendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          checkOutTime: attendance?.check_out ? new Date(attendance.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          date: today.toISOString().split('T')[0],
        },
        logs: formattedLogs,
      },
    });
  } catch (error: any) {
    console.error('Get attendance status error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch attendance status' },
    });
  }
};

/**
 * Handle staff check-in.
 */
export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { user_id: userId },
    });

    if (!staffProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Staff profile not found' },
      });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked out (Review Finding: Logic Edge Case)
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        uk_staff_date: {
          staff_id: staffProfile.id,
          date: today,
        },
      },
    });

    if (existingAttendance?.check_out) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CHECKED_OUT', message: 'You have already checked out for today' },
      });
    }

    // Calculate tardiness
    const scheduledStartStr = staffProfile.scheduled_start; // "12:00:00"
    const [scheduledHours, scheduledMinutes] = scheduledStartStr.split(':').map(Number);
    
    const scheduledStartTime = new Date(today);
    scheduledStartTime.setHours(scheduledHours, scheduledMinutes, 0, 0);

    let tardinessMinutes = 0;
    const gracePeriod = 15;
    const diffMs = now.getTime() - scheduledStartTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes > gracePeriod) {
      tardinessMinutes = diffMinutes;
    }

    const deductionAmount = tardinessMinutes * 1; // ₱1 per minute

    const attendance = await prisma.attendance.upsert({
      where: {
        uk_staff_date: {
          staff_id: staffProfile.id,
          date: today,
        },
      },
      update: {
        check_in: now,
        scheduled_start: scheduledStartStr,
        scheduled_end: staffProfile.scheduled_end,
        tardiness_minutes: tardinessMinutes,
        deduction_amount: deductionAmount,
      },
      create: {
        staff_id: staffProfile.id,
        date: today,
        check_in: now,
        scheduled_start: scheduledStartStr,
        scheduled_end: staffProfile.scheduled_end,
        tardiness_minutes: tardinessMinutes,
        deduction_amount: deductionAmount,
      },
    });

    // Notify Managers
    (async () => {
      try {
        const managers = await prisma.user.findMany({ where: { role: 'manager' } });
        for (const manager of managers) {
          createNotification(
            manager.id,
            'STAFF_CHECK_IN',
            'Staff Checked In',
            `${staffProfile.full_name} checked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ${tardinessMinutes > 0 ? `Late by ${tardinessMinutes}m.` : ''}`
          );
        }
      } catch (err) {
        console.error('Manager notification error:', err);
      }
    })();

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to check in' },
    });
  }
};

/**
 * Handle staff check-out.
 */
export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { user_id: userId },
    });

    if (!staffProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Staff profile not found' },
      });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.update({
      where: {
        uk_staff_date: {
          staff_id: staffProfile.id,
          date: today,
        },
      },
      data: {
        check_out: now,
      },
    });

    // Notify Managers
    (async () => {
      try {
        const managers = await prisma.user.findMany({ where: { role: 'manager' } });
        for (const manager of managers) {
          createNotification(
            manager.id,
            'STAFF_CHECK_OUT',
            'Staff Checked Out',
            `${staffProfile.full_name} checked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
          );
        }
      } catch (err) {
        console.error('Manager notification error:', err);
      }
    })();

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    if (error.code === 'P2025') {
       return res.status(400).json({
        success: false,
        error: { code: 'NOT_CHECKED_IN', message: 'You must check in before checking out' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to check out' },
    });
  }
};

export const getAllAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: { staff: true },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    console.error('Get all attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance records' });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, tardinessMinutes, deductionAmount, notes } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id: parseInt(id as string) },
      data: {
        check_in: checkIn ? new Date(checkIn) : undefined,
        check_out: checkOut ? new Date(checkOut) : undefined,
        tardiness_minutes: tardinessMinutes !== undefined ? parseInt(tardinessMinutes) : undefined,
        deduction_amount: deductionAmount !== undefined ? parseFloat(deductionAmount) : undefined,
        notes,
      },
    });

    return res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    console.error('Update attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update attendance record' });
  }
};
