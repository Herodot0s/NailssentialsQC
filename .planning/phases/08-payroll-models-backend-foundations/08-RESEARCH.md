# Phase 8 Research: Payroll Models & Backend Foundations

## Domain Knowledge & Context
The goal of this phase is to extend the database schema and backend foundations to support a more manual, simplified payroll system. This shifts away from the previously planned complex `SalaryStructure` towards direct configurations on the `StaffProfile` and manual triggers.

### Key Requirements
- **PAY-01:** Manager can edit the dynamic base commission rate and commission tiers for staff.
- **PAY-02:** System calculates weekly payout periods.
- **PAY-04:** Manager can input and track categorized deductions (Cash Advance, Loan, Uniform, Reloan, Lates/Early Out) for each staff member per payroll period.

### Technical Approach & Schema Changes

1. **StaffProfile Adjustments (D-01)**
   - **Current State:** `StaffProfile` has `base_pay_per_week` but lacks commission configuration.
   - **Required Changes:**
     - Add `base_commission_rate Decimal @default(0.10) @db.Decimal(5, 2)` to `StaffProfile`.
     - Add `commission_tier Int?` (or `String?` depending on how the frontend handles it, e.g., Tier 1, Tier 2) to `StaffProfile`.
   - **Impact:** We ignore `SalaryStructure` models and use these fields directly. This requires updating the `staffController.ts` (or wherever staff updates are handled) to allow managers to modify these fields via API.

2. **Deduction Tracking (D-02, PAY-04)**
   - **Current State:** `DeductionLog` model exists with `type String`, `amount Decimal`, `notes String?`, and a relation to `payroll_period_id`.
   - **Required Changes:**
     - Create an enum `DeductionType` (e.g., `cash_advance`, `loan`, `uniform`, `reloan`, `lates_early_out`, `other`) and update `DeductionLog.type` to use this enum, OR enforce validation at the controller level to restrict `type` to the allowed categories. Enum is safer for data integrity.
     - Ensure the API has endpoints for managers to create, read, update, and delete `DeductionLog` entries for a specific payroll period.

3. **Payroll Period Generation (D-03)**
   - **Current State:** `PayrollPeriod` model exists with `start_date`, `end_date`, `is_locked`.
   - **Required Changes:**
     - Instead of an automated cron job, create a new endpoint (e.g., `POST /api/v1/payroll/periods/generate`) that the manager can manually trigger.
     - Logic: Find the most recent `PayrollPeriod`. If one exists, the new period's `start_date` is the day after the latest `end_date`, and the `end_date` is `start_date + 6 days` (to make a 7-day weekly period). If none exists, accept a start date from the request and generate the 7-day period.

### Validation Architecture (Nyquist)
- **Schema Validation:** Prisma migrations must successfully run.
- **API Validation:** 
  - Ensure manager can update a staff's `base_commission_rate` and `commission_tier`.
  - Ensure manager can create a `DeductionLog` with the specific categories.
  - Ensure manager can trigger the next `PayrollPeriod` generation and verify dates are exactly 7 days apart.

## What the Planner Needs to Know
1. **Database Mod:** Instruct Prisma schema modifications for `StaffProfile` (`base_commission_rate`, `commission_tier`) and `DeductionLog` (restrict/categorize `type`).
2. **Push Command:** A database schema push (`npx prisma db push`) will be required.
3. **API Updates:**
   - Extend the staff update endpoint to accept the new fields.
   - Ensure the deduction log endpoints (CRUD) are implemented/updated.
   - Implement the manual "Generate Next Period" endpoint.
4. **Safety:** Ensure role-based access control (RBAC) restricts these payroll operations to Managers only.
