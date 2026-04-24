# Story: S1.T3 - Database & ORM Setup

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 1: Foundation & Security  
**Status:** ✅ COMPLETE  
**Type:** Setup Task  

---

## 1. Description
**Goal:** Set up the database layer using Prisma ORM with MySQL, defining the initial schema based on the system architecture.

**Technical Context:**
- **ORM:** Prisma v7.7.0.
- **Database:** MySQL 8.0.
- **Schema:** Defined in `backend/prisma/schema.prisma`.

---

## 2. Acceptance Criteria
- [x] Prisma is installed and initialized in the `backend/` directory.
- [x] `schema.prisma` contains all core tables (users, profiles, services, appointments, etc.) as defined in the Architecture.
- [x] Database connection string is configured in `backend/.env`.
- [x] Prisma Client is generated and can be imported into the backend code.
- [x] (Optional) Initial migration is created using `npx prisma migrate dev`. (Note: Manual migration might be needed once MySQL is live).

---

## 3. Tasks
- [x] **Task 1: Install Prisma**
  - Install `prisma` as a dev dependency.
  - Install `@prisma/client` as a dependency.
  - Run `npx prisma init`.
- [x] **Task 2: Define Schema**
  - Translate the SQL schema from `06-System-Architecture.md` into `schema.prisma` format.
  - Ensure all relations (FKs) are correctly defined.
- [x] **Task 3: Environment Setup**
  - Ensure `DATABASE_URL` in `.env` is correct (defaulting to local MySQL for now).
- [x] **Task 4: Generate & Verify**
  - Run `npx prisma generate`.
  - Create a simple script or update `index.ts` to verify Prisma can be imported.

---

## 4. Technical Notes
- **Prisma 7.7.0+:** Connection URL moved to `prisma.config.ts`.
- **Relations:** Pay close attention to 1:1 (user/profile) and 1:N (category/service) relations.
- **Enums:** Use Prisma enums for roles and statuses.
- **MySQL:** Ensure the provider in `schema.prisma` is set to `"mysql"`.
