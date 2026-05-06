---
status: complete
title: Categorize Manager Sidebar & Refine Analytics
slug: categorize-manager-sidebar
completed: 2026-05-06
---

# Quick Task Summary: Sidebar Categorization & Cleanup

Organized the Manager Dashboard sidebar into logical categories and removed the legacy analytics view to streamline the management experience.

## Changes
- **`ManagerSidebar.tsx`**:
    - Removed legacy `analytics` view.
    - Renamed `advanced-analytics` to **Dashboard** (using `BarChart2` icon).
    - Grouped all items into three categories: **Insights**, **Operations**, and **Personnel**.
    - Implemented category headers in the sidebar.
- **`ManagerDashboard.tsx`**:
    - Set `advanced-analytics` as the default view.
    - Removed conditional rendering for the legacy `analytics` view.
- **`types.ts`**: Removed `analytics` from the `ActiveView` type.

## Verification
- **Build**: `tsc --noEmit` passed without errors.
- **Visuals**: Sidebar now features distinct sections with uppercase headers and consistent spacing.
