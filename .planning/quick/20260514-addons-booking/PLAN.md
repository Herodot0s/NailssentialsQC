---
task: "Addons feature for booking and managers dashboard"
status: "in-progress"
---

# Plan for Addons

1. **Database Schema:**
   - Add `Addon` model to `schema.prisma`.
   - Add `AppointmentAddon` model to `schema.prisma`.
   - Run `npx prisma db push` and `npx prisma generate`.

2. **Backend API:**
   - Create `addonController.ts` for CRUD operations on Addons.
   - Create `addonRoutes.ts`.
   - Update `app.ts` to include `/api/addons`.
   - Update `appointmentController.ts` to accept `addons` in `createAppointment` and persist to `AppointmentAddon`.

3. **Frontend API Client:**
   - Add `getAddons`, `createAddon`, `updateAddon`, `deleteAddon` in `apiClient.ts`.

4. **Manager Dashboard:**
   - Add `ManageAddonsDialog.tsx` component (similar to `ManageCategoriesDialog`).
   - Add a button in `ManageServices.tsx` to open the `ManageAddonsDialog`.

5. **Booking Flow:**
   - Update `Booking.tsx` to fetch active addons.
   - Add an Addons selection section before the final submit.
   - Append selected addons to the `handleBooking` payload.
   - Display selected addons in the Summary.

6. **State Tracking:**
   - Update `SUMMARY.md` on completion.
