---
status: complete
phase: quick-260503-u9i
quick_id: 260503-u9i
description: fix avatar dropdown not dropping in Navbar.tsx
date: 2026-05-03
---

# Quick Task 260503-u9i: Fix Avatar Dropdown

## Summary

Fixed the avatar dropdown menu in `Navbar.tsx` that was not opening when clicked.

## Root Cause

The `DropdownMenuTrigger` with `asChild` prop uses Radix's `Slot` component to merge props (onClick, data-state, etc.) into the child component. However, the child was a Base UI `Button` component that uses a `render` prop pattern which doesn't properly forward all props from Radix's Slot, causing the trigger event listeners to not attach correctly to the DOM button element.

## Changes Made

**File: `frontend/src/components/Navbar.tsx`**

1. **Desktop avatar dropdown (line ~105-117):** Replaced Base UI `Button` component with a standard HTML `<button>` element inside `DropdownMenuTrigger asChild`.

2. **Mobile menu dropdown (line ~209-213):** Replaced Base UI `Button` component with a standard HTML `<button>` element inside `DropdownMenuTrigger asChild`.

Both changes maintain the same visual styling while ensuring proper prop forwarding from Radix's Slot component.

## Verification

- TypeScript compilation: Passes (no errors in Navbar.tsx)
- Button import preserved: Still used for "Sign Up" button
- Visual styling preserved: Same classes applied to standard button elements

## Files Modified

- `frontend/src/components/Navbar.tsx`
