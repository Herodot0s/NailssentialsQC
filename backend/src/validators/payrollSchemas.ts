import { z } from 'zod';

export const generatePayrollSchema = z.object({
  start_date: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }),
  end_date: z.string().datetime({ message: 'End date must be a valid ISO datetime string' }),
});
