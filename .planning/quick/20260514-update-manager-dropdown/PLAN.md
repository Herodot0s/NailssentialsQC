# Quick Task: Update Manager Dropdown Menu

The manager's dropdown avatar should only contain "Manager Dashboard", "Services", and "Exhibit". "Cart" should be removed for the manager role.

## User Request
"the manager's dropdown avatar should only have managers dashboard, services, exhibit. remove the cart"

## Implementation Plan
1.  Modify `frontend/src/components/Navbar.tsx`.
2.  In the desktop `UserButton.MenuItems` (lines 88-125):
    -   Wrap "Cart" `UserButton.Action` with `{userRole !== 'manager' && ...}`.
3.  In the mobile `UserButton.MenuItems` (lines 163-200):
    -   Wrap "Cart" `UserButton.Action` with `{userRole !== 'manager' && ...}`.

## Verification
-   Login as manager.
-   Open avatar dropdown.
-   Verify "Cart" is missing.
-   Verify "Manager Dashboard", "Services", "Exhibit" are present.
-   Login as customer/guest.
-   Verify "Cart" is still present in dropdown (if applicable).
