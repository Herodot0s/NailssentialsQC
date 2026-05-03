# Phase 6: Missing Features - Discussion Log

**Date:** 2026-05-04
**Participants:** User (Founder), Gemini CLI (Builder)

## Discussion Points

### 1. Audit Trail Scope & Detail (FEAT-01)
- **Question:** What level of detail should we capture in the 'details' field of SystemLog?
- **Options:** Action Only / Full Diff (Old vs New)
- **User Selection:** **Action Only**
- **Notes:** Decided to keep logs clean and lightweight. No need for complex diffing logic. Scope is limited to Payroll, Staff, and Commissions.

### 2. Payroll Export Format (FEAT-02)
- **Question:** Which format should the payroll export support?
- **Options:** CSV Only / Excel (XLSX) Only / Both
- **User Selection:** **Excel (XLSX) Only**
- **Notes:** User specifically requested TIN and SSS fields be included in the export. Excel was preferred over CSV for manager use.

### 3. Sales Target Configuration (FEAT-03)
- **Question:** Where should the sales target be stored?
- **Options:** Environment Variable / Database (Settings table)
- **User Selection:** **Database (Settings table)**
- **Notes:** User wants a "Global Default + Override" model where targets can also be set per payroll period.

## Decisions Locked

1. **Audit Scope**: Log `generatePayroll`, `lockPayroll`, `addDeduction`, `createStaff`, `updateStaff`, `updateStaffSchedule`, and commission creation.
2. **Log Detail**: Human-readable message and entity ID only. Capture IP/UA.
3. **Export Format**: Excel (XLSX) using `exceljs`.
4. **Export Fields**: Name, Period, Base Pay, Commissions, Deductions, Net Pay, TIN, SSS.
5. **Target Storage**: New `SystemSettings` table for global; new field on `PayrollPeriod` for overrides.
6. **Dashboard Logic**: Active period override > Global default > Code fallback (8000).

## Deferred Ideas
- Audit Trail UI
- Settings Management UI
- PDF/CSV Export formats

---

*Log generated for Phase 6 Context Capture*
