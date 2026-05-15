# Plan - Staff Dashboard Notice Duration Format

Update `StaffDashboard.tsx` to display hours and minutes instead of just minutes in attendance notices.

## Proposed Changes

### `frontend/src/lib/utils.ts`
- Add `formatDuration` helper function.

### `frontend/src/pages/StaffDashboard.tsx`
- Import `formatDuration` from `@/lib/utils`.
- Replace manual minute calculations in `handleCheckIn` and `handleCheckOut` with `formatDuration`.

## Verification Plan
- Check in early (>15 mins) and verify notice shows "X hour(s) and Y minute(s)".
- Check in late and verify notice shows "X hour(s) and Y minute(s)".
- Check out early and verify notice shows "X hour(s) and Y minute(s)".
