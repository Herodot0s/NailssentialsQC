import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, parse, format, areIntervalsOverlapping, getISOWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { sendBookingConfirmation, sendAppointmentCompletion } from '../utils/email';
import { createNotification } from './notificationController';

/**
 * Basic helper to convert "HH:mm" and Date to a full Date object for comparison
 */
const getFullDate = (dateStr: string, timeStr: string) => {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
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
      where.technician_id = staff.id;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        technician: true,
        services: {
          include: { service: true }
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
        services: true,
        technician: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Appointment is already completed' });
    }

    // 1. Calculate total amount
    const totalAmount = appointment.services.reduce((acc, s) => acc + Number(s.price_at_booking) * s.quantity, 0);

    // 2. Generate receipt number (YYYYMMDD-NNN)
    const today = new Date();
    const todayStr = format(today, 'yyyyMMdd');
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const transactionCount = await prisma.transaction.count({
      where: {
        transaction_date: {
          gte: startOfDay,
        },
      },
    });
    const receiptNumber = `${todayStr}-${(transactionCount + 1).toString().padStart(3, '0')}`;

    // 3. Complete appointment and record transaction & commissions in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update appointment status
      const updatedAppointment = await tx.appointment.update({
        where: { id: parseInt(id as string) },
        data: { status: 'completed' },
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
      const commissionRate = 0.10; // 10% flat rate

      const commissionsCreated = [];
      for (const serviceItem of appointment.services) {
        const commissionAmount = Number(serviceItem.price_at_booking) * serviceItem.quantity * commissionRate;
        
        const commission = await tx.commission.create({
          data: {
            transaction_id: transaction.id,
            staff_id: appointment.technician_id,
            service_id: serviceItem.service_id,
            base_amount: Number(serviceItem.price_at_booking) * serviceItem.quantity,
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

      return { updatedAppointment, transaction, commissions: commissionsCreated };
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

    // 2. Get all appointments for this date
    const appointments = await prisma.appointment.findMany({
      where: {
        appointment_date: new Date(date as string),
        status: { in: ['pending', 'confirmed', 'in_progress'] }
      },
      select: { 
        start_time: true, 
        end_time: true,
        technician_id: true
      }
    });

    // 3. For each slot, check if ANY technician is free
    // A technician is free if they don't have an appointment overlapping with the slot [HH:00, HH:59]
    // Note: This is a simplified check for the 1-hour slot view.
    const slotsWithAvailability = allSlots.map(slotTime => {
      const slotStart = getFullDate(date as string, slotTime);
      const slotEnd = addMinutes(slotStart, 59);

      const availableTechnicians = technicians.filter(tech => {
        const techAppointments = appointments.filter(a => a.technician_id === tech.id);
        
        const isOverlapping = techAppointments.some(appt => {
          const apptStart = getFullDate(date as string, appt.start_time);
          const apptEnd = getFullDate(date as string, appt.end_time);
          
          return areIntervalsOverlapping(
            { start: slotStart, end: slotEnd },
            { start: apptStart, end: apptEnd }
          );
        });

        return !isOverlapping;
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

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { role } = req.user || {};
    const { serviceId, date, time, notes, customerId, isWalkIn } = req.body; // time is "HH:mm"

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Data Validation
    if (!serviceId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 2. Determine Customer ID
    let targetCustomerId: number;

    if (role === 'staff' || role === 'manager') {
      if (customerId) {
        targetCustomerId = parseInt(customerId as string);
      } else if (isWalkIn) {
        // Find or create a generic 'Walk-in' customer
        let walkInCustomer = await prisma.customerProfile.findFirst({
          where: { full_name: 'Walk-in Customer' }
        });

        if (!walkInCustomer) {
           // We need a user record for the profile (requirement of schema)
           // Create a ghost user for walk-ins if not exists
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
      // Customer booking for themselves
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { user_id: userId }
      });
      if (!customerProfile) {
        return res.status(404).json({ success: false, message: 'Customer profile not found' });
      }
      targetCustomerId = customerProfile.id;
    }

    // 3. Get service details
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // 4. Calculate proper end time
    const startDateTime = getFullDate(date, time);
    const endDateTime = addMinutes(startDateTime, service.duration_minutes);
    const endTimeStr = format(endDateTime, 'HH:mm');

    // 5. Find an available technician
    const technicians = await prisma.staffProfile.findMany({
      where: { is_available: true }
    });

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        appointment_date: new Date(date),
        status: { in: ['pending', 'confirmed', 'in_progress'] }
      }
    });

    const availableTech = technicians.find(tech => {
      const techAppointments = existingAppointments.filter(a => a.technician_id === tech.id);
      
      const hasConflict = techAppointments.some(appt => {
        const apptStart = getFullDate(date, appt.start_time);
        const apptEnd = getFullDate(date, appt.end_time);
        
        return areIntervalsOverlapping(
          { start: startDateTime, end: endDateTime },
          { start: apptStart, end: apptEnd }
        );
      });

      return !hasConflict;
    });

    if (!availableTech) {
      return res.status(409).json({ 
        success: false, 
        message: 'No available technician for this time slot and duration.' 
      });
    }

    // 6. Create Appointment in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          customer_id: targetCustomerId,
          technician_id: availableTech.id,
          appointment_date: new Date(date),
          start_time: time,
          end_time: endTimeStr,
          status: isWalkIn ? 'in_progress' : 'pending',
          is_walk_in: isWalkIn || false,
          notes: notes || '',
        }
      });

      await tx.appointmentService.create({
        data: {
          appointment_id: apt.id,
          service_id: service.id,
          quantity: 1,
          price_at_booking: service.price,
        }
      });

      return apt;
    });

    // 7. Send Notifications (Async)
    (async () => {
      try {
        const customer = await prisma.customerProfile.findUnique({
          where: { id: targetCustomerId },
          include: { user: true }
        });
        
        const technician = await prisma.staffProfile.findUnique({
          where: { id: availableTech.id },
          include: { user: true }
        });

        if (customer?.user.email && !isWalkIn) {
          sendBookingConfirmation(customer.user.email, {
            customerName: customer.full_name,
            serviceName: service.name,
            date: format(new Date(date), 'MMMM dd, yyyy'),
            time,
            technicianName: technician?.full_name || 'Assigned Technician'
          });
        }

        if (technician) {
          createNotification(
            technician.user_id,
            'NEW_BOOKING',
            'New Appointment Assigned',
            `You have a new booking for ${service.name} on ${format(new Date(date), 'MMM dd')} at ${time}.`
          );
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
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create appointment' }
    });
  }
};
