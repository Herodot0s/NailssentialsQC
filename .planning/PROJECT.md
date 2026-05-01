# NailssentialsQC

## What This Is

NailssentialsQC is a nail salon management system built with React 19, Express.js, and PostgreSQL (via Prisma ORM). It serves three user types — customers (booking, profiles), staff (clock in/out, commissions), and managers (payroll, reports, staff management) — with a full-featured web application. The system is operational but requires comprehensive bug fixes, tech debt cleanup, security hardening, and full test coverage to be production-ready.

## Core Value

A reliable, bug-free salon management system that customers, staff, and managers can trust for daily operations — with verified correctness through full test coverage.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ User registration and login (JWT auth with access/refresh tokens) — existing
- ✓ Role-based access control (customer, staff, manager) — existing
- ✓ Appointment booking with service items — existing
- ✓ Staff clock in/out with attendance tracking — existing
- ✓ Commission calculation on appointment completion — existing
- ✓ Payroll generation and period management — existing
- ✓ Manager dashboard with reports and analytics — existing
- ✓ Profile management with picture uploads (Vercel Blob) — existing
- ✓ Notification system (in-app) — existing
- ✓ Email notifications for bookings and completions — existing
- ✓ Service catalog with categories — existing

### Active

<!-- Current scope. Building toward these. -->

**Bug Fixes:**
- [ ] **BUG-01**: Fix JSX syntax errors in Navbar.tsx dropdown menu (missing closing tags on DropdownMenuItem)
- [ ] **BUG-02**: Fix hardcoded password 'N/A' for walk-in customers (generate random password or prevent login)
- [ ] **BUG-03**: Fix ManagerDashboard setState type mismatch (replace `as any` cast with proper union type)
- [ ] **BUG-04**: Fix parseInt without NaN checks on route params across all controllers
- [ ] **BUG-05**: Fix staff schedule upsert logic using `s.id || -1` (never matches for new schedules)

**Tech Debt:**
- [ ] **DEBT-01**: Replace `any` type with proper interfaces across frontend (50+ occurrences) and backend
- [ ] **DEBT-02**: Split ManagerDashboard.tsx (1224 lines) into separate components (StaffTable, PayrollTable, AttendanceLedger, ReviewModeration)
- [ ] **DEBT-03**: Split appointmentController.ts (527 lines) into separate modules
- [ ] **DEBT-04**: Add cursor-based pagination to all list endpoints (appointments, staff, payroll periods)
- [ ] **DEBT-05**: Extract duplicate auth checks, error responses, and notification patterns into shared helpers
- [ ] **DEBT-06**: Add Zod schema validation to all API endpoints (replace express-validator or add Zod)
- [ ] **DEBT-07**: Debounce localStorage writes in AuthContext and CartContext

**Security:**
- [ ] **SEC-01**: Remove JWT secret fallbacks, fail fast if env vars not set
- [ ] **SEC-02**: Add password strength validation during registration
- [ ] **SEC-03**: Add role-based permission checks for notification creation
- [ ] **SEC-04**: Add rate limiting middleware to auth endpoints (express-rate-limit)
- [ ] **SEC-05**: Validate profile picture URLs against allowlist to prevent stored XSS
- [ ] **SEC-06**: Fix refresh token rotation race condition (create new before deleting old)

**Performance:**
- [ ] **PERF-01**: Fix sequential awaits in payroll controller (use Promise.all for independent queries)
- [ ] **PERF-02**: Fix N+1 query pattern in report controller (batch fetch services)
- [ ] **PERF-03**: Add database index on commission.commission_date for unpaid records
- [ ] **PERF-04**: Stream large file uploads instead of loading into memory
- [ ] **PERF-05**: Fix appointment completion flow (wrap in single Prisma transaction, handle email failures gracefully)

**Missing Features:**
- [ ] **FEAT-01**: Add audit trail (SystemLog entries) for all sensitive operations (payroll, staff updates, commission changes)
- [ ] **FEAT-02**: Add data export/backup endpoint (CSV/Excel for payroll data)
- [ ] **FEAT-03**: Make sales target configurable via database or env var (remove hardcoded 8000)

**Test Coverage:**
- [ ] **TEST-01**: Set up Jest + Supertest for backend with 80% line coverage minimum
- [ ] **TEST-02**: Set up Vitest + React Testing Library for frontend with 70% line coverage minimum
- [ ] **TEST-03**: Write unit tests for commission calculation logic (tiered rates, specialty quota)
- [ ] **TEST-04**: Write integration tests for authentication flows (register, login, refresh, logout)
- [ ] **TEST-05**: Write integration tests for appointment creation and completion
- [ ] **TEST-06**: Write integration tests for payroll generation and period locking
- [ ] **TEST-07**: Write component tests for critical pages (Login, Booking, ManagerDashboard, StaffDashboard)
- [ ] **TEST-08**: Add npm audit to CI/CD pipeline

### Out of Scope

- [ ] **Payment gateway integration (Stripe, PayPal)** — Not required for v1, salon handles payments offline
- [ ] **SMS notification service** — Email and in-app notifications sufficient for now
- [ ] **Mobile app** — Web-first, mobile responsive is sufficient
- [ ] **Real-time chat** — Not core to salon operations
- [ ] **Video appointments** — Not applicable for nail salon
- [ ] **Multi-tenant / multi-location support** — Single salon deployment only
- [ ] **Switching from Nodemailer to SendGrid/Resend** — Current setup works, deferral to future
- [ ] **Switching from bcrypt to bcryptjs** — Current version stable, no pressing need

## Context

**Existing Codebase (Brownfield):**
- Built with React 19 + Vite (frontend), Express.js + TypeScript (backend), Prisma + PostgreSQL (database)
- Docker Compose setup for local development, Vercel deployment target
- UI components from Radix UI, Base UI, and shadcn with Tailwind CSS
- Codebase mapped on 2026-05-01 with full architecture, stack, conventions, concerns, and testing docs in `.planning/codebase/`
- 30+ documented concerns across bugs, tech debt, security, performance, and missing features

**Timeline:**
- 1-2 weeks to complete all fixes and achieve production-ready state

**Approach:**
- Parallel tracks: fix bugs, clear tech debt, add tests, and harden security simultaneously
- All user types (customers, staff, managers) must have a perfect experience
- No active fires — proactive comprehensive improvement

**Known Issues to Address:**
- JSX rendering errors in Navbar dropdown
- Hardcoded secrets and passwords
- Zero test coverage
- Extensive `any` type usage
- Large files exceeding maintainability thresholds
- No pagination on list endpoints
- Multiple security gaps (rate limiting, validation, authorization checks)

## Constraints

- **Timeline**: 1-2 weeks for all fixes and test coverage
- **Tech stack**: Must maintain existing stack (React 19, Express.js, Prisma, PostgreSQL)
- **Compatibility**: All fixes must not break existing functionality for any user type
- **Coverage targets**: Backend 80%, frontend 70%, critical paths (auth, payroll) 90%
- **Deployment**: Vercel (frontend + serverless backend), Docker Compose for local dev

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Parallel fix approach | 1-2 week timeline requires simultaneous work on bugs, debt, tests, security | — Pending |
| Keep existing tech stack | No time for migrations, system is operational | — Pending |
| Zod for validation | Modern, TypeScript-first, replaces express-validator incrementally | — Pending |
| Jest + Supertest (backend), Vitest + RTL (frontend) | Recommended by codebase testing analysis, matches existing patterns | — Pending |

---
*Last updated: 2026-05-02 after initialization*
