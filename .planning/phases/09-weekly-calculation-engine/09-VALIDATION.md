---
phase: 09
slug: weekly-calculation-engine
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-14
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest / Node.js Scripts |
| **Config file** | `backend/jest.config.js` or `package.json` |
| **Quick run command** | `npm test` or `ts-node backend/src/scripts/testPayroll.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `ts-node backend/src/scripts/testPayroll.ts` or similar test script.
- **After every plan wave:** Run full test suite or execute generation.
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | PAY-03 | — | N/A | schema | `npx prisma db push` | ✅ | ⬜ pending |
| 09-01-02 | 01 | 1 | PAY-03 | — | N/A | unit | `ts-node scripts/testPayrollCalc.ts` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | PAY-03 | — | N/A | API | `ts-node scripts/testPayrollAPI.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/scripts/testPayrollCalc.ts` — stubs for calculating daily breakdown and commission.
- [ ] `backend/src/scripts/testPayrollAPI.ts` — stubs for testing generation/regeneration workflow.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Data accuracy | PAY-03 | End-to-end check | Manager verifies specific edge cases using manual inputs. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-14
