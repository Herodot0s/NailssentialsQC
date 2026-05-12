# Plan: Booking Sync and Conflict Prevention

## Objective
Ensure all bookings in a single checkout ("wave") share the same start time and implement industry-grade conflict prevention between online bookings and walk-ins.

## Context
- **Wave Booking:** Customers often book multiple services (or for multiple people) in one go. Currently, each item has its own time select, which is confusing and allows misaligned schedules.
- **Conflict Prevention:** Online bookings and staff-logged walk-ins currently lack a strict concurrency check at the database level, leading to potential double-bookings.

## Proposed Changes

### 1. Frontend: Unified Time Selection
- **Booking.tsx:** 
    - Move time selection out of individual treatment cards.
    - Add a single, global time selector that applies to all items in the cart.
    - Update `handleBooking` to use the global time for all items.
- **CartPackageItem.tsx:**
    - Remove individual time selects from child services.
- **CartContext:** (If needed) add a `globalStartTime` state.

### 2. Backend: Industry-Grade Conflict Prevention
- **Availability Check:** Update `createAppointment` to validate technician availability for the requested service duration *inside* the database transaction.
- **Walk-in Logic:** Ensure walk-ins logged via `LogWalkInDialog` follow the same strict availability rules as online bookings.
- **Availability API:** Update `getAvailableSlots` to account for the number of technicians needed if the user has multiple items in their "wave".

## Verification Plan
- [ ] Test booking multiple services in one "wave" and confirm they all have the same time in the database.
- [ ] Simulate concurrent bookings for the same technician and slot to verify that the second one fails with a "Staff already booked" error.
- [ ] Verify that walk-ins cannot be booked over existing online appointments.
