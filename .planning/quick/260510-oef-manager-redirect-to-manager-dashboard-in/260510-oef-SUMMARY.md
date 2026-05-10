# Quick Task 260510-oef: Manager redirect to manager dashboard

**Status:** complete
**Completed:** 2026-05-10

## Summary

Fixed login redirect so managers go to `/manager` (ManagerDashboard) instead of `/dashboard` (StaffDashboard).

## Changes

### `frontend/src/pages/Login.tsx`

Added manager-specific redirect before the staff fallback:

```typescript
if (user.role === 'customer') {
  navigate('/');
} else if (user.role === 'manager') {
  navigate('/manager');
} else {
  navigate('/dashboard');
}
```

## Verification

- Login as manager demo account → should redirect to `/manager`
- Login as staff demo account → should redirect to `/dashboard`