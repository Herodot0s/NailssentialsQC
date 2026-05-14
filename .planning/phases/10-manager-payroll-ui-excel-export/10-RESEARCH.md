# Phase 10: Manager Payroll UI & Excel Export - Research

**Objective:** Investigate technical implementation details for Excel transposition, sidebar integration, and draft/locked state management.

## 1. ExcelJS Transposition Logic
The requirement is "Staff are Rows" and "Dates are Columns".

### Implementation Strategy:
1.  **Data Fetching:** Fetch all `StaffPayroll` records for a given `PayrollPeriod`.
2.  **Date Range:** Determine the `start_date` and `end_date` from the `PayrollPeriod`.
3.  **Column Generation:**
    - Column A: Staff Name
    - Columns B to (N+1): Individual dates in the period (e.g., Feb 1, Feb 2, ...).
    - Summary Columns: Total Sales, Commission, Basic Pay, Gross Pay, Deductions (Categorized), Net Pay.
4.  **Row Generation:**
    - For each staff member, iterate through the days in the period.
    - Extract daily sales/commissions from the `daily_breakdown` JSON field in `StaffPayroll`.
    - Map categorized deductions from `DeductionLog` or `StaffPayrollItem`.

### Transposition Code Snippet (Conceptual):
```typescript
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Payroll');

// Header Row
const dateHeaders = getDatesInRange(period.start_date, period.end_date);
const headers = ['Staff Name', ...dateHeaders, 'Total Sales', 'Commission', ...deductionTypes, 'Net Pay'];
worksheet.addRow(headers);

// Staff Rows
payrolls.forEach(payroll => {
  const rowData = [
    payroll.staff.full_name,
    ...dateHeaders.map(date => payroll.daily_breakdown[date]?.sales || 0),
    payroll.total_sales,
    payroll.commissions,
    ...deductionTypes.map(type => payroll.deductions_breakdown[type] || 0),
    payroll.net_pay
  ];
  worksheet.addRow(rowData);
});
```

## 2. Draft vs Locked Export (Watermark)
ExcelJS doesn't support a "true" semi-transparent watermark easily in all viewers, but we can:
1.  **Header Text:** Add "DRAFT - NOT FINALIZED" in a large, red, bold font in the top rows.
2.  **Cell Backgrounds:** Lightly shade all data cells in a light red/yellow to indicate draft status.
3.  **File Name:** Prefix the filename with `[DRAFT]`.

## 3. Manager UI Integration
### Sidebar:
- Update `frontend/src/components/layout/ManagerSidebar.tsx`.
- Add "Payroll" under "Personnel".
- Icon: `BanknotesIcon` or `DocumentTextIcon`.

### Payroll Views:
1.  **PayrollList:** Table showing all `PayrollPeriod` records with status (Draft/Locked) and actions.
2.  **PayrollDetail:**
    - Summary table of staff.
    - Detail Sheet (slide-over or modal) for individual staff adjustments.
    - "Add Deduction" contextual button.
    - "Pull Unlinked Deductions" action: Fetches `DeductionLog` entries where `payroll_period_id` is null and `staff_id` matches.

## 4. Recalculation Flow
When a deduction is added/edited:
1.  API call to `POST /api/payroll/deductions` or `PATCH /api/payroll/:id`.
2.  Backend updates `DeductionLog`.
3.  Backend calls `generatePayroll(periodId)` for the specific staff or entire period to refresh `StaffPayroll` snapshots.
4.  Frontend refreshes the detail view.

## 5. Security & RBAC
- All endpoints must verify `user.role === 'manager'`.
- Deductions can only be added to `Draft` periods.
- Once a period is `Locked`, the "Finalize" button is disabled and edits are restricted.

## 6. Project Skills & Patterns
- Check `.agent/skills/gsd-ui-phase` for UI specs if needed.
- Use existing `apiClient` patterns.
- Follow the "transposed" spreadsheet requirement strictly as it matches the legacy manual process.

## 7. Validation Strategy (Nyquist)
- **Dimension 1 (Logic):** Verify transposition logic with multiple staff and varying date ranges.
- **Dimension 4 (State):** Verify locking prevents further modifications.
- **Dimension 8 (Validation):**
    - Unit test for Excel column mapping.
    - Integration test for "Finalize & Lock" workflow.
