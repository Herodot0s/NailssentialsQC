import { z } from 'zod';

export const createStaffSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  username: z.string().min(1, 'Username is required'),
  specializations: z.string().optional(),
  basePayPerWeek: z.coerce.number().positive().optional(),
  dailyTarget: z.coerce.number().positive().optional(),
  sssNumber: z.string().optional(),
  tinNumber: z.string().optional(),
  govId: z.string().optional(),
  profilePictureUrl: z.string().url().optional().or(z.literal('')),
  role: z.enum(['staff', 'manager']).optional(),
});

export const updateStaffSchema = createStaffSchema.partial().omit({ password: true });
