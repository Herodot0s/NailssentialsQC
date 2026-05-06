---
status: complete
date: 2026-05-06
slug: 20260506-add-login-shortcuts
---

# Summary: Add Login Shortcuts

Successfully added quick login shortcut buttons to the login page to facilitate easier testing and demonstration of the different user roles.

## Accomplishments
- Added "Quick Login (Demo Accounts)" section to `Login.tsx`.
- Implemented three buttons: Customer, Staff, and Manager.
- Configured buttons to automatically fill the identifier and password fields using `setValue` from `react-hook-form`.
- Verified demo credentials against `ACCOUNTS.md`.

## Resulting State
- Users can now click a single button on the login page to populate credentials for `charlie_brown`, `john_smith`, or `admin`.
- Default password `password123` is automatically filled for all demo shortcuts.
