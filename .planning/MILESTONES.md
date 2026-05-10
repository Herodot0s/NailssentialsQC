# Milestones: NailssentialsQC

This file tracks all shipped milestones with key stats, accomplishments, and links to archived details.

---

## v2.0 — Premium Experience & Expansion

**Shipped:** 2026-05-10
**Phases:** 7 (6 complete, 1 partial)
**Plans:** 28 total (25 complete, 3 deferred to v2.1)
**Status:** ✅ SHIPPED

**Git range:** `0d111c3` → `3adc758`
**Timeline:** ~7 days (2026-05-04 → 2026-05-10)

### Key Accomplishments

1. **Premium UI Foundations** — Rausch (#FF385C) brand color, organic radii (32px/12px/8px), framer-motion page transitions (PageTransition, AnimatedCard), Vitest testing environment
2. **Public Nail Art Exhibit Gallery** — Vercel Blob storage, manager drag-and-drop upload, masonry layout, detail view modal
3. **Manager & Staff Dashboard Overhaul** — Categorized sidebar, mobile-responsive staff dashboard, attendance tracking cards, dossier calendar
4. **Full Marketing CMS** — Manager CRUD for landing page hero text, contact info, policies, FAQ with React Query caching
5. **Service Packages & Bundling** — PackageBuilderDialog for managers, CartPackageItem for customers, commission logic preserves catalog prices while billing package price
6. **Advanced Analytics Dashboard** — Revenue (stacked bar + line charts), Staff (leaderboard with gold/silver/bronze), Retention (60-day repeat rate, donut chart)
7. **Photography-First Landing Page** — Playfair Display typography, Trending Treatments grid, Hero section with Unsplash imagery

### Known Gaps

- Phase 2 (Customer Journey Redesign): 3 of 4 plans not executed (02-02, 02-03, 02-04 deferred to v2.1)
- UI-02 booking flow redesign incomplete (deferred to v2.1)

### Archives

- [milestones/v2.0-ROADMAP.md](./milestones/v2.0-ROADMAP.md) — Full phase details, decisions, tech debt
- [milestones/v2.0-REQUIREMENTS.md](./milestones/v2.0-REQUIREMENTS.md) — Requirements traceability with final status

### Tag

`git tag -a v2.0 -m "v2.0 Premium Experience & Expansion
..."`

---

## v1.0 — MVP

**Shipped:** 2026-05-04
**Phases:** 7 (V1-1 through V1-7)
**Plans:** 34 total
**Status:** ✅ SHIPPED

### Key Accomplishments

1. **Critical Bug Fixes** — JSX errors, hardcoded passwords, type mismatches, schedule upsert logic
2. **Type Safety & Code Quality** — No `any` types, split ManagerDashboard, split appointmentController
3. **Security Hardening** — JWT fail-fast, password strength, RBAC, rate limiting, URL validation, refresh token rotation
4. **Performance** — Promise.all payroll, batched service queries, DB indexes, streamed uploads, Prisma transactions
5. **Missing Features** — Audit trail, data export, configurable sales target
6. **Test Infrastructure** — Jest + Supertest backend, Vitest + RTL frontend

### Archives

- Archived in individual quick task directories under `.planning/quick/`

---

_Next: Start v2.1 with `/gsd-new-milestone`_