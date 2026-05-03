---
phase: 06
slug: missing-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-04
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + Supertest (Backend) |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | FEAT-01 | T-06-01 | SystemLog entries on sensitive actions | integration | `npx jest tests/audit.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | FEAT-02 | T-06-02 | Manager-only CSV/Excel export | integration | `npx jest tests/export.test.ts` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 2 | FEAT-03 | — | Target config via env var fallback | unit | `npx jest tests/report.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/audit.test.ts` — stubs for FEAT-01
- [ ] `tests/export.test.ts` — stubs for FEAT-02
- [ ] `tests/report.test.ts` — stubs for FEAT-03
- [ ] Jest + Supertest install — framework missing in package.json

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | All | All phase behaviors have automated verification. | N/A |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
