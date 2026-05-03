---
phase: 2
slug: type-safety-code-quality
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript 6.0.3 (tsc --noEmit) + ESLint 9.39.4/10.2.1 |
| **Config file** | `backend/tsconfig.json`, `frontend/tsconfig.json`, `.eslintrc.cjs` (root) |
| **Quick run command** | `cd backend && npx tsc --noEmit && cd ../frontend && npx tsc --noEmit` |
| **Full suite command** | `npm run lint` (runs ESLint on all files) |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` in both backend/ and frontend/
- **After every plan wave:** Run `npm run lint` (full ESLint check for `any` type usage)
- **Before `/gsd-verify-work`:** Both TypeScript compilation and ESLint must pass clean
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01 | 01 | 1 | DEBT-01 | — | No `any` types in frontend files | static | `cd frontend && npx tsc --noEmit` | ✅ W0 | ⬜ pending |
| 02-02 | 02 | 1 | DEBT-01 | — | No `any` types in backend controllers | static | `cd backend && npx tsc --noEmit` | ✅ W0 | ⬜ pending |
| 02-03 | 03 | 2 | DEBT-02 | — | ManagerDashboard.tsx < 400 lines, 4 components extracted | static | `wc -l frontend/src/pages/ManagerDashboard.tsx` | ✅ W0 | ⬜ pending |
| 02-04 | 04 | 2 | DEBT-03 | — | appointmentController.ts split into 3 modules | static | `ls backend/src/controllers/appointment*.ts` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] TypeScript config exists in both backend/ and frontend/ (VERIFIED: exists)
- [ ] ESLint config exists with no-any rule or equivalent (VERIFIED: exists, need to add @typescript-eslint/no-explicit-any rule)
- [ ] `npm run lint` runs clean before phase completion

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard components render correctly after split | DEBT-02 | Visual regression, component integration | Open ManagerDashboard, verify StaffTable, PayrollTable, AttendanceLedger, ReviewModeration render and function |
| Appointment endpoints work after controller split | DEBT-03 | API contract preservation | Test book appointment, complete appointment, check availability via UI |

*Visual/integration checks needed for extracted components and split controllers.*

---

## Validation Sign-Off

- [ ] All tasks have `<acceptance_criteria>` with grep-verifiable conditions
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
