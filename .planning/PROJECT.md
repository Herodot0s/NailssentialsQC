# NailssentialsQC

## Current Milestone: v2.0 Premium Experience & Expansion

**Goal:** Overhaul the entire UI/UX to match Airbnb's premium design system, while expanding the platform with a content CMS, advanced analytics, and expanded salon services.

**Target features:**
- Full UI/UX Overhaul using Airbnb DESIGN.md (clean white canvas, soft radii, Rausch accents) and the 'impeccable' skill.
- Nail Art Exhibit / Gallery Page.
- Comprehensive Manager CMS (CRUD for both business entities and website content like gallery/landing info).
- Advanced Manager Analytics (Revenue, retention, staff performance, detailed breakdowns).
- Service Packages/Bundles combining Nail, Spa, Hair, Waxing, and Threading services.

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

**Premium UI/UX Overhaul:**
- [ ] **UI-01**: Implement Airbnb DESIGN.md tokens (colors, typography, radii, spacing) across all components
- [ ] **UI-02**: Redesign customer landing page with Premium aesthetic
- [ ] **UI-03**: Redesign manager and staff dashboards for cleaner, softer UI

**Nail Art Exhibit:**
- [ ] **ART-01**: Add public gallery page for Nail Art Exhibits
- [ ] **ART-02**: Allow managers to upload and manage exhibit images and details

**Manager CMS & Analytics:**
- [ ] **CMS-01**: Add full CRUD for website content (landing info, policies, exhibit)
- [ ] **ANLY-01**: Add Advanced Analytics dashboard (retention, staff performance, detailed revenue)

**Service Expansion:**
- [ ] **SERV-01**: Add support for Service Packages/Bundles (combining Nail, Spa, Hair, etc.)

*(Existing active bugs, debt, security, and performance requirements remain active)*

**Bug Fixes:**
- [ ] **BUG-01**: Fix JSX syntax errors in Navbar.tsx dropdown menu
- [ ] **BUG-02**: Fix hardcoded password 'N/A' for walk-in customers
- [ ] **BUG-03**: Fix ManagerDashboard setState type mismatch
- [ ] **BUG-04**: Fix parseInt without NaN checks
- [ ] **BUG-05**: Fix staff schedule upsert logic

**Tech Debt:**
- [ ] **DEBT-01**: Replace `any` type with proper interfaces
- [ ] **DEBT-02**: Split ManagerDashboard.tsx into separate components
- [ ] **DEBT-03**: Split appointmentController.ts into separate modules
- [ ] **DEBT-04**: Add cursor-based pagination
- [ ] **DEBT-05**: Extract shared helpers
- [ ] **DEBT-06**: Add Zod schema validation
- [ ] **DEBT-07**: Debounce localStorage writes

**Security:**
- [ ] **SEC-01**: Remove JWT secret fallbacks
- [ ] **SEC-02**: Add password strength validation
- [ ] **SEC-03**: Add role-based permission checks for notifications
- [ ] **SEC-04**: Add rate limiting middleware
- [ ] **SEC-05**: Validate profile picture URLs
- [ ] **SEC-06**: Fix refresh token rotation race condition

**Performance:**
- [ ] **PERF-01**: Fix sequential awaits in payroll controller
- [ ] **PERF-02**: Fix N+1 query pattern in report controller
- [ ] **PERF-03**: Add database index on commission.commission_date
- [ ] **PERF-04**: Stream large file uploads
- [ ] **PERF-05**: Fix appointment completion flow

**Missing Features:**
- [ ] **FEAT-01**: Add audit trail (SystemLog entries)
- [ ] **FEAT-02**: Add data export/backup endpoint
- [ ] **FEAT-03**: Make sales target configurable

**Test Coverage:**
- [ ] **TEST-01**: Set up Jest + Supertest for backend
- [ ] **TEST-02**: Set up Vitest + React Testing Library for frontend
- [ ] **TEST-03**: Write unit tests for commission calculation
- [ ] **TEST-04**: Write integration tests for authentication
- [ ] **TEST-05**: Write integration tests for appointment completion
- [ ] **TEST-06**: Write integration tests for payroll generation
- [ ] **TEST-07**: Write component tests for critical pages
- [ ] **TEST-08**: Add npm audit to CI/CD pipeline

### Out of Scope

- [ ] **Payment gateway integration (Stripe, PayPal)** — Not required for v1, salon handles payments offline
- [ ] **SMS notification service** — Email and in-app notifications sufficient for now
- [ ] **Mobile app** — Web-first, mobile responsive is sufficient
- [ ] **Real-time chat** — Not core to salon operations
- [ ] **Video appointments** — Not applicable for nail salon
- [ ] **Multi-tenant / multi-location support** — Single salon deployment only
- [ ] **Switching from Nodemailer to SendGrid/Resend** — Current setup works
- [ ] **Switching from bcrypt to bcryptjs** — Current version stable

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

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-04 after milestone v2.0 start*
