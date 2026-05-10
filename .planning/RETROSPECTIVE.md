# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v2.0 — Premium Experience & Expansion

**Shipped:** 2026-05-10
**Phases:** 7 (6 complete, 1 partial) | **Plans:** 28 (25 complete, 3 deferred) | **Sessions:** ~7

### What Was Built
- Premium UI/UX design system (Rausch #FF385C palette, organic radii 32px/12px/8px, framer-motion transitions)
- Public Nail Art Exhibit gallery with Vercel Blob storage and masonry layout
- Manager & Staff dashboard overhaul with categorized sidebar, mobile-responsive staff views, attendance cards
- Full Marketing CMS (landing page hero, contact info, policies, FAQ) with React Query caching
- Service Packages & Bundling (create, book, commission with fair catalog-price preservation)
- Advanced Analytics Dashboard (revenue charts, staff leaderboard with bronze/silver/gold, retention donut)
- Photography-first landing page with Playfair Display typography and Trending Treatments grid

### What Worked
- Phase parallelization — 4-phase wave execution kept momentum
- Vercel Blob integration straightforward for gallery uploads
- Phase 6 (Packages) cross-phase dependencies (Phase 2, Phase 4) resolved cleanly with clear API contracts
- Phase 5 (CMS) React Query 10-min stale time balanced performance vs freshness

### What Was Inefficient
- Phase 2 (Customer Journey Redesign) planning created 4 plans but only 1 was executed — 3 became tech debt
- Phase 1 generated 4 plans instead of consolidating into fewer, larger waves
- Some plans had minimal actual work (3-5 min) but full ceremony overhead (SUMMARY, UAT, etc.)
- Phase dependencies were more complex than needed — Phase 6 depended on Phase 2 but Phase 2 was the incomplete one

### Patterns Established
- Rausch (#FF385C) as primary brand color — replaces Terracotta Brown
- Organic radii system (32px containers, 12px utility, 8px data) as premium standard
- Package transaction amount override at completion — bill package price, preserve catalog prices for commission fairness
- React Query with 10-min stale time for public CMS content
- Phase plans with 3 waves (Foundation → Core → Integration) as default structure

### Key Lessons
1. Phase planning should reflect actual capacity — don't create 4 plans if 1 can cover the work
2. Cross-phase dependencies need explicit "blocked by" status tracking in STATE.md
3. REQUIREMENTS.md should be updated in real-time, not at milestone close (discrepancies between PKG-02/PKG-03 status and actual completion)
4. Phase 2 remaining work (02-02/02-03/02-04) should have been flagged as deferred much earlier — once 02-01 shipped, the gap was obvious

### Cost Observations
- Model mix: primarily Opus 4 with Sonnet 4.6 for frontend-specific tasks
- Sessions: ~7 active sessions over 7 days (2026-05-04 → 2026-05-10)
- Notable: Phase 2 incomplete — the 3 remaining plans represent ~30% of the phase's intended scope, now deferred to v2.1

---

## v1.0 — MVP

**Shipped:** 2026-05-04
**Phases:** 7 (V1-1 through V1-7) | **Plans:** 34

### What Was Built
- Critical bug fixes (JSX errors, hardcoded passwords, type mismatches, schedule upsert)
- Type safety (no `any` types, split components)
- Security hardening (JWT fail-fast, RBAC, rate limiting, refresh token rotation)
- Performance optimization (Promise.all, batched queries, DB indexes, Prisma transactions)
- Missing features (audit trail, data export, configurable sales target)
- Test infrastructure (Jest+Supertest backend, Vitest+RTL frontend)

### What Worked
- Parallel fix tracks maintained momentum across bugs, debt, security, tests simultaneously
- Quick task system (`.planning/quick/`) captured small fixes without derailing phase execution

### What Was Inefficient
- Phases 4-7 plans showed 0/3, 0/5, 0/3, 0/5 progress — likely the ROADMAP was already outdated when read at session start

### Key Lessons
1. Quick tasks are valuable for capturing small work without derailing phases
2. Phase plans should have explicit verification criteria per task
3. Security and performance fixes are easier to verify than UI changes (compile passes vs "looks good")

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~5 | 7 | Parallel fix tracks (bugs, debt, security, tests simultaneously) |
| v2.0 | ~7 | 7 | Phase waves (Foundation → Core → Integration), quick tasks for capture |

### Top Lessons (Verified Across Milestones)

1. **Quick task capture** — Small fixes should be captured immediately in `.planning/quick/` rather than blocking phase execution
2. **Phase scope discipline** — Don't create plans that won't be executed; consolidate into fewer, larger executions
3. **Real-time requirements tracking** — Update REQUIREMENTS.md as work completes, not at milestone close
4. **Cross-phase dependencies** — Need explicit "blocked by" status, not just "depends on" in the plan