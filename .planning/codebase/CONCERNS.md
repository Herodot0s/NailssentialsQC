# Codebase Concerns

**Analysis Date:** 2026-05-01

## Tech Debt

**Insufficient Type Safety / Excessive `any` Usage:**
- Issue: TypeScript `any` type is used extensively across frontend (50+ occurrences) and backend
- Files:
  - `frontend/src/pages/ManagerDashboard.tsx`
  - `frontend/src/pages/Booking.tsx`
  - `frontend/src/pages/StaffDashboard.tsx`
  - `frontend/src/api/apiClient.ts`
  - `backend/src/middleware/authMiddleware.ts`
- Impact: Type safety is compromised, runtime errors may occur undetected, IDE autocomplete is unreliable
- Fix approach: Replace `any` with proper interfaces. Create shared type definitions in `frontend/src/types/`.

**Missing Test Coverage:**
- Issue: No test files exist in the project. Zero unit, integration, or E2E tests
- Impact: Refactoring is risky, bugs may go unnoticed, no confidence in deployments
- Fix approach: Add Jest/Vitest for backend, React Testing Library for frontend. Start with critical paths (auth, payroll calculations, appointment completion).

**Large File Complexity:**
- Issue: Multiple files exceed reasonable lines-of-code thresholds
- Files:
  - `frontend/src/pages/ManagerDashboard.tsx` (1224 lines) - Contains 6 different view modes in one file
  - `backend/src/controllers/appointmentController.ts` (527 lines) - Handles booking, completion, and availability
  - `frontend/src/pages/StaffDashboard.tsx` (453 lines)
- Impact: Difficult to understand, test, and maintain. Cognitive load is high.
- Fix approach: Split ManagerDashboard into separate components (StaffTable, PayrollTable, AttendanceLedger, ReviewModeration, etc.). Extract appointment logic into separate modules.

**No Pagination on List Endpoints:**
- Issue: All list endpoints return all records without pagination
- Files:
  - `backend/src/controllers/appointmentController.ts` - `getAppointments()` fetches all
  - `backend/src/controllers/staffController.ts` - `getAllStaff()` returns complete list
  - `backend/src/controllers/payrollController.ts` - `getPayrollPeriods()` has no limit
- Impact: Performance degrades as data grows, network payload bloat, UI rendering issues
- Fix approach: Add cursor-based pagination to all list endpoints.

**Duplicate Code Patterns:**
- Issue: Similar authentication checks, error responses, and data transformations are repeated
- Examples:
  - Auth checks in multiple controllers: `req.user?.sub` checks repeated
  - `console.error()` pattern: Same error logging pattern manually repeated
  - Notification creation: Async fire-and-forget pattern duplicated
- Fix approach: Create middleware/helpers: `requireAuth()` wrapper, centralized error logger, notification service.

**No Request Validation Layer:**
- Issue: No input validation middleware (e.g., Zod, Joi) on API routes
- Files: All controllers in `backend/src/controllers/`
- Impact: Invalid data reaches database layer, potential security issues, confusing error messages
- Fix approach: Add Zod schemas for each endpoint, validate in controller or middleware.

## Known Bugs

**JSX Syntax Errors in Navbar.tsx:**
- Issue: `render` prop syntax appears malformed with missing closing tags
- File: `frontend/src/components/Navbar.tsx:105-166`
- Symptoms: Dropdown menu items show incorrect JSX (e.g., `<DropdownMenuItemrender=<Link...>` missing `>` and proper closing)
- Trigger: Opening dropdown menu will cause rendering errors
- Fix approach: Fix the JSX syntax - change `<DropdownMenuItemrender` to proper `<DropdownMenuItem` with closing pattern

**Hardcoded Password for Walk-in Users:**
- Issue: New walk-in customer created with `password_hash: 'N/A'`
- File: `backend/src/controllers/appointmentController.ts:413-414`
- Trigger: Any staff/manager creates a walk-in appointment
- Impact: Security vulnerability if walk-in user account is ever used for authentication
- Fix approach: Generate a random password or use a flag to prevent login for walk-in users.

**ManagerDashboard State Type Mismatch:**
- Issue: `onClick={() => setActiveView(item.id as any)}` - casts viewId to `any`
- File: `frontend/src/pages/ManagerDashboard.tsx:444`
- Symptom: TypeScript may allow invalid view values, runtime errors possible
- Fix approach: Define union type for activeView values and cast properly.

**parseInt Without Error Handling on Route Params:**
- Issue: `parseInt(id as string)` used without NaN checks
- Files:
  - `backend/src/controllers/payrollController.ts:196,290,302`
  - `backend/src/controllers/attendanceController.ts:289`
  - `backend/src/controllers/serviceController.ts:43,104,124,139,165,171`
- Trigger: Passing non-numeric ID to endpoint (e.g., `/payroll/periods/abc`)
- Symptom: Prisma will throw cryptic error or return 500
- Fix approach: Validate IDs at route level or use Prisma's `where: { id: Number(id) }` with error handling.

## Security Considerations

**JWT Secrets with Fallback Defaults:**
- Risk: If env vars are not set, authentication falls back to predictable default secrets
- Files:
  - `backend/src/utils/jwt.ts:6-7`
  - `JWT_SECRET || 'access_secret_fallback'` and `REFRESH_TOKEN_SECRET || 'refresh_secret_fallback'`
- Impact: Attacker with code access can forge tokens
- Current mitigation: Production deployment should set these env vars
- Recommendations: Fail fast if secrets are not set (throw error instead of fallback), add startup validation.

**Missing Password Validation:**
- Risk: No password strength requirements enforced during registration
- File: `backend/src/controllers/authController.ts:8`
- Impact: Weak passwords can be set during account creation
- Recommendations: Add password strength validation (min length, complexity requirements)

**Authorization Check on createNotification:**
- Risk: No role/permission check on who can create notifications
- File: `backend/src/controllers/notificationController.ts:58`
- Impact: Any authenticated user could potentially spam notifications to any user
- Current mitigation: User can only mark their own notifications as read
- Recommendations: Add role-based permission checks for notification creation.

**SQL Injection via Raw String in Filter:**
- Risk: Potential injection if using raw strings in Prisma filters without sanitization
- File: `backend/src/controllers/customerController.ts` - `customer_id` filter
- Impact: While Prisma escapes parameters, raw SQL interpolation is dangerous
- Recommendations: Always use parameterized queries, avoid string interpolation in where clauses.

**No Rate Limiting on Auth Endpoints:**
- Risk: Brute force attacks on `/auth/login` and `/auth/refresh` endpoints
- File: All auth routes in `backend/src/routes/authRoutes.ts`
- Impact: Account lockout mechanisms exist, but server resources may still be exhausted
- Recommendations: Add rate limiting middleware (express-rate-limit)

**Profile Picture URL Not Validated:**
- Risk: Stored XSS if malicious URLs are accepted as profile picture
- File: `frontend/src/pages/ManagerDashboard.tsx:930-932`
- Impact: If image is loaded from untrusted source, could execute JavaScript
- Recommendations: Validate URLs match allowlist (e.g., start with `https://images.unsplash.com/` or configured CDN).

## Performance Bottlenecks

**Sequential Awaits in Report Controllers:**
- Problem: Multiple sequential `prisma` queries in payroll and report generation
- File: `backend/src/controllers/payrollController.ts:86-158`
- Cause: One staff loop with multiple DB calls per iteration (commissions, deductions, attendance, etc.)
- Improvement path: Use `Promise.all()` for independent queries, batch DB operations, consider caching.

**N+1 Query Pattern in Historical Analytics:**
- Problem: Fetch service names individually for each stat entry
- File: `backend/src/controllers/reportController.ts:125-132`
- Cause: `statsWithNames` uses `Promise.all()` but triggers N queries for N services
- Improvement path: Fetch all services in one query and map in memory.

**No Database Index on Commission Date for Reports:**
- Problem: Aggregations on `commission.commission_date` may be slow without index
- File: `backend/src/controllers/reportController.ts:164`
- Current: Compound index exists on `[staff_id, period_year, period_week]` but not on `commission_date`
- Improvement path: Add partial index on `commission_date` for `is_paid=false` records.

**Large File Upload to Memory:**
- Problem: Entire file loaded into memory as base64 before upload
- File: `backend/src/controllers/uploadController.ts:23`
- Impact: Users uploading large images will cause high memory usage
- Improvement path: Stream large files or enforce file size limits before upload.

**Context Re-render on localStorage Updates:**
- Problem: `AuthContext` and `CartContext` persist to localStorage on every state change
- Files:
  - `frontend/src/context/AuthContext.tsx:39`
  - `frontend/src/context/CartContext.tsx:32`
- Impact: Unnecessary localStorage writes, potential performance degradation on rapid updates
- Improvement path: Debounce localStorage writes or use manual sync on specific actions only.

## Fragile Areas

**Appointment Completion with Multiple Side Effects:**
- Why fragile: `completeAppointment` creates appointments, transactions, commissions, AND sends emails in separate async blocks
- File: `backend/src/controllers/appointmentController.ts:173-305`
- Safe modification: Wrap the entire completion flow in a single Prisma transaction. Move email sending to queue or handle failures gracefully.
- Test coverage: None - this critical path has no tests.

**Staff Schedule Upsert Logic:**
- Why fragile: Uses `s.id || -1` as the upsert key, which will never match for new schedules
- File: `backend/src/controllers/staffController.ts:208-212`
- Symptom: Creating new schedule entries always creates instead of updating
- Safe modification: Ensure new schedules don't have IDs, existing ones do. Consider using `day_of_week` as unique key instead.

**Refresh Token Rotation Race Condition:**
- Why fragile: Old token deleted before new one is created, brief gap exists
- File: `backend/src/controllers/authController.ts:308-317`
- Safe modification: Create new token first, then delete old token to maintain continuity.

**Hardcoded Target Value in Sales Stats:**
- Why fragile: Sales target of 8000 is hardcoded in controller
- File: `backend/src/controllers/reportController.ts:142`
- Safe modification: Make target configurable via database or env var.

## Scaling Limits

**Authentication Token Refresh Pattern:**
- Current capacity: Single refresh token per user (old is deleted on refresh)
- Limit: If user has multiple sessions, refreshing on one invalidates others
- Scaling path: Support multiple refresh tokens (one per session) with expiry.

**Attendance Unique Constraint:**
- Current capacity: One record per staff per day (`uk_staff_date`)
- Limit: Cannot model staff working split shifts on same day
- Scaling path: Change to store multiple clock-in/out pairs per day.

**In-Memory Context State:**
- Current capacity: Auth state held in React Context, cart held in Context
- Limit: Context cannot persist across browser tabs without manual sync
- Scaling path: Consider Redux or Zustand with localStorage persistence for better reliability.

## Dependencies at Risk

**bcrypt (10.4.0):**
- Risk: Older version, potential to upgrade to bcryptjs for better Node.js compatibility
- Impact: Minor - current version is stable
- Migration plan: If switching to `bcryptjs`, test password hash compatibility.

**Nodemailer (Legacy Package):**
- Risk: Nodemailer is mature but configuration often has issues with modern email providers
- Impact: Email delivery failures may go unnoticed
- Migration plan: Consider transactional email services (SendGrid, Resend) with proper webhook handling.

**No Dependency Auditing:**
- Risk: `npm audit` not integrated into CI/CD
- Impact: Security vulnerabilities in dependencies may go unnoticed
- Migration plan: Add `npm audit` to pre-commit hooks and CI pipeline.

## Missing Critical Features

**No Audit Trail for Sensitive Operations:**
- Problem: No system log entries for critical business operations (payroll generation, staff updates)
- Blocks: Compliance requirements, debugging issues, security investigations
- Fix approach: Add `SystemLog` entries for all create/update/delete operations on staff, payroll, and commission records.

**No Data Export / Backup:**
- Problem: No mechanism to export data for backup
- Blocks: Disaster recovery, compliance audits
- Fix approach: Add admin endpoint to export payroll data as CSV/Excel.

**Missing Unit Tests for Commission Calculations:**
- Problem: Commission calculation logic has no automated tests
- File: `backend/src/controllers/appointmentController.ts` - `getTieredCommissionRate()`, `checkSpecialtyQuota()`
- Blocks: Confidence when modifying commission rules, risk of miscalculation
- Fix approach: Write unit tests covering all tier boundaries and specialty quota scenarios.

## Test Coverage Gaps

**No Backend API Tests:**
- What's not tested: All controller functions (auth, appointments, payroll, staff, etc.)
- Files: `backend/src/controllers/*.ts`
- Risk: Auth flow breaks could cause security issues, payroll calculation errors could cause financial loss
- Priority: High - especially for payroll and commission calculations.

**No Frontend Component Tests:**
- What's not tested: All React components
- Files: `frontend/src/pages/*.tsx`, `frontend/src/components/*.tsx`
- Risk: UI regressions, broken user flows
- Priority: Medium - start with forms and critical user paths.

**No Integration Tests for Database Operations:**
- What's not tested: Prisma queries, transactions
- Risk: Changes to schema may break queries unexpectedly
- Priority: High - critical transactions (appointment completion, payroll generation).

**No E2E Tests:**
- What's not tested: Complete user flows (login -> book -> pay -> review)
- Risk: Integration issues between frontend and backend
- Priority: Medium - can be manual initially, automate critical paths.

---

*Concerns audit: 2026-05-01*