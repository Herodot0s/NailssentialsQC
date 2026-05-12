# PLAN - Organize Customer Related Components

The goal is to consolidate all customer-facing management tools into a professional, centralized "Customer Care" container within the Manager Dashboard. This improves both the codebase organization and the manager's user experience.

## Proposed Changes

### 1. Filesystem Reorganization
- Create `frontend/src/components/dashboard/customers/`
- Move the following components into this new directory:
    - `ReviewModeration.tsx`
    - `AppointmentTimeline.tsx`
    - `LogWalkInDialog.tsx`

### 2. UI Consolidation
- Create `frontend/src/components/dashboard/customers/CustomerCareView.tsx`
    - This will act as the "Professional Container" for all customer-related activity.
    - It will feature a tabbed interface:
        - **Live Activity**: Appointment Timeline + Log Walk-in trigger.
        - **Public Feedback**: Review Moderation.
        - **Customer Directory**: (Placeholder or lightweight search using existing API).
- Update `ManagerSidebar.tsx`:
    - Add a new group: **Customer Relations**
    - Item: **Customer Care** (Icon: Heart or Users)

### 3. Integration
- Update `frontend/src/components/dashboard/types.ts` to include `customer-care` view.
- Update `frontend/src/pages/ManagerDashboard.tsx` to handle the new view and updated import paths.

## Verification Plan
- [ ] Verify sidebar shows "Customer Relations" group.
- [ ] Verify "Customer Care" view renders correctly with tabs.
- [ ] Verify Review Moderation still works.
- [ ] Verify Appointment Timeline still works.
- [ ] Verify Log Walk-in dialog still works.
