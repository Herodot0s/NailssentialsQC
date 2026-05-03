# Phase 4: API Improvements - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers API improvements for NailssentialsQC — adding cursor-based pagination to list endpoints, extracting duplicate code into shared helpers, and migrating from express-validator to Zod validation.

**In scope:**
- DEBT-04: Add cursor-based pagination to all list endpoints (appointments, staff, payroll periods)
- DEBT-05: Extract duplicate auth checks, error responses, and notification patterns into shared helpers
- DEBT-06: Add Zod schema validation to all API endpoints (replace express-validator)

**Out of scope:**
- Tests (Phase 7/8)
- New features or capabilities
- Frontend changes (pagination consumption will be in later phases)
- Audit trail (FEAT-01, Phase 6)
</domain>

<decisions>
## Implementation Decisions

### Shared Helpers Extraction (DEBT-05)
- **D-01:** Location: `backend/src/utils/apiHelpers.ts` (new file, co-located with other utils)
- **D-02:** Includes: Error + success formatters only (not notifications or query patterns)
- **D-03:** Error response format: Standardized `{ success: boolean, error: { code, message, fieldErrors? } }` with optional fieldErrors for validation failures
- **D-04:** User context helper: `getCurrentUser(req)` returning `{ userId, role, ... }` to replace repeated `req.user.sub` / `req.user.role` access

### Zod Migration Strategy (DEBT-06)
- **D-05:** Migration strategy: All at once (replace express-validator on all routes in one pass, clean break)
- **D-06:** Schema location: Per-route schema files (e.g., `backend/src/schemas/authSchemas.ts`, `backend/src/schemas/appointmentSchemas.ts`)
- **D-07:** Validation error format: fieldErrors format — `{ success: false, error: { code: 'VALIDATION_ERROR', message: '...', fieldErrors: { field: [...] } } }`
- **D-08:** Validation scope: Body + query params + route params (comprehensive Zod schemas for all input)

### Pagination Design (DEBT-04)
- **D-09:** Cursor field: ID field (auto-incrementing primary key, simple and stable across all models)
- **D-10:** Page size: Default 20 items per page, max 100
- **D-11:** Response format: Standard format — `{ success: boolean, data: { items, nextCursor, hasMore } }`
- **D-12:** Pagination type: Cursor-only (no offset support, per phase requirement)

### Claude's Discretion
- For Zod migration: Remove express-validator as a dependency after migration is complete
- For apiHelpers.ts: Create `sendError(res, status, code, message, fieldErrors?)` and `sendSuccess(res, data)` functions. Use consistent import pattern across all controllers.
- For pagination: Use Prisma `cursor: { id: ... }` with `take: pageSize + 1` to detect hasMore (fetch one extra, then slice)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase-Specific Files
- `backend/src/controllers/appointmentController.ts` — Add pagination to list endpoints, add Zod validation
- `backend/src/controllers/staffController.ts` — Add pagination to staff list, add Zod validation
- `backend/src/controllers/payrollController.ts` — Add pagination to payroll periods, add Zod validation
- `backend/src/utils/apiHelpers.ts` — To be created (shared error/success formatters, getCurrentUser helper)
- `backend/src/schemas/` — To be created (per-route Zod schema files)

### Schema & Config
- `backend/prisma/schema.prisma` — All models need ID-based cursor pagination

### Project-Level Docs
- `.planning/PROJECT.md` — Key Decisions: Zod for validation, testing stack (Jest/Vitest)
- `.planning/ROADMAP.md` — Phase 4 goals and success criteria
- `.planning/STATE.md` — Current position: Phase 4 ready to execute

### Prior Phase Decisions
- `.planning/phases/01-critical-bug-fixes/01-CONTEXT.md` — D-06: Zod validation for route params
- `.planning/phases/02-type-safety-code-quality/02-CONTEXT.md` — D-04: Preserve try/catch pattern, no asyncHandler; D-10: `catch (error: unknown)` + narrowing
- `.planning/phases/03-security-hardening/03-CONTEXT.md` — express-validator currently used; Zod introduced incrementally

### Codebase Maps
- `.planning/codebase/STACK.md` — express-validator 7.3.2 (to be replaced), no Zod currently
- `.planning/codebase/ARCHITECTURE.md` — API layer patterns, controller error handling, response format
- `.planning/codebase/INTEGRATIONS.md` — No external API integrations affected

### Established Patterns (from prior phases)
- try/catch + console.error + standardized error response pattern throughout all controllers
- `authorizeRoles()` middleware for role-based access control
- Controller functions: `async (req, res) => { try { ... } catch (error: unknown) { ... } }`
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Controller error pattern:** `try/catch` with `console.error` and `{ success: false, error: { code, message } }` — will be replaced with `sendError()` helper from apiHelpers.ts
- **express-validator:** Currently used on routes (e.g., `authRoutes.ts`, `appointmentRoutes.ts`) — to be replaced with Zod schemas
- **Prisma cursor pagination:** Native support via `cursor`, `take`, `skip` params — no additional libraries needed

### Established Patterns
- **Response format:** `{ success: boolean, data?: any, error?: { code, message } }` — extend with `fieldErrors` for validation
- **Route definitions:** `router.METHOD('/path', [middleware], controllerFunction)` — middleware will become Zod validation instead of express-validator
- **Error handling:** `catch (error: unknown)` + `if (error instanceof Error)` narrowing (Phase 2 D-10)

### Integration Points
- **Routes → Controllers:** Currently use express-validator middleware; will change to Zod schema validation before controller functions
- **Controllers → apiHelpers.ts:** All controllers will import `sendError`, `sendSuccess`, `getCurrentUser` from new utils/apiHelpers.ts
- **Pagination:** Affects `appointmentController.ts` (list appointments), `staffController.ts` (list staff), `payrollController.ts` (list periods)
</code_context>

<specifics>
## Specific Ideas

- For apiHelpers.ts: `sendError(res, status, code, message, fieldErrors?)` should map to appropriate HTTP status codes (400 for validation, 401 for auth, 403 for forbidden, 404 for not found, 500 for server errors)
- For Zod schemas: Per-route files should be named `{route}Schemas.ts` (e.g., `appointmentSchemas.ts` for `appointmentRoutes.ts`) and co-located with controllers or in a shared `schemas/` folder
- For pagination: First page has no cursor; subsequent pages use `nextCursor` from previous response. Empty results return `{ items: [], nextCursor: null, hasMore: false }`
- Cursor-based pagination is more efficient than offset for large datasets and avoids race conditions when new items are inserted during pagination
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 4 scope.
</deferred>

---

*Phase: 4-API Improvements*
*Context gathered: 2026-05-03*
