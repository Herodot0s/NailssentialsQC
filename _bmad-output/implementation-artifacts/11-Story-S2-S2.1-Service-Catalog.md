# Story: S2.1 - View Service Catalog

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 2: Service Catalog & Booking  
**Status:** ✅ COMPLETE  
**Type:** User Story  

---

## 1. Description
**Goal:** Provide customers with a browsable list of salon services, organized by category, including prices and durations.

**User Statement:**
As a customer, I want to see the available services so that I can decide what to book.

**Technical Context:**
- **Backend:** `GET /api/v1/services` and `GET /api/v1/services/categories`.
- **Database:** Prisma models for `Service` and `ServiceCategory`.
- **Frontend:** `Services.tsx` page with dynamic filtering and modern UI.

---

## 2. Acceptance Criteria
- [x] Backend endpoint `GET /api/v1/services/categories` returns all active categories.
- [x] Backend endpoint `GET /api/v1/services` returns all active services.
- [x] Frontend displays category tabs (Nails, Hair, Waxing, Lashes).
- [x] Frontend displays services as cards with name, description, duration, and price.
- [x] UI aligns with the brand design (Terracotta theme, Playfair Display headings).
- [x] Catalog is accessible to all users.

---

## 3. Tasks

### 3.1 Backend Implementation
- [x] **Task 1: Create Service Controller**
  - Implemented `getCategories` and `getServices`.
- [x] **Task 2: Service Routes**
  - Added `serviceRoutes.ts`.
- [x] **Task 3: Seed Initial Data**
  - Created `prisma/seed.ts` with categories and 10+ services.

### 3.2 Frontend Implementation
- [x] **Task 4: Service API Service**
  - Added `getCategories` and `getServices` to `apiClient.ts`.
- [x] **Task 5: Service Catalog UI**
  - Implemented `Services.tsx`.
  - Added modern card-based styles to `index.css`.
- [x] **Task 6: Integration**
  - Connected frontend to backend with loading/error handling.

---

## 4. Technical Notes
- **Seeding:** Run `npx prisma db seed` to populate services (requires live DB).
- **Responsive Grid:** The service grid automatically adapts to screen width.
