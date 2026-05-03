# Phase 4: API Improvements - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 4-api-improvements
**Areas discussed:** Shared helpers extraction, Zod migration strategy, Pagination design

---

## Shared helpers extraction

| Option | Description | Selected |
|--------|-------------|----------|
| utils/apiHelpers.ts (Recommended) | New dedicated file in utils/ for API-specific helpers | ✓ |
| middleware/ folder | Extend existing middleware pattern | |
| Split by concern | Error helpers in utils/, auth in middleware/ | |

**User's choice:** utils/apiHelpers.ts
**Notes:** Keeps middleware/ focused on request pipeline, utils/ for business logic helpers

---

## Shared helpers extraction - Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Error + success formatters (Recommended) | Create sendError/sendSuccess functions | ✓ |
| Error + notifications | Also extract notification firing pattern | |
| Error + notifications + queries | Extract common Prisma query patterns too | |

**User's choice:** Error + success formatters
**Notes:** Focus on response formatting, not notifications or queries

---

## Shared helpers extraction - Error format

| Option | Description | Selected |
|--------|-------------|----------|
| Current pattern + fieldErrors (Recommended) | Standardize on { success, error: { code, message, fieldErrors? } } | ✓ |
| Current + details field | Add 'details' field for extra context | |
| Simpler: error as string | { success, data, error } where error is string | |

**User's choice:** Current pattern + fieldErrors
**Notes:** Consistent with existing pattern, adds fieldErrors for validation failures

---

## Shared helpers extraction - User context helper

| Option | Description | Selected |
|--------|-------------|----------|
| User context helper (Recommended) | Create getCurrentUser(req) returning { userId, role, ... } | ✓ |
| Keep req.user direct access | Simpler, no indirection | |
| Extend authorizeRoles | Single middleware does both auth + context | |

**User's choice:** User context helper
**Notes:** Reduces repeated req.user.sub / req.user.role access across controllers

---

## Zod migration strategy

| Option | Description | Selected |
|--------|-------------|----------|
| All at once (Recommended) | Replace express-validator on all routes at once | ✓ |
| Incremental by route | Replace per controller or per route group | |
| You decide | Claude chooses best approach | |

**User's choice:** All at once
**Notes:** Clean break, no dual-validation period

---

## Zod migration strategy - Schema location

| Option | Description | Selected |
|--------|-------------|----------|
| Per-route schema files (Recommended) | One file per route (e.g., authSchemas.ts) | ✓ |
| Centralized schemas/ folder | All Zod schemas in one place | |
| In routes files | Co-locate schemas with routes | |

**User's choice:** Per-route schema files
**Notes:** Clear mapping between routes and schemas

---

## Zod migration strategy - Error format

| Option | Description | Selected |
|--------|-------------|----------|
| fieldErrors format (Recommended) | Return { success: false, error: { code, fieldErrors: { field: [...] } } } | ✓ |
| Flat errors array | Return { success: false, error: { code, errors: [...] } } | |
| First error only | Return first error as message string | |

**User's choice:** fieldErrors format
**Notes:** Consistent with API error response format decision

---

## Zod migration strategy - Validation scope

| Option | Description | Selected |
|--------|-------------|----------|
| Body + query + params (Recommended) | Validate all inputs comprehensively | ✓ |
| Body + query only | Validate body and query, route params separately | |
| Body only for now | Validate body, add query/params later | |

**User's choice:** Body + query + params
**Notes:** Most comprehensive validation approach

---

## Pagination design - Cursor field

| Option | Description | Selected |
|--------|-------------|----------|
| ID field (Recommended) | Use auto-incrementing ID as cursor | ✓ |
| created_at + ID | Use timestamp with ID tiebreaker | |
| updated_at + ID | Use updated_at with ID tiebreaker | |

**User's choice:** ID field
**Notes:** Simple, stable, works across all models

---

## Pagination design - Page size

| Option | Description | Selected |
|--------|-------------|----------|
| Default 20, max 100 (Recommended) | Standard REST API defaults | ✓ |
| Default 50, max 200 | Larger pages for admin dashboards | |
| You decide | Claude chooses based on data size | |

**User's choice:** Default 20, max 100
**Notes:** Standard REST API defaults

---

## Pagination design - Response format

| Option | Description | Selected |
|--------|-------------|----------|
| Standard format (Recommended) | { success, data: { items, nextCursor, hasMore } } | ✓ |
| With totalCount | Include total count for UI | |
| Separate pagination meta | Separate data from pagination metadata | |

**User's choice:** Standard format
**Notes:** Clean and consistent with existing response patterns

---

## Pagination design - Pagination type

| Option | Description | Selected |
|--------|-------------|----------|
| Cursor-only (Recommended) | Cursor-based only, per phase requirement | ✓ |
| Cursor + offset | Support both cursor and ?offset= params | |
| You decide | Claude chooses best approach | |

**User's choice:** Cursor-only
**Notes:** Per phase requirement (DEBT-04 specifies cursor-based)

---

## Claude's Discretion

- Zod migration: Remove express-validator dependency after migration complete
- apiHelpers.ts: Create sendError(res, status, code, message, fieldErrors?) and sendSuccess(res, data) functions
- Pagination: Use Prisma cursor: { id: ... } with take: pageSize + 1 to detect hasMore

## Deferred Ideas

None — discussion stayed within Phase 4 scope.
