# Phase 11: Staff Payslip UI & PDF Generation - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable staff to view their itemized weekly payroll breakdown and download a professional PDF payslip directly from their dashboard.

</domain>

<decisions>
## Implementation Decisions

### PDF Generation Strategy
- **D-01:** Perform **client-side generation** using `jspdf` and `html2canvas`.
- **D-02:** Use a hidden "Payslip Template" component in the React tree to render the document before capturing it for PDF conversion.

### Content & Layout
- **D-03:** Include a **Daily Breakdown** section showing sales/commissions for each day of the week (sourced from `StaffPayroll.daily_breakdown`).
- **D-04:** Provide itemized lists for **Categorized Deductions** (CA, Loan, Uniform, etc.) to ensure full transparency.
- **D-05:** Branding: Include the salon logo and contact information (retrieved via `getCmsSettings`) in the header.

### UI Integration
- **D-06:** Add a "View Details" button to the existing Payroll History table in the `StaffDashboard`.
- **D-07:** Clicking "View Details" opens a modal displaying the full itemized breakdown (the "preview").
- **D-08:** The modal includes a prominent "Download PDF" button that triggers the export.
- **D-09:** Success state: Toast notification when PDF generation starts and completes.

### Security & Access
- **D-10:** Frontend-only enforcement: Only render the details/download button for the logged-in staff's own records (existing `StaffDashboard` pattern).
- **D-11:** Backend-only enforcement: Ensure the `GET /api/payroll/staff/:id` endpoint validates that the requester matches the `:id` or is a manager.

</decisions>

<verification>
## Success Criteria (from ROADMAP.md)
1. Staff dashboard includes a "Download Payslip" button for past weekly periods.
2. The generated PDF correctly formats earnings, base pay, commissions, and deductions.
3. Staff can only access their own payslips.

## Verification Requirements
- [ ] PDF contains Salon Logo and contact info.
- [ ] PDF contains daily sales breakdown.
- [ ] PDF contains itemized deductions.
- [ ] Modal preview matches the data shown in the final PDF.
- [ ] Cross-account access to payslips is blocked at the API level.
</verification>
