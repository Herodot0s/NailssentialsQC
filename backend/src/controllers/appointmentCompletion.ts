import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, getISOWeek, getMonth, getYear, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendAppointmentCompletion } from '../utils/email';
import { createNotification } from './notificationController';
import { AppointmentWithDetails } from '../types/appointmentTypes';
import { sendSuccess, sendError } from '../utils/apiHelpers';
import { PaymentMethod, Prisma } from '@prisma/client';
import { logSystemAction } from '../utils/systemLog';

/**
 * Helper to determine the commission rate based on previous month's total salon sales.
 * Below ₱51,000 = 5%, ₱51,000 to ₱54,999 = 8%, ₱55,000 and above = 10%.
 */
const getTieredCommissionRate = async (tx: Prisma.TransactionClient) => {
  const lastMonth = subMonths(new Date(), 1);
  const start = startOfMonth(lastMonth);
  const end = endOfMonth(lastMonth);

  const totalSales = await tx.transaction.aggregate({
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
const checkSpecialtyQuota = async (staffId: number, tx: Prisma.TransactionClient) => {
  const startOfCurrMonth = startOfMonth(new Date());

  const staffSales = await tx.commission.aggregate({
    where: {
      staff_id: staffId,
      commission_date: { gte: startOfCurrMonth },
    },
    _sum: { base_amount: true }
  });

  const totalSales = Number(staffSales._sum.base_amount || 0);
  return totalSales >= 6000;
};

export const completeAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.validatedBody || req.body; // 'cash' | 'gcash'

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        items: {
          include: { 
            service: true,
            staff: true
          }
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
        where: { id: parseInt(id) },
        data: { status: 'completed' },
      });

      // Also update all items to completed
      await tx.appointmentItem.updateMany({
        where: { appointment_id: parseInt(id) },
        data: { status: 'completed' }
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          appointment_id: parseInt(id),
          amount: totalAmount,
          payment_method: paymentMethod as PaymentMethod,
          status: 'completed',
          receipt_number: receiptNumber,
        },
      });

      // Calculate and create commissions
      const baseRate = await getTieredCommissionRate(tx);

      const commissionsCreated = [];
      for (const item of appointment.items) {
        // Specialty Quota Check (Rule 2)
        const hasHitQuota = await checkSpecialtyQuota(item.staff_id, tx);
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

        // Create in-app notification for staff member
        await tx.notification.create({
          data: {
            user_id: item.staff.user_id,
            type: 'APPOINTMENT_COMPLETED',
            title: 'Appointment Completed',
            message: `You completed an appointment. Commission: ₱${commissionAmount.toFixed(2)}`,
          },
        });
      }

      // Create in-app notification for customer
      if (appointment.customer) {
        await tx.notification.create({
          data: {
            user_id: appointment.customer.user_id,
            type: 'APPOINTMENT_COMPLETED',
            title: 'Appointment Completed',
            message: `Your appointment on ${format(today, 'yyyy-MM-dd')} is complete. Receipt: ${receiptNumber}`,
          },
        });
      }

      return { transaction, commissions: commissionsCreated };
    });

    await logSystemAction(req as AuthRequest, 'COMMISSIONS_CREATED', 'Appointment', Number(id), { message: 'Calculated commissions for appointment' });

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
      } catch (err: unknown) {
        console.error('Post-completion notification error:', err);
      }
    })();

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Appointment completed and commissions calculated!',
    });

  } catch (error: unknown) {
    console.error('Complete appointment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete appointment';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message }
    });
  }
};
