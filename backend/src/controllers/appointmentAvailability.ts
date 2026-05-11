import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, areIntervalsOverlapping, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { AppointmentWithDetails } from '../types/appointmentTypes';
import { getFullDate, getDatePart } from '../utils/dateUtils';
import { sendSuccess } from '../utils/apiHelpers';

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    const dateStr = Array.isArray(date) ? (date[0] as string) : (date as string);
    const dateOnly = getDatePart(dateStr);

    const OPERATING_HOURS = { start: 12, end: 22 }; // 12 PM to 10 PM
    const allSlots = [];
    for (let h = OPERATING_HOURS.start; h < OPERATING_HOURS.end; h++) {
      allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    // 1. Get all technicians
    const technicians = await prisma.staffProfile.findMany({
      where: { is_available: true }
    });

    if (technicians.length === 0) {
      return sendSuccess(res, allSlots.map(s => ({ time: s, available: false })));
    }

    // 2. Get all appointment items for this date
    const parsedDate = new Date(dateOnly);

    const appointmentItems = await prisma.appointmentItem.findMany({
      where: {
        appointment: {
          appointment_date: {
            gte: startOfDay(parsedDate),
            lte: endOfDay(parsedDate),
          }
        },
        status: { in: ['pending', 'confirmed', 'in_progress'] }
      },
      select: {
        start_time: true,
        end_time: true,
        staff_id: true
      }
    });

    // 3. For each slot, check if ANY technician is free
    const slotsWithAvailability = allSlots.map(slotTime => {
      const slotStart = getFullDate(dateOnly, slotTime);
      const slotEnd = addMinutes(slotStart, 59);

      const availableTechnicians = technicians.filter(tech => {
        const techItems = appointmentItems.filter(item => item.staff_id === tech.id);

        const hasConflict = techItems.some(item => {
          const itemStart = getFullDate(dateOnly, item.start_time);
          const itemEnd = getFullDate(dateOnly, item.end_time);

          return areIntervalsOverlapping(
            { start: slotStart, end: slotEnd },
            { start: itemStart, end: itemEnd }
          );
        });

        return !hasConflict;
      });

      return {
        time: slotTime,
        available: availableTechnicians.length > 0
      };
    });

    return sendSuccess(res, slotsWithAvailability);
  } catch (error: unknown) {
    console.error('Get available slots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch availability';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message }
    });
  }
};

export const getCommissionSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.sub);
    const staff = await prisma.staffProfile.findUnique({ where: { user_id: userId } });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const dailyCommissions = await prisma.commission.aggregate({
      where: {
        staff_id: staff.id,
        commission_date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
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
              include: { customer: true }
            }
          }
        }
      },
      orderBy: { commission_date: 'desc' },
      take: 50
    });

    return res.status(200).json({ success: true, data: commissions });
  } catch (error: unknown) {
    console.error('Get staff commissions error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch commissions';
    return res.status(500).json({ success: false, message });
  }
};
