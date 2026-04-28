# Story Implementation: Manager Dashboard - Employee Advance (Deductions Ledger)

**Project:** NailssentialsQC Salon Management System
**Phase:** 5-V2 Implementation
**Epic:** 4 - Manager Control & Financial Compliance
**Date:** April 25, 2026
**Role:** Fullstack Developer

## 1. Overview
The owner's payroll formula strictly requires the ability to manually deduct "Cash Advances (CA), Loans, Reloans, and Uniforms" from a staff member's weekly Gross Pay. Currently, the Prisma database has a `DeductionLog` table, and the backend `payrollController.ts` correctly aggregates these logs. However, the Manager Dashboard lacks any User Interface to perform CRUD operations on these deductions.

This story implements the **Employee Advance (Deductions Ledger)** module within the new HRMS-style Manager Dashboard.

## 2. Requirements Addressed
*   **Manager Control:** Allow managers to log manual financial deductions against specific staff members.
*   **Payroll Accuracy:** Ensure manual deductions are recorded in the database so the automated weekly payroll generation calculates the correct Net Pay.
*   **Audit Trail:** Maintain a historical ledger of all deductions (who, how much, when, and why).

## 3. Implementation Steps

### Step 1: Backend API Routes & Controller (`backend/src/routes/staffRoutes.ts` & `backend/src/controllers/staffController.ts`)
*   **GET `/api/v1/staff/deductions`**: Fetch a list of all deduction logs. Should support filtering by `staff_id` and date ranges. Include the `StaffProfile` relation to display names.
*   **POST `/api/v1/staff/deductions`**: Create a new deduction.
    *   *Payload:* `staff_id` (Int), `amount` (Decimal), `type` (Enum/String: 'cash_advance', 'loan', 'uniform', 'penalty', 'other'), `notes` (String), `date` (Date).
    *   *Action:* Insert into the `DeductionLog` Prisma model.
*   **DELETE `/api/v1/staff/deductions/:id`**: Allow a manager to delete a deduction *only if* it hasn't been locked into a completed payroll period yet.

### Step 2: Frontend API Client (`frontend/src/api/apiClient.ts`)
*   Export new methods:
    *   `getDeductions(params?)`
    *   `createDeduction(data)`
    *   `deleteDeduction(id)`

### Step 3: Frontend UI Component (`frontend/src/pages/ManagerDashboard.tsx` or new `components/manager/DeductionsLedger.tsx`)
*   **The Layout:** Create a new tab or sidebar section named "Advances & Deductions".
*   **The Ledger Table:**
    *   Use Shadcn `<Table>`.
    *   Columns: Date, Staff Name, Type (Badge colored by type), Amount (₱), Notes, Actions.
*   **The "Add Deduction" Flow:**
    *   A prominent primary button "Log New Deduction".
    *   Opens a Shadcn `<Dialog>`.
    *   **Form Fields:**
        *   Staff Member: Shadcn `<Select>` populated with `active` staff members.
        *   Type: Shadcn `<Select>` ('Cash Advance', 'Loan', 'Uniform', 'Other').
        *   Amount: `<Input type="number" min="0" step="0.01">`
        *   Date: Shadcn Date Picker (defaults to today).
        *   Notes: `<Textarea>` for context (e.g., "Requested for emergency").
*   **Integration:** Upon form submission, call `createDeduction`, show a success toast, and refresh the ledger table.

## 4. Verification & QA
*   [x] Manager can successfully log a ₱500 Cash Advance for "Staff A".
*   [x] The ledger table immediately updates to show the new entry.
*   [x] Generating a payroll for that week correctly subtracts the ₱500 from "Staff A"'s Gross Pay.

**Status:** ✅ COMPLETED (April 27, 2026)