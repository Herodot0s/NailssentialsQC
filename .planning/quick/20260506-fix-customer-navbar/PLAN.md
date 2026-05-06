---
status: complete
---

# Fix Customer Navigation Bar

Address layout redundancies and missing links in the navigation bar, specifically for the Customer role.

## Issues Identified
1. **Redundancy**: "Book Now" and the Shopping Cart icon both link to `/booking` and are displayed as separate items.
2. **Clutter**: "My Appointments" is duplicated in both the main navigation and the profile dropdown.
3. **Mobile Gaps**: The mobile navigation menu is missing role-specific links (Book Now, My Appointments, Dashboards).
4. **Inconsistency**: The "Exhibit" link in the nav corresponds to the "Gallery" page, which might be confusing.

## Proposed Changes
1. **Consolidate Customer Links**:
   - Merge the Shopping Cart indicator into the "Book Now" link or place them adjacent more logically.
   - Remove "My Appointments" from the main desktop nav to reduce clutter (it remains in the profile dropdown which is the standard pattern for authenticated users).
2. **Improve Mobile Menu**:
   - Add role-specific links to the mobile dropdown (Book Now, My Appointments for customers; Dashboards for staff/manager).
3. **Manager/Staff Visibility**:
   - Add "Admin Dashboard" to the main nav for Managers for better accessibility.
4. **Naming Consistency**:
   - Rename "Exhibit" to "Gallery" to match the page purpose and file naming.

## Verification Plan
1. Log in as Customer:
   - Verify nav shows: Services, Gallery, Book Now (with cart count if items present), and Avatar.
   - Verify "My Appointments" is available in the Avatar dropdown.
   - Verify mobile menu includes all relevant links.
2. Log in as Manager/Staff:
   - Verify respective Dashboard links are visible in the main nav.
