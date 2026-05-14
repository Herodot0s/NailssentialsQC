# Payroll System Alignment Discussion

## 1. Current System vs. Sample Table
The requested sample table computes payroll based on **daily revenue** within a specific week (Feb 1 - Feb 7).
- **Sample Computation:**
  - Sum of daily sales = Total Commissionable Amount
  - Applies 8% (or 20% for specific staff) to get Commission Pay.
  - Adds Basic Pay to get Gross Pay.
  - Deducts CA, Loan, Uniform, Reloan, Lates/Early Out.
  - Results in Net Pay.

- **Current System (`payrollController.ts`):**
  - Our system relies on pre-calculated `Commission` records generated when appointments are completed.
  - It also has a legacy fallback that takes the *previous month's total commission* and divides it by 4 to get a weekly rate. 
  - The system has flexible `SalaryStructureAssignment` which can calculate commissions, but it currently evaluates based on `total_sales` (Salon's total sales) or a hardcoded `commissions` context variable.
  - Deductions are supported but not categorized distinctly in the Excel export (currently lumped into one "Deductions" column).

## 2. Identified Gaps & Gray Areas
1. **Commission Source:** Should the system continue dividing last month's commission by 4, or should it calculate the 8% / 20% commission on the *actual daily sales* achieved by the staff during the payroll period?
2. **Deduction Categories:** The current `exportPayrollExcel` only has one "Deductions" column. We need to expand this to `CA`, `Loan`, `Uniform`, `Reloan`, and `Lates/Early Out`.
3. **Daily Breakdown:** The Excel export needs to show daily columns (e.g., Feb 1, Feb 2...) transposed or as distinct columns for each staff.
4. **Detailed Payslip UI:** We need an API endpoint to fetch the daily breakdown so the frontend can render a "Document Generator" style detailed payslip.

## 3. Implementation Plan
1. **Backend Adjustments (`payrollController.ts`):**
   - **Daily Data:** For the Excel export and detailed payslip, we will fetch daily transaction sums (or daily commissionable sales) for each staff within the payroll period.
   - **Dynamic Export:** Modify `exportPayrollExcel` to use `ExcelJS` to dynamically generate daily columns based on the days in the payroll period, mimicking the sample table structure.
   - **Categorized Deductions:** Fetch and map specific deduction types (`CA`, `Loan`, `Uniform`, `Reloan`) to separate columns in the Excel.
   - **Payslip Details API:** Extend `getPayrollDetails` or `getMyPayroll` to return a `dailyBreakdown` and categorized `deductionsBreakdown` so the frontend can build the detailed payslip.
2. **Frontend Adjustments:**
   - Create a `DetailedPayslip` UI component (likely extending `StaffDetailSheet.tsx` or `StaffDashboard.tsx` or a new `PayslipDocument` component) that renders the detailed breakdown per week.
