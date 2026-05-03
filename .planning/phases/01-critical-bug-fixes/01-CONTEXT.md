# Phase 1: Critical Bug Fixes - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers fixes for 5 critical bugs (BUG-01 to BUG-05) to stabilize the NailssentialsQC system. This phase focuses exclusively on correcting existing broken behavior — no new features, no component library migrations, no schema changes unless required for bug fixes.

**In scope:**
- BUG-01: Fix JSX syntax errors in Navbar.tsx dropdown menu
- BUG-02: Fix hardcoded password 'N/A' for walk-in customers
- BUG-03: Fix ManagerDashboard setState type mismatch
- BUG-04: Fix parseInt without NaN checks on route params
- BUG-05: Fix staff schedule upsert logic

**Out of scope:**
- Component library migrations (Base UI → Radix)
- New features or capabilities
- Schema changes beyond what's required for bug fixes (e.g., adding `is_walk_in` field is out of scope)
</domain>

<decisions>
## Implementation Decisions

### Staff Schedule Upsert (BUG-05)
- **D-01:** Use `staff_id + day_of_week` composite key for upsert logic in `updateStaffSchedule`. Requires adding `@@unique([staff_id, day_of_week])` to StaffSchedule model in Prisma schema.
- **D-02:** Add Zod validation for schedule entries (day_of_week, start_time, end_time, is_active) in the `updateStaffSchedule` route, per project decision to use Zod incrementally.

### Navbar JSX Fix (BUG-01)
- **D-03:** Fix JSX syntax in place — add space between `DropdownMenuItem` and `render` prop in all occurrences (Navbar.tsx lines 130, 136, 143, 150). Do not migrate to Radix DropdownMenu (out of scope for bug fixes).

### Walk-in Password (BUG-02)
- **D-04:** Generate a random 12-character password, hash it with bcrypt (12 rounds), and set as `password_hash` for walk-in users. Existing code already sets `is_active: false` so walk-in users cannot login regardless.

### ManagerDashboard Type (BUG-03)
- **D-05:** Define `ActiveView` union type inline in ManagerDashboard.tsx: `type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews'`. Replace `as any` cast with `as ActiveView`.

### parseInt Validation (BUG-04)
- **D-06:** Add Zod validation for all numeric route params (`id`, etc.) across controllers (payrollController, attendanceController, serviceController). Use Zod schemas per project decision, not express-validator. Validate at route level before controllers.

### Claude's Discretion
- For BUG-04, apply Zod validation to the highest-traffic routes first (appointments, payroll, staff) before covering remaining routes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bug-Specific Files
- `backend/src/controllers/staffController.ts` — BUG-05: staff schedule upsert logic (lines 208-212)
- `frontend/src/components/Navbar.tsx` — BUG-01: JSX syntax errors (lines 130, 136, 143, 150)
- `backend/src/controllers/appointmentController.ts` — BUG-02: walk-in password hash (line 414)
- `frontend/src/pages/ManagerDashboard.tsx` — BUG-03: ActiveView type (line 444), menu item IDs (lines 411-416)
- `backend/src/controllers/payrollController.ts` — BUG-04: parseInt without NaN checks (lines 196, 290, 302)
- `backend/src/controllers/attendanceController.ts` — BUG-04: parseInt (line 289)
- `backend/src/controllers/serviceController.ts` — BUG-04: parseInt (lines 43, 104, 124, 139, 165, 171)

### Schema & Config
- `backend/prisma/schema.prisma` — StaffSchedule model (add composite unique constraint for BUG-05)
- `.planning/PROJECT.md` — Key Decisions: Zod for validation, Jest/Vitest for testing
- `.planning/codebase/CONCERNS.md` — Known bugs and fragile areas documentation
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Zod validation patterns**: No existing Zod schemas in codebase yet — Phase 1 will introduce Zod incrementally per project decision.
- **Prisma schema**: StaffSchedule model exists with `staff_id`, `day_of_week`, `start_time`, `end_time`, `is_active` fields.
- **Base UI DropdownMenu**: Navbar.tsx uses Base UI's DropdownMenu components (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem).

### Established Patterns
- **Controller error handling**: try/catch with `console.error` and standardized error response `{ success: false, error: { code, message } }`.
- **Route validation**: Currently uses express-validator middleware — will be replaced with Zod incrementally.
- **Type safety**: Extensive `any` usage in frontend (ManagerDashboard.tsx has `as any` casts).

### Integration Points
- **Staff schedule update**: `PUT /api/v1/staff/:id/schedule` route (staffRoutes.ts) → `updateStaffSchedule` controller.
- **Navbar**: Rendered in all authenticated pages via AuthContext.
- **Walk-in creation**: Happens in `POST /api/v1/appointments` when staff creates appointment for walk-in customer.
</code_context>

<specifics>
## Specific Ideas

- For BUG-05: The composite key `staff_id + day_of_week` assumes one schedule per staff per day — matches existing unique constraint `uk_staff_date` in Attendance model.
- For BUG-02: Random password generation should use Node.js `crypto.randomBytes` or similar (not a library addition).
- For BUG-03: The `ActiveView` union type should match the `id` values in the `menuItems` array (lines 411-416).
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 1-Critical Bug Fixes*
*Context gathered: 2026-05-02*
