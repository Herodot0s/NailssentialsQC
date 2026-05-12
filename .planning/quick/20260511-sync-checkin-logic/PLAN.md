# Plan - Synchronize Mobile Check-In with Staff Schedule

The goal is to ensure the `MobileCheckIn` component and the underlying attendance logic accurately reflect the staff's schedule, including day-specific variations defined in `StaffSchedule`.

## Proposed Changes

### Backend
1. **attendanceController.ts**
   - Update `getAttendanceStatus` to look up the `StaffSchedule` for the current staff member and the current day of the week.
   - Fall back to `staffProfile.scheduled_start/end` if no specific schedule exists for the day.
   - Update `checkIn` to use the same logic for calculating tardiness and storing the scheduled times in the `Attendance` record.

### Frontend
1. **StaffDashboard.tsx**
   - No major logic changes needed if the backend provides the correct `scheduledStart` and `scheduledEnd` in the status response.
   - Ensure the UI handles missing schedule data gracefully.

2. **MobileCheckIn.tsx**
   - Add a display for "Scheduled Shift" (e.g., "12:00 PM - 10:00 PM").
   - Improve the "Status" badge or add a secondary badge showing if they are within their scheduled time.
   - Optimize the duration calculation logic.

## Verification Plan

### Automated Tests
- Create a script to seed a specific schedule for a staff member for the current day.
- Call the `getAttendanceStatus` API and verify it returns the custom schedule.
- Call the `checkIn` API and verify `tardiness_minutes` is calculated correctly based on the custom schedule.

### Manual Verification
- View the `StaffDashboard` and check if `MobileCheckIn` displays the correct scheduled shift.
- Test check-in/out and verify messages and state updates.
