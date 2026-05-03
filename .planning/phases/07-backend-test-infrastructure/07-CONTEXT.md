# Phase 7: Backend Test Infrastructure - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 delivers the foundation for backend reliability by setting up a robust testing infrastructure using Jest and Supertest. It includes configuring the test runner, establishing patterns for database interaction using a real PostgreSQL test instance, and writing tests for critical logic (commissions, auth, appointments, payroll) to reach 80% line coverage.

**In scope:**
- TEST-01: Set up Jest + Supertest for backend with 80% line coverage minimum
- TEST-03: Write unit tests for commission calculation logic (tiered rates, specialty quota)
- TEST-04: Write integration tests for authentication flows (register, login, refresh, logout)
- TEST-05: Write integration tests for appointment creation and completion
- TEST-06: Write integration tests for payroll generation and period locking

**Out of scope:**
- Frontend Test Infrastructure (Phase 8)
- E2E Testing with Playwright/Cypress (Phase 9)
- UI changes for test results
</domain>

<decisions>
## Implementation Decisions

### Database Testing Strategy
- **D-01:** Use a real PostgreSQL database for integration tests (via `TEST_DATABASE_URL`). This ensures transactions and Prisma-specific behaviors are correctly verified.
- **D-02:** Data Isolation: Delete/Truncate all tables before each test suite to ensure a clean state without the overhead of recreating the schema every time.

### Test File Organization
- **D-03:** Centralized Location: All backend tests will be stored in a dedicated `backend/tests/` directory rather than being co-located with source files.

### Coverage & Priority
- **D-04:** Depth-First Strategy: Prioritize 100% coverage for critical paths (Auth, Payroll, Commission Calculation) before filling in the rest of the controllers to meet the 80% aggregate target.

### Supertest Setup
- **D-05:** Supertest will import the `app` instance from `backend/src/index.ts`. Since the server listen call is guarded by `process.env.NODE_ENV`, it won't start a real network listener during tests.

### Claude's Discretion
- Select/implement a reliable database cleanup utility (e.g., a helper that iterates through all Prisma models and performs `deleteMany`).
- Define the specific structure within `backend/tests/` (e.g., `controllers/`, `integration/`, `unit/`).
- Use `ts-jest` for seamless TypeScript support.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Docs
- `.planning/PROJECT.md` — Core value: verified correctness; Key Decisions: Jest/Supertest stack
- `.planning/ROADMAP.md` — Phase 7 goals and success criteria
- `.planning/STATE.md` — Current position and phase dependencies

### Codebase Maps
- `.planning/codebase/TESTING.md` — Existing testing recommendations and patterns
- `.planning/codebase/ARCHITECTURE.md` — Controller patterns and Prisma usage
- `.planning/codebase/CONVENTIONS.md` — Naming and code style

### Phase-Specific Files
- `backend/src/index.ts` — Main Express app export for Supertest
- `backend/src/utils/prisma.ts` — Prisma singleton used across all controllers
- `backend/src/controllers/appointmentController.ts` — Targeted for integration tests (TEST-05)
- `backend/src/controllers/authController.ts` — Targeted for integration tests (TEST-04)
- `backend/src/controllers/payrollController.ts` — Targeted for integration tests (TEST-06)
- `backend/src/utils/commissionLogic.ts` (if extracted, otherwise the controller) — Targeted for unit tests (TEST-03)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/utils/prisma.ts`: Prisma singleton - must be used/mocked consistently in tests.
- `backend/src/utils/apiHelpers.ts`: Standardized response formatters - tests should assert against these structures.

### Established Patterns
- **Standardized Error Handling**: Tests should verify specific error codes (e.g., `VALIDATION_ERROR`, `UNAUTHORIZED`) defined in `CONVENTIONS.md`.
- **Prisma Transactions**: Complex flows (Phase 5) need integration tests that verify rollbacks on failure.

### Integration Points
- **Supertest + App**: Integration at the route level allows testing of middleware (auth, validation) along with controller logic.
- **Prisma + Test DB**: Requires `DATABASE_URL` override during test runs.

</code_context>

<specifics>
## Specific Ideas

- Create a `backend/tests/setup.ts` to handle global database connection and cleanup logic.
- Use `beforeEach` or `afterEach` hooks to clear the database to prevent test pollution.
- Example test data (fixtures) should be stored in `backend/tests/fixtures/`.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 7 scope.
</deferred>

---

*Phase: 7-Backend Test Infrastructure*
*Context gathered: 2026-05-04*
