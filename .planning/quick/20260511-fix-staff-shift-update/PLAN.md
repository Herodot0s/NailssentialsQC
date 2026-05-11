# Plan: Fix Staff Shift Update and Optimize UI

Investigate and fix the "failed to update a shift" error in the Manager Dashboard, optimize the code, and replace alert pop-ups with modals.

## Root Cause Analysis
The backend validation schema for staff schedules (`backend/src/routes/staffRoutes.ts`) uses a strict regex `/^\d{2}:\d{2}:\d{2}$/` which requires seconds (`HH:MM:SS`). The frontend (`ManagerDashboard.tsx`) sends time in `HH:MM` format (e.g., "12:00"). This results in a validation failure (`400 Bad Request`).

## Proposed Changes

### 1. Backend Fixes
- **`backend/src/routes/staffRoutes.ts`**: Update the regex to make seconds optional: `/^\d{2}:\d{2}(:\d{2})?$/`.
- **`backend/src/controllers/staffController.ts`**: In `updateStaffSchedule`, normalize the time format to `HH:MM:SS` before database operations if seconds are missing.

### 2. Frontend Fixes & UI Optimization
- **`frontend/src/pages/ManagerDashboard.tsx`**: Replace `alert()` calls with a more modern UI component (like a toast or a modal). Since the user specifically asked for a "modal", I will look for an existing Modal/Dialog component or use a Toast if appropriate for success/error messages.
- **Optimization**: Ensure consistent error handling and state updates after a successful shift update.

## Verification Plan
- **Manual Test**: Attempt to update a staff shift in the Manager Dashboard and verify it succeeds.
- **UI Test**: Verify that success/error messages appear in a modal/toast instead of an `alert()`.
