import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, format } from 'date-fns';
import { sendBookingConfirmation } from '../utils/email';
import { createNotification } from './notificationController';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendSuccess, sendError, getCurrentUser } from '../utils/apiHelpers';
import { getFullDate } from '../utils/dateUtils';

function generateRandomPassword(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }
    const userId = currentUser.userId;
    const role = currentUser.role;

    // Pagination params (D-10: default 20, max 100)
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const where: Prisma.AppointmentWhereInput = {};
    if (role === 'customer') {
      const customer = await prisma.customerProfile.findUnique({ where: { user_id: userId } });
      if (!customer) return sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer not found', 404);
      where.customer_id = customer.id;
    } else if (role === 'staff') {
      const staff = await prisma.staffProfile.findUnique({ where: { user_id: userId } });
      if (!staff) return sendError(res, 'STAFF_NOT_FOUND', 'Staff profile not found', 404);
      where.items = { some: { staff_id: staff.id } };
    }

    // D-09: cursor-based using id field
    if (cursor) {
      where.id = { gt: cursor };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      take: limit + 1, // Fetch one extra to detect hasMore (D-12: cursor-only)
      orderBy: { appointment_date: 'desc' },
      include: {
        customer: true,
        items: { include: { service: true, staff: true } },
        transactions: true,
        addons: { include: { addon: true } },
      },
    });

    const hasMore = appointments.length > limit;
    const items = hasMore ? appointments.slice(0, limit) : appointments;
    const nextCursor = hasMore ? items[items.length - 1].id.toString() : null;

    // D-11: Response format with { items, nextCursor, hasMore } wrapper
    return sendSuccess(res, { items, nextCursor, hasMore }, 200);
  } catch (error: unknown) {
    console.error('Get appointments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch appointments';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }
    const userId = currentUser.userId;
    const role = currentUser.role;
    const { items, date, notes, customerId, isWalkIn, phone, addons } = req.validatedBody || req.body;

    if (!userId) {
      return sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }

    // MANDATORY: Check if user is verified and has a phone number
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer_profile: true },
    });

    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // 1. Verification check (Every user must be verified)
    // We assume 'is_active' or similar field tracks verification status if synced from Clerk
    // Or we check if clerk_id is present and they are authenticated.
    // For now, let's assume if they have a clerk_id and are active, they are verified.
    if (!user.is_active) {
      return sendError(res, 'USER_NOT_VERIFIED', 'Your account must be verified before booking.', 403);
    }

    // 2. Mandatory phone number check (SET ASIDE FOR NOW per user request)
    /*
    const userPhone = user.phone || phone;
    if (!userPhone) {
      return sendError(res, 'PHONE_REQUIRED', 'A phone number is required to make an appointment.', 400);
    }

    // If phone was provided in request but not in DB, update DB
    if (phone && !user.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone },
      });
    }
    */



    if (!items || !Array.isArray(items) || items.length === 0 || !date) {
      return sendError(res, 'MISSING_FIELDS', 'Missing required fields (items, date)', 400);
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
        return sendError(
          res,
          'CUSTOMER_ID_REQUIRED',
          'Customer ID is required for staff bookings',
          400,
        );
      }
    } else {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { user_id: userId },
      });
      if (!customerProfile) {
        return sendError(res, 'CUSTOMER_PROFILE_NOT_FOUND', 'Customer profile not found', 404);
      }
      targetCustomerId = customerProfile.id;
    }

    const packageIds = [
      ...new Set(items.filter((i: any) => i.packageId).map((i: any) => i.packageId)),
    ];
    for (const pkgId of packageIds as number[]) {
      const pkg = await prisma.servicePackage.findUnique({
        where: { id: pkgId },
        include: { appointment_items: { select: { id: true } } },
      });

      if (!pkg) {
        return sendError(res, 'BAD_REQUEST', `Package ${pkgId} not found`, 400);
      }
      if (!pkg.is_active) {
        return sendError(res, 'BAD_REQUEST', `Package "${pkg.name}" is no longer available`, 400);
      }

      const now = new Date();
      if (pkg.valid_from && new Date(pkg.valid_from) > now) {
        return sendError(res, 'BAD_REQUEST', `Package "${pkg.name}" is not yet available`, 400);
      }
      if (pkg.valid_until && new Date(pkg.valid_until) < now) {
        return sendError(res, 'BAD_REQUEST', `Package "${pkg.name}" has expired`, 400);
      }

      if (pkg.max_redemptions !== null) {
        const currentBookings = pkg.appointment_items.length;
        const newBookingsForThisPkg = items.filter((i: any) => i.packageId === pkgId).length;
        if (currentBookings + newBookingsForThisPkg > pkg.max_redemptions) {
          return sendError(
            res,
            'BAD_REQUEST',
            `Package "${pkg.name}" has reached its booking limit`,
            400,
          );
        }
      }
    }

    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Strict Availability Check (Conflict Prevention)
      for (const item of items) {
        const { serviceId, staffId, startTime } = item;
        const service = await tx.service.findUnique({ where: { id: parseInt(serviceId) } });
        if (!service) throw new Error(`Service ${serviceId} not found`);

        const staffProfile = await tx.staffProfile.findFirst({
          where: { user_id: parseInt(staffId) },
        });
        if (!staffProfile) throw new Error(`Staff profile for user ${staffId} not found`);

        const startDateTime = getFullDate(date, startTime);
        const endDateTime = addMinutes(startDateTime, service.duration_minutes);

        // Check for overlapping appointments for this staff member
        const existingAppointments = await tx.appointmentItem.findMany({
          where: {
            staff_id: staffProfile.id,
            appointment: {
              appointment_date: {
                gte: new Date(date),
                lte: new Date(date), // Strictly same day
              },
            },
            status: { in: ['pending', 'confirmed', 'in_progress'] },
          },
        });

        for (const existing of existingAppointments) {
          const exStart = getFullDate(date, existing.start_time);
          const exEnd = getFullDate(date, existing.end_time);

          if (
            (startDateTime >= exStart && startDateTime < exEnd) ||
            (endDateTime > exStart && endDateTime <= exEnd) ||
            (startDateTime <= exStart && endDateTime >= exEnd)
          ) {
            throw new Error(
              `Technician ${staffProfile.full_name || staffId} is already booked at ${startTime}. Please select another time or technician.`,
            );
          }
        }
      }

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
        const { serviceId, staffId, startTime, packageId } = item;
        const service = await tx.service.findUnique({ where: { id: parseInt(serviceId) } });
        if (!service) throw new Error(`Service ${serviceId} not found`);

        // staffId from frontend is User.id — resolve to StaffProfile.id for storage
        const staffProfile = await tx.staffProfile.findFirst({
          where: { user_id: parseInt(staffId) },
        });
        if (!staffProfile) throw new Error(`Staff profile for user ${staffId} not found`);

        const startDateTime = getFullDate(date, startTime);
        const endDateTime = addMinutes(startDateTime, service.duration_minutes);
        const endTimeStr = format(endDateTime, 'HH:mm');

        await tx.appointmentItem.create({
          data: {
            appointment_id: apt.id,
            service_id: service.id,
            staff_id: staffProfile.id,
            status: isWalkIn ? 'in_progress' : 'pending',
            start_time: startTime,
            end_time: endTimeStr,
            price_at_booking: service.price,
            package_id: packageId || null,
          },
        });
      }

      if (addons && Array.isArray(addons)) {
        for (const adn of addons) {
          const addonDb = await tx.addon.findUnique({ where: { id: parseInt(adn.addonId) } });
          if (!addonDb) throw new Error(`Addon ${adn.addonId} not found`);
          if (!addonDb.is_active) throw new Error(`Addon "${addonDb.name}" is no longer available`);
          
          await tx.appointmentAddon.create({
            data: {
              appointment_id: apt.id,
              addon_id: addonDb.id,
              price_at_booking: addonDb.price,
              quantity: parseInt(adn.quantity) || 1,
            }
          });
        }
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
          // item.staffId here is User.id — resolve to StaffProfile.user_id for notification targeting
          const staff = await prisma.staffProfile.findFirst({
            where: { user_id: parseInt(item.staffId) },
          });
          if (staff) {
            // D-05: Customers cannot notify other users
            if (callerRole === 'customer' && callerId !== staff.user_id) {
              console.warn('[notification] Blocked cross-user notification attempt', {
                callerId,
                targetId: staff.user_id,
              });
            } else {
              createNotification(
                staff.user_id,
                'NEW_BOOKING',
                'New Appointment Assigned',
                `You have a new booking on ${format(new Date(date), 'MMM dd')} at ${item.startTime}.`,
              );
            }
          }
        }
      } catch (err: unknown) {
        console.error('Post-booking notification error:', err);
      }
    })();

    return sendSuccess(res, { ...appointment, message: 'Appointment booked successfully!' }, 201);
  } catch (error: unknown) {
    console.error('Create appointment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }

    const appointmentId = (req as any).validatedParams.id;
    const { reason } = req.validatedBody || req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        items: {
          include: {
            staff: true,
          },
        },
      },
    });

    if (!appointment) {
      return sendError(res, 'APPOINTMENT_NOT_FOUND', 'Appointment not found', 404);
    }

    // Check if user has permission to cancel
    if (currentUser.role === 'customer') {
      const customer = await prisma.customerProfile.findUnique({
        where: { user_id: currentUser.userId },
      });
      if (!customer || appointment.customer_id !== customer.id) {
        return sendError(res, 'FORBIDDEN', 'You can only cancel your own appointments', 403);
      }
    }

    // Only pending or confirmed appointments can be cancelled
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return sendError(
        res,
        'INVALID_STATUS',
        `Cannot cancel appointment in "${appointment.status}" status`,
        400,
      );
    }

    // Perform cancellation in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'cancelled',
          notes: reason
            ? `${appointment.notes || ''}\nCancellation Reason: ${reason}`
            : appointment.notes,
        },
      });

      await tx.appointmentItem.updateMany({
        where: { appointment_id: appointmentId },
        data: { status: 'cancelled' },
      });

      await tx.systemLog.create({
        data: {
          user_id: currentUser.userId,
          action: 'CANCEL_APPOINTMENT',
          entity_type: 'appointment',
          entity_id: appointmentId,
          details: { reason, cancelledBy: currentUser.role },
        },
      });
    });

    // Notify staff
    (async () => {
      try {
        const staffToNotify = new Set<number>();
        appointment.items.forEach((item) => {
          if (item.staff) staffToNotify.add(item.staff.user_id);
        });

        for (const staffUserId of staffToNotify) {
          await createNotification(
            staffUserId,
            'APPOINTMENT_CANCELLED',
            'Appointment Cancelled',
            `The appointment on ${format(new Date(appointment.appointment_date), 'MMM dd')} has been cancelled${reason ? `: ${reason}` : '.'}`,
          );
        }
      } catch (err) {
        console.error('Error notifying staff about cancellation:', err);
      }
    })();

    return sendSuccess(res, { message: 'Appointment cancelled successfully' }, 200);
  } catch (error: unknown) {
    console.error('Cancel appointment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel appointment';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};
