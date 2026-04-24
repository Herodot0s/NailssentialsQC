# Story: S2.2 - Book Appointment (Basic)

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 2: Service Catalog & Booking  
**Status:** ✅ COMPLETE  
**Type:** User Story  

---

## 1. Description
**Goal:** Allow authenticated customers to book an appointment for a specific service on a chosen date and time.

**User Statement:**
As a customer, I want to book an appointment online so that I can secure my slot without calling the salon.

**Technical Context:**
- **Backend:** `POST /api/v1/appointments` and `GET /api/v1/appointments/availability`.
- **Database:** Prisma models for `Appointment` and `AppointmentService`.
- **Frontend:** Multi-step booking UI (Service -> Date/Time -> Confirmation).

---

## 2. Acceptance Criteria
- [x] Only logged-in users can book an appointment (redirects to login if guest).
- [x] Users can select a service (carried over from the catalog).
- [x] Users can select a date (within a 14-day window).
- [x] Users can select a time slot (respecting operating hours: 12 PM - 10 PM).
- [x] Backend validates that the requested time slot is not already fully booked (3 staff capacity).
- [x] Successful booking creates an `Appointment` record with status `pending`.
- [x] User receives a confirmation message and is redirected home.

---

## 3. Tasks

### 3.1 Backend Implementation
- [x] **Task 1: Appointment Controller**
  - Implemented `getAvailableSlots` with global capacity check.
  - Implemented `createAppointment` with Prisma transaction.
- [x] **Task 2: Appointment Routes**
  - Added `appointmentRoutes.ts` with protection.

### 3.2 Frontend Implementation
- [x] **Task 3: Booking API Service**
  - Added `getAvailability` and `createAppointment` to `apiClient.ts`.
- [x] **Task 4: Booking Flow UI**
  - Implemented `Booking.tsx` with date picker and time chip grid.
- [x] **Task 5: Integration**
  - Connected Catalog "Book Now" buttons to Booking flow.

---

## 4. Technical Notes
- **Technician Assignment:** For the basic version, the system assigns the first available staff member automatically.
- **Availability:** Mocked to 3 staff members handling concurrent slots.
