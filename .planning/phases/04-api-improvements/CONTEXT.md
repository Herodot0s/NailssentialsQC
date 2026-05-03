# Phase 4: API Improvements

## Phase Goal

Improve backend API quality by adding cursor-based pagination to list endpoints, extracting duplicate patterns into shared helpers, and introducing Zod schema validation to replace/incremental express-validator.

## Requirements (from PROJECT.md Traceability)

| ID | Description | Status |
|----|-------------|--------|
| DEBT-04 | Add cursor-based pagination to all list endpoints (appointments, staff, payroll periods) | Pending |
| DEBT-05 | Extract duplicate auth checks, error responses, and notification patterns into shared helpers | Pending |
| DEBT-06 | Add Zod schema validation to all API endpoints (replace express-validator or add Zod) | Pending |

## Scope

### In Scope
- Implement cursor-based pagination for:
  - `GET /api/appointments` (appointmentRoutes.ts)
  - `GET /api/staff` (staffRoutes.ts)
  - `GET /api/payroll/periods` (payrollRoutes.ts)
- Create shared helpers:
  - `authorize()` wrapper for role checks (unify `authorizeRoles`)
  - `sendError()` / `sendSuccess()` response helpers
  - `notify()` abstraction for email + in-app notifications
- Add Zod validation:
  - Install `zod` and `@types/express-zod` if needed
  - Create schema files in `backend/src/validators/`
  - Migrate 3-5 high-traffic endpoints as pilot (register, login, create appointment, complete appointment, generate payroll)

### Out of Scope
- Full replacement of express-validator (incremental Zod adoption)
- Other tech debt items (DEBT-01, 02, 03, 07)
- Security items (Phase 3)
- Performance items (Phase 5)
- Test coverage (Phase 7/8)

## Constraints
- Maintain backward compatibility (existing API consumers must not break)
- Keep existing express-validator middleware running alongside Zod during transition
- Pagination defaults: 20 items per page, max 100
- Cursor field: use `id` (sequential UUID or auto-increment) for simplicity
- Shared helpers must not introduce breaking changes to existing controller signatures

## Context References
- Project: `.planning/PROJECT.md` (Traceability table rows 91-93)
- Codebase docs: `.planning/codebase/` (architecture, patterns, concerns)
- Phase 2 (Type Safety): `.planning/phases/02-type-safety-code-quality/` (interface patterns)
- Commit `2959df0`: "docs(04): capture phase 4 API improvements context"
- Commit `98550c3`: "docs(state): record phase 4 context session"

## Success Criteria
1. All list endpoints return paginated responses with `nextCursor` when more items exist
2. Shared helpers reduce duplicated code in at least 5 controllers
3. At least 5 endpoints have Zod validation schemas with proper TypeScript types
4. No existing functionality broken (all existing routes still work)
5. Phase 4 requirements marked as completed in PROJECT.md Traceability table
