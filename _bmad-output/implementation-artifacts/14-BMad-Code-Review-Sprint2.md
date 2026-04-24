# BMad Code Review Report: Sprint 2 (S2.2 & S2.3 + S2.1 Fixes Check)

## 1. Blind Hunter (Immediate Technical Faults)

*   **[CRITICAL] S2.2 Blind Technician Assignment:**
    In `backend/src/controllers/appointmentController.ts` (`createAppointment`), the code blindly assigns every new appointment to the first staff member in the database (`const staff = await prisma.staffProfile.findFirst();`). It does not check if the staff member is already booked at that time, which will immediately lead to double-booked technicians.

*   **[HIGH] S2.2 Flawed End Time Calculation:**
    In `createAppointment`, the end time is calculated by extracting the hour (`time.split(':')[0]`) and adding `Math.ceil(service.duration_minutes / 60)`. This completely ignores minutes. If a 45-minute service starts at `12:30`, `parseInt("12") + 1` results in an end time of `13:00` instead of `13:15`. 

*   **[HIGH] S2.1 Fixes Were NOT Applied:**
    The issues identified in the previous S2.1 code review were ignored and remain in the codebase:
    1. `categoryId` `NaN` crash in `getServices` (still throws 500 error if given a string).
    2. `backend/prisma/seed.ts` still uses a blind `.create()` loop for services causing duplication.
    3. `frontend/src/pages/Services.tsx` still uses waterfall sequential requests instead of `Promise.all()`.

## 2. Edge Case Hunter (Logic Flaws)

*   **[HIGH] S2.2 Slot Availability Ignores Duration:**
    In `getAvailableSlots`, the logic assumes every appointment fits neatly into a 1-hour slot. It simply counts how many appointments start at a specific hour (`bookedSlots.filter(s => s === slot).length`). If a customer books a 90-minute service starting at 12:00, the 13:00 slot will incorrectly appear as fully available. The logic must calculate overlapping intervals based on `start_time` and `end_time`.

## 3. Acceptance Auditor (Security & Standards)

*   **[MEDIUM] S2.3 Missing Frontend Data Validation:**
    In `frontend/src/pages/ManageServices.tsx`, the form relies purely on HTML5 `required` and `type="number"`. A user can input negative prices (e.g., `-500`) or negative durations (e.g., `-30`), which the backend (`createService`/`updateService`) will blindly accept and insert into the database.
