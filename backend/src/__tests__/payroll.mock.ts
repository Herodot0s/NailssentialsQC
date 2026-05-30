import { Prisma, Role, DeductionType, SalaryComponentType } from '@prisma/client';

/**
 * Mock Staff Profiles
 */
export const mockStaffProfiles = [
  {
    id: 1,
    user_id: 101,
    full_name: 'Jane Doe',
    specializations: 'Nails, Hair',
    daily_target: new Prisma.Decimal(6000.0),
    base_pay_per_week: new Prisma.Decimal(2500.0),
    base_commission_rate: new Prisma.Decimal(0.1),
    scheduled_start: '12:00:00',
    scheduled_end: '22:00:00',
    is_available: true,
    user: {
      id: 101,
      username: 'janedoe',
      role: Role.staff,
    },
  },
  {
    id: 2,
    user_id: 102,
    full_name: 'John Smith',
    specializations: 'Nails',
    daily_target: new Prisma.Decimal(6000.0),
    base_pay_per_week: new Prisma.Decimal(2500.0),
    base_commission_rate: new Prisma.Decimal(0.1),
    scheduled_start: '12:00:00',
    scheduled_end: '22:00:00',
    is_available: true,
    user: {
      id: 102,
      username: 'johnsmith',
      role: Role.staff,
    },
  },
];

/**
 * Mock Service Categories and Services
 */
export const mockCategories = [
  { id: 1, name: 'Nails' },
  { id: 2, name: 'Hair' },
];

export const mockServices = [
  { id: 1, category_id: 1, name: 'Manicure', price: new Prisma.Decimal(500.0) },
  { id: 2, category_id: 2, name: 'Haircut', price: new Prisma.Decimal(1000.0) },
];

/**
 * Mock Commissions
 */
export const mockCommissions = [
  {
    id: 1,
    transaction_id: 1,
    staff_id: 1,
    service_id: 1,
    base_amount: new Prisma.Decimal(500.0),
    commission_rate: new Prisma.Decimal(0.1),
    commission_amount: new Prisma.Decimal(50.0),
    commission_date: new Date('2026-05-25'),
    period_week: 21,
    period_month: 5,
    period_year: 2026,
    service: {
      category: { name: 'Nails' },
    },
  },
  {
    id: 2,
    transaction_id: 2,
    staff_id: 1,
    service_id: 2, // Hair service
    base_amount: new Prisma.Decimal(7000.0), // Hits > 6000 for hair specialization rule
    commission_rate: new Prisma.Decimal(0.1),
    commission_amount: new Prisma.Decimal(700.0),
    commission_date: new Date('2026-05-26'),
    period_week: 21,
    period_month: 5,
    period_year: 2026,
    service: {
      category: { name: 'Hair' },
    },
  },
];

/**
 * Mock Deduction Logs
 */
export const mockDeductionLogs = [
  {
    id: 1,
    staff_id: 1,
    payroll_period_id: null,
    type: DeductionType.cash_advance,
    amount: new Prisma.Decimal(500.0),
    notes: 'Advance for personal use',
    created_at: new Date('2026-05-25'),
  },
  {
    id: 2,
    staff_id: 2,
    payroll_period_id: null,
    type: DeductionType.uniform,
    amount: new Prisma.Decimal(200.0),
    notes: 'New uniform',
    created_at: new Date('2026-05-26'),
  },
];

/**
 * Mock Salary Structures
 */
export const mockSalaryComponents = [
  { id: 1, name: 'Health Insurance', type: SalaryComponentType.deduction },
  { id: 2, name: 'Performance Bonus', type: SalaryComponentType.earning },
];

export const mockSalaryStructures = [
  {
    id: 1,
    name: 'Standard Staff Structure',
    components: [
      {
        salary_component: { id: 1, name: 'Health Insurance', type: SalaryComponentType.deduction },
        amount: new Prisma.Decimal(100.0),
      },
      {
        salary_component: { id: 2, name: 'Performance Bonus', type: SalaryComponentType.earning },
        amount: new Prisma.Decimal(500.0),
      },
    ],
  },
];

export const mockSalaryAssignments = [
  {
    id: 1,
    staff_id: 1,
    salary_structure_id: 1,
    base_pay: new Prisma.Decimal(2500.0),
    effective_from: new Date('2026-01-01'),
    is_active: true,
    salary_structure: mockSalaryStructures[0],
  },
];

/**
 * Mock Attendance
 */
export const mockAttendance = [
  {
    id: 1,
    staff_id: 1,
    date: new Date('2026-05-25'),
    tardiness_minutes: 15,
    deduction_amount: new Prisma.Decimal(50.0),
  },
];

/**
 * Mock Payroll Period
 */
export const mockPayrollPeriod = {
  id: 1,
  start_date: new Date('2026-05-25'),
  end_date: new Date('2026-05-31'),
  total_salon_sales: new Prisma.Decimal(10000.0),
  is_locked: false,
};
