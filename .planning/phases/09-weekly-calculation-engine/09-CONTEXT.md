# Phase 9: Weekly Calculation Engine - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the logic to accurately calculate the payroll matching the exact spreadsheet behavior, including daily aggregation, gross pay, deductions, and accurate net pay computation.

</domain>

<decisions>
## Implementation Decisions

### Daily Breakdown Storage
- **D-01:** Store the daily performance breakdown as a JSON Snapshot directly in the DB (`StaffPayroll` table) when generating the period to lock the historical state.
- **D-02:** The granularity of the daily JSON snapshot will be "Total daily sales only", matching the spreadsheet perfectly.

### Regeneration Workflow
- **D-03:** When a draft needs corrections, the system will use a "Wipe and Regenerate" action to recalculate everything cleanly and ensure math accuracy.
- **D-04:** During regeneration, any manual deductions (like Cash Advance or Uniforms) entered for that draft must be preserved (detached and re-attached) so the manager doesn't lose manual inputs.

### Commission Rate Precedence
- **D-05:** If a staff member has a "Custom" tier but no explicit rate, default to an 8% commission rate as a safe fallback.
- **D-06:** Rate changes mid-week are applied to the entire weekly period based on the current rate at generation time, giving managers the power to override via `base_commission_rate`.

### the agent's Discretion
- The agent decided to use JSON Snapshot in DB for storage stability.
- The agent decided to Preserve manual deductions on regeneration for better UX.
- The agent decided to apply new commission rates to the entire week for simpler computation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/ROADMAP.md` — Phase 9 goal and criteria
- `.planning/REQUIREMENTS.md` — PAY-03

### Database & Structure
- `backend/prisma/schema.prisma` — Current schema definitions including `StaffProfile`, `DeductionLog`, and `StaffPayroll`

### Tech Stack & Architecture
- `.planning/codebase/STACK.md` — Tech stack constraints
- `.planning/codebase/ARCHITECTURE.md` — Backend architecture patterns
- `.planning/codebase/INTEGRATIONS.md` — Integration context

### Relevant Implementations
- `backend/src/controllers/payrollController.ts` — Existing payroll logic and export behaviors

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `exportPayrollExcel` in `payrollController.ts`: Already contains logic for aggregating daily sales dynamically from `Commission` records, which can be adapted for the JSON snapshot.

### Established Patterns
- Prisma transactions: Used extensively in appointment and payroll logic, essential for safely wiping and regenerating a period.

### Integration Points
- `generatePayroll` endpoint: Needs to handle the new JSON snapshot logic and the regeneration behavior.

</code_context>

<specifics>
## Specific Ideas

- The JSON snapshot should strictly include "Total daily sales only" to match the manager's master spreadsheet format perfectly.
- "Give the manager the power to give custom commission rate" — explicitly respect `base_commission_rate` for the entire period.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-Weekly Calculation Engine*
*Context gathered: 2026-05-14*
