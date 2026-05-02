import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, parse, format, areIntervalsOverlapping, getISOWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendBookingConfirmation, sendAppointmentCompletion } from '../utils/email';
import { createNotification } from './notificationController';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Basic helper to convert "HH:mm" and Date to a full Date object for comparison
 */
const getFullDate = (dateStr: string, timeStr: string) => {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
};

/**
 * Helper to determine the commission rate based on previous month's total salon sales.
 * Below ₱51,000 = 5%, ₱51,000 to ₱54,999 = 8%, ₱55,000 and above = 10%.
 */
const getTieredCommissionRate = async () => {
  const lastMonth = subMonths(new Date(), 1);
  const start = startOfMonth(lastMonth);
  const end = endOfMonth(lastMonth);

  const totalSales = await prisma.transaction.aggregate({
    where: {
      transaction_date: { gte: start, lte: end },
      status: 'completed',
    },
    _sum: { amount: true },
  });

  const salesAmount = Number(totalSales._sum.amount || 0);

  if (salesAmount >= 55000) return 0.10;
  if (salesAmount >= 51000) return 0.08;
  return 0.05;
};

/**
 * Helper to check if staff hits their specialty quota (Rule 2).
 * 20% rate applied if staff hits >₱6000 in specific services during current month.
 */
const checkSpecialtyQuota = async (staffId: number) => {
  const startOfCurrMonth = startOfMonth(new Date());
  
  const staffSales = await prisma.commission.aggregate({
    where: {
      staff_id: staffId,
      commission_date: { gte: startOfCurrMonth },
    },
    _sum: { base_amount: true }
  });

  const totalSales = Number(staffSales._sum.base_amount || 0);
  return totalSales >= 6000; 
};

export const getCommissionSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
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
  } catch (error: any) {
    console.error('Get commission summary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch commission summary' });
  }
};

export const getStaffCommissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
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
  } catch (error: any) {
    console.error('Get staff commissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch commissions' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { role } = req.user || {};

    let where: any = {};
    if (role === 'customer') {
      const customer = await prisma.customerProfile.findUnique({ where: { user_id: userId } });
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      where.customer_id = customer.id;
    } else if (role === 'staff') {
      const staff = await prisma.staffProfile.findUnique({ where: { user_id: userId } });
      if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
      // Staff see appointments where they have at least one item
      where.items = {
        some: { staff_id: staff.id }
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { 
            service: true,
            staff: true
          }
        },
        transactions: true
      },
      orderBy: { appointment_date: 'desc' }
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

export const completeAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body; // 'cash' | 'gcash'

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        items: {
          include: { service: true }
        }
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Appointment is already completed' });
    }

    // 1. Calculate total amount
    const totalAmount = appointment.items.reduce((acc, item) => acc + Number(item.price_at_booking), 0);

    // 2. Generate receipt number (REC-MMYYYY-NNNN)
    const today = new Date();
    const monthYearStr = format(today, 'MMyyyy');
    const startOfToday = startOfDay(today);
    
    const transactionCount = await prisma.transaction.count({
      where: {
        transaction_date: {
          gte: startOfToday,
        },
      },
    });
    const receiptNumber = `REC-${monthYearStr}-${(transactionCount + 1).toString().padStart(4, '0')}`;

    // 3. Complete appointment and record transaction & commissions in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update appointment status
      await tx.appointment.update({
        where: { id: parseInt(id as string) },
        data: { status: 'completed' },
      });

      // Also update all items to completed
      await tx.appointmentItem.updateMany({
        where: { appointment_id: parseInt(id as string) },
        data: { status: 'completed' }
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          appointment_id: parseInt(id as string),
          amount: totalAmount,
          payment_method: paymentMethod as any,
          status: 'completed',
          receipt_number: receiptNumber,
        },
      });

      // Calculate and create commissions
      const baseRate = await getTieredCommissionRate();

      const commissionsCreated = [];
      for (const item of appointment.items) {
        // Specialty Quota Check (Rule 2)
        const hasHitQuota = await checkSpecialtyQuota(item.staff_id);
        const commissionRate = hasHitQuota ? 0.20 : baseRate;

        const commissionAmount = Number(item.price_at_booking) * commissionRate;
        
        const commission = await tx.commission.create({
          data: {
            transaction_id: transaction.id,
            staff_id: item.staff_id,
            service_id: item.service_id,
            base_amount: Number(item.price_at_booking),
            commission_rate: commissionRate * 100, 
            commission_amount: commissionAmount,
            commission_date: today,
            period_week: getISOWeek(today),
            period_month: getMonth(today) + 1, 
            period_year: getYear(today),
          },
        });
        commissionsCreated.push(commission);
      }

      return { transaction, commissions: commissionsCreated };
    });

    // 4. Send Completion Notification (Async)
    (async () => {
      try {
        const customer = await prisma.customerProfile.findUnique({
          where: { id: appointment.customer_id },
          include: { user: true }
        });

        if (customer?.user.email && !appointment.is_walk_in) {
          sendAppointmentCompletion(customer.user.email, {
            customerName: customer.full_name,
            receiptNumber: receiptNumber,
            totalAmount: totalAmount.toFixed(2)
          });
        }
      } catch (err) {
        console.error('Post-completion notification error:', err);
      }
    })();

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Appointment completed and commissions calculated!',
    });

  } catch (error: any) {
    console.error('Complete appointment error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to complete appointment' },
    });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

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
      return res.status(200).json({ success: true, data: allSlots.map(s => ({ time: s, available: false })) });
    }

    // 2. Get all appointment items for this date
    const appointmentItems = await prisma.appointmentItem.findMany({
      where: {
        appointment: {
          appointment_date: new Date(date as string),
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
      const slotStart = getFullDate(date as string, slotTime);
      const slotEnd = addMinutes(slotStart, 59);

      const availableTechnicians = technicians.filter(tech => {
        const techItems = appointmentItems.filter(item => item.staff_id === tech.id);
        
        const hasConflict = techItems.some(item => {
          const itemStart = getFullDate(date as string, item.start_time);
          const itemEnd = getFullDate(date as string, item.end_time);
          
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

    return res.status(200).json({
      success: true,
      data: slotsWithAvailability
    });
  } catch (error: any) {
    console.error('Get available slots error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch availability' }
    });
  }
};

function generateRandomPassword(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { role } = req.user || {};
    const { items, date, notes, customerId, isWalkIn } = req.body; 

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Data Validation
    if (!items || !Array.isArray(items) || items.length === 0 || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields (items, date)' });
    }

    // 2. Determine Customer ID
    let targetCustomerId: number;
    if (role === 'staff' || role === 'manager') {
      if (customerId) {
        targetCustomerId = parseInt(customerId as string);
      } else if (isWalkIn) {
        let walkInCustomer = await prisma.customerProfile.findFirst({
          where: { full_name: 'Walk-in Customer' }
        });
        if (!walkInCustomer) {
           const walkInUser = await prisma.user.upsert({
             where: { username: 'walkin_guest' },
             update: {},
             create: {
               username: 'walkin_guest',
               password_hash: 'N/A',
               role: 'customer',
               is_active: false
             }
           });
           walkInCustomer = await prisma.customerProfile.create({
             data: {
               user_id: walkInUser.id,
               full_name: 'Walk-in Customer'
             }
           });
        }
        targetCustomerId = walkInCustomer.id;
      } else {
        return res.status(400).json({ success: false, message: 'Customer ID is required for staff bookings' });
      }
    } else {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { user_id: userId }
      });
      if (!customerProfile) {
        return res.status(404).json({ success: false, message: 'Customer profile not found' });
      }
      targetCustomerId = customerProfile.id;
    }

    // 3. Create Appointment in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          customer_id: targetCustomerId,
          appointment_date: new Date(date),
          status: isWalkIn ? 'in_progress' : 'pending',
          is_walk_in: isWalkIn || false,
          notes: notes || '',
        }
      });

      for (const item of items) {
        const { serviceId, staffId, startTime } = item;
        
        const service = await tx.service.findUnique({ where: { id: parseInt(serviceId) } });
        if (!service) throw new Error(`Service ${serviceId} not found`);

        const startDateTime = getFullDate(date, startTime);
        const endDateTime = addMinutes(startDateTime, service.duration_minutes);
        const endTimeStr = format(endDateTime, 'HH:mm');

        await tx.appointmentItem.create({
          data: {
            appointment_id: apt.id,
            service_id: service.id,
            staff_id: parseInt(staffId),
            status: isWalkIn ? 'in_progress' : 'pending',
            start_time: startTime,
            end_time: endTimeStr,
            price_at_booking: service.price,
          }
        });
      }

      return apt;
    });

    // 4. Send Notifications (Async)
    (async () => {
      try {
        const customer = await prisma.customerProfile.findUnique({
          where: { id: targetCustomerId },
          include: { user: true }
        });
        
        if (customer?.user.email && !isWalkIn) {
          // Simplified notification for multi-service
          sendBookingConfirmation(customer.user.email, {
            customerName: customer.full_name,
            serviceName: `${items.length} services`,
            date: format(new Date(date), 'MMMM dd, yyyy'),
            time: items[0].startTime,
            technicianName: 'Assigned Technicians'
          });
        }

        // Notify each staff
        for (const item of items) {
           const staff = await prisma.staffProfile.findUnique({ where: { id: parseInt(item.staffId) } });
           if (staff) {
             createNotification(
               staff.user_id,
               'NEW_BOOKING',
               'New Appointment Assigned',
               `You have a new booking on ${format(new Date(date), 'MMM dd')} at ${item.startTime}.`
             );
           }
        }
      } catch (err) {
        console.error('Post-booking notification error:', err);
      }
    })();

    return res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully!'
    });

  } catch (error: any) {
    console.error('Create appointment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create appointment'
    });
  }
};
