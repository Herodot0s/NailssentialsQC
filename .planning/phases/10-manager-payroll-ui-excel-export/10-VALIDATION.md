---
phase: 10
slug: manager-payroll-ui-excel-export
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-14
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x / Vitest |
| **Config file** | `backend/jest.config.js`, `frontend/vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (relevant workspace)
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | PAY-06 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | PAY-01 | — | RBAC enforcement | integration | `npm test` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | — | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | PAY-04 | — | N/A | e2e | `npm test` | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 2 | PAY-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/tests/payroll.test.ts` — stubs for Excel transposition
- [ ] `frontend/src/tests/payrollUI.test.ts` — stubs for Payroll UI components
- [ ] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Excel Export Layout | PAY-06 | Visual layout check | Download exported Excel and verify "Staff as Rows, Dates as Columns" transposition. |
| Sidebar Navigation | — | Visual UI check | Verify "Payroll" appears under Personnel group in Sidebar. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
