---
status: complete
---

# Plan: Refine Navbar for Customer Experience

Refine the Navbar by removing redundant links and repositioning the cart icon for a cleaner, more focused customer experience.

## Changes

### Frontend

- [x] Modify `frontend/src/components/Navbar.tsx`:
    - [x] Remove "Book Now" link for customers.
    - [x] Remove "My Appointments" link for customers (moved to avatar dropdown).
    - [x] Move Cart icon to the left of the user avatar/dropdown.

## Verification Plan

### Automated Tests
- N/A (UI layout change)

### Manual Verification
- [ ] Login as a customer.
- [ ] Verify "Book Now" and "My Appointments" are gone from the main navbar.
- [ ] Verify Cart icon is positioned correctly to the left of the avatar.
- [ ] Verify "My Appointments" is still available in the avatar dropdown.
