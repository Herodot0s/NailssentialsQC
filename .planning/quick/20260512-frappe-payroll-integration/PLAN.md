---
status: in-progress
title: Frappe-style Payroll Mechanism Integration
description: Adapt the sophisticated payroll mechanism from Frappe HRMS to the NailssentialsQC system, replacing hardcoded logic with a flexible, component-based structure.
---

# Plan: Frappe-style Payroll Integration

## 1. Schema Expansion
- [ ] Define `SalaryComponent` model: `name`, `type` (EARNING, DEDUCTION), `description`.
- [ ] Define `SalaryStructure` model: `name`, `is_active`.
- [ ] Define `SalaryStructureComponent` model: Links `SalaryStructure` and `SalaryComponent` with `amount` or `formula`.
- [ ] Define `SalaryStructureAssignment` model: Links `StaffProfile` to `SalaryStructure` with `base_pay_per_period` and `effective_from`.
- [ ] Refactor `StaffPayroll` to include a JSON `breakdown` or a separate `StaffPayrollItem` model for itemized earnings/deductions.

## 2. Backend Logic (Node.js/Prisma)
- [ ] Implement CRUD for `SalaryComponent` and `SalaryStructure`.
- [ ] Implement `SalaryStructureAssignment` logic.
- [ ] Refactor `payrollController.generatePayroll`:
    - [ ] Fetch active assignment for each staff.
    - [ ] Calculate each component based on assignment and structure.
    - [ ] Support dynamic calculation of Commissions and Attendance (Tardiness) as components.
    - [ ] Implement a simple formula evaluator (e.g., `base * 0.1` for 10% of base pay).

## 3. Frontend Implementation (React/Tailwind)
- [ ] Create `PayrollSettings` view for Managers to define Components and Structures.
- [ ] Update `StaffProfile` view to handle Salary Structure Assignments.
- [ ] Update `GeneratePayroll` dialog to reflect the new flexible mechanism.
- [ ] Update Payroll Details view to show the itemized breakdown (Earnings/Deductions).

## 4. Verification
- [ ] Verify that old payroll records still work (migration or compatibility layer).
- [ ] Test generation with various components and formulas.
- [ ] Verify net pay calculation accuracy.
