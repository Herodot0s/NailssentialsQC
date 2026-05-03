---
phase: 7
slug: backend-test-infrastructure
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-04
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.3.0 + Supertest 7.2.2 |
| **Config file** | `backend/jest.config.ts` (Wave 0) |
| **Quick run command** | `npm test --prefix backend -- --runInBand` |
| **Full suite command** | `npm test --prefix backend -- --runInBand --coverage` |
| **Estimated runtime** | ~15-20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test --prefix backend -- --runInBand {specific_test_file}`
- **After every plan wave:** Run `npm test --prefix backend -- --runInBand`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | TEST-01 | — | N/A | config | `npm test --prefix backend -- --version` | 📥 W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | TEST-01 | — | N/A | config | `ls backend/jest.config.ts` | 📥 W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | TEST-01 | — | Listen guard | unit | `grep "process.env.NODE_ENV !== 'test'" backend/src/index.ts` | 📥 W0 | ⬜ pending |
| 07-02-01 | 02 | 2 | TEST-03 | — | N/A | unit | `npm test --prefix backend tests/unit/commission.test.ts` | 📥 W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | TEST-03 | — | Delegated calc | unit | `grep "getCommissionRate" backend/src/controllers/appointmentCompletion.ts` | 📥 W0 | ⬜ pending |
| 07-03-01 | 03 | 3 | TEST-04 | — | Valid registration | integration | `npm test --prefix backend tests/integration/auth.test.ts` | 📥 W0 | ⬜ pending |
| 07-03-02 | 03 | 3 | TEST-04 | T-07-03 | Secure JWT rotation | integration | `npm test --prefix backend tests/integration/auth.test.ts` | 📥 W0 | ⬜ pending |
| 07-04-01 | 04 | 4 | TEST-05 | — | Availability logic | integration | `npm test --prefix backend tests/integration/appointments.test.ts` | 📥 W0 | ⬜ pending |
| 07-04-02 | 04 | 4 | TEST-05 | — | Atomic transactions | integration | `npm test --prefix backend tests/integration/appointments.test.ts` | 📥 W0 | ⬜ pending |
| 07-05-01 | 05 | 5 | TEST-06 | — | N/A | integration | `npm test --prefix backend tests/integration/payroll.test.ts` | 📥 W0 | ⬜ pending |
| 07-05-02 | 05 | 5 | TEST-06 | — | Locking idempotency | integration | `npm test --prefix backend tests/integration/payroll.test.ts` | 📥 W0 | ⬜ pending |
| 07-06-01 | 06 | 6 | TEST-01 | — | N/A | integration | `npm test --prefix backend tests/integration/staff_attendance.test.ts` | 📥 W0 | ⬜ pending |
| 07-06-02 | 06 | 6 | TEST-01 | — | Attendance status | integration | `npm test --prefix backend tests/integration/staff_attendance.test.ts` | 📥 W0 | ⬜ pending |
| 07-07-01 | 07 | 7 | TEST-01 | — | Catalog CRUD | integration | `npm test --prefix backend tests/integration/catalog_reports.test.ts` | 📥 W0 | ⬜ pending |
| 07-07-02 | 07 | 7 | TEST-01 | — | Data accuracy | integration | `npm test --prefix backend tests/integration/catalog_reports.test.ts` | 📥 W0 | ⬜ pending |
| 07-08-01 | 08 | 8 | TEST-01 | T-07-08-01 | File validation | integration | `npm test --prefix backend tests/integration/misc_controllers.test.ts` | 📥 W0 | ⬜ pending |
| 07-08-02 | 08 | 8 | TEST-01 | — | Persistent feedback | integration | `npm test --prefix backend tests/integration/misc_controllers.test.ts` | 📥 W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/jest.config.ts` — Jest configuration
- [ ] `backend/tests/setup.ts` — Global test setup and DB isolation
- [ ] `backend/tests/helpers/database.ts` — Table truncation utility
- [ ] `backend/package.json` — Dependencies: supertest, @types/supertest, dotenv

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Test Database Creation | TEST-01 | Env specific | Ensure a PostgreSQL database exists with "test" in its name/URL. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
