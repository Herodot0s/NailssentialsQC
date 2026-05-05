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

**Completed V1 Tasks (Phases 1-7):**
- ✓ **Bug Fixes:** Fix JSX syntax errors in Navbar, hardcoded passwords, type mismatches, and schedule upsert logic
- ✓ **Tech Debt:** Replace `any` types, split components/controllers, add cursor-based pagination, extract helpers, add Zod schema, debounce localStorage
- ✓ **Security:** Remove JWT secret fallbacks, add password strength validation, role-based permission checks, rate limiting, URL validation, fix refresh token rotation
- ✓ **Performance:** Fix sequential awaits, N+1 query patterns, add DB index, stream large file uploads, fix appointment completion flow
- ✓ **Missing Features:** Add audit trail, data export/backup endpoint, configurable sales target
- ✓ **Test Coverage:** Setup Jest+Supertest for backend, Vitest+RTL for frontend, add unit/integration/component tests, add npm audit

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
