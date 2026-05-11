import { z } from 'zod';

export const createStaffSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  username: z.string().min(1, 'Username is required'),
  specializations: z.string().optional().nullable(),
  basePayPerWeek: z.coerce.number().nonnegative().optional().nullable(),
  dailyTarget: z.coerce.number().nonnegative().optional().nullable(),
  sssNumber: z.string().optional().nullable(),
  tinNumber: z.string().optional().nullable(),
  govId: z.string().optional().nullable(),
  profilePictureUrl: z.string().url().optional().or(z.literal('')).nullable(),
  role: z.enum(['staff', 'manager']).optional(),
});

export const updateStaffSchema = createStaffSchema.partial().omit({ password: true });
