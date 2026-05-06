---
status: complete
title: Consolidate Manager Tools to Dashboard
slug: consolidate-manager-tools
completed: 2026-05-06
---

# Quick Task Summary: Consolidate Manager Tools

Consolidated all manager-only operational tools into the **Manager Dashboard** sidebar and cleaned up the global **Navbar** to provide a more professional, focused interface.

## Changes
- **`ManagerDashboard.tsx`**: Embedded the `ManageServices` view.
- **`ManagerSidebar.tsx`**: Added "Services" to the sidebar menu.
- **`Navbar.tsx`**: Removed "Manage Services" and "Exhibit Gallery" from the top navigation and profile dropdown.
- **`types.ts`**: Expanded `ActiveView` to support the new `services` view.

## Verification
- **Build**: `tsc --noEmit` passed.
- **Manual**: All management links are now centralized in the sidebar, accessible only to managers.
