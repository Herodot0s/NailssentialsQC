# Phase 6: Missing Features - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 delivers critical missing features for compliance and operations: a system audit trail for sensitive operations, Excel-based payroll data export, and a configurable database-driven sales target.

**In scope:**
- FEAT-01: Add audit trail (SystemLog entries) for all sensitive operations (payroll, staff updates, commission changes)
- FEAT-02: Add data export/backup endpoint (Excel for payroll data)
- FEAT-03: Make sales target configurable via database (remove hardcoded 8000)

**Out of scope:**
- Audit trail UI (viewing logs is for a future phase/direct DB access for now)
- Frontend UI for changing global settings (manager can use direct DB or a future phase)
- Export formats other than Excel (XLSX)
- CSV export
</domain>

<decisions>
## Implementation Decisions

### Audit Trail (FEAT-01)
- **D-01: Scope of Operations**: Log the following sensitive operations only:
  - Payroll: `generatePayroll`, `lockPayroll`, `addDeduction`
  - Staff: `createStaff`, `updateStaff`, `updateStaffSchedule`
  - Commissions: `completeAppointment` (creation of commission records)
- **D-02: Detail Level**: "Action Only" logging. The `details` field in `SystemLog` should capture a human-readable summary (e.g., `{"message": "Manager updated staff profile for ID 5"}`) and the relevant entity ID. No full "diff" (old vs new values) is required.
- **D-03: IP/User Agent**: Capture IP address and User Agent in `SystemLog` where available (via middleware or req object).

### Payroll Export (FEAT-02)
- **D-04: Format**: Excel (XLSX) only. Use the `exceljs` library.
- **D-05: Required Fields**: Each row in the payroll export must include:
  - Staff Full Name
  - Payroll Period (Start Date - End Date)
  - Base Pay
  - Commissions
  - Deductions
  - Net Pay
  - TIN (Tax Identification Number)
  - SSS (Social Security System number)
- **D-06: Delivery**: A dedicated GET endpoint `backend/api/payroll/export/:id` that returns the XLSX file as a buffer with appropriate headers for download.

### Sales Target Configuration (FEAT-03)
- **D-07: Storage**: Database-driven.
  - Create a new `SystemSettings` table (Key-Value pair or single row) for `global_sales_target`.
  - Add a `sales_target` Decimal field to the `PayrollPeriod` model in `schema.prisma`.
- **D-08: Logic**: "Global Default + Override".
  - The Daily Sales Stats dashboard pulls the target from the currently active (unlocked) `PayrollPeriod` if one exists and has a `sales_target` set.
  - Otherwise, it falls back to the `global_sales_target` from `SystemSettings`.
  - Initial `global_sales_target` should be seeded as `8000.00`.
- **D-09: Fallback**: If no DB entry exists, default to `8000.00` in code as a safety measure.

### Claude's Discretion
- For FEAT-01: Create a utility helper `logSystemAction(userId, action, entityType, entityId, details, req)` to standardize logging across controllers.
- For FEAT-02: Column widths in Excel should be auto-sized or reasonably fixed for readability.
- For FEAT-03: Use a Prisma migration to add the `SystemSettings` table and the `PayrollPeriod.sales_target` field.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase-Specific Files
- `backend/prisma/schema.prisma` — Existing `SystemLog` model; need to add `SystemSettings` and update `PayrollPeriod`
- `backend/src/controllers/reportController.ts` — Remove hardcoded 8000 target; update to use DB source
- `backend/src/controllers/payrollController.ts` — Add export endpoint; add audit logging to generate/lock/deduction
- `backend/src/controllers/staffController.ts` — Add audit logging to create/update staff
- `backend/src/controllers/appointmentCompletion.ts` — Add audit logging to commission creation

### Project-Level Docs
- `.planning/PROJECT.md` — Core value: reliable, bug-free salon system; security constraints
- `.planning/ROADMAP.md` — Phase 6 goals and success criteria
- `.planning/STATE.md` — Current position: Phase 6 ready for planning

### Prior Phase Decisions
- `.planning/phases/04-api-improvements/04-CONTEXT.md` — D-03: Standardized error response format; D-04: `getCurrentUser` helper
- `.planning/phases/05-performance-optimization/05-CONTEXT.md` — D-04: Log failures with `console.error`; Prisma transaction patterns
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **SystemLog Model**: Already exists with `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `user_agent`.
- **apiHelpers.ts**: `sendSuccess` and `sendError` helpers for the new export endpoint.
- **Prisma Transactions**: Already used in `appointmentCompletion.ts` and `payrollController.ts` — ensure audit logs are part of transactions where atomicity matters.

### Established Patterns
- **Standardized Error Handling**: `try/catch` + `console.error` + `sendError`.
- **Auth Middleware**: `req.user.sub` for the current user ID to record in logs.
- **Decimal Type**: Use `Decimal` from `@prisma/client` for money/targets to maintain precision.

### Integration Points
- **Audit Helper**: Needs access to `req` for IP/User-Agent extraction.
- **Export Endpoint**: Should be restricted to `manager` role via `authorizeRoles('manager')`.
</code_context>

<specifics>
## Specific Ideas

- **SystemSettings Seeding**: Include a seed script or initial migration step to set the `global_sales_target` to `8000`.
- **Excel Formatting**: Header row should be bold with a background color. Number columns (Pay, TIN, SSS) should be formatted correctly (currency for pay, text for IDs).
- **Log Messages**:
  - `PAYROLL_GENERATED`: "Generated payroll for period [ID]"
  - `STAFF_UPDATED`: "Updated profile for staff member [Name]"
  - `COMMISSIONS_CREATED`: "Calculated commissions for appointment [ID]"
</specifics>

<deferred>
## Deferred Ideas

- **Audit Trail UI**: A manager-only view to browse system logs.
- **Settings UI**: A page for managers to update the global sales target.
- **Other Export Formats**: PDF or CSV for payroll records.
</deferred>

---

*Phase: 6-Missing Features*
*Context gathered: 2026-05-04*
