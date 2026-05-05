# Manager Dashboard Decomposition

Decomposed the monolithic ManagerDashboard.tsx into a layout shell with extracted view components and dialog components.

## Actions Taken
- Extended dashboard types in `frontend/src/components/dashboard/types.ts`
- Extracted `ManagerSidebar` component
- Extracted `OverviewView` component
- Extracted `DeductionsView` component
- Extracted `StaffDetailSheet` and 4 dialog components (`AddStaffDialog`, `ShiftEditDialog`, `PayrollRunDialog`, `DeductionEntryDialog`)
- Refactored `ManagerDashboard.tsx` to use the extracted components

## Verification
- `npx tsc --noEmit` passes with 0 errors
- `npm run build` completes successfully
- Monolithic dashboard was successfully decoupled into smaller logical components without any functionality loss.
