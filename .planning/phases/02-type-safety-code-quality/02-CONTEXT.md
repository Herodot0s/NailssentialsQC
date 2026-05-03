# Phase 2: Type Safety & Code Quality - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers type safety improvements (replacing `any` types with proper interfaces) and code quality improvements (splitting large files into manageable components). This phase addresses DEBT-01 (replace `any` types), DEBT-02 (split ManagerDashboard.tsx), and DEBT-03 (split appointmentController.ts).

**In scope:**
- DEBT-01: Replace `any` type with proper interfaces across frontend (50+ occurrences) and backend
- DEBT-02: Split ManagerDashboard.tsx (1224 lines) into separate components (StaffTable, PayrollTable, AttendanceLedger, ReviewModeration)
- DEBT-03: Split appointmentController.ts (527 lines) into separate modules

**Out of scope:**
- Adding tests (Phase 7/8)
- Zod validation (Phase 4)
- Extracting duplicate auth checks (DEBT-05, Phase 4)
- Debouncing localStorage writes (DEBT-07, Phase 8)

</domain>

<decisions>
## Implementation Decisions

### appointmentController Split
- **D-01:** Split by function — keep `appointmentController.ts` (CRUD operations), create `appointmentAvailability.ts` (getAvailableSlots, getStaffAvailability), and `appointmentCompletion.ts` (completeAppointment, generateReceipt). Matches existing single-file-per-concern pattern.
- **D-02:** Keep all routes together in `appointmentRoutes.ts`, import from all 3 controllers. Do not split routes to match controllers.
- **D-03:** Create shared types file at `backend/src/types/appointmentTypes.ts` with interfaces (CreateAppointmentInput, AppointmentWithDetails, etc.) for reuse across controllers and future tests.
- **D-04:** Keep existing try/catch error pattern with `console.error` in each controller. Do not introduce `asyncHandler` wrapper.

### ManagerDashboard Split
- **D-05:** Extract components to `frontend/src/components/dashboard/` directory (StaffTable.tsx, PayrollTable.tsx, AttendanceLedger.tsx, ReviewModeration.tsx). Clean separation from pages/.
- **D-06:** Use props drilling for state management — pass data and setState functions as props to extracted components. No DashboardContext or useReducer.
- **D-07:** Extract all 4 components at once (StaffTable, PayrollTable, AttendanceLedger, ReviewModeration). Remaining in ManagerDashboard.tsx: Analytics view, Deductions form, state management + view switching.
- **D-08:** Create shared types file at `frontend/src/components/dashboard/types.ts` with StaffTableProps, PayrollTableProps, etc.

### `any` Type Replacement
- **D-09:** Prioritize critical paths first: AuthContext.tsx (user type, login response), ManagerDashboard.tsx (remaining usages), CartContext.tsx (cart items type), then backend controllers (catch blocks).
- **D-10:** Replace `catch (error: any)` with `catch (error: unknown)` + narrowing: `if (error instanceof Error) { ... } else { ... }`. Modern TypeScript pattern.
- **D-11:** Create independent frontend types in `frontend/src/types/` (User.ts, CartItem.ts, etc.) — not shared with backend, not using Prisma types directly.
- **D-12:** Replace ALL 50+ `any` occurrences (frontend and backend), not just critical paths. Comprehensive type safety improvement.

### Claude's Discretion
- For `any` type replacement, process frontend files first (50+ occurrences) before backend catch blocks, despite "critical paths first" priority — frontend has significantly more `any` usages.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase-Specific Files
- `backend/src/controllers/appointmentController.ts` — to be split (527 lines, CRUD + availability + completion)
- `frontend/src/pages/ManagerDashboard.tsx` — to be split (1224 lines, 4 components to extract)
- `backend/src/types/appointmentTypes.ts` — to be created (shared interfaces)
- `frontend/src/components/dashboard/` — to be created (extracted components)
- `frontend/src/components/dashboard/types.ts` — to be created (component props interfaces)
- `frontend/src/types/` — to be created (User.ts, CartItem.ts, etc.)

### Codebase Maps
- `.planning/codebase/STACK.md` — TypeScript 6.0.3, ESLint configs, testing recommendations (Jest + Supertest, Vitest + RTL)
- `.planning/codebase/CONVENTIONS.md` — Naming patterns (PascalCase for controllers, etc.), code style, error handling patterns
- `.planning/codebase/TESTING.md` — Testing stack recommendations, test file organization patterns

### Project-Level Docs
- `.planning/PROJECT.md` — Key Decisions: Zod for validation, Jest/Vitest for testing
- `.planning/REQUIREMENTS.md` — DEBT-01, DEBT-02, DEBT-03 requirements

### Prior Phase Decisions (from Phase 1 CONTEXT.md)
- `any` → union type pattern (D-05 from Phase 1: ActiveView type in ManagerDashboard.tsx)
- Zod validation for API endpoints (D-06 from Phase 1)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Controller pattern:** try/catch with `console.error` and standardized error response `{ success: false, error: { code, message } }` — will be preserved in split controllers.
- **Component pattern:** Functional components with `React.FC` type — `any` types to be replaced with proper interfaces.
- **Base UI components:** `frontend/src/components/ui/` — extracted dashboard components can use existing Button, Input, Table, etc.

### Established Patterns
- **Controller error handling:** `catch (error: any)` — to be changed to `catch (error: unknown)` + narrowing.
- **Frontend state:** `useState` with `React.FC` type — `any` types in AuthContext.tsx, CartContext.tsx, etc. to be replaced.
- **Component extraction:** No prior examples in codebase — this phase establishes the pattern for future extractions.

### Integration Points
- **appointmentRoutes.ts:** Will import from 3 controllers instead of 1 (`appointmentController`, `appointmentAvailability`, `appointmentCompletion`).
- **ManagerDashboard.tsx:** Will import extracted components from `components/dashboard/`.
- **New types files:** Will be imported by controllers (`backend/src/types/appointmentTypes.ts`) and components (`frontend/src/types/`, `frontend/src/components/dashboard/types.ts`).

</code_context>

<specifics>
## Specific Ideas

- For appointmentController split: Follow existing single-file-per-concern pattern (like authController.ts, payrollController.ts, staffController.ts).
- For ManagerDashboard split: Keep Analytics view and Deductions form in ManagerDashboard.tsx (not extracted — they're smaller/simpler than the 4 table components).
- For `any` type replacement: Phase 1 already replaced `ActiveView as any` with union type in ManagerDashboard.tsx — remaining `any` usages are in AuthContext.tsx, CartContext.tsx, Login.tsx, Booking.tsx, etc.
- Backend `catch (error: any)` pattern is consistent across all controllers — replace uniformly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 2-Type Safety & Code Quality*
*Context gathered: 2026-05-02*
