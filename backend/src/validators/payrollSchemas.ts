import { z } from 'zod';

export const addDeductionSchema = z.object({
  staff_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  staffId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  payroll_period_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  payrollPeriodId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  type: z.string().min(1, 'Type is required'),
  amount: z.union([z.number(), z.string().transform(Number)]),
  notes: z.string().optional(),
}).passthrough();

export const generatePayrollSchema = z.object({
  start_date: z.string().optional(),
  startDate: z.string().optional(),
  end_date: z.string().optional(),
  endDate: z.string().optional(),
  payroll_period_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  payrollPeriodId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
}).passthrough();

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
