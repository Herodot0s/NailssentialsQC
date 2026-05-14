# Phase 10: Manager Payroll UI & Excel Export - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the interface for managers to finalize payroll and download the comprehensive Excel report, including a transposed spreadsheet layout and integrated deduction management.

</domain>

<decisions>
## Implementation Decisions

### Excel Report Layout
- **D-01:** Implement a "Transposed" layout where **Staff are Rows** and **Dates are Columns**.
- **D-02:** Include summary blocks for each row: Total Sales, Commission Pay, Basic Pay, Gross Pay, Categorized Deductions (CA, Loan, Uniform, Reloan, Lates/Early Out), Total Deductions, and Net Pay.
- **D-03:** "Export Excel" functionality will be available for both **Draft** and **Locked** payrolls. Draft exports will include a clear header/watermark indicating the non-finalized status.

### Manager Finalization Workflow
- **D-04:** Managers review draft payrolls via a summary table. Clicking a staff member opens a detail sheet for adjustments.
- **D-05:** Any adjustment to manual deductions triggers an immediate recalculation of the staff's Net Pay.
- **D-06:** A manual "Finalize & Lock" action will lock the period (`is_locked: true`), preventing further edits.

### Deduction Management UI
- **D-07:** Contextual "Add Deduction" inside a Payroll detail view will automatically link the deduction to that active period.
- **D-08:** A separate "Deductions Ledger" tab will exist for global entry. Deductions added here remain **unlinked** until the manager manually assigns them to a period.

### UI Navigation & Placement
- **D-09:** Add "Payroll" as a new item under the **Personnel** sidebar group.
- **D-10:** The "Generate Next Period" action will be located inside the Payroll List View rather than as a global quick action.

### the agent's Discretion
- The agent will decide the specific visual styling of the "Draft" watermark on the Excel export.
- The agent will determine the most efficient way to handle the "Pull Unlinked Deductions" UI within the payroll detail view.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 10 goals and success criteria
- `.planning/REQUIREMENTS.md` — PAY-01, PAY-04, PAY-06

### Prior Context (Locked Decisions)
- `.planning/phases/08-payroll-models-backend-foundations/08-CONTEXT.md` — Base rates and period generation decisions
- `.planning/phases/09-weekly-calculation-engine/09-CONTEXT.md` — JSON snapshot and regeneration logic decisions

### Technical Foundation
- `backend/prisma/schema.prisma` — Schema for `StaffPayroll`, `PayrollPeriod`, and `DeductionLog`
- `backend/src/controllers/payrollController.ts` — Existing logic for `generatePayroll` and `exportPayrollExcel`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExcelJS` integration in `payrollController.ts`: Already handles basic workbook creation and streaming to response.
- `ManagerSidebar.tsx`: Established pattern for adding new navigation items and groups.
- `StaffDetailSheet.tsx`: Can be adapted or used as a pattern for the payroll adjustment detail view.

### Established Patterns
- **Recalculation:** The `generatePayroll` controller already supports "wipe and regenerate" which can be triggered after manual adjustments.
- **Role-Based Access:** All payroll management routes are protected by `authorizeRoles('manager')`.

### Integration Points
- `ManagerDashboard.tsx`: Needs to handle the new `payroll` active view.
- `frontend/src/api/apiClient.ts`: Has endpoints for locking payroll and adding deductions.

</code_context>

<specifics>
## Specific Ideas

- The Excel transposition is critical: "staff as rows, dates as columns" to match the manager's preferred manual workflow.
- Ensure the "Deduction Type" mapping in Excel is exact (CA, Loan, Uniform, Reloan, Lates/Early Out).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-Manager Payroll UI & Excel Export*
*Context gathered: 2026-05-14*
