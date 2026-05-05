---
phase: 6
slug: service-packages-bundling
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (frontend), jest 29.x (backend) |
| **Config file** | `frontend/vitest.config.ts`, `backend/jest.config.ts` |
| **Quick run command** | `cd backend && npx tsc --noEmit` |
| **Full suite command** | `cd backend && npm test && cd ../frontend && npx tsc --noEmit` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` in affected workspace
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 06-01-01 | 01 | 1 | PKG-01 | type-check | `cd backend && npx tsc --noEmit` | ○ pending |
| 06-01-02 | 01 | 1 | PKG-01 | schema | `cd backend && npx prisma validate` | ○ pending |
| 06-02-01 | 02 | 2 | PKG-01 | type-check | `cd backend && npx tsc --noEmit` | ○ pending |
| 06-02-02 | 02 | 2 | PKG-01 | type-check | `cd frontend && npx tsc --noEmit` | ○ pending |
| 06-03-01 | 03 | 2 | PKG-01 | type-check | `cd frontend && npx tsc --noEmit` | ○ pending |
| 06-04-01 | 04 | 3 | PKG-02 | type-check | `cd frontend && npx tsc --noEmit` | ○ pending |
| 06-05-01 | 05 | 3 | PKG-02, PKG-03 | type-check | `cd backend && npx tsc --noEmit && cd ../frontend && npx tsc --noEmit` | ○ pending |

*Status: ○ pending ✓ green ✗ red*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework installation needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Package card visual layout matches UI-SPEC | PKG-01 | Visual verification | Navigate to /services, confirm package cards render per UI-SPEC specs |
| Cart package item expands with child services | PKG-02 | Interactive flow | Add package to cart, navigate to /booking, verify child services show staff/time selects |
| Commission amounts correct after package completion | PKG-03 | Requires live DB state | Complete a package appointment, verify Commission records use full catalog prices |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
