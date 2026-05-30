import { z } from 'zod';

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  username: z.string().optional().or(z.literal('')).nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  preferences: z.any().optional().nullable(),
  allergies: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  is_active: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
