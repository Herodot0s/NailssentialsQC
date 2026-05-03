# Phase 5: Performance Optimization - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 delivers performance optimization for NailssentialsQC — fixing sequential awaits (Promise.all), N+1 queries, missing database indexes, file upload memory issues, and transaction handling for appointment completion.

**In scope:**
- PERF-01: Fix sequential awaits in payroll controller (use Promise.all for independent queries)
- PERF-02: Fix N+1 query pattern in report controller (batch fetch services)
- PERF-03: Add database index on commission.commission_date for unpaid records
- PERF-04: Stream large file uploads instead of loading into memory as base64
- PERF-05: Fix appointment completion flow (wrap in single Prisma transaction, handle email failures gracefully)

**Out of scope:**
- Tests (Phase 7/8)
- Frontend changes (streaming UI, progress bars)
- New features or capabilities
- Audit trail (FEAT-01, Phase 6)
</domain>

<decisions>
## Implementation Decisions

### Email Failure Handling (PERF-05)
- **D-01:** Email failures: Log only with `console.error`, no retry or manager notification.
- **D-02:** Email sending: Only after successful Prisma transaction commit (email outside transaction).
- **D-03:** In-app notifications: Inside the transaction (DB writes), email outside.
- **D-04:** Log level for email failures: `console.error` (matches Phase 2 D-04 try/catch pattern).

### Promise.all Error Strategy (PERF-01)
- **D-05:** If one independent query fails: Fail whole request (return 500). Matches try/catch pattern.
- **D-06:** Which queries to group: All independent DB queries (base pay, commissions, deductions) in one `Promise.all`.
- **D-07:** Post-processing: Yes, compute totals/summaries after all parallel queries finish.
- **D-08:** Timeout: No timeout on `Promise.all` (trust DB, keep simple).

### Claude's Discretion
- For PERF-02 (N+1 fix): Use Prisma `include` with `select` to batch fetch related services in one query.
- For PERF-03 (database index): Add single-column index on `commission.commission_date` (no composite needed per user decisions).
- For PERF-04 (streaming): Use `busboy` or `@vercel/blob`'s built-in streaming support for multipart uploads, threshold at 5MB.
- For PERF-05 (transaction): Wrap DB operations (update appointment, create transaction, create commissions, in-app notifications) in `prisma.$transaction()`, keep email outside with log-only failure.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase-Specific Files
- `backend/src/controllers/payrollController.ts` — PERF-01: Fix sequential awaits with Promise.all
- `backend/src/controllers/reportController.ts` — PERF-02: Fix N+1 query pattern (batch fetch services)
- `backend/prisma/schema.prisma` — PERF-03: Add index on commission.commission_date
- `backend/src/controllers/uploadController.ts` — PERF-04: Stream large file uploads (currently Base64)
- `backend/src/controllers/appointmentController.ts` (or `appointmentCompletion.ts`) — PERF-05: Wrap completion in Prisma transaction

### Schema & Config
- `backend/prisma/schema.prisma` — Commission model for PERF-03 index, Appointment/Transaction/Commission models for PERF-05 transaction

### Project-Level Docs
- `.planning/PROJECT.md` — Key Decisions: Zod for validation, testing stack (Jest/Vitest)
- `.planning/ROADMAP.md` — Phase 5 goals and success criteria
- `.planning/STATE.md` — Current position: Phase 5 ready to execute

### Prior Phase Decisions
- `.planning/phases/02-type-safety-code-quality/02-CONTEXT.md` — D-04: Preserve try/catch pattern, D-10: `catch (error: unknown)` + narrowing
- `.planning/phases/03-security-hardening/03-CONTEXT.md` — D-07: Log blocked notifications with WARNING, SEC-06: Transaction ordering for token rotation
- `.planning/phases/04-api-improvements/04-CONTEXT.md` — D-03: Error response format, D-04: getCurrentUser helper, D-09: Cursor pagination with ID field

### Codebase Maps
- `.planning/codebase/STACK.md` — Prisma 6.4.1, @vercel/blob 2.3.3, nodemailer 8.0.5
- `.planning/codebase/ARCHITECTURE.md` — Controller patterns, Prisma transaction usage, async notifications anti-pattern
- `.planning/codebase/INTEGRATIONS.md` — @vercel/blob upload (Base64), nodemailer email sending

### Established Patterns (from prior phases)
- try/catch + console.error + standardized error response pattern throughout all controllers
- `authorizeRoles()` middleware for role-based access control
- Controller functions: `async (req, res) => { try { ... } catch (error: unknown) { ... } }`
- Prisma transactions for multi-table operations (e.g., appointment creation, completion)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Controller error pattern:** `try/catch` with `console.error` and `{ success: false, error: { code, message } }` — will preserve for PERF-01/05.
- **Prisma ORM 6.4.1:** Native support for transactions (`$transaction()`), `include` with `select` for batch queries (PERF-02), index definitions in schema.prisma (PERF-03).
- **@vercel/blob 2.3.3:** Currently uses Base64-encoded upload in `uploadController.ts` — needs streaming refactor for PERF-04.
- **nodemailer 8.0.5:** Email sending in `backend/src/utils/email.ts` — used for appointment completion receipts (PERF-05).
- **Prisma singleton:** `backend/src/utils/prisma.ts` (global variable + conditional assignment) — used in all controllers.

### Established Patterns
- **Response format:** `{ success: boolean, data?: any, error?: { code, message } }` — preserve for all endpoints.
- **Controller functions:** `async (req, res) => { try { ... } catch (error: unknown) { ... } }` — no asyncHandler wrapper (Phase 2 D-04).
- **Role-based access:** `authorizeRoles()` middleware on routes — applies to all controllers.
- **Async notifications:** Fire-and-forget async IIFE after controller response — anti-pattern noted in ARCHITECTURE.md, email failure handling addressed in PERF-05.

### Integration Points
- **payrollController.ts → Promise.all:** Independent DB queries (base pay, commissions, deductions) grouped in `Promise.all`, post-processing for totals.
- **reportController.ts → Prisma query:** Replace N+1 loop with single query using `include` or batch `findMany`.
- **schema.prisma → index:** Add `@@index([commission_date])` to Commission model for PERF-03.
- **uploadController.ts → streaming:** Replace Base64 with streaming middleware (busboy or @vercel/blob streaming) for PERF-04.
- **appointmentController.ts → transaction:** Wrap DB operations in `prisma.$transaction()`, keep email outside with log-only failure.
</code_context>

<specifics>
## Specific Ideas

- For PERF-01: `Promise.all([basePayQuery, commissionsQuery, deductionsQuery])` then post-process totals. Fail whole request if any reject.
- For PERF-02: `prisma.appointment.findMany({ include: { services: { include: { service: true } } } })` to batch fetch all services in one query.
- For PERF-03: In schema.prisma: `@@index([commission_date])` on Commission model. Simple single-column index for unpaid records query.
- For PERF-04: Use `busboy` to parse multipart/form-data and pipe to @vercel/blob put() with streaming. Threshold: 5MB before streaming kicks in.
- For PERF-05: `await prisma.$transaction([ updateAppointment, createTransaction, createCommissions, createNotifications ])` then `sendEmail().catch(console.error)`.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 5 scope.
</deferred>

---

*Phase: 5-Performance Optimization*
*Context gathered: 2026-05-03*
