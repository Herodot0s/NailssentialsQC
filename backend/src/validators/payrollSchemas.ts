import { z } from 'zod';

export const addDeductionSchema = z.object({
  staff_id: z.number().int().positive('Staff ID must be a positive integer'),
  payroll_period_id: z.number().int().positive().optional(),
  type: z.string().min(1, 'Type is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export const generatePayrollSchema = z.object({
  start_date: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }),
  end_date: z.string().datetime({ message: 'End date must be a valid ISO datetime string' }),
});
