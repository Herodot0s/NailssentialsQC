# Plan: Move Navigation Items to Avatar (Quick Task)

Move 'Exhibit', 'Services', and 'My Appointments' to the Clerk UserButton dropdown on mobile and desktop. Ensure these items are removed from the hamburger menu when the user is signed in to avoid redundancy.

## User Review Required

> [!IMPORTANT]
> The navigation items will now be inside the User Avatar menu when logged in. For logged-out users, they will remain in the hamburger menu.

## Proposed Changes

### Frontend

#### [Navbar.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/Navbar.tsx)
- Import `Image` and `List` from `lucide-react`.
- Update `UserButton` (Desktop and Mobile) to include 'Services' and 'Exhibit'.
- Ensure 'My Appointments' is present in mobile `UserButton`.
- Conditionally render 'Exhibit', 'Services', and 'My Appointments' in the hamburger menu only if the user is NOT signed in.

## Verification Plan

### Automated Tests
- None (Quick task)

### Manual Verification
1. Login as customer.
2. Check mobile view.
3. Open Avatar menu. Verify 'Services', 'Exhibit', and 'My Appointments' are there.
4. Open Hamburger menu. Verify 'Services', 'Exhibit', and 'My Appointments' are NOT there.
5. Logout.
6. Open Hamburger menu. Verify 'Services' and 'Exhibit' ARE there.
