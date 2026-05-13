---
status: "complete"
---

# Addons Feature Summary

- **Database**: Added `Addon` and `AppointmentAddon` models to Prisma schema and ran push/generate.
- **Backend API**: Created `addonController` and `addonRoutes`, mounted at `/api/v1/addons`. Updated `createAppointment` to handle persisting `addons` and returning them in `getAppointments`.
- **Frontend Admin**: Created `ManageAddonsDialog.tsx` component to provide CRUD operations on Addons from the Manager dashboard's "Services" tab. Linked in `ManageServices.tsx` via a "Manage Addons" button.
- **Frontend Booking**: Updated `Booking.tsx` to fetch available addons and render a selection section before checkout. Users can increase or decrease quantities. Subtotal is calculated correctly and the payloads are sent alongside the `createAppointment` API call.
