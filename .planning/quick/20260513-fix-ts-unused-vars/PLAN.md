# Plan: Fix TS6133 Unused Variable Errors

Fix TypeScript errors in frontend components where variables are declared but never read.

## User Review Required

> [!IMPORTANT]
> None. These are standard cleanup fixes for build compliance.

## Proposed Changes

### Frontend

#### [GuestRoute.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/GuestRoute.tsx)
- Remove `isAuthenticated` from `useAuth()` destructuring.

#### [Navbar.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/Navbar.tsx)
- Remove `User` from `lucide-react` imports.
- Remove `isAuthenticated` from `useAuth()` destructuring.

#### [ProtectedRoute.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/ProtectedRoute.tsx)
- Remove `isAuthenticated` from `useAuth()` destructuring.

## Verification Plan

### Automated Tests
- Run `npm run build` in `frontend` directory to ensure no TS errors remain.

### Manual Verification
- None required for these specific changes as they are unused variables.
