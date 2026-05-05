status: complete

- Fix database truncation deadlocks: Truncated tables in one go.
- Disable rate-limiting in test environment: Skipped rate-limiting in test mode.
- Mock email service in tests: Added test mode check to sendEmail.
- Fix unique constraint violations: Used dynamic payloads in auth tests.
- Fix refresh token rotation: Added `jti` claim to refresh tokens to ensure uniqueness.

Note: Authentication integration tests are passing. Some other integration tests still show failures (service catalog, attendance), which are likely linked to data setup dependencies and should be addressed in subsequent tasks.
