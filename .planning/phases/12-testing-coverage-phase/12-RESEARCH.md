# Research: Testing & Coverage Phase

## Backend: Jest Initialization
The backend already has a basic Jest configuration, but it is partially non-functional due to configuration and environment issues.

### Existing State
- **Config:** `backend/jest.config.ts` exists, using `ts-jest` and `node` environment.
- **Tests:** A suite of tests exists in `backend/tests/`, including `auth.test.ts` and `payroll.test.ts`.
- **Setup:** `backend/tests/setup.ts` loads `.env.test` and includes a `truncateAllTables` helper.
- **Command:** `npm test` runs `jest --runInBand`.

### Issues
- **Module Type Mismatch:** Project uses `commonjs` in `backend/package.json` but has `.ts` config files, leading to ESM loading warnings.
- **Database Safety:** `setup.ts` checks for "test" or "neon" in `DATABASE_URL`, potentially blocking local execution.

### Recommendation
- Rename `jest.config.ts` to `jest.config.js` or fix ts-node/esm interop.
- Ensure `DATABASE_URL_TEST` is configured.

## Frontend: Vitest Initialization
The frontend has Vitest and React Testing Library installed, but existing tests are failing.

### Existing State
- **Config:** `frontend/vite.config.ts` has a `test` section using `jsdom`.
- **Tests:** `frontend/src/pages/Home.test.tsx` exists.
- **Setup:** `frontend/src/tests/setup.ts` exists.

### Issues
- **Missing Providers:** Tests fail because components using React Query or Router are rendered without providers.
- **Clerk Integration:** Pages depend on Clerk, requiring mocking.

### Recommendation
- Create a test wrapper component with `QueryClientProvider`, `MemoryRouter`, and mocked `AuthContext`.
- Mock global APIs like `IntersectionObserver`.

## Critical Paths

### Auth Path
- **Backend:** `backend/src/middleware/authMiddleware.ts` and `clerkWebhookController.ts`.
- **Frontend:** `Login.tsx` and `Register.tsx` (Clerk components).
- **Focus:** Mock Clerk verification and user profile sync.

### Payroll Path
- **Backend:** `backend/src/controllers/payrollController.ts` (especially `generatePayroll`).
- **Logic:** Complex formula-based engine with tiered commissions and deductions.
- **Focus:** Unit tests for `payrollEvaluator.ts` and integration tests for `generatePayroll`.

## Coverage Targets
- **Auth & Payroll:** 90%
- **Rest of Backend:** 80%
- **Frontend:** 70%
