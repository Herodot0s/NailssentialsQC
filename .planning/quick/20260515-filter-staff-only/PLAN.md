# Plan - Filter Staff Only in Booking

Exclude 'manager' role from technician choices in the customer booking page.

## Proposed Changes

### Frontend

#### [Booking.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/pages/Booking.tsx)
- Update staff filtering logic to only include 'staff' role.

## Verification Plan

### Automated Tests
- N/A (Manual verification preferred for UI filtering)

### Manual Verification
- Navigate to Booking page.
- Open technician dropdown.
- Confirm only staff members are listed.
- Confirm managers are hidden.
