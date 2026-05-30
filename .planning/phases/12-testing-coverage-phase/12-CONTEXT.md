# Context: Testing & Coverage Phase

## Objectives
- **Targets:** Auth & Payroll (90%), Backend (80%), Frontend (70%).
- **Initialization:** Jest (Backend), Vitest (Frontend).
- **Regressions:** Timezone shifts, concurrency, checkout logic.

## Technical Context
- **Backend:** Express.js, Prisma, commonjs modules.
- **Frontend:** React 19, Vite, Vitest, React Testing Library.
- **Auth:** Clerk integration.

## Constraints
- Must use existing stack.
- Tests must pass in a CI environment (Vercel/GitHub Actions).
