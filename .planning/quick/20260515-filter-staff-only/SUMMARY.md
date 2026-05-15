---
status: complete
---

# Summary - Filter Staff Only in Booking

Excluded 'manager' role from the technician selection list in the customer booking page.

## Changes

### Frontend

#### [Booking.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/pages/Booking.tsx)
- Modified `useEffect` to filter `staffItems` by `role === 'staff'` only.
