# Phase 7: Backend Test Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 7-Backend Test Infrastructure
**Areas discussed:** Database Testing Strategy, Test File Organization, Coverage Priority & Scope, DB Cleanup

---

## Database Testing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Real PostgreSQL DB | Use a real PostgreSQL database (e.g., a 'test' schema). Best for catching transaction and schema issues. | ✓ |
| Mock Prisma Client | Mock the Prisma client. Faster and easier to set up, but doesn't verify DB constraints or transactions. | |

**User's choice:** Real PostgreSQL DB
**Notes:** User values reliability and correctness over setup speed.

---

## Test File Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Co-located (__tests__/) | Put tests in __tests__/ subdirs next to the controllers/routes they test. | |
| Centralized (/tests) | Put all tests in a single top-level directory. (e.g. backend/tests/auth.test.ts) | ✓ |

**User's choice:** Centralized (/tests)
**Notes:** Prefers keeping the source directory clean of test files.

---

## Coverage Priority & Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Critical Paths First (Depth) | Focus on testing every line of Auth, Payroll, and Commissions first. Then expand to others. | ✓ |
| Breadth-First (Target-focused) | Cover all controllers basic paths first to reach the 80% target quickly, then refine. | |

**User's choice:** Critical Paths First (Depth)
**Notes:** Aligns with the project core value of verified correctness for critical daily operations.

---

## DB Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Delete/Truncate All | Explicitly delete/truncate all tables before or after each test suite. Simple and reliable. | ✓ |
| Fresh Schema per Run | Drop and recreate the entire test schema before the run. Slower but cleaner. | |

**User's choice:** Delete/Truncate All
**Notes:** Chosen for better performance while maintaining isolation.

---

## Claude's Discretion

- Selection of specific database cleanup utility implementation.
- Detailed directory structure within `backend/tests/`.
- Use of `ts-jest` for TypeScript integration.

## Deferred Ideas

None — discussion stayed within phase scope.
