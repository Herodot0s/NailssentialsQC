# Phase 3: Security Hardening - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 delivers security hardening for NailssentialsQC — addressing 6 security requirements (SEC-01 through SEC-06). The goal is to fail fast on misconfiguration, validate user input for security, prevent authorization bypass, and fix token rotation integrity.

**In scope:**
- SEC-01: Remove JWT secret fallbacks, fail fast on missing env vars
- SEC-02: Password strength validation during registration
- SEC-03: Role-based permission checks for notification creation
- SEC-04: Rate limiting middleware on auth endpoints
- SEC-05: Profile picture URL allowlist validation
- SEC-06: Refresh token rotation — create new before delete old

**Out of scope:**
- Full audit trail (FEAT-01, Phase 6)
- Data export endpoints (FEAT-02, Phase 6)
- Zod input validation on all endpoints (DEBT-06, Phase 4)
</domain>

<decisions>
## Implementation Decisions

### Password Validation Scope (SEC-02)
- **D-01:** Password strength rules (min 8, uppercase, number) apply at **registration only** — not at password change or password reset endpoints.
- **D-02:** Password rules: minimum 8 characters, at least one uppercase letter, at least one number. Special characters are not required.
- **D-03:** Special characters are shown as an optional hint text on the registration form — educational only, not enforced.

### Notification Permission Enforcement (SEC-03)
- **D-04:** Role check enforced **at each caller** of `createNotification(userId, ...)` — the centralized function itself remains a simple DB insert. Each calling controller is responsible for checking authorization before invoking it.
- **D-05:** Customers (role=`customer`) are blocked from creating notifications for any other user. Customers can only self-notify (their own booking confirmations, etc.). This is enforced at the call site, not inside createNotification.
- **D-06:** Staff and manager roles have no cross-role restrictions on notification creation — no restrictions on which staff can notify which customers, or which manager can notify staff.
- **D-07:** Blocked notification attempts (customer attempting cross-user notification) are **logged with WARNING level** — includes user ID and target user ID. No 403 response returned to client; silent skip at the caller's discretion.

### Pre-Answered (from requirements — not discussed)
- SEC-01: Fail fast if JWT_SECRET / REFRESH_TOKEN_SECRET env vars are not set — throw at module load, not at runtime.
- SEC-04: Rate limiting: 5 attempts per 15 minutes per IP on auth endpoints (login/register/refresh).
- SEC-05: Profile picture URL validation against Vercel Blob allowlist (https://*.public.blob.vercel-storage.com/).
- SEC-06: Refresh token rotation — create new token before deleting old token, no explicit transaction required (ordering alone is sufficient).

### Claude's Discretion
- For SEC-01: The check happens at module load in `jwt.ts` via an IIFE or top-level guard that throws if the env var is missing. This prevents the server from starting with weak secrets.
- For SEC-04: express-rate-limit package (already aligned with project's use of express-validator and established patterns in backend).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Security-Specific Files
- `backend/src/utils/jwt.ts` — SEC-01: JWT secrets with current fallback defaults to remove (lines 6-7)
- `backend/src/routes/authRoutes.ts` — SEC-02: Existing register validation (lines 12-18), add hint on special chars
- `backend/src/controllers/notificationController.ts` — SEC-03: createNotification function (line 58), callers that need role checks
- `backend/src/controllers/authController.ts` — SEC-06: refresh token rotation (lines 300-324)
- `frontend/src/pages/ManagerDashboard.tsx` — SEC-05: profile picture URL rendering (lines 930-932)

### Schema & Config
- `backend/prisma/schema.prisma` — RefreshToken model for SEC-06

### Project-Level Docs
- `.planning/PROJECT.md` — Core value: reliable, bug-free salon system; security constraints
- `.planning/ROADMAP.md` — Phase 3 goals and success criteria
- `.planning/codebase/CONCERNS.md` §Security Considerations — Full description of all 6 SEC-N issues and existing code references
- `.planning/codebase/INTEGRATIONS.md` §Authentication & Identity — JWT auth architecture, refresh token rotation details
- `.planning/phases/01-critical-bug-fixes/01-CONTEXT.md` — Prior phase decisions (Zod validation philosophy, error handling patterns)
- `.planning/phases/02-type-safety-code-quality/02-CONTEXT.md` — Prior phase decisions (shared types pattern)

### Established Project Decisions (from prior phases)
- express-validator used for route validation (per Phase 1 D-06, Phase 2 confirms "do not introduce asyncHandler wrapper")
- Zod introduced incrementally (Phase 1, per PROJECT.md key decision)
- try/catch + console.error + standardized error response pattern throughout all controllers

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **express-rate-limit**: Already in CONCERNS.md as recommendation for SEC-04 — install and apply to authRoutes.ts.
- **express-validator validation chain**: `authRoutes.ts` already has `registerValidation` with password rules — update this in place for SEC-02.
- **console.error pattern**: Used consistently for logging — used for blocked notification attempts per D-07.

### Established Patterns
- **Controller-level authorization**: Each controller checks `req.user?.sub` and role before performing sensitive operations — pattern to follow at notification caller sites.
- **JWT rotation**: Refresh token rotation already implemented in `authController.ts:303-325` — only the ordering (create-before-delete) needs fixing per SEC-06.

### Integration Points
- **Notification callers**: `appointmentController.ts` calls `createNotification` for booking confirmations and completions. Staff can trigger these for customers. Role check needed here.
- **Rate limiting**: Applied at the route level via `express-rate-limit` middleware — attaches to login, register, refresh routes in `authRoutes.ts`.
- **Profile picture**: Rendered in ManagerDashboard.tsx from `user.profile_picture_url` — validation on upload side (uploadController.ts) is best, not just on display.

</code_context>

<specifics>
## Specific Ideas

- For password hints: Add hint text below the password input on the registration form like "Tip: adding !@#$ can make your password stronger" — not a validation rule.
- For notification callers: The main callers to check are `appointmentController` (booking/completion flow), `staffController` (schedule updates), `payrollController` (payroll generated). Each should add a role guard before calling `createNotification(userId, ...)` when `userId !== req.user.sub` and `req.user.role === 'customer'`.
- For blocked attempts: `console.warn('[notification] Blocked cross-user notification attempt', { callerId, targetId });` — keeps consistent with existing logging pattern.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

</deferred>

---

*Phase: 3-Security Hardening*
*Context gathered: 2026-05-02*