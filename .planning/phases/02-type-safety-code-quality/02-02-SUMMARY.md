---
phase: 02
plan: 02
subsystem: backend
tags: [typescript, type-safety, tech-debt, DEBT-01]
dependency_graph:
  requires: []
  provides: [proper backend type definitions, typed catch blocks, Prisma WhereInput types]
  affects: [backend/src/controllers/*, backend/src/middleware/*, backend/src/utils/*]
tech-stack:
  added: [Prisma typed WhereInput, JwtPayload, AppJwtPayload, PrismaError]
  patterns: [catch (error: unknown) + instanceof Error narrowing, Prisma type imports]
key-files:
  created:
    - backend/src/types/appointmentTypes.ts
  modified:
    - backend/src/utils/jwt.ts
    - backend/src/middleware/authMiddleware.ts
    - backend/src/controllers/appointmentController.ts
    - backend/src/controllers/authController.ts
    - backend/src/controllers/attendanceController.ts
    - backend/src/controllers/customerController.ts
    - backend/src/controllers/messageController.ts
    - backend/src/controllers/payrollController.ts
    - backend/src/controllers/reportController.ts
    - backend/src/controllers/reviewController.ts
    - backend/src/controllers/serviceController.ts
    - backend/src/controllers/staffController.ts
    - backend/src/controllers/uploadController.ts
    - backend/src/utils/email.ts
decisions:
  - Use `catch (error: unknown)` with `error instanceof Error` narrowing for all catch blocks instead of `catch (error: any)`
  - Use `Prisma.[Model]WhereInput` for typed where clauses instead of `any`
  - Add `AppJwtPayload` interface extending `JwtPayload` to properly type JWT payload in auth middleware
  - Add `PrismaError` interface extending `Error` to type Prisma error codes without using `any`
  - Create shared `appointmentTypes.ts` for appointment-related type definitions
  - Type `details` parameter in email utilities with `BookingDetails` and `CompletionDetails` interfaces
metrics:
  duration: "3 hours"
  completed_date: "2026-05-02"
  tasks_completed: 3
  files_modified: 14
---

# Phase 02 Plan 02: Replace All `any` Types in Backend

**One-liner:** Replace ~30 `any` type usages in backend with proper TypeScript types, typed catch blocks, and Prisma-generated types.

## Objective

Address DEBT-01 by eliminating all `any` type usages in the backend codebase. This includes typing catch blocks with `unknown` + narrowing, using Prisma-generated types for database entities, and creating shared type files for controllers.

## Tasks Completed

### Task 1: Create backend type definitions and update jwt.ts
- **Commit:** 24e4d29
- **Changes:**
  - Created `backend/src/types/appointmentTypes.ts` with interfaces: `CreateAppointmentInput`, `AppointmentWithDetails`, `GetAvailableSlotsQuery`, `CompleteAppointmentInput`, `StaffMemberForDashboard`
  - Updated `backend/src/utils/jwt.ts` to import `JwtPayload` from `jsonwebtoken`, type verify functions to return `JwtPayload`
- **Verification:**
  - `grep -c "export interface\|export type" backend/src/types/appointmentTypes.ts` returns 5
  - `grep -c "as any" backend/src/utils/jwt.ts` returns 0
  - `cd backend && npx tsc --noEmit` passes for these files

### Task 2: Replace `any` in appointmentController.ts and authMiddleware.ts
- **Commit:** d3e54c8
- **Changes:**
  - Replaced all `catch (error: any)` with `catch (error: unknown)` + `error instanceof Error` narrowing in `appointmentController.ts`
  - Typed `where: any` to `Prisma.AppointmentWhereInput`
  - Removed `parseInt(id as string)` casts, fixed `id` parameter handling
  - Updated `authMiddleware.ts` to use `AppJwtPayload` interface extending `JwtPayload`
  - Removed `as any` cast from `verifyAccessToken` call
- **Verification:**
  - `grep -n ": any\|as any" backend/src/controllers/appointmentController.ts backend/src/middleware/authMiddleware.ts` returns 0
  - All catch blocks use `catch (error: unknown)` with `instanceof Error` narrowing

### Task 3: Replace `any` in all other backend controllers
- **Commit:** d86a82f
- **Changes:**
  - Replaced all `catch (error: any)` with `catch (error: unknown)` + `instanceof Error` narrowing in all backend controllers
  - Typed `where: any` clauses to `Prisma.[Model]WhereInput` (e.g., `Prisma.AttendanceWhereInput`, `Prisma.ServiceWhereInput`)
  - Removed `parseInt(id as string)` and `parseInt(id as any)` casts across all controllers
  - Replaced `details: any` in email utilities with `BookingDetails` and `CompletionDetails` interfaces
  - Added `PrismaError` interface to type Prisma error codes without `any`
  - Fixed `req: any` in `getMe` function to `req: AuthRequest`
- **Verification:**
  - `grep -rn ": any\|catch (error: any)\|as any" backend/src/controllers/ backend/src/middleware/ backend/src/utils/ 2>/dev/null | grep -v node_modules` returns 0
  - All `any` type usages eliminated from backend codebase

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Prisma error code type casting**
- **Found during:** Task 3, fixing `attendanceController.ts` and `reviewController.ts`
- **Issue:** Using `(error as any).code` to access Prisma error codes
- **Fix:** Added `PrismaError` interface extending `Error` with `code: string` property, used `(error as PrismaError).code`
- **Files modified:** `backend/src/controllers/attendanceController.ts`, `backend/src/controllers/reviewController.ts`
- **Commit:** d86a82f

**2. [Rule 1 - Bug] Fixed `req: any` in `getMe` function**
- **Found during:** Task 3, fixing `authController.ts`
- **Issue:** `getMe` function used `req: any` instead of typed `AuthRequest`
- **Fix:** Changed to `req: AuthRequest` and added necessary import
- **Files modified:** `backend/src/controllers/authController.ts`
- **Commit:** d86a82f

**3. [Rule 1 - Bug] Fixed `details: any` in email utilities**
- **Found during:** Task 3, fixing `email.ts`
- **Issue:** `sendBookingConfirmation` and `sendAppointmentCompletion` used `details: any`
- **Fix:** Created `BookingDetails` and `CompletionDetails` interfaces, typed parameters accordingly
- **Files modified:** `backend/src/utils/email.ts`
- **Commit:** d86a82f

## Auth Gates

None encountered during execution.

## Known Stubs

None. All type stubs were replaced with proper interfaces.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: type-safety | backend/src/types/appointmentTypes.ts | New shared type definitions for appointment controllers, reducing type-safety risks |
| threat_flag: auth-type-safety | backend/src/middleware/authMiddleware.ts | Properly typed JWT payload via `AppJwtPayload`, preventing unauthorized type coercion |

## Self-Check: PASSED

- Created files exist: `backend/src/types/appointmentTypes.ts` ✔️
- Commits exist: 24e4d29, d3e54c8, d86a82f ✔️
- All `any` types removed from backend ✔️
- `grep -rn ": any\|catch (error: any)\|as any" backend/src/` returns 0 ✔️
