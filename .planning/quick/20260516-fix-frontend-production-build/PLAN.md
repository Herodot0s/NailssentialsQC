---
task: fix-frontend-production-build
status: in-progress
date: 2026-05-16
---

# Plan: Fix Frontend Production Build Errors

Resolve 111+ TypeScript errors in the frontend to enable `npm run build` and production deployment.

## Problem Analysis
The frontend fails to build due to:
1. **Button Component**: Missing `asChild` / `Slot` implementation causing `asChild` property errors.
2. **Type Mismatches**: `string` vs `number` in forms and API calls (e.g., `basePayPerWeek`, `price`).
3. **Unused Imports/Variables**: TS errors for unused code.
4. **Missing/Incorrect Types**: Incorrect interfaces for `Appointment`, `StaffMember`, etc.

## Proposed Changes

### 1. Fix Button Component
- Update `frontend/src/components/ui/button.tsx` to use `@radix-ui/react-slot`.
- Implement `asChild` prop and `Slot` component.

### 2. Fix Type Mismatches in Dashboard Components
- **ManagerDashboard.tsx**: Convert `basePayPerWeek` from string to number before sending to API.
- **ManageServices.tsx**: Ensure `price` is handled as a number.
- **AttendanceLedger.tsx**: Fix number to string conversions.

### 3. Cleanup Unused Imports
- Remove unused imports in `Navbar.tsx`, `ManagerDashboard.tsx`, etc.

### 4. Fix IntrinsicAttributes Errors
- Fix `asChild` usage in `Booking.tsx`, `CustomerAppointments.tsx`.

## Verification Plan
1. Run `tsc -b` in the `frontend` directory to verify type checking passes.
2. Run `npm run build` in the `frontend` directory to ensure successful production bundle generation.
