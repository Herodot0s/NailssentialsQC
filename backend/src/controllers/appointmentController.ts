import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, parse, format } from 'date-fns';
import { sendBookingConfirmation } from '../utils/email';
import { createNotification } from './notificationController';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

function getFullDate(dateStr: string, timeStr: string): Date {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
}

function generateRandomPassword(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
    const { role } = req.user || {};

    const where: Prisma.AppointmentWhereInput = {};
    if (role === 'customer') {
      const customer = await prisma.customerProfile.findUnique({ where: { user_id: userId } });
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      where.customer_id = customer.id;
    } else if (role === 'staff') {
      const staff = await prisma.staffProfile.findUnique({ where: { user_id: userId } });
      if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
      where.items = { some: { staff_id: staff.id } };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        items: { include: { service: true, staff: true } },
        transactions: true,
      },
      orderBy: { appointment_date: 'desc' },
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error: unknown) {
    console.error('Get appointments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch appointments';
    return res.status(500).json({ success: false, message });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
    const { role } = req.user || {};
    const { items, date, notes, customerId, isWalkIn } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!items || !Array.isArray(items) || items.length === 0 || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields (items, date)' });
    }

    let targetCustomerId: number;
    if (role === 'staff' || role === 'manager') {
      if (customerId) {
        targetCustomerId = parseInt(customerId);
      } else if (isWalkIn) {
        let walkInCustomer = await prisma.customerProfile.findFirst({
          where: { full_name: 'Walk-in Customer' },
        });
        if (!walkInCustomer) {
          const randomPassword = generateRandomPassword(12);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);
          const walkInUser = await prisma.user.upsert({
            where: { username: 'walkin_guest' },
            update: {},
            create: {
              username: 'walkin_guest',
              password_hash: hashedPassword,
              role: 'customer',
              is_active: false,
            },
          });
          walkInCustomer = await prisma.customerProfile.create({
            data: { user_id: walkInUser.id, full_name: 'Walk-in Customer' },
          });
        }
        targetCustomerId = walkInCustomer.id;
      } else {
        return res.status(400).json({ success: false, message: 'Customer ID is required for staff bookings' });
      }
    } else {
      const customerProfile = await prisma.customerProfile.findUnique({ where: { user_id: userId } });
      if (!customerProfile) {
        return res.status(404).json({ success: false, message: 'Customer profile not found' });
      }
      targetCustomerId = customerProfile.id;
    }

    const appointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          customer_id: targetCustomerId,
          appointment_date: new Date(date),
          status: isWalkIn ? 'in_progress' : 'pending',
          is_walk_in: isWalkIn || false,
          notes: notes || '',
        },
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
          },
        });
      }

      return apt;
    });

    // SEC-03: Capture caller identity for notification authorization
    const callerId = userId!;
    const callerRole = role;

    (async () => {
      try {
        const customer = await prisma.customerProfile.findUnique({
          where: { id: targetCustomerId },
          include: { user: true },
        });

        if (customer?.user.email && !isWalkIn) {
          sendBookingConfirmation(customer.user.email, {
            customerName: customer.full_name,
            serviceName: `${items.length} services`,
            date: format(new Date(date), 'MMMM dd, yyyy'),
            time: items[0].startTime,
            technicianName: 'Assigned Technicians',
          });
        }

        for (const item of items) {
          const staff = await prisma.staffProfile.findUnique({ where: { id: parseInt(item.staffId) } });
          if (staff) {
            // D-05: Customers cannot notify other users
            if (callerRole === 'customer' && callerId !== staff.user_id) {
              console.warn('[notification] Blocked cross-user notification attempt', { callerId, targetId: staff.user_id });
            } else {
              createNotification(
                staff.user_id,
                'NEW_BOOKING',
                'New Appointment Assigned',
                `You have a new booking on ${format(new Date(date), 'MMM dd')} at ${item.startTime}.`
              );
            }
          }
        }
      } catch (err: unknown) {
        console.error('Post-booking notification error:', err);
      }
    })();

    return res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully!',
    });
  } catch (error: unknown) {
    console.error('Create appointment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    return res.status(500).json({ success: false, message });
  }
};