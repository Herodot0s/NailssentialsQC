---
phase: 01
slug: critical-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None currently configured (Jest + Supertest for backend, Vitest + RTL for frontend per PROJECT.md) |
| **Config file** | None — Wave 0 installs |
| **Quick run command** | `cd backend && npx jest --testPathPattern="BUG-0[1-5]" --no-coverage` |
| **Full suite command** | `cd backend && npx jest --no-coverage && cd ../frontend && npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** `cd backend && npx jest --testPathPattern="[relevant]" --no-coverage`
- **After every plan wave:** `cd backend && npx jest --no-coverage && cd ../frontend && npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 | 01-01 | 1 | BUG-01 | — | Navbar DropdownMenu renders without JSX errors | manual/e2e | Visual inspection in browser | ❌ W0 | ⬜ pending |
| 01-02 | 01-02 | 1 | BUG-02 | — | Walk-in customer gets properly hashed password | unit | `jest tests/unit/appointmentController.test.ts -t "walk-in password"` | ❌ W0 | ⬜ pending |
| 01-03 | 01-03 | 1 | BUG-03 | — | ManagerDashboard activeView accepts only valid values | unit | `vitest tests/unit/ManagerDashboard.test.tsx -t "ActiveView type"` | ❌ W0 | ⬜ pending |
| 01-04 | 01-04 | 1 | BUG-04 | T-01 | Route params validated with Zod before controller | integration | `jest tests/integration/paramValidation.test.ts` | ❌ W0 | ⬜ pending |
| 01-05 | 01-05 | 1 | BUG-05 | — | Staff schedule upsert uses composite key correctly | integration | `jest tests/integration/staffSchedule.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/jest.config.js` — Jest configuration for backend tests
- [ ] `frontend/vitest.config.ts` — Vitest configuration for frontend tests
- [ ] `backend/tests/setup.ts` — Shared test setup (Prisma test client, etc.)
- [ ] `frontend/tests/setup.ts` — Shared test setup (React Testing Library)
- [ ] Install test dependencies: `cd backend && npm install --save-dev jest @types/jest ts-jest supertest @types/supertest`
- [ ] Install test dependencies: `cd frontend && npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom`

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Navbar.tsx DropdownMenu renders without JSX errors | BUG-01 | Requires browser rendering verification | Open application, click dropdown menu, verify no console errors |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-05-02
