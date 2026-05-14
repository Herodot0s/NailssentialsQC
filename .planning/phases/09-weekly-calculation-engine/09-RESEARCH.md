# Phase 09: Weekly Calculation Engine - Research

## Technical Domain
The goal of this phase is to implement the backend calculation logic for weekly payroll. This engine must read from transactions/commissions and daily attendance/deductions to determine gross pay, net pay, and daily sales performance snapshots for each staff member, mirroring a manual spreadsheet process.

## Schema Implications
- **StaffPayroll Model**: According to Context D-01 and D-02, a JSON snapshot of the daily performance breakdown must be stored directly in the `StaffPayroll` model. 
  - Current state in `schema.prisma`: The `StaffPayroll` model lacks a `daily_breakdown` field.
  - Action: Add `daily_breakdown Json?` to `StaffPayroll`.
- **Commission Rate Logic**: D-05 and D-06 dictate commission calculations based on `base_commission_rate` and `commission_tier` located on the `StaffProfile`. If a custom tier exists but no rate, fallback to 8%. Rate changes apply to the whole period.

## Workflow Integration (Regeneration)
- **Wipe and Regenerate (D-03/D-04)**: When generating a period that already exists, the system must clean out the old `StaffPayroll` records but preserve existing `DeductionLog` records created during that period so manual inputs are not lost. 
- Existing transactions (`Commission` records) within the week boundaries will be re-aggregated.

## File Modifications
- `backend/prisma/schema.prisma`: Add JSON field.
- `backend/src/services/payrollService.ts` (or equivalent controller): Implement `generateWeeklyPayroll` logic.
- `backend/src/controllers/payrollController.ts`: Connect API endpoints for payroll generation with regeneration support.

## Validation Architecture
- Unit tests or UAT scripts must ensure that:
  - Generating twice does not duplicate records.
  - Generating twice does not delete manual deductions.
  - Daily breakdowns reflect exact aggregate sales per day.
  - 8% vs 20% commission tier yields correct commission totals.
