---
status: complete
---

# Summary: Fix Booking 400 Error

Fixed the "Request failed with status code 400" error during the booking process by aligning the date format between the frontend and backend.

## Changes
- **Backend**: Updated `createAppointmentSchema` in `appointmentSchemas.ts` to expect `YYYY-MM-DD` date format (regex) instead of an ISO datetime string. This matches how the frontend selects dates and how the backend `getFullDate` utility processes them.
- **Frontend**: Added a comment to `Booking.tsx` confirming that `selectedDate` is sent in the expected `YYYY-MM-DD` format.

# Summary: Fix Staff Dashboard Booking Display

Fixed the issue where bookings were not appearing in the Staff Dashboard due to an ID mismatch.

## Changes
- **Backend Auth**: Updated `authController.ts` (`login` and `getMe` endpoints) to include the `staffProfileId` in the user response.
- **Frontend Types**: Updated the `User` interface in `frontend/src/types/User.ts` to include the optional `staffProfileId` field.
- **Frontend Dashboard**: Updated `StaffDashboard.tsx` to filter appointment items using `user.staffProfileId`. This ensures that the correct staff member's rituals are displayed, as the system stores the profile ID in appointment items rather than the base user ID.

## Verification
- Verified that `authController.ts` now correctly extracts and returns `staff_profile.id`.
- Verified that `StaffDashboard.tsx` uses a fallback filter logic (`user?.staffProfileId || user?.id`) to ensure backward compatibility or handle cases where a profile might not be fully loaded.

## Verification
- Analyzed `appointmentController.ts` and `appointmentAvailability.ts` to ensure `YYYY-MM-DD` is the preferred format for date operations.
- Confirmed that `new Date(date)` (where date is `YYYY-MM-DD`) works correctly in the Prisma transaction.
