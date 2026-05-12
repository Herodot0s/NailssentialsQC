# Plan - Synchronize AttendanceLedger with Updated Database

Synchronize the `AttendanceLedger.tsx` component and its associated API types with the updated database schema, specifically focusing on `scheduled_start`, `scheduled_end`, and `deduction_amount`.

## User Review Required

> [!IMPORTANT]
> I will be updating the `AttendanceRecord` type to include `scheduled_start`, `scheduled_end`, and `deduction_amount`. The `AttendanceLedger` will now prioritize the schedule stored in the attendance record over the general staff schedule for historical accuracy.

- [ ] Confirm if any other fields from the `Attendance` model (like `notes`) should be displayed in the ledger.

## Proposed Changes

### Types

#### [api.ts](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/types/api.ts)
- Add `scheduled_start: string | null`
- Add `scheduled_end: string | null`
- Add `deduction_amount: number`
- Add `notes: string | null`

### Components

#### [AttendanceLedger.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/dashboard/staff/AttendanceLedger.tsx)
- Update `chartData` to use `record.scheduled_start` and `record.scheduled_end` if they exist.
- Update the main table list to display the `deduction_amount` next to tardiness.
- Update the "Daily Summary" in the dossier modal to show the actual scheduled times from the record.
- Use `staffProfileId` consistently for map keying to avoid ambiguity.

## Verification Plan

### Automated Tests
- N/A (Frontend UI changes)

### Manual Verification
1. Open the Attendance Ledger.
2. Verify that the "Shift" column still shows correctly for today.
3. Check a staff member's dossier and verify the "Expected" times match the record's schedule.
4. Verify that tardiness and deductions are displayed correctly.
