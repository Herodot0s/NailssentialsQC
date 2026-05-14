# Phase 8: Payroll Models & Backend Foundations - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the database schema and backend logic to support categorized deductions (Cash Advance, Loan, Uniform, Reloan, Lates/Early Out), weekly periods, and dynamic base commissions.

</domain>

<decisions>
## Implementation Decisions

### Commission Rate Storage
- **D-01:** Add simple `base_commission_rate` and `commission_tier` fields directly to the `StaffProfile` table to allow managers to easily override defaults, ignoring the complex `SalaryStructure` system for this requirement.

### Deduction Tracking
- **D-02:** Track deductions via simple manual input per payroll period without tracking long-term running balances (e.g., no `LoanBalance` model). The existing `DeductionLog` or adding specific deduction columns will suffice.

### Payroll Period Creation
- **D-03:** Managers will manually generate the weekly payroll period by clicking a "Generate Next Period" action, rather than using an automated cron job.

### the agent's Discretion
None

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/ROADMAP.md` — Phase 8 goal and constraints
- `.planning/REQUIREMENTS.md` — PAY-01, PAY-02, PAY-04

### Existing Models and Integrations
- `backend/prisma/schema.prisma` — Current schema definitions including `StaffProfile`, `DeductionLog`, and `PayrollPeriod`
- `.planning/codebase/STACK.md` — Tech stack constraints
- `.planning/codebase/ARCHITECTURE.md` — Backend architecture patterns
- `.planning/codebase/INTEGRATIONS.md` — Integration context

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StaffProfile` model: Already contains `base_pay_per_week` which serves as a precedent for adding new simple configuration fields.
- `DeductionLog` model: Already has a `type` string field that can be utilized.

### Established Patterns
- Prisma schema migrations are required for model changes.
- Express controllers manage business logic, adhering to role-based access for manager-only operations.

### Integration Points
- Any changes to `StaffProfile` or `PayrollPeriod` will impact `/api/v1/payroll/generate` controller flow and Staff Dashboard API responses.

</code_context>

<specifics>
## Specific Ideas

Keep it simple and manual: user explicitly preferred manual override capabilities and manual triggering rather than automated background processing.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 8-Payroll Models & Backend Foundations*
*Context gathered: 2026-05-14*
