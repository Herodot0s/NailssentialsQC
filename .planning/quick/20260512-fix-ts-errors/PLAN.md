# Plan - Fix TypeScript Errors

Fixing 23 TypeScript errors across multiple dashboard components to stabilize the frontend build.

## Proposed Changes

### 1. `src/components/dashboard/customers/AppointmentHistory.tsx`
- Remove unused imports: `Filter`, `History`, `Eye`, `MapPin`, `DialogHeader`, `DialogTitle`, `DialogDescription`.
- Fix `title` prop on `UserCheck` and `Smartphone` icons (remove or replace with proper tooltip).
- Add type to parameter `i` in `selectedAppointment.items.map`.

### 2. `src/components/dashboard/customers/CustomerCareView.tsx`
- Remove unused import: `Camera`.

### 3. `src/components/dashboard/customers/ProofGallery.tsx`
- Remove unused import: `User`.

### 4. `src/components/dashboard/staff/MobileCards.tsx`
- Remove unused imports: `Badge`, `User`, `DollarSign`.

### 5. `src/components/dashboard/staff/StaffPersonalHistory.tsx`
- Remove unused imports: `Calendar`, `Clock`, `User`, `UserCheck`, `DialogHeader`, `DialogTitle`.
- Fix missing `is_walk_in` property in `app` object.
- Update `appointments` prop type to include `service_photo_url` if needed, or ensure it's optional/handled.

### 6. `src/pages/StaffDashboard.tsx`
- Ensure `appointments` data passed to `StaffPersonalHistory` contains `service_photo_url`.

## Verification Plan
- Run `npm run build` in the `frontend` directory to ensure all 23 errors are resolved.
