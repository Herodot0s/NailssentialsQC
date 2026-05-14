# NailssentialsQC

## Current Milestone: v2.1 Advanced Payroll & Export System

**Goal:** Overhaul the payroll system for weekly payout cycles, featuring dynamic commission rates, detailed deductions, PDF payslips for staff, and Excel master reports for managers.

**Target features:**
- Weekly payroll generation and payout tracking.
- Dynamic, manager-editable base commission rates.
- Categorized deduction management (Cash Advance, Loan, Uniform, Reloan, Lates/Early Out).
- PDF generation for individual staff payslips.
- Excel generation for Manager's master payroll view, formatted precisely like the spreadsheet.
- Easy-to-navigate Manager UI to finalize and review payroll before export.

## What This Is

NailssentialsQC is a nail salon management system built with React 19, Express.js, and PostgreSQL (via Prisma ORM). It serves three user types — customers (booking, profiles), staff (clock in/out, commissions), and managers (payroll, reports, staff management) — with a full-featured web application. The system is operational but requires comprehensive bug fixes, tech debt cleanup, security hardening, and full test coverage to be production-ready.

## Core Value

A reliable, bug-free salon management system that customers, staff, and managers can trust for daily operations — with verified correctness through full test coverage.

## Requirements

### Validated

<!-- v1.0 milestone (shipped and confirmed valuable). -->
- ✓ User registration and login (JWT auth with access/refresh tokens) — v1.0
- ✓ Role-based access control (customer, staff, manager) — v1.0
- ✓ Appointment booking with service items — v1.0
- ✓ Staff clock in/out with attendance tracking — v1.0
- ✓ Commission calculation on appointment completion — v1.0
- ✓ Payroll generation and period management — v1.0
- ✓ Manager dashboard with reports and analytics — v1.0
- ✓ Profile management with picture uploads (Vercel Blob) — v1.0
- ✓ Notification system (in-app and email) — v1.0
- ✓ Service catalog with categories — v1.0
- ✓ Bug fixes (JSX errors, hardcoded passwords, type mismatches, schedule upsert) — v1.0
- ✓ Security hardening (JWT secrets, password strength, RBAC, rate limiting) — v1.0
- ✓ Test infrastructure (Jest + Supertest backend, Vitest + RTL frontend) — v1.0

<!-- v2.0 milestone (shipped 2026-05-10). -->
- ✓ **UI-04**: Smooth transitions using framer-motion — v2.0
- ✓ **UI-03**: Redesign Manager & Staff Dashboards — v2.0
- ✓ **CMS-01**: Public gallery page for Nail Art Exhibits — v2.0
- ✓ **CMS-02**: Manager CRUD for uploading exhibit images (Vercel Blob) — v2.0
- ✓ **CMS-03**: Manager CRUD for landing page content/policies — v2.0
- ✓ **ANLY-01**: Revenue Dash charts (stacked bar, line) — v2.0
- ✓ **ANLY-02**: Staff Analytics (leaderboard, performance metrics) — v2.0
- ✓ **ANLY-03**: Retention Analytics (cohort analysis, donut chart) — v2.0
- ✓ **PKG-01**: Managers can create fixed service bundles — v2.0
- ✓ **PKG-02**: Customers can book a service package — v2.0
- ✓ **PKG-03**: Commission logic handles package redemption — v2.0

### Active

<!-- Currently building toward these. -->

**Payroll System (v2.1):**
- [ ] **PAY-01**: Update database schema for deductions and base commission rates
- [ ] **PAY-02**: Implement weekly payroll generation and payout logic
- [ ] **PAY-03**: Build PDF generation for Staff payslips
- [ ] **PAY-04**: Build Excel generation for Manager master payroll export
- [ ] **PAY-05**: Develop Manager UI for editing commissions, managing deductions, and finalizing payroll

**Deferred (v2.2 Planning):**
- [ ] Complete Phase 2 remaining plans (02-02, 02-03, 02-04) for full booking flow redesign

### Out of Scope

| Feature | Reason |
|---------|--------|
| Payment gateway integration (Stripe, PayPal) | Salon handles payments offline |
| Multi-Staff Packages | Extreme scheduling complexity; deferred for v3+ |
| Real-time chat | Not core to salon operations |
| Multi-tenant / multi-location support | Single salon deployment only |
| Switch from Nodemailer to SendGrid/Resend | Current setup works |
| Switch from bcrypt to bcryptjs | Current version stable |

## Context

**v2.0 Shipped (2026-05-10):**
- Premium UI/UX foundation (Rausch palette, organic radii, framer-motion)
- Public Nail Art Exhibit gallery with Vercel Blob storage
- Manager CMS (landing page content, policies, FAQ)
- Manager & Staff dashboard overhaul with categorized sidebar
- Advanced Analytics Dashboard (revenue, staff performance, retention)
- Service Packages & Bundling (create, book, commission)
- Photography-first landing page with Trending Treatments

**v1.0 Baseline:**
- Built with React 19 + Vite (frontend), Express.js + TypeScript (backend), Prisma + PostgreSQL
- Docker Compose for local development, Vercel deployment target
- UI components from Radix UI, Base UI, and shadcn with Tailwind CSS

**Known Technical Debt:**
- Phase 2 remaining plans (02-02, 02-03, 02-04) deferred to v2.1 — booking flow redesign incomplete
- UI-01 discrepancy: design tokens applied but not formally closed in requirements

## Constraints

- **Timeline**: 1-2 weeks for all fixes and test coverage
- **Tech stack**: Must maintain existing stack (React 19, Express.js, Prisma, PostgreSQL)
- **Compatibility**: All fixes must not break existing functionality for any user type
- **Coverage targets**: Backend 80%, frontend 70%, critical paths (auth, payroll) 90%
- **Deployment**: Vercel (frontend + serverless backend), Docker Compose for local dev

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rausch (#FF385C) as primary brand color | More vibrant, modern Airbnb-inspired palette | ✅ Shipped in v2.0, replaces Terracotta |
| Organic radii system (32px/12px/8px) | Premium boutique aesthetic | ✅ Shipped in v2.0 |
| framer-motion for transitions | Premium feel with minimal overhead | ✅ Shipped in v2.0, PageTransition + AnimatedCard |
| React Query for CMS content (10-min stale) | Performance + simplicity for rarely-changing content | ✅ Shipped in v2.0 |
| Service package transaction amount override | Bill customer package price, preserve catalog prices for commission | ✅ Shipped in v2.0 |
| Keep existing tech stack | No time for migrations, system operational | ✅ Confirmed v2.0 — no migrations needed |
| Zod for validation | Modern, TypeScript-first | ⚠️ Partially adopted — express-validator still in use |
| Jest + Supertest (backend), Vitest + RTL (frontend) | Matches existing patterns | ⚠️ Infrastructure exists, coverage still being built |

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
*Last updated: 2026-05-14 starting v2.1 milestone*
