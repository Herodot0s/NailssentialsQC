# Phase 07: Backend Test Infrastructure - Research

**Researched:** 2026-05-04
**Domain:** Backend Testing (Jest, Supertest, Prisma)
**Confidence:** HIGH

## Summary

Phase 07 establishes the backend testing infrastructure for NailssentialsQC. The primary goal is to provide a reliable environment for verifying business logic (commissions, payroll) and API integrity (authentication, appointments). 

The strategy uses **Jest** as the test runner, **Supertest** for HTTP assertions, and a real **PostgreSQL** instance for integration tests to ensure Prisma-specific behaviors (transactions, constraints) are correctly validated. Isolation is achieved by truncating all database tables before each test suite, ensuring a clean state without the overhead of re-running migrations.

**Primary recommendation:** Use a centralized `backend/tests/` directory with a robust global setup file that manages the test database lifecycle and environment variable overrides.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a real PostgreSQL database for integration tests (via `TEST_DATABASE_URL`). This ensures transactions and Prisma-specific behaviors are correctly verified.
- **D-02:** Data Isolation: Delete/Truncate all tables before each test suite to ensure a clean state without the overhead of recreating the schema every time.
- **D-03:** Centralized Location: All backend tests will be stored in a dedicated `backend/tests/` directory rather than being co-located with source files.
- **D-04:** Depth-First Strategy: Prioritize 100% coverage for critical paths (Auth, Payroll, Commission Calculation) before filling in the rest of the controllers to meet the 80% aggregate target.
- **D-05:** Supertest will import the `app` instance from `backend/src/index.ts`. Since the server listen call is guarded by `process.env.NODE_ENV`, it won't start a real network listener during tests.

### the agent's Discretion
- Select/implement a reliable database cleanup utility (e.g., a helper that iterates through all Prisma models and performs `deleteMany`).
- Define the specific structure within `backend/tests/` (e.g., `controllers/`, `integration/`, `unit/`).
- Use `ts-jest` for seamless TypeScript support.

### Deferred Ideas (OUT OF SCOPE)
- Frontend Test Infrastructure (Phase 8)
- E2E Testing with Playwright/Cypress (Phase 9)
- UI changes for test results
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-01 | Set up Jest + Supertest with 80% coverage | Standard stack identified; sample configuration provided below. |
| TEST-03 | Unit tests for commission calculation | Identified `appointmentCompletion.ts` as the target for these tests. |
| TEST-04 | Integration tests for authentication | `authController.ts` target identified; refresh token rotation mentioned as critical path. |
| TEST-05 | Integration tests for appointments | Prisma transaction verification logic researched. |
| TEST-06 | Integration tests for payroll | Payroll period locking and aggregation logic identified as high priority. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| API Integration Testing | Backend | — | Supertest interacts directly with Express app instance in-process. |
| Database Isolation | Database | Backend | Truncation logic runs via Prisma `$executeRaw` against the test DB. |
| Unit Testing (Logic) | Backend | — | Business logic (e.g., tiered commission rates) tested without DB dependencies where possible. |
| Coverage Reporting | Backend | — | Jest built-in coverage (V8) provides accurate line/branch reports. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | 30.3.0 | Test runner & assertions | Industry standard for Node.js, powerful mocking. [VERIFIED: npm] |
| Supertest | 7.2.2 | HTTP assertions | The "blessed" tool for testing Express apps. [VERIFIED: npm] |
| ts-jest | 29.4.9 | TypeScript Support | Seamlessly handles TS files without a separate build step. [VERIFIED: npm] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/jest | 30.0.0 | Typings for Jest | Always (for IDE support). |
| @types/supertest | 6.0.2 | Typings for Supertest | Always (for IDE support). |
| dotenv | 17.4.2 | Env Var Loading | To load `.env.test` for `TEST_DATABASE_URL`. |

**Installation:**
```bash
cd backend
npm install --save-dev supertest @types/supertest
# Note: jest, ts-jest, and @types/jest are already in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── jest.config.ts           # Root test configuration
└── tests/
    ├── setup.ts             # Global setup (dotenv, lifecycle hooks)
    ├── helpers/
    │   └── database.ts      # Database truncation utility
    ├── fixtures/            # Reusable test data (factories)
    │   ├── users.ts
    │   ├── appointments.ts
    │   └── payroll.ts
    ├── integration/         # API endpoint tests (Supertest + DB)
    │   ├── auth/            # authController.test.ts
    │   ├── appointments/    # appointmentController.test.ts
    │   └── payroll/         # payrollController.test.ts
    └── unit/                # Pure logic tests (no DB)
        └── commission.test.ts
```

### Pattern 1: Table Truncation (Isolation)
Instead of dropping and recreating the schema (slow), we use `TRUNCATE ... CASCADE` on all tables before each test suite (or each test if needed).

### Pattern 2: Guarded Server Entry
Ensure `backend/src/index.ts` does not block Jest by attempting to listen on a port during tests.
```typescript
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, ...);
}
```

### Anti-Patterns to Avoid
- **Hardcoded IDs:** Use fixtures that create their own data and return IDs for assertions.
- **Cross-test state:** Avoid relying on data created by a previous test file.
- **Production DB in Tests:** Never run tests against the main `DATABASE_URL`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP Mocking | Custom fetch mocks | Supertest | Correctly handles the Express request/response lifecycle. |
| Schema Sync | Manual SQL scripts | `npx prisma migrate dev` | Keeps test DB schema in sync with `schema.prisma` automatically. |
| JWT Verification | Manual logic checks | `jsonwebtoken` verify | Re-use production logic to ensure test parity. |

## Common Pitfalls

### Pitfall 1: Race Conditions in DB
**What goes wrong:** Tests running in parallel against the same physical database conflict.
**How to avoid:** Run Jest with `--runInBand` for backend tests to ensure serial execution, or use separate database schemas per worker (complex). Serial execution is recommended for Phase 07.

### Pitfall 2: Stale Prisma Client
**What goes wrong:** Schema changes aren't reflected in the Prisma client used by tests.
**How to avoid:** Ensure `npx prisma generate` runs after any schema changes before running tests.

### Pitfall 3: Time-Sensitive Logic
**What goes wrong:** Payroll or appointment tests fail based on the current date (e.g., start of month).
**How to avoid:** Use `jest.useFakeTimers()` or pass date overrides to the business logic functions.

## Code Examples

### Database Truncation Helper
```typescript
// backend/tests/helpers/database.ts
import prisma from '../../src/utils/prisma';

export const truncateAllTables = async () => {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' 
    AND tablename != '_prisma_migrations';
  `;

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
  }
};
```

### Sample Jest Configuration
```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  verbose: true,
  forceExit: true,
};

export default config;
```

### Global Setup File
```typescript
// backend/tests/setup.ts
import dotenv from 'dotenv';
import path from 'path';
import { truncateAllTables } from './helpers/database';
import prisma from '../src/utils/prisma';

// Load .env.test specifically
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

beforeAll(async () => {
  // Verify we are NOT using the production DB
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error('Tests must be run against a database with "test" in the URL.');
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Optional: Truncate before every test for maximum isolation
// or beforeAll for suite-level isolation.
beforeEach(async () => {
  await truncateAllTables();
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `mocha` + `chai` | `jest` | 2020+ | Unified runner, matcher, and mocking library. |
| Manual SQL Mocking | Prisma Mocking / Real DB | Prisma 2+ | Real DB testing is preferred for complex transactions. |
| Co-located tests | Dedicated `tests/` folder | Scale dependent | For clean production builds (Vercel), keeping tests separate is safer. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `process.env.VERCEL` is not set locally | Pattern 2 | Server might not listen during dev if wrong. |
| A2 | Serial execution (`--runInBand`) is acceptable | Pitfalls | Slower test runs as the suite grows. |

## Open Questions (RESOLVED)

1. **Test Data Management:** Should we use `factory-buddy` or similar for complex models?
   - **RESOLVED:** No. Start with simple fixture functions in `tests/fixtures/`. This avoids dependency bloat and keeps tests close to the Prisma schema.

2. **CI/CD Integration:** Will the Vercel Postgres instance be used for CI tests?
   - **RESOLVED:** No. Use a local Docker instance for dev-test and a dedicated branch DB for CI. This ensures tests are truly isolated and don't incur production costs or risks.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | ✓ | 20.x+ | — |
| PostgreSQL | DB Tests | ✓ | 16.x | — |
| Docker | Local DB | ✓ | 24.x | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 |
| Config file | `backend/jest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-03 | Commission Calculation | unit | `npm test tests/unit/commission.test.ts` | ❌ |
| TEST-04 | Auth Integration | integration | `npm test tests/integration/auth.test.ts` | ❌ |
| TEST-05 | Appointment Creation | integration | `npm test tests/integration/appointments.test.ts` | ❌ |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Integration tests for login/refresh token rotation. |
| V5 Input Validation | yes | Supertest assertions for 400 Bad Request on invalid payloads. |
| V13 API Security | yes | Verify role-based access control (RBAC) via Supertest. |

### Known Threat Patterns for Node/Express/Prisma

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL Injection | Tampering | Prisma ORM (parameterized queries). |
| JWT Forgery | Information Disclosure | Secret management + RS256/HS256 validation. |
| Broken Access Control | Elevation of Privilege | Middleware-level role checks (verified in tests). |

## Sources

### Primary (HIGH confidence)
- `npm view jest version` - Latest stable version confirmed.
- `npm view supertest version` - Latest stable version confirmed.
- `backend/src/index.ts` - Verified app export pattern.
- `schema.prisma` - Verified table names for truncation helper.

### Secondary (MEDIUM confidence)
- Jest 30 Documentation - Verified `defineConfig` and JSDOM changes.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Latest versions verified.
- Architecture: HIGH - Matches common industry patterns for Express/Prisma.
- Pitfalls: HIGH - Common issues with DB testing identified.

**Research date:** 2026-05-04
**Valid until:** 2026-06-04
