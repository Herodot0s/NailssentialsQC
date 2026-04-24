# Story: S1.3 - Role-Based Access Control (RBAC)

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 1: Foundation & Security  
**Status:** ✅ COMPLETE  
**Type:** User Story  

---

## 1. Description
**Goal:** Enforce access control based on user roles (`customer`, `staff`, `manager`) at both the API and UI levels.

**User Statement:**
As a salon owner, I want to ensure that only authorized users can access sensitive features (like sales reports or staff management) so that my business data remains secure.

**Technical Context:**
- **Backend:** Middleware `authorizeRoles` in `authMiddleware.ts`.
- **Frontend:** `ProtectedRoute` component and conditional rendering in the UI.
- **Roles:** Defined in the Prisma schema as an Enum.

---

## 2. Acceptance Criteria
- [x] Backend middleware correctly identifies the user's role from the JWT token.
- [x] API endpoints can be restricted to specific roles (e.g., `/api/v1/reports` only for `manager`).
- [x] Frontend routes are restricted based on roles (e.g., `/dashboard` only for `staff` or `manager`).
- [x] Navigation elements are conditionally shown/hidden based on the user's role.
- [x] Unauthorized access attempts (API or UI) are handled gracefully (redirect or 403 error).

---

## 3. Tasks

### 3.1 Backend Implementation
- [x] **Task 1: Verify authorizeRoles Middleware**
  - Ensure the middleware correctly checks `req.user.role`.
- [x] **Task 2: Create a Test Protected Route**
  - Implement `/api/v1/auth/me` or a similar endpoint to test RBAC.

### 3.2 Frontend Implementation
- [x] **Task 3: Implement Conditional Navigation**
  - Create a basic `Navbar` component that shows different links based on user role.
- [x] **Task 4: Role-Based Redirects**
  - Ensure users are redirected to the appropriate dashboard upon login.
- [x] **Task 5: UI Element Protection**
  - Implement a helper component/hook to conditionally render UI elements (e.g., "Edit" button only for managers).

---

## 4. Technical Notes
- **Roles:** `customer`, `staff`, `manager`.
- **Token Payload:** The JWT includes the `role` to avoid database lookups on every request.
- **Navbar:** Implemented conditional rendering based on `AuthContext` user role.
