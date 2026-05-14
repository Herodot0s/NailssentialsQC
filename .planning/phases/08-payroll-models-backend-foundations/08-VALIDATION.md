---
phase: 08
slug: payroll-models-backend-foundations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-14
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | manual testing via backend and frontend / jest (if tests configured) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm run test` or `curl` API |
| **Full suite command** | `npm run dev` and manual verification |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run build check `npm run build` in backend
- **After every plan wave:** Verify API behavior
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | PAY-01, PAY-04 | — | Schema updates and push | integration | `npx prisma db push` | ✅ | ⬜ pending |
| 08-01-02 | 01 | 1 | PAY-01 | — | Staff Profile updates via API | API | HTTP / manual | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | PAY-04 | — | Deduction Log CRUD | API | HTTP / manual | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | PAY-02 | — | Payroll Period Generation | API | HTTP / manual | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/controllers/staffController.ts` — verify logic exists or create
- [ ] `backend/src/routes/payrollRoutes.ts` — stubs for new API

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DB structure update | PAY-01, PAY-04 | Prisma Push | Run `npx prisma db push` |
| End-to-end flow | PAY-01, PAY-02, PAY-04 | Logic accuracy | Use postman or frontend to trigger generation |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
