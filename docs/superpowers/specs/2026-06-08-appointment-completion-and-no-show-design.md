# Design Specification: Actual Completion Time & Appointment No-Show Handling

## 1. Overview
This specification details the implementation of two requested improvements to the NailssentialsQC booking and appointment management workflows:
1. **Actual Service Completion Time**: Overwriting the estimated `end_time` of `AppointmentItem`s with the actual time the service is finalized (the system timestamp when the staff marks it completed).
2. **Appointment No-Show Logging**: Providing a mechanism for staff and managers to mark an appointment as a "no-show" when the customer fails to appear, logging it for administrative records.

---

## 2. Technical Architecture & Changes

### 2.1 Actual Service Completion Time (Backend)
When marking an appointment as completed, the system currently sets the status of the `Appointment` and all related `AppointmentItem`s to `completed`, leaving the estimated `end_time` unchanged. 

We will modify this behavior inside the Prisma transaction:
* **Location**: `backend/src/controllers/appointmentCompletion.ts`
* **Flow**:
  1. Determine the current local time in Manila.
  2. Format the time as a 24-hour string (`"HH:mm"` format) using `date-fns` formatting.
  3. Overwrite the `end_time` field of all `AppointmentItem`s in the transaction update.
* **Code Modification snippet**:
  ```typescript
  const nowTimeStr = format(new Date(), 'HH:mm'); // e.g., "15:45"
  await tx.appointmentItem.updateMany({
    where: { appointment_id: parseInt(id as string) },
    data: { 
      status: 'completed',
      end_time: nowTimeStr, // Overwriting original estimated end_time
    },
  });
  ```

---

### 2.2 Appointment No-Show Handling (Backend)
To track customer attendance accurately, staff and managers can mark missed appointments as `no_show`.
* **Endpoint**: `PATCH /api/appointments/:id/no-show`
* **Authorization**: Roles `staff` and `manager` (utilizing `authorizeRoles`).
* **Validation**:
  * Validation middleware for the `id` parameter.
  * Check if the appointment exists (returns `404` if not found).
  * Check that the appointment's current status is either `pending` or `confirmed` (returns `400` if already completed, cancelled, or no-show).
  * Check that the scheduled appointment date is today or in the past (strictly prevents marking future bookings as no-show).
* **Database Transaction Logic**:
  * Update `Appointment.status = 'no_show'`.
  * Update all related `AppointmentItem.status = 'no_show'`.
  * Create a `SystemLog` entry documenting the event:
    * `action`: `"MARK_NO_SHOW"`
    * `entity_type`: `"appointment"`
    * `entity_id`: `id`
    * `details`: `{ markedBy: role }`

---

### 2.3 Frontend Integration

#### 2.3.1 API Client Updates (`frontend/src/api/apiClient.ts`)
* Export a new method `markAppointmentNoShow(id: number)` to call the `PATCH /api/appointments/${id}/no-show` endpoint.

#### 2.3.2 Dashboard UI Updates (`frontend/src/pages/StaffDashboard.tsx`)
* **Mark No-Show Button**:
  * Rendered next to the "Complete Service" button in the "Today's Appointments" view.
  * **Condition**: Shown only if `item.status` is `pending` or `confirmed` AND the appointment date is today or in the past.
  * Clicking the button prompts a confirmation dialog using shadcn/ui Dialog: *"Are you sure you want to mark this appointment as a No-Show?"*.
  * Upon confirmation:
    1. Call `markAppointmentNoShow` API.
    2. Display a success feedback message.
    3. Re-fetch dashboard data to update the schedule state and status badges.

---

## 3. Scope & Verification

### 3.1 Excluded from Scope
* Customer suspension/penalization logic (out of scope per user specification of Option 1).
* Automated notifications or emails to customers regarding missed appointments.

### 3.2 Verification & Test Cases
* **Verification 1**: Complete an appointment and verify the `end_time` in database is overwritten with the actual system hour.
* **Verification 2**: Verify that attempting to mark a future appointment as "No-Show" returns a validation error `400`.
* **Verification 3**: Verify that marking a today/past appointment as "No-Show" succeeds, updates database statuses to `no_show`, logs a `MARK_NO_SHOW` action, and updates UI status badges.
* **Verification 4**: Verify that only `staff` and `manager` roles can call the no-show endpoint.
