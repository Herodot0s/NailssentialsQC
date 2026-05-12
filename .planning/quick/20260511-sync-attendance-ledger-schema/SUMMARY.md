# Summary - Synchronized AttendanceLedger with Updated Database

Synchronized the `AttendanceLedger.tsx` component and associated API types with the updated database schema.

## Changes

### [api.ts](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/types/api.ts)
- Updated `AttendanceRecord` interface to include:
  - `scheduled_start`
  - `scheduled_end`
  - `deduction_amount`
  - `notes`

### [AttendanceLedger.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/dashboard/staff/AttendanceLedger.tsx)
- **Data Integrity**: Prioritized `scheduled_start` and `scheduled_end` from the attendance record itself, ensuring historical accuracy even if general staff schedules change.
- **Deduction Visibility**: Added badges to the main attendance list to show deduction amounts for tardiness.
- **Detailed Dossier**: Updated the daily summary modal to display both tardiness and deduction amounts.
- **Bug Fix**: Standardized the internal schedule map to use `staffProfileId` as the key, resolving potential ambiguity between User IDs and Staff Profile IDs.

## Verification Results

- [x] Verified `AttendanceRecord` type consistency.
- [x] Verified `AttendanceLedger` logic for schedule fallback.
- [x] Verified UI rendering of deduction badges.

## Status: complete
