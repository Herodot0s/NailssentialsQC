import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  addMinutes,
  areIntervalsOverlapping,
  startOfISOWeek,
  endOfISOWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { AppointmentWithDetails } from '../types/appointmentTypes';
import { getFullDate, getDatePart } from '../utils/dateUtils';
import { sendSuccess } from '../utils/apiHelpers';

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date, count, duration, slot_increment } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    const requiredCount = count ? parseInt(count as string) : 1;
    const requiredDuration = duration ? parseInt(duration as string) : 30;
    const increment = slot_increment ? parseInt(slot_increment as string) : 30;
    const dateStr = Array.isArray(date) ? (date[0] as string) : (date as string);
    const dateOnly = getDatePart(dateStr);

    const OPERATING_HOURS = { start: 12, end: 22 }; // 12 PM to 10 PM
    const allSlots = [];

    // Generate slots based on increment
    let currentSlot = getFullDate(dateOnly, `${OPERATING_HOURS.start.toString().padStart(2, '0')}:00`);
    const endOfDayTime = getFullDate(dateOnly, `${OPERATING_HOURS.end.toString().padStart(2, '0')}:00`);

    while (currentSlot < endOfDayTime) {
      const hours = currentSlot.getHours().toString().padStart(2, '0');
      const minutes = currentSlot.getMinutes().toString().padStart(2, '0');
      allSlots.push(`${hours}:${minutes}`);
      currentSlot = addMinutes(currentSlot, increment);
    }

    // 1. Get all technicians
    const technicians = await prisma.staffProfile.findMany({
      where: { is_available: true },
    });

    if (technicians.length === 0) {
      return sendSuccess(
        res,
        allSlots.map((s) => ({ time: s, available: false })),
      );
    }

    // 2. Get all appointment items for this date
    const parsedDate = new Date(dateOnly);

    const appointmentItems = await prisma.appointmentItem.findMany({
      where: {
        appointment: {
          appointment_date: {
            gte: `${dateOnly}T00:00:00Z`,
            lte: `${dateOnly}T23:59:59Z`,
          },
        },
        status: { in: ['pending', 'confirmed', 'in_progress'] },
      },
      select: {
        start_time: true,
        end_time: true,
        staff_id: true,
      },
    });

    // 3. Pre-process busy intervals for each technician (O(A))
    const techBusyIntervals = new Map<number, { start: number; end: number }[]>();
    appointmentItems.forEach((item) => {
      const start = getFullDate(dateOnly, item.start_time).getTime();
      const end = getFullDate(dateOnly, item.end_time).getTime();
      if (!techBusyIntervals.has(item.staff_id)) {
        techBusyIntervals.set(item.staff_id, []);
      }
      techBusyIntervals.get(item.staff_id)!.push({ start, end });
    });

    // Sort intervals for each technician for efficient conflict checking (O(A log A))
    techBusyIntervals.forEach((intervals) => {
      intervals.sort((a, b) => a.start - b.start);
    });

    const now = new Date();
    const isToday = dateOnly === getDatePart(now.toISOString());
    const nowTime = now.getTime();
    const operatingEndTime = getFullDate(
      dateOnly,
      `${OPERATING_HOURS.end.toString().padStart(2, '0')}:00`,
    ).getTime();

    // 4. For each slot, check availability efficiently (O(S * T))
    const slotsWithAvailability = allSlots.map((slotTime) => {
      const slotStartTime = getFullDate(dateOnly, slotTime).getTime();
      const slotEndTime = slotStartTime + requiredDuration * 60000;

      // If it's today, filter out slots that have already passed
      if (isToday && slotStartTime < nowTime) {
        return {
          time: slotTime,
          available: false,
        };
      }

      // Check if the service fits within operating hours
      if (slotEndTime > operatingEndTime) {
        return {
          time: slotTime,
          available: false,
        };
      }

      const availableTechnicians = technicians.filter((tech) => {
        const intervals = techBusyIntervals.get(tech.id);
        if (!intervals) return true; // No appointments = available

        // Check for overlap: slotStart < intervalEnd && slotEnd > intervalStart
        return !intervals.some(
          (interval) => slotStartTime < interval.end && slotEndTime > interval.start,
        );
      });

      return {
        time: slotTime,
        available: availableTechnicians.length >= requiredCount,
        availableTechnicianIds: availableTechnicians.map((t) => t.id),
      };
    });

    return sendSuccess(res, slotsWithAvailability);
  } catch (error: unknown) {
    console.error('Get available slots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch availability';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message },
    });
  }
};

export const getCommissionSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.sub);
    const staff = await prisma.staffProfile.findUnique({ where: { user_id: userId } });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const today = new Date();
    const weekStart = startOfISOWeek(today);
    const weekEnd = endOfISOWeek(today);

    const dailyCommissions = await prisma.commission.aggregate({
      where: {
        staff_id: staff.id,
        commission_date: {
          gte: `${getDatePart(today.toISOString())}T00:00:00Z`,
          lte: `${getDatePart(today.toISOString())}T23:59:59Z`,
        },
      },
      _sum: { commission_amount: true },
    });

    const weeklyCommissions = await prisma.commission.aggregate({
      where: {
        staff_id: staff.id,
        commission_date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _sum: { commission_amount: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        today: Number(dailyCommissions._sum.commission_amount || 0),
        thisWeek: Number(weeklyCommissions._sum.commission_amount || 0),
      },
    });
  } catch (error: unknown) {
    console.error('Get commission summary error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch commission summary';
    return res.status(500).json({ success: false, message });
  }
};

export const getStaffCommissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.sub);
    const staff = await prisma.staffProfile.findUnique({ where: { user_id: userId } });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const commissions = await prisma.commission.findMany({
      where: { staff_id: staff.id },
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
    });

    return res.status(200).json({ success: true, data: commissions });
  } catch (error: unknown) {
    console.error('Get staff commissions error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch commissions';
    return res.status(500).json({ success: false, message });
  }
};
