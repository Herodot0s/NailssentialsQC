import { Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';

interface PrismaError extends Error {
  code: string;
}

/**
 * Get current attendance status for the logged-in staff and recent history.
 */
export const getAttendanceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
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
    const dayOfWeek = today.getDay();

    const attendance = await prisma.attendance.findUnique({
      where: {
        uk_staff_date: {
          staff_id: staffProfile.id,
          date: today,
        },
      },
    });

    // Fetch day-specific schedule
    const daySchedule = await prisma.staffSchedule.findUnique({
      where: {
        staff_day_unique: {
          staff_id: staffProfile.id,
          day_of_week: dayOfWeek,
        }
      }
    });

    const scheduledStart = (daySchedule && daySchedule.is_active) ? daySchedule.start_time : staffProfile.scheduled_start;
    const scheduledEnd = (daySchedule && daySchedule.is_active) ? daySchedule.end_time : staffProfile.scheduled_end;

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
          checkInRaw: attendance?.check_in?.toISOString() || null,
          checkOutTime: attendance?.check_out ? new Date(attendance.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          checkOutRaw: attendance?.check_out?.toISOString() || null,
          date: today.toISOString().split('T')[0],
          scheduledStart: attendance?.scheduled_start || scheduledStart,
          scheduledEnd: attendance?.scheduled_end || scheduledEnd,
        },
        logs: formattedLogs,
      },
    });
  } catch (error: unknown) {
    console.error('Get attendance status error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch attendance status';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message },
    });
  }
};

/**
 * Handle staff check-in.
 */
export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
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
    const dayOfWeek = today.getDay();

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

    // Fetch day-specific schedule
    const daySchedule = await prisma.staffSchedule.findUnique({
      where: {
        staff_day_unique: {
          staff_id: staffProfile.id,
          day_of_week: dayOfWeek,
        }
      }
    });

    const scheduledStartStr = (daySchedule && daySchedule.is_active) ? daySchedule.start_time : (staffProfile.scheduled_start || "12:00:00");
    const scheduledEndStr = (daySchedule && daySchedule.is_active) ? daySchedule.end_time : (staffProfile.scheduled_end || "22:00:00");

    // Calculate tardiness
    const scheduledParts = scheduledStartStr.split(':');
    const scheduledHours = parseInt(scheduledParts[0]);
    const scheduledMinutes = parseInt(scheduledParts[1]);
    
    const scheduledStartTime = new Date(today);
    scheduledStartTime.setHours(scheduledHours, scheduledMinutes, 0, 0);

    let tardinessMinutes = 0;
    const gracePeriod = 15;
    const diffMs = now.getTime() - scheduledStartTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes > gracePeriod) {
      tardinessMinutes = diffMinutes;
    }

    // Roadmap: Clocking in at 16 minutes late generates exactly a ₱1 deduction.
    // So deduction = tardinessMinutes - gracePeriod if tardinessMinutes > gracePeriod
    const deductionAmount = tardinessMinutes > gracePeriod ? (tardinessMinutes - gracePeriod) : 0;

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
        scheduled_end: scheduledEndStr,
        tardiness_minutes: tardinessMinutes,
        deduction_amount: deductionAmount,
      },
      create: {
        staff_id: staffProfile.id,
        date: today,
        check_in: now,
        scheduled_start: scheduledStartStr,
        scheduled_end: scheduledEndStr,
        tardiness_minutes: tardinessMinutes,
        deduction_amount: deductionAmount,
      },
    });

    // SEC-03: Capture caller identity for notification authorization
    const callerId = userId!;
    const callerRole = req.user?.role;

    // Notify Managers
    (async () => {
      try {
        const managers = await prisma.user.findMany({ where: { role: 'manager' } });
        for (const manager of managers) {
          // D-05: Customers cannot notify other users
          if (callerRole === 'customer' && callerId !== manager.id) {
            console.warn('[notification] Blocked cross-user notification attempt', { callerId, targetId: manager.id });
          } else {
            createNotification(
              manager.id,
              'STAFF_CHECK_IN',
              'Staff Checked In',
              `${staffProfile.full_name} checked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ${tardinessMinutes > 0 ? `Late by ${tardinessMinutes}m.` : ''}`
            );
          }
        }
      } catch (err: unknown) {
        console.error('Manager notification error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
      }
    })();

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: unknown) {
    console.error('Check-in error:', error);
    const message = error instanceof Error ? error.message : 'Failed to check in';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message },
    });
  }
};

/**
 * Handle staff check-out.
 */
export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
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

    // Calculate if early out
    const scheduledEndStr = attendance.scheduled_end || staffProfile.scheduled_end || "22:00:00";
    const endParts = scheduledEndStr.split(':');
    const endHours = parseInt(endParts[0]);
    const endMinutes = parseInt(endParts[1]);
    
    const scheduledEndTime = new Date(today);
    scheduledEndTime.setHours(endHours, endMinutes, 0, 0);

    const earlyOutMinutes = Math.floor((scheduledEndTime.getTime() - now.getTime()) / (1000 * 60));
    const isEarlyOut = earlyOutMinutes > 0;

    // SEC-03: Capture caller identity for notification authorization
    const callerId = userId!;
    const callerRole = req.user?.role;

    // Notify Managers
    (async () => {
      try {
        const managers = await prisma.user.findMany({ where: { role: 'manager' } });
        for (const manager of managers) {
          // D-05: Customers cannot notify other users
          if (callerRole === 'customer' && callerId !== manager.id) {
            console.warn('[notification] Blocked cross-user notification attempt', { callerId, targetId: manager.id });
          } else {
            let title = 'Staff Checked Out';
            let message = `${staffProfile.full_name} checked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
            
            if (isEarlyOut) {
              title = 'Early Shift Departure';
              const hours = Math.floor(earlyOutMinutes / 60);
              const mins = earlyOutMinutes % 60;
              message = `${staffProfile.full_name} checked out EARLY at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${hours > 0 ? `${hours}h ` : ''}${mins}m before schedule).`;
            }

            createNotification(
              manager.id,
              isEarlyOut ? 'STAFF_EARLY_OUT' : 'STAFF_CHECK_OUT',
              title,
              message
            );
          }
        }
      } catch (err: unknown) {
        console.error('Manager notification error:', err);
      }
    })();

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: unknown) {
    console.error('Check-out error:', error);
    if (error instanceof Error && 'code' in error && (error as PrismaError).code === 'P2025') {
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

    const where: Prisma.AttendanceWhereInput = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: { staff: true },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({ success: true, data: attendance });
  } catch (error: unknown) {
    console.error('Get all attendance error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch attendance records';
    return res.status(500).json({ success: false, message });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.validatedParams ?? {};
    const { checkIn, checkOut, tardinessMinutes, deductionAmount, notes } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        check_in: checkIn ? new Date(checkIn) : undefined,
        check_out: checkOut ? new Date(checkOut) : undefined,
        tardiness_minutes: tardinessMinutes !== undefined ? parseInt(tardinessMinutes) : undefined,
        deduction_amount: deductionAmount !== undefined ? parseFloat(deductionAmount) : undefined,
        notes,
      },
    });

    return res.status(200).json({ success: true, data: attendance });
  } catch (error: unknown) {
    console.error('Update attendance error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update attendance record';
    return res.status(500).json({ success: false, message });
  }
};
