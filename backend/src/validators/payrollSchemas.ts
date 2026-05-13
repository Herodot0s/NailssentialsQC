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

export const salaryComponentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['earning', 'deduction']),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const salaryStructureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  components: z.array(
    z.object({
      salary_component_id: z.number().int(),
      amount: z.number().optional(),
      formula: z.string().optional(),
    }),
  ),
});

export const salaryStructureAssignmentSchema = z.object({
  staff_id: z.number().int().positive(),
  salary_structure_id: z.number().int().positive(),
  base_pay: z.number().positive(),
  effective_from: z.string().datetime(),
});
