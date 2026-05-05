# Backend Test Fixes

## Problem Description
The backend integration tests are failing due to:
1. **Foreign Key Constraint Violations**: `system_logs_user_id_fkey`, `services_category_id_fkey`, `refresh_tokens_user_id_fkey`.
2. **Database Deadlocks**: During `TRUNCATE` operations in `tests/helpers/database.ts`.
3. **Authentication failures**: Login 429 status (rate limiting), and token handling issues in tests (`Cannot read properties of undefined (reading 'tokens')`).

## Plan
1. **Database Helper**: Update `truncateAllTables` in `backend/tests/helpers/database.ts` to use a more robust order or approach to avoid deadlocks.
2. **Test Setup**: Update `backend/tests/setup.ts` and individual test files to handle database cleanup and data initialization more cleanly, preventing unique constraint violations.
3. **Authentication Tests**: Fix the token retrieval logic in tests to check for successful login responses before accessing tokens. Investigate rate limiting (429 errors).
4. **Data Consistency**: Ensure all test data creation follows a consistent order that respects foreign key dependencies.

## Verification
- Run all backend integration tests and ensure they pass.
- Verify no deadlocks occur during test execution.
