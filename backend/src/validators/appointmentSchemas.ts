import { z } from 'zod';

export const createAppointmentSchema = z.object({
  items: z
    .array(
      z.object({
        serviceId: z.number().int().positive('Service ID must be a positive integer'),
        staffId: z.number().int().positive('Staff ID must be a positive integer'),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
      })
    )
    .min(1, 'At least one item is required'),
  date: z.string().datetime({ message: 'Date must be a valid ISO datetime string' }),
  notes: z.string().optional(),
  customerId: z.number().int().positive().optional(),
  isWalkIn: z.boolean().optional(),
});

export const completeAppointmentSchema = z.object({
  paymentMethod: z.enum(['cash', 'gcash'], {
    message: 'Payment method must be either cash or gcash',
  }),
});
