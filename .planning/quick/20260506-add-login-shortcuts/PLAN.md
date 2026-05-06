---
status: complete
---

# Add Login Shortcuts

Add buttons to the login page to fill credentials for Customer, Staff, and Manager accounts for testing purposes.

## Context
The user wants to quickly fill in credentials for different roles on the login page:
- Customer: `charlie_brown`
- Staff: `john_smith`
- Manager: `admin`
- Password for all: `password123`

## Proposed Changes
1. Modify `frontend/src/pages/Login.tsx` to include a set of shortcut buttons.
2. The buttons will use `setValue` from `react-hook-form` to populate `identifier` and `password`.

## Verification Plan
1. Open the login page.
2. Click "Customer" button -> verify fields are filled with `charlie_brown` and `password123`.
3. Click "Staff" button -> verify fields are filled with `john_smith` and `password123`.
4. Click "Manager" button -> verify fields are filled with `admin` and `password123`.
