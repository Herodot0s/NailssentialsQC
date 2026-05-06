---
status: in-progress
title: Consolidate Manager Tools to Dashboard
slug: consolidate-manager-tools
created: 2026-05-06
---

# Plan: Consolidate Manager Tools to Dashboard

Move "Manage Services" and "Exhibit Gallery" from the global Navbar to the Manager Dashboard sidebar to provide a more focused, professional toolset for salon owners.

## Proposed Changes

### 1. Types & Navigation Definitions
- Update `ActiveView` in `frontend/src/components/dashboard/types.ts` to include `'services'`.
- Add `'services'` item to `menuItems` in `frontend/src/components/dashboard/ManagerSidebar.tsx`.

### 2. Manager Dashboard Integration
- Import `ManageServices` into `frontend/src/pages/ManagerDashboard.tsx`.
- Add conditional rendering for `activeView === 'services'` in the main dashboard content area.

### 3. Navbar Cleanup
- Remove the "Manage Services" and "Exhibit Gallery" links from the desktop navigation in `frontend/src/components/Navbar.tsx`.
- Remove the "Manage Services" and "Exhibit Gallery" items from the avatar dropdown menu for managers.
- Remove them from the mobile menu to ensure consistency.

## Verification Plan

### Automated Tests
- Check for build errors (TypeScript).
- Verify that `ActiveView` includes `services`.

### Manual UAT
1. Log in as a Manager.
2. Verify that "Manage Services" and "Exhibit Gallery" are NOT in the top navbar.
3. Verify that they are NOT in the profile dropdown.
4. Go to the Manager Dashboard.
5. Verify that "Services" (Manage Services) is in the sidebar.
6. Verify that "Exhibit Gallery" is in the sidebar.
7. Click "Services" and ensure the service management view loads correctly.
8. Click "Exhibit Gallery" and ensure the gallery management view loads correctly.
