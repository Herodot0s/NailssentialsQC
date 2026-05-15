# Summary - Staff Dashboard Notice Duration Format

Update `StaffDashboard.tsx` to display hours and minutes instead of just minutes in attendance notices.

## Status
- **Status:** complete ✓
- **Date:** 2026-05-15
- **Commit:** local

## Changes
- Created `formatDuration` helper in `frontend/src/lib/utils.ts` to convert minutes into a human-readable "X hour(s) and Y minute(s)" string.
- Integrated `formatDuration` into `StaffDashboard.tsx` for:
    - Early check-in notices.
    - Late check-in notices.
    - Early check-out notices.

## Verification Results
- Manual code review confirms logical conversion: `Math.floor(min/60)` for hours and `min%60` for minutes.
- Verified pluralization (e.g., "1 hour", "2 hours").
- Verified edge cases (e.g., "45 minutes" remains minutes-only, "1 hour and 5 minutes" shows both).
