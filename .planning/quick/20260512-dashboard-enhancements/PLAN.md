# Plan: Implement Industry-Grade Dashboard Features

Implement a comprehensive suite of history and performance tracking features for both Managers and Staff, focusing on transparency, proof of service, and success metrics.

## Objectives
- **Manager Dashboard:**
  - View appointments created specifically by customers (online bookings).
  - View "Staff Success" (completed services and commissions).
  - Visual gallery for "Proof of Service" (after-photos).
  - Unified history of all appointments and transactions.
- **Staff Dashboard:**
  - Individual history of services rendered and commissions earned.
  - Personal portfolio of service proofs.

## Proposed Changes

### 1. New Frontend Components (`frontend/src/components/dashboard/`)
- `ProofGallery.tsx`: A premium masonry or grid gallery showing `service_photo_url` from completed appointments.
- `StaffPerformanceView.tsx`: A table/card view showing staff success metrics (rituals completed, revenue generated, commissions earned).
- `AppointmentHistory.tsx`: A filterable list of all past appointments with status and links to proofs.
- `StaffPersonalHistory.tsx`: A refined view for staff to track their personal progress and history.

### 2. Dashboard Updates
- **`ManagerDashboard.tsx`**:
  - Update `CustomerCareView` to include the "Appointments", "Success", and "Proofs" tabs.
- **`StaffDashboard.tsx`**:
  - Enhance the "Commissions" tab or add a "History" tab to show a detailed log of past work.

### 3. Backend Refinements (if needed)
- Ensure existing analytics endpoints provide sufficient data for the new UI views.
- Add `is_walk_in` filtering to appointment list if not already supported via query params.

## Verification Plan
### Automated Tests
- N/A (Manual UI verification)

### Manual Verification
1. Log in as Manager.
2. Navigate to "Customer Care" -> "Activity".
3. Verify "Online Bookings" filter.
4. Check "Staff Success" metrics for accuracy.
5. Open "Service Proofs" and verify photos are displayed correctly.
6. Log in as Staff.
7. Verify "History" tab shows past appointments and correct commissions.
