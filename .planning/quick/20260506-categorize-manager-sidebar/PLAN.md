---
status: in-progress
title: Categorize Manager Sidebar & Refine Analytics
slug: categorize-manager-sidebar
created: 2026-05-06
---

# Plan: Categorize Manager Sidebar & Refine Analytics

Clean up the Manager Sidebar by removing the legacy analytics view and organizing the remaining tools into logical categories for better usability.

## Proposed Changes

### 1. Sidebar Categorization
- Define categories in `frontend/src/components/dashboard/ManagerSidebar.tsx`:
    - **Insights**: Dashboard (formerly Advanced Analytics)
    - **Operations**: Services, Packages, Exhibit Gallery, Content
    - **Human Resources**: Employee Files, Attendance, Deductions, Payroll
    - **Feedback**: Reviews
- Update the UI to render category headers in the sidebar.

### 2. Analytics Cleanup
- Remove the legacy `'analytics'` view from `ActiveView` in `frontend/src/components/dashboard/types.ts`.
- Update `ManagerDashboard.tsx` to use `'advanced-analytics'` as the default view.
- Remove the `'analytics'` case from the render logic in `ManagerDashboard.tsx`.
- Rename `'advanced-analytics'` label to `'Dashboard'` in the sidebar to make it the primary entry point.

### 3. ManagerDashboard.tsx Default State
- Update `useState<ActiveView>('analytics')` to `useState<ActiveView>('advanced-analytics')`.

## Verification Plan

### Automated Tests
- `tsc --noEmit` to ensure no broken references to the removed `'analytics'` view.

### Manual UAT
1. Log in as a Manager.
2. Verify the sidebar has clearly labeled categories.
3. Verify that the "Dashboard" (Advanced Analytics) loads by default.
4. Verify that all other tools (Services, Staff, etc.) are present in their respective categories.
