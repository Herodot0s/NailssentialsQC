# Story: S2.3 - Manage Services (Manager)

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 2: Service Catalog & Booking  
**Status:** ✅ COMPLETE  
**Type:** User Story  

---

## 1. Description
**Goal:** Allow salon managers to add, update, or disable services and categories to keep the salon menu current.

**User Statement:**
As a salon manager, I want to manage our service offerings so that our online catalog always reflects our current menu and pricing.

**Technical Context:**
- **Backend:** CRUD endpoints in `serviceController.ts` protected by `manager` role.
- **Frontend:** Management dashboard for services with forms for creation and editing.
- **Security:** RBAC middleware ensures only managers can perform mutations.

---

## 2. Acceptance Criteria
- [x] Manager can create new service categories.
- [x] Manager can add new services with name, description, duration, and price.
- [x] Manager can edit existing services.
- [x] Manager can disable/enable services (soft delete).
- [x] Only users with the `manager` role can access these features.
- [x] Frontend displays a clear list of all services with management actions (Edit/Toggle).

---

## 3. Tasks

### 3.1 Backend Implementation
- [x] **Task 1: Add CRUD logic to Service Controller**
  - Implemented `createCategory`, `updateCategory`.
  - Implemented `createService`, `updateService`.
- [x] **Task 2: Protect Mutation Routes**
  - Updated `serviceRoutes.ts` with `authenticateToken` and `authorizeRoles('manager')`.

### 3.2 Frontend Implementation
- [x] **Task 3: Manage Services UI**
  - Created `ManageServices.tsx` with table view.
  - Implemented modal-based add/edit forms.
- [x] **Task 4: Category Management**
  - Enabled category selection in service forms; added basic category update logic.

### 3.3 Integration
- [x] **Task 5: Role-Based Navigation**
  - Added "Manage Services" link to `Navbar` visible only to managers.
- [x] **Task 6: Verification**
  - Protected the frontend route using `ProtectedRoute`.

---

## 4. Technical Notes
- **Soft Delete:** Implemented using `is_active` field.
- **Validation:** Basic frontend validation for required fields; backend parses types.
