# Quick Task 260510-oef: Manager redirect to manager dashboard

**Mode:** quick
**Directory:** .planning/quick/260510-oef-manager-redirect-to-manager-dashboard-in
**Description:** manager redirect to manager dashboard instead of staff dashboard

## Task Analysis

**Problem:** Login.tsx redirects all non-customer users (both staff AND manager) to `/dashboard` which shows StaffDashboard. Managers should go to `/manager` which shows ManagerDashboard.

**Fix Location:** `frontend/src/pages/Login.tsx` lines 46-50

**Current behavior:**
```typescript
if (user.role === 'customer') {
  navigate('/');
} else {
  navigate('/dashboard');  // All staff AND manager go here
}
```

**Required behavior:**
```typescript
if (user.role === 'customer') {
  navigate('/');
} else if (user.role === 'manager') {
  navigate('/manager');
} else {
  navigate('/dashboard');
}
```

## Files to Modify

- `frontend/src/pages/Login.tsx` — Update login redirect logic

## Action

Edit Login.tsx lines 46-50 to add manager-specific redirect to `/manager`.