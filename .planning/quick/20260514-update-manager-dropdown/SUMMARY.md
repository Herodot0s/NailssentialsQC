---
status: complete
---
# Quick Task Summary: Update Manager Dropdown Menu

Removed "Cart" from the manager's dropdown avatar and ensured the requested order: Manager Dashboard, Services, Exhibit.

## Changes
-   Modified `frontend/src/components/Navbar.tsx` to conditionally hide the "Cart" action if the user role is 'manager'.
-   Reordered `UserButton.MenuItems` in mobile view to prioritize "Manager Dashboard" at the top for managers, followed by "Services" and "Exhibit".

## Verification Results
-   [x] Manager role: Cart removed, items reordered correctly.
-   [x] Non-manager role: Cart remains available.
