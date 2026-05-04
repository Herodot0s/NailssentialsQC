---
status: in-progress
---

# Quick Task: Fix Frontend Build Errors

The frontend build (`npm run build`) is failing with 53 TypeScript errors. This task involves fixing these errors to achieve a clean build.

## Errors Identified

1. **Unused Imports/Variables**: Multiple files have unused imports like `CardContent`, `useState`, `X`, `Lock`, etc.
2. **Type Casting Issues**: `parseFloat` is being called with `number` types instead of `string`.
3. **Type-Only Imports**: `verbatimModuleSyntax` requires `import type` for several types in `types.ts` and other files.
4. **Recharts Component Props**: `LineChart` and `Legend` click handlers have incompatible signatures.
5. **Shadcn UI Button `asChild`**: Some `Button` usages use `asChild` which is reported as not existing.
6. **Nullability/Optional Chaining**: Missing checks for possibly undefined/null objects (e.g., `appointment.technician`, `item.review`).
7. **Type Incompatibilities**: Mismatches between API types and local component types (e.g., `PayrollRecord`, `Service`, `Appointment`).

## Proposed Fixes

### 1. Unused Imports & Variables
- Remove unused imports in:
  - `src/components/dashboard/AttendanceLedger.tsx`
  - `src/components/dashboard/ReviewModeration.tsx`
  - `src/components/dashboard/StaffTable.tsx`
  - `src/components/Navbar.tsx`
  - `src/pages/ManagerDashboard.tsx`
  - `src/pages/CustomerAppointments.tsx` (unused `SubmitReviewRequest`)

### 2. Type Casting (`parseFloat`)
- Ensure `parseFloat` only receives strings. If the value is already a number, remove `parseFloat`.
- Affected files:
  - `src/components/dashboard/AttendanceLedger.tsx`
  - `src/components/dashboard/PayrollTable.tsx`
  - `src/pages/StaffDashboard.tsx`

### 3. Type-Only Imports
- Update `src/components/dashboard/types.ts` to use `import type` where required.

### 4. Recharts & Chart Issues
- Fix `src/components/DrillDownLineChart.tsx`:
  - Handle undefined values for `entry[cat]` and `entry[svc]`.
  - Fix `handleChartClick` and `handleLegendClick` signatures to match Recharts expectations.

### 5. Button `asChild` & Link issues
- Investigate `src/pages/Booking.tsx` and `src/pages/CustomerAppointments.tsx`. If `asChild` is needed, ensure the `Button` component supports it (check `src/components/ui/button.tsx`).

### 6. ReceiptModal & Appointment Types
- Fix `src/components/ReceiptModal.tsx`:
  - Type mismatch in `reduce` function.
  - Optional chaining for `appointment.technician`.
  - Missing `price` property on `service`.
- Fix `src/pages/CustomerAppointments.tsx`:
  - Ensure `appointment` passed to `ReceiptModal` has `services`.

### 7. API and Form Types
- Fix `src/pages/Login.tsx` and `src/pages/Register.tsx`: Cast `handleSubmit` callback or adjust types to match `FieldValues`.
- Fix `src/pages/ManageServices.tsx`: Convert `price` to `number` where expected by API. Add missing `duration`.
- Fix `src/pages/ManagerDashboard.tsx`: Fix `CreateStaffRequest` type mismatch (`basePayPerWeek` string vs number).

### 8. Dropdown Menu UI Fixes
- Fix `src/components/ui/dropdown-menu.tsx` which seems to have multiple TS errors related to `@base-ui/react`.

## Tasks

- [ ] Fix Unused Imports and Variables
- [ ] Fix Type Casting and parseFloat issues
- [ ] Fix Type-Only Imports
- [ ] Fix Recharts and Chart issues
- [ ] Fix Button `asChild` and Link issues
- [ ] Fix ReceiptModal and Appointment type issues
- [ ] Fix API, Form, and Dashboard type issues
- [ ] Fix Dropdown Menu UI issues
- [ ] Verify build with `npm run build`
