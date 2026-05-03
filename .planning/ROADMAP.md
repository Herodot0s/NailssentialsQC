# Roadmap: NailssentialsQC

## Overview

NailssentialsQC is a production-ready nail salon management system that needs comprehensive bug fixes, tech debt cleanup, security hardening, performance optimization, missing features, and full test coverage within 1-2 weeks. This roadmap maps 34 active requirements into 10 phases that transform the operational but imperfect system into a reliable, trustworthy platform for customers, staff, and managers.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Critical Bug Fixes** - Fix all critical bugs preventing normal operation (JSX errors, hardcoded passwords, type mismatches, parseInt errors, schedule upsert)
- [x] **Phase 2: Type Safety & Code Quality** - Replace any types with proper interfaces and split large files into manageable components
- [x] **Phase 3: Security Hardening** - Address JWT secrets, password validation, authorization checks, rate limiting, XSS prevention, and token rotation
- [ ] **Phase 4: API Improvements** - Add pagination, extract duplicate code, and implement Zod validation
- [ ] **Phase 5: Performance Optimization** - Fix sequential awaits, N+1 queries, missing indexes, memory issues, and transaction handling
- [ ] **Phase 6: Missing Features** - Add audit trail, data export, and configurable sales targets
- [ ] **Phase 7: Backend Test Infrastructure** - Set up Jest + Supertest and achieve 80% backend coverage
- [ ] **Phase 8: Frontend Test Infrastructure** - Set up Vitest + RTL and achieve 70% frontend coverage
- [ ] **Phase 9: Integration Tests for Critical Paths** - Add end-to-end tests for booking, payroll, and auth flows
- [ ] **Phase 10: Cleanup & Verification** - Add npm audit to CI/CD and final production readiness verification

## Phase Details

### Phase 1: Critical Bug Fixes
**Goal**: Fix all critical bugs that prevent normal operation for all user types
**Depends on**: Nothing (first phase)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05
**Success Criteria** (what must be TRUE):
  1. Navbar dropdown menu renders correctly without JSX syntax errors
  2. Walk-in customers cannot authenticate with hardcoded passwords
  3. ManagerDashboard view state changes work without type errors
  4. API endpoints return 400 for non-numeric IDs instead of 500 errors
  5. Staff schedules can be created and updated correctly via upsert
**Plans**: 5 plans

Plans:
- [x] 01-01: Fix JSX syntax errors in Navbar.tsx dropdown menu (render prop, closing tags)
- [x] 01-02: Fix hardcoded password 'N/A' for walk-in customers (generate random or prevent login)
- [x] 01-03: Fix ManagerDashboard setState type mismatch (replace `as any` with union type)
- [x] 01-04: Fix parseInt without NaN checks on route params across all controllers
- [x] 01-05: Fix staff schedule upsert logic (replace `s.id || -1` with proper key matching)

**UI hint**: yes

### Phase 2: Type Safety & Code Quality
**Goal**: Eliminate any types and reduce large file complexity for maintainability
**Depends on**: Phase 1
**Requirements**: DEBT-01, DEBT-02, DEBT-03
**Success Criteria** (what must be TRUE):
  1. Frontend has no `any` type usage (eslint passes clean)
  2. ManagerDashboard.tsx is split into manageable components under 400 lines each
  3. appointmentController.ts is split into separate modules by responsibility
  4. TypeScript compilation passes without errors across entire project
**Plans**: 4 plans

Plans:

**Wave 1** *(parallel, no dependencies)*
- [x] 02-01: Replace `any` type with proper interfaces across frontend (50+ occurrences)
- [x] 02-02: Replace `any` type with proper interfaces in backend controllers

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-03: Split ManagerDashboard.tsx into StaffTable, PayrollTable, AttendanceLedger, ReviewModeration
- [x] 02-04: Split appointmentController.ts into booking, completion, and availability modules

**Cross-cutting constraints:**
- `must_haves.truths`: Frontend has no `any` type usage (DEBT-01), backend controllers have no `any` type (DEBT-01), ManagerDashboard.tsx under 700 lines (DEBT-02), appointmentController.ts under 200 lines (DEBT-03)
- `must_haves.key_links`: `frontend/src/types/api.ts` shared across 02-01/02-03, `backend/src/types/appointmentTypes.ts` shared across 02-02/02-04
- `must_haves.artifacts`: `frontend/src/components/dashboard/types.ts` (02-03), `frontend/src/types/User.ts` (02-01), `backend/src/types/appointmentTypes.ts` (02-02)

**UI hint**: yes

### Phase 3: Security Hardening
**Goal**: Address all security vulnerabilities to protect user data and prevent attacks
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):
  1. Server fails to start if JWT secrets are not set (no fallback defaults)
  2. Users cannot register with weak passwords (min length, complexity enforced)
  3. Only managers can create notifications for other users (role-based checks)
  4. Auth endpoints have rate limiting (max 5 attempts per 15 minutes per IP)
  5. Profile picture URLs are validated against allowlist to prevent stored XSS
  6. Refresh token rotation works without race conditions (create before delete)
**Plans**: 6 plans

Plans:
- [x] 03-01: Remove JWT secret fallbacks, fail fast on missing env vars
- [x] 03-02: Add password strength validation during registration (min 8 chars, mixed case, numbers)
- [x] 03-03: Add role-based permission checks for notification creation endpoint
- [x] 03-04: Add rate limiting middleware to auth endpoints using express-rate-limit
- [x] 03-05: Validate profile picture URLs against allowlist (Vercel Blob + configured CDN)
- [x] 03-06: Fix refresh token rotation race condition (create new before deleting old)

### Phase 4: API Improvements
**Goal**: Improve API reliability, consistency, and usability with pagination and validation
**Depends on**: Phase 3
**Requirements**: DEBT-04, DEBT-05, DEBT-06
**Success Criteria** (what must be TRUE):
  1. All list endpoints (appointments, staff, payroll periods) support cursor-based pagination
  2. Duplicate auth checks, error responses, and notification patterns extracted into shared helpers
  3. All API endpoints validate input with Zod schemas (replace express-validator)
  4. API returns consistent, typed error responses across all endpoints
**Plans**: 3 plans

Plans:
- [x] 04-01: Add cursor-based pagination to all list endpoints (appointments, staff, payroll)
- [x] 04-02: Extract duplicate auth checks, error responses, and notification patterns into shared helpers
- [x] 04-03: Add Zod schema validation to all API endpoints (replace express-validator)

### Phase 5: Performance Optimization
**Goal**: Fix performance bottlenecks for scalability and responsiveness
**Depends on**: Phase 4
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. Payroll generation uses Promise.all for independent queries (not sequential awaits)
  2. Report controller fetches all services in one query (no N+1 pattern)
  3. Database has index on commission.commission_date for unpaid records
  4. Large file uploads are streamed instead of loading entire file into memory
  5. Appointment completion is wrapped in a single Prisma transaction with graceful email failure handling
**Plans**: 5 plans

Plans:
- [ ] 05-01: Fix sequential awaits in payroll controller (use Promise.all for independent queries)
- [ ] 05-02: Fix N+1 query pattern in report controller (batch fetch services)
- [ ] 05-03: Add database index on commission.commission_date for unpaid records
- [ ] 05-04: Stream large file uploads instead of loading into memory as base64
- [ ] 05-05: Fix appointment completion flow (wrap in single Prisma transaction, handle email failures)

### Phase 6: Missing Features
**Goal**: Add critical missing features for compliance and operations
**Depends on**: Phase 3, Phase 5
**Requirements**: FEAT-01, FEAT-02, FEAT-03
**Success Criteria** (what must be TRUE):
  1. All sensitive operations (payroll, staff updates, commission changes) create SystemLog entries
  2. Managers can export payroll data as CSV/Excel via dedicated endpoint
  3. Sales target is configurable via database
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Schema Updates & Configurable Target
- [ ] 06-02-PLAN.md — System Audit Trail
- [ ] 06-03-PLAN.md — Excel Payroll Export

### Phase 7: Backend Test Infrastructure
**Goal**: Set up backend testing framework and achieve 80% line coverage
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6
**Requirements**: TEST-01, TEST-03, TEST-04, TEST-05, TEST-06
**Success Criteria** (what must be TRUE):
  1. Jest + Supertest is configured and running for backend tests
  2. Commission calculation logic has unit tests covering all tier boundaries and specialty quotas
  3. Authentication flows (register, login, refresh, logout) have integration tests
  4. Appointment creation and completion flows have integration tests
  5. Payroll generation and period locking have integration tests
  6. Backend achieves 80% line coverage overall, 90% for critical paths
**Plans**: 5 plans

Plans:
- [ ] 07-01: Set up Jest + Supertest for backend with configuration and test helpers
- [ ] 07-02: Write unit tests for commission calculation logic (tiered rates, specialty quota)
- [ ] 07-03: Write integration tests for authentication flows (register, login, refresh, logout)
- [ ] 07-04: Write integration tests for appointment creation and completion
- [ ] 07-05: Write integration tests for payroll generation and period locking

### Phase 8: Frontend Test Infrastructure
**Goal**: Set up frontend testing framework and achieve 70% line coverage
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6
**Requirements**: TEST-02, TEST-07, DEBT-07
**Success Criteria** (what must be TRUE):
  1. Vitest + React Testing Library is configured and running for frontend tests
  2. Critical pages (Login, Booking, ManagerDashboard, StaffDashboard) have component tests
  3. AuthContext and CartContext localStorage writes are debounced
  4. Frontend achieves 70% line coverage overall, 90% for critical paths
**Plans**: 3 plans

Plans:
- [ ] 08-01: Set up Vitest + React Testing Library for frontend with configuration
- [ ] 08-02: Write component tests for critical pages (Login, Booking, ManagerDashboard, StaffDashboard)
- [ ] 08-03: Debounce localStorage writes in AuthContext and CartContext

**UI hint**: yes

### Phase 9: Integration Tests for Critical Paths
**Goal**: Add end-to-end integration tests for critical business flows
**Depends on**: Phase 7, Phase 8
**Requirements**: (Builds on TEST-04, TEST-05, TEST-06 with full-stack integration)
**Success Criteria** (what must be TRUE):
  1. Complete booking flow test passes (login -> search availability -> book -> complete -> review)
  2. Payroll generation flow test passes (generate payroll -> lock period -> export data)
  3. Staff operations flow test passes (clock in -> view schedule -> view commissions)
  4. Auth security flow test passes (rate limiting -> lockout -> password validation)
  5. Critical paths have 90% test coverage across frontend and backend
**Plans**: 5 plans

Plans:
- [ ] 09-01: Write end-to-end booking flow integration test (login to review)
- [ ] 09-02: Write payroll generation and locking integration test
- [ ] 09-03: Write staff operations integration test (clock in/out, commissions)
- [ ] 09-04: Write auth security integration test (rate limiting, lockout)
- [ ] 09-05: Verify 90% coverage on critical paths (auth, payroll, appointments)

### Phase 10: Cleanup & Verification
**Goal**: Final production readiness verification and CI/CD cleanup
**Depends on**: Phase 7, Phase 8, Phase 9
**Requirements**: TEST-08
**Success Criteria** (what must be TRUE):
  1. npm audit runs clean (or known issues documented) in CI/CD pipeline
  2. All phases pass verification with no regressions
  3. System is production-ready for all user types (customers, staff, managers)
  4. Documentation reflects final state of system
**Plans**: 2 plans

Plans:
- [ ] 10-01: Add npm audit to CI/CD pipeline with failure thresholds
- [ ] 10-02: Final production readiness verification (all tests pass, all phases complete)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Critical Bug Fixes | 5/5 | Complete | 2026-05-02 |
| 2. Type Safety & Code Quality | 4/4 | Complete | 2026-05-02 |
| 3. Security Hardening | 6/6 | Complete | 2026-05-03 |
| 4. API Improvements | 0/3 | Not started | - |
| 5. Performance Optimization | 0/5 | Not started | - |
| 6. Missing Features | 0/3 | Not started | - |
| 7. Backend Test Infrastructure | 0/5 | Not started | - |
| 8. Frontend Test Infrastructure | 0/3 | Not started | - |
| 9. Integration Tests for Critical Paths | 0/5 | Not started | - |
| 10. Cleanup & Verification | 0/2 | Not started | - |