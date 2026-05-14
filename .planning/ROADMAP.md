# Roadmap: NailssentialsQC

## Milestone v2.1: Advanced Payroll & Export System

### Phase 8: Payroll Models & Backend Foundations [Complete]
**Goal:** Extend the database schema to support categorized deductions, weekly periods, and dynamic base commissions.
**Requirements:** PAY-01, PAY-02, PAY-04
**Success Criteria:**
1. Database schema includes specific fields for Cash Advance, Loan, Uniform, Reloan, Lates/Early Out.
2. Manager can update the base commission rates via API.
3. System can correctly define and store a weekly payroll period boundary.

### Phase 9: Weekly Calculation Engine
**Goal:** Implement the logic to accurately calculate the payroll matching the exact spreadsheet behavior.
**Requirements:** PAY-03
**Success Criteria:**
1. System correctly aggregates daily performance per staff member.
2. System computes gross pay, subtracts categorized deductions, and yields the precise net pay.
3. Support for 8% and 20% commission tier calculations.

### Phase 10: Manager Payroll UI & Excel Export
**Goal:** Build the interface for managers to finalize payroll and download the comprehensive Excel report.
**Requirements:** PAY-01, PAY-04, PAY-06
**Success Criteria:**
1. Manager can input and edit deductions and commissions directly from the dashboard.
2. Manager can click "Export Excel" to download a spreadsheet mirroring the requested layout.
3. Excel export correctly maps the dynamic columns (dates) and rows (staff metrics).

### Phase 11: Staff Payslip UI & PDF Generation
**Goal:** Enable staff to view their weekly breakdown and download a PDF payslip.
**Requirements:** PAY-05
**Success Criteria:**
1. Staff dashboard includes a "Download Payslip" button for past weekly periods.
2. The generated PDF correctly formats earnings, base pay, commissions, and deductions.
3. Staff can only access their own payslips.