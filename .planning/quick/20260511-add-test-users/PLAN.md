# Quick Task: Add Test Users + Update Login Buttons

## Goal
Add three test users to the database seed and update Login.tsx quick-login buttons to use them.

## Steps

1. **Add test users to backend/prisma/seed.ts**
   - `test_customer` (role: customer)
   - `test_staff` (role: staff)
   - `test_manager` (role: manager)
   - Password: `Password121212` (hashed with bcrypt)

2. **Update frontend/src/pages/Login.tsx quick-login buttons**
   - Customer button → `setValue('identifier', 'test_customer')` + `setValue('password', 'Password121212')`
   - Staff button → `setValue('identifier', 'test_staff')` + `setValue('password', 'Password121212')`
   - Manager button → `setValue('identifier', 'test_manager')` + `setValue('password', 'Password121212')`

3. **Verify seed file has password hashing for the new users**