---
status: complete
date: 2026-05-11
---

# Summary: Fix Staff Shift Update and UI Optimization

## Changes Made
- **Backend Fixes**:
  - Updated `backend/src/routes/staffRoutes.ts` to allow both `HH:MM` and `HH:MM:SS` time formats in the Zod schema.
  - Updated `backend/src/controllers/staffController.ts` to normalize input time to `HH:MM:SS` before database operations.
- **Frontend Optimization**:
  - Created `frontend/src/components/dashboard/StatusModal.tsx`, a reusable premium dialog component for success/error feedback.
  - Replaced all `alert()` calls in `frontend/src/pages/ManagerDashboard.tsx` with the new `StatusModal`.
  - Improved error handling in `ManagerDashboard.tsx` to display specific API error messages.

## Verification
- Verified backend validation flexibility for time formats.
- Verified time normalization logic in the controller.
- Verified removal of `alert()` and correct integration of `StatusModal` in the Manager Dashboard.
