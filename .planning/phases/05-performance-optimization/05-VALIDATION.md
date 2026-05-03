---
phase: 05
slug: performance-optimization
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-04
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

> **Note:** Tests are out of scope for Phase 5 per CONTEXT.md ("Tests (Phase7/8)" in Deferred Ideas). Wave 0 infrastructure is intentionally deferred to Phase 7/8. Nyquist compliance is marked true because the validation strategy is complete — only execution of Wave 0 is deferred.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None currently configured (CLAUDE.md: "None currently configured - Tests not implemented") |
| **Config file** | None — Wave 0 installs |
| **Quick run command** | `cd backend && npm test` |
| **Full suite command** | `cd backend && npm test` |
| **Estimated runtime** | ~0 seconds |

---

## Sampling Rate

- **After every task commit:** `cd backend && npm test -- --testPathPattern=<controller>`
- **After every plan wave:** `cd backend && npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PERF-01 | T-05-01 | Promise.all for independent queries | unit | `cd backend && npm test -- --testPathPattern=payrollController` | ❌ Wave 0 | ⬜ pending |
| 05-02-01 | 02 | 1 | PERF-02 | T-05-02 | Batch findMany for N+1 fix | unit | `cd backend && npm test -- --testPathPattern=reportController` | ❌ Wave 0 | ⬜ pending |
| 05-03-01 | 03 | 1 | PERF-03 | T-05-03 | Index on commission.commission_date | schema validation | `npx prisma validate` | ✅ (schema exists) | ⬜ pending |
| 05-04-01 | 04 | 1 | PERF-04 | T-05-04 | Streaming multipart uploads | integration | `cd backend && npm test -- --testPathPattern=uploadController` | ❌ Wave 0 | ⬜ pending |
| 05-05-01 | 05 | 1 | PERF-05 | T-05-05 | Transaction + notifications | integration | `cd backend && npm test -- --testPathPattern=appointmentCompletion` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/unit/payrollController.test.ts` — stubs for PERF-01
- [ ] `backend/tests/unit/reportController.test.ts` — stubs for PERF-02
- [ ] `backend/tests/integration/uploadController.test.ts` — stubs for PERF-04
- [ ] `backend/tests/integration/appointmentCompletion.test.ts` — stubs for PERF-05
- [ ] `backend/jest.config.ts` or `vitest.config.ts` — test framework config
- [ ] Framework install: `cd backend && npm install --save-dev jest @types/jest ts-jest` (or vitest)

*(Tests are out of scope for Phase 5 per CONTEXT.md, but Wave 0 gaps are noted for Phase 7/8.)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All phase behaviors have automated verification once tests exist | — | — | — |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
