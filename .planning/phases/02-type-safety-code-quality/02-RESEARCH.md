# Phase 2: Type Safety & Code Quality - Research

**Researched:** 2026-05-02
**Domain:** TypeScript type safety, React component decomposition, Express controller splitting
**Confidence:** HIGH

## Summary

Phase 2 addresses three technical debt requirements: replacing `any` types with proper TypeScript interfaces across ~97 occurrences in the codebase, splitting the 1226-line ManagerDashboard.tsx into manageable components, and splitting the 537-line appointmentController.ts into focused modules. The codebase uses TypeScript 6.0.3 with strict mode enabled in the backend (`"strict": true` in tsconfig.json) and `"verbatimModuleSyntax": true` in the frontend. ESLint is configured with `@typescript-eslint/no-explicit-any': 'warn'` in both frontend and backend, meaning `any` usage already triggers warnings but does not fail the build.

The `any` type usage falls into three clear categories: (1) `catch (error: any)` patterns in ~30 backend controller catch blocks and ~10 frontend catch blocks, (2) `as any` type assertions used as workarounds for Prisma enum types and `parseInt` calls, and (3) untyped function parameters in apiClient.ts (`data: any`). The fix patterns are well-established: `unknown` with narrowing for catch blocks, Prisma-generated types for database entities, and proper interfaces for API payloads.

Component splitting follows established React patterns. ManagerDashboard.tsx contains 6 view modes (analytics, staff, attendance, deductions, payroll, reviews) with 4 renderable data tables that should be extracted. The component already uses `useState` with typed state — extracted components will receive data and setters via props (props drilling, per Decision D-06, no DashboardContext). Controller splitting follows the existing single-file-per-concern pattern already used by authController.ts, payrollController.ts, and staffController.ts.

**Primary recommendation:** Replace all `any` types with properly narrowed types using a three-tier approach: `unknown` + narrowing for catch blocks, Prisma-generated types for database entities, and hand-crafted interfaces for API payloads and component props. Split files by extracting self-contained render blocks into dedicated component files with properly typed props interfaces.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Type replacement (any -> proper types) | Frontend (browser) + Backend (API) | Shared types layer | TypeScript types exist at compile time across all tiers; frontend and backend each maintain their own type definitions |
| ManagerDashboard component splitting | Frontend (browser) | None | Pure UI decomposition; React components render in browser only |
| appointmentController.ts splitting | Backend (API server) | None | Express controller logic runs server-side only |
| API client type safety | Frontend (browser) | Backend (API contract) | Frontend defines request types; backend defines response shapes via Prisma |
| Error type narrowing (catch blocks) | Frontend + Backend | None | Both tiers use try/catch with error typing |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript 6.0.3 | 6.0.3 (frontend), ~6.0.2 (backend) | Type safety across codebase | Already in use; strict mode in backend, `verbatimModuleSyntax` in frontend [VERIFIED: npm registry + package.json] |
| Prisma 6.4.1 | 6.4.1 | ORM and type generation | Generates TypeScript types from schema.prisma; types available at `backend/node_modules/.prisma/client` [VERIFIED: npm registry + schema.prisma] |
| Express.js 5.2.1 | 5.2.1 | HTTP server framework | Backend controllers to be split use Express Request/Response types from @types/express 5.0.6 [VERIFIED: npm registry] |
| React 19.2.5 | 19.2.5 | UI framework | ManagerDashboard.tsx and extracted components use React.FC pattern [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/express 5.0.6 | 5.0.6 | Express type definitions | Typing Request, Response, NextFunction in controllers [VERIFIED: npm registry] |
| jsonwebtoken 9.0.3 | 9.0.3 | JWT token handling | AuthRequest interface extends Request with `user` property [VERIFIED: npm registry] |
| date-fns 4.1.0 | 4.1.0 | Date manipulation | Used in appointmentController.ts for date calculations [VERIFIED: package.json] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `catch (error: unknown)` + narrowing | `catch (error: Error)` | Error type is too restrictive; unknown is the correct Type-safe approach in TypeScript 4.4+ [CITED: typescriptlang.org/docs/handbook/release-notes/typescript-4.4.html] |
| Prisma-generated types | Manual interface definitions | Prisma types stay in sync with schema; manual interfaces drift [ASSUMED] |
| Props drilling for dashboard components | DashboardContext (useReducer) | Decision D-06 explicitly rejects context; props drilling is simpler for this scale [VERIFIED: CONTEXT.md D-06] |

**Installation:**
```bash
# All dependencies already installed
# TypeScript, Prisma, React, Express types are all in package.json
# No new packages required for this phase
```

**Version verification:**
```bash
npm view typescript version  # 6.0.3 (frontend), ~6.0.2 (backend)
npm view @prisma/client version  # 6.4.1
npm view @types/express version  # 5.0.6
```

## Architecture Patterns

### System Architecture Diagram

```
Phase 2 Type Safety & Code Quality - No runtime architecture changes.
This phase improves compile-time type safety and code organization only.

BEFORE (Current State)                 AFTER (Improved State)
=============================          =========================

[Express Controllers]                   [Express Controllers]
appointmentController.ts (537 lines) --> appointmentController.ts (CRUD, ~150 lines)
  |-- getAppointments                     |-- getAppointments
  |-- completeAppointment               --> appointmentAvailability.ts (~150 lines)
  |-- getAvailableSlots                   |-- getAvailableSlots
  |-- createAppointment                  |-- getCommissionSummary
  |-- getCommissionSummary              --> appointmentCompletion.ts (~200 lines)
  |-- getStaffCommissions                 |-- completeAppointment
                                           |-- createAppointment
                                           |-- helpers (getTieredCommissionRate, etc.)

[React Pages]                           [React Pages + Components]
ManagerDashboard.tsx (1226 lines) ---->  ManagerDashboard.tsx (~300 lines)
  |-- Analytics view (kept)               |-- State management
  |-- Staff view (extract)                |-- View switching
  |-- Attendance view (extract)          --> components/dashboard/StaffTable.tsx
  |-- Deductions form (kept)             --> components/dashboard/PayrollTable.tsx
  |-- Payroll view (extract)              --> components/dashboard/AttendanceLedger.tsx
  |-- Reviews view (extract)              --> components/dashboard/ReviewModeration.tsx
                                           --> components/dashboard/types.ts (shared props)

[Type Safety]                            [Type Safety]
catch (error: any)  -->  catch (error: unknown) + narrowing
let where: any = {}  -->  proper Prisma WhereInput types
data: any (apiClient) -->  typed request interfaces
as any (type assertions) -->  proper type casting or Prisma enum usage
```

### Recommended Project Structure

```
backend/src/
├── controllers/
│   ├── appointmentController.ts      # CRUD operations only (getAppointments)
│   ├── appointmentAvailability.ts   # getAvailableSlots, getCommissionSummary, getStaffCommissions
│   ├── appointmentCompletion.ts     # completeAppointment, createAppointment + helpers
│   ├── authController.ts            # (unchanged)
│   ├── payrollController.ts         # (unchanged)
│   └── ...                         # (other controllers unchanged)
├── types/
│   └── appointmentTypes.ts          # CreateAppointmentInput, AppointmentWithDetails, etc.
├── middleware/
│   └── authMiddleware.ts            # (update: remove `as any` from verifyAccessToken)
└── utils/
    └── jwt.ts                       # (update: type the return of verify functions)

frontend/src/
├── components/
│   ├── dashboard/                   # NEW: Extracted dashboard components
│   │   ├── StaffTable.tsx
│   │   ├── PayrollTable.tsx
│   │   ├── AttendanceLedger.tsx
│   │   ├── ReviewModeration.tsx
│   │   └── types.ts                 # StaffTableProps, PayrollTableProps, etc.
│   └── ui/                          # (existing UI components, unchanged)
├── pages/
│   ├── ManagerDashboard.tsx         # SLIMMED: ~300 lines (state + analytics + deductions)
│   └── ...                         # (other pages unchanged)
├── types/                            # NEW: Frontend type definitions
│   ├── User.ts                      # User interface (from AuthContext)
│   ├── CartItem.ts                  # CartItem interface (from CartContext)
│   └── api.ts                       # API request/response interfaces
└── api/
    └── apiClient.ts                  # UPDATE: replace `data: any` with proper types
```

### Pattern 1: Replace `catch (error: any)` with `unknown` + narrowing
**What:** TypeScript 4.4+ supports `unknown` in catch clauses for type-safe error handling
**When to use:** Every catch block in the codebase (30+ backend, 10+ frontend)
**Example:**
```typescript
// BEFORE (current pattern):
} catch (error: any) {
  console.error('Operation error:', error);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: error.message }
  });
}

// AFTER (type-safe pattern):
} catch (error: unknown) {
  console.error('Operation error:', error);
  const message = error instanceof Error ? error.message : 'Failed to complete operation';
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message }
  });
}
```
Source: [CITED: typescriptlang.org/docs/handbook/release-notes/typescript-4.4.html#catch-clauses-can-now-be-typed-as-unknown]

### Pattern 2: Prisma type imports for database entities
**What:** Prisma generates TypeScript types from schema.prisma that can be imported and used
**When to use:** Controller functions returning database entities, type annotations for Prisma queries
**Example:**
```typescript
import { Appointment, AppointmentItem, Service, Prisma } from '@prisma/client';

// Typed where clause instead of `let where: any = {}`
const where: Prisma.AppointmentWhereInput = {};
if (role === 'customer') {
  where.customer_id = customer.id;
} else if (role === 'staff') {
  where.items = { some: { staff_id: staff.id } };
}

// Typed return type for controller
export const getAppointments = async (req: AuthRequest, res: Response<AppointmentWithRelations>) => {
  // ...
};
```
[VERIFIED: Prisma client index.d.ts generates types for all models]

### Pattern 3: Props drilling for extracted components
**What:** Pass data and state setters as props to child components (no context/reducer)
**When to use:** Dashboard component extraction (Decision D-06: "Use props drilling for state management")
**Example:**
```typescript
// types.ts
export interface StaffTableProps {
  staffMembers: StaffMember[];
  onStaffClick: (staff: StaffMember) => void;
}

// StaffTable.tsx
export const StaffTable: React.FC<StaffTableProps> = ({ staffMembers, onStaffClick }) => {
  return (
    <Card className="rounded-none border-none shadow-sm overflow-hidden">
      <Table>
        {/* ... table rendering ... */}
      </Table>
    </Card>
  );
};
```
[ASSUMED: Standard React pattern for this component scale]

### Pattern 4: API client request typing
**What:** Replace `data: any` parameters with properly typed interfaces
**When to use:** All apiClient.ts function signatures
**Example:**
```typescript
// types/api.ts
export interface CreateStaffRequest {
  fullName: string;
  email?: string;
  phone?: string;
  username: string;
  password: string;
  specializations?: string;
  basePayPerWeek: number;
  dailyTarget: number;
  sssNumber?: string;
  tinNumber?: string;
  govId?: string;
  profilePictureUrl?: string;
}

// apiClient.ts
export const createStaff = (data: CreateStaffRequest) => apiClient.post('/staff', data);
export const updateStaff = (id: number, data: Partial<CreateStaffRequest>) => apiClient.put(`/staff/${id}`, data);
```

### Anti-Patterns to Avoid
- **Using `as any` to silence TypeScript errors:** The `payment_method: paymentMethod as any` in appointmentController.ts (line 237) exists because Prisma expects the PaymentMethod enum. Fix: `payment_method: paymentMethod as PaymentMethod` or import and use the enum type properly.
- **`parseInt(id as string)`:** The `as string` cast is unnecessary when `id` is already typed. Fix: Type the route parameter properly in the route definition or use `Number(id)` with validation.
- **Creating a DashboardContext when props drilling suffices:** Decision D-06 explicitly rejects this. The dashboard has ~4 extractable components with straightforward data flows.
- **Mixing Prisma types with frontend types:** Decision D-11 states frontend types should be independent, not sharing Prisma types directly. Create frontend-specific interfaces in `frontend/src/types/`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database entity types | Custom interfaces mirroring Prisma schema | `@prisma/client` generated types | Prisma types are auto-generated from schema.prisma, stay in sync with database schema [VERIFIED: Prisma client] |
| JWT token payload typing | `interface JwtPayload { sub: number; email: string; role: string }` | `jsonwebtoken.JwtPayload` or typed verify function | jwt.verify returns `JwtPayload` string, or `any` depending on overload; better to type the verify function return [ASSUMED] |
| Express request typing | Custom `req: any` or `req: Request` without user | `AuthRequest` interface (already defined in authMiddleware.ts) | AuthRequest already extends Request with user property; use it consistently [VERIFIED: authMiddleware.ts] |
| Error type narrowing | Custom error type checks | `error instanceof Error` (built-in) | Standard JavaScript Error class works for all thrown errors; instanceof check is the recommended pattern [CITED: typescriptlang.org/docs] |

**Key insight:** The codebase already has good patterns in place (AuthRequest interface, Prisma types available). The phase primarily requires systematic application of these patterns and removal of `any` shortcuts.

## Runtime State Inventory

> This section is included because the phase involves file splitting and renaming of imports, which could break runtime behavior if import paths are incorrect.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database schema changes | No migration needed |
| Live service config | None — no service configuration changes | No config updates needed |
| OS-registered state | None — no OS-level changes | No OS changes needed |
| Secrets/env vars | None — no environment variable changes | No env var updates needed |
| Build artifacts | `backend/tsconfig.tsbuildinfo` — stale build info after controller split | Delete and rebuild: `rm backend/tsconfig.tsbuildinfo` then `npm run build` in backend |

**Nothing found in other categories:** Verified by reading the files to be modified — all changes are compile-time (types) or file organization (splitting), no runtime state changes required.

## Common Pitfalls

### Pitfall 1: Circular Import Dependencies After Controller Split
**What goes wrong:** When splitting appointmentController.ts into 3 files, shared types or helpers might be imported circularly (e.g., appointmentCompletion.ts imports from appointmentController.ts which imports from appointmentCompletion.ts)
**Why it happens:** Extracting code without considering import dependency direction
**How to avoid:** Create `backend/src/types/appointmentTypes.ts` as a shared dependency. All 3 controllers import FROM types file. No controller imports from another controller. Helpers like `getTieredCommissionRate` and `checkSpecialtyQuota` go in `appointmentCompletion.ts` (the file that uses them) or a separate `appointmentHelpers.ts`.
**Warning signs:** TypeScript errors about circular dependencies; runtime `Cannot access before initialization` errors.

### Pitfall 2: Broken Import Paths After Component Extraction
**What goes wrong:** ManagerDashboard.tsx imports extracted components with wrong paths, or components import types from wrong location
**Why it happens:** Moving code between files without updating import statements
**How to avoid:** Extract components to `frontend/src/components/dashboard/` and update imports in ManagerDashboard.tsx to use relative paths (`../components/dashboard/StaffTable`). Create `types.ts` in the same directory for component props.
**Warning signs:** Module not found errors at build time; components rendering blank due to import failures.

### Pitfall 3: Losing State Initialization During Dashboard Split
**What goes wrong:** State that was in ManagerDashboard.tsx gets lost or duplicated when extracting components
**Why it happens:** Extracting a component that needs state without properly passing state via props
**How to avoid:** Per Decision D-06, keep ALL state in ManagerDashboard.tsx. Extracted components receive data and setters via props. Do NOT move `useState` calls into extracted components.
**Warning signs:** Data not updating after user actions; "state is not a function" errors.

### Pitfall 4: Prisma Enum Type Mismatch with `as any`
**What goes wrong:** `payment_method: paymentMethod as any` works because Prisma expects `PaymentMethod` enum, but `paymentMethod` is typed as `string` from `req.body`
**Why it happens:** Request body is untyped `any`, so `paymentMethod` is inferred as `string`, not `PaymentMethod`
**How to avoid:** Import the enum: `import { PaymentMethod } from '@prisma/client'` and use `payment_method: paymentMethod as PaymentMethod` or validate the value against the enum values before using.
**Warning signs:** TypeScript error: "Type 'string' is not assignable to type 'PaymentMethod'"

### Pitfall 5: TypeScript `strict` Mode Breaking After `any` Removal
**What goes wrong:** Removing `any` types exposes previously hidden type errors (null checks, undefined checks, etc.)
**Why it happens:** `any` acts as an escape hatch that silences TypeScript checks
**How to avoid:** Enable `@typescript-eslint/no-explicit-any': 'error'` in ESLint AFTER completing all replacements. Fix newly exposed type errors incrementally. The backend already has `"strict": true`, so most issues should be caught early.
**Warning signs:** Cascading type errors after removing one `any`; "Object is possibly null" errors.

## Code Examples

Verified patterns from official sources:

### Typed Express Route with AuthRequest
```typescript
// Source: [VERIFIED: authMiddleware.ts + @types/express 5.0.6]
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { role } = req.user || {};

    // Prisma WhereInput type instead of `let where: any = {}`
    const where: Prisma.AppointmentWhereInput = {};
    if (role === 'customer') {
      const customer = await prisma.customerProfile.findUnique({ where: { user_id: userId } });
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      where.customer_id = customer.id;
    }

    const appointments = await prisma.appointment.findMany({ where, /* ... */ });
    return res.status(200).json({ success: true, data: appointments });
  } catch (error: unknown) {
    console.error('Get appointments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch appointments';
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } });
  }
};
```

### Typed React Component with Props Interface
```typescript
// Source: [VERIFIED: Existing component patterns in frontend/src/components/ui/]
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface StaffTableProps {
  staffMembers: StaffMember[];
  onStaffClick: (staff: StaffMember) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({ staffMembers, onStaffClick }) => {
  return (
    <Card className="rounded-none border-none shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffMembers.map(staff => (
            <TableRow key={staff.id} onClick={() => onStaffClick(staff)}>
              {/* ... */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
```

### Prisma Type Import for Database Entities
```typescript
// Source: [VERIFIED: backend/node_modules/.prisma/client/index.d.ts]
import { Appointment, AppointmentItem, Service, PaymentMethod, Prisma } from '@prisma/client';

// Properly typed appointment creation
interface CreateAppointmentInput {
  customer_id: number;
  appointment_date: Date;
  status: string;
  is_walk_in: boolean;
  notes: string;
  items: {
    service_id: number;
    staff_id: number;
    start_time: string;
    end_time: string;
    price_at_booking: Prisma.Decimal;
  }[];
}

// Using Prisma enums instead of `as any`
const paymentMethodEnum: PaymentMethod = paymentMethod as PaymentMethod;
// Or validate against the enum:
if (!Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
  return res.status(400).json({ success: false, message: 'Invalid payment method' });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `catch (error: any)` + `error.message` | `catch (error: unknown)` + `instanceof Error` check | TypeScript 4.4+ (2021) | Type-safe error handling; prevents runtime errors from non-Error throws |
| `let where: any = {}` for Prisma queries | `Prisma.ModelWhereInput` typed where clauses | Prisma 2.0+ (2019) | Type-safe query building with autocomplete |
| `data: any` in API client | Typed request/response interfaces | N/A (best practice) | Compile-time checks for API calls |

**Deprecated/outdated:**
- `catch (error: any)` pattern — still works but triggers ESLint warning; replace with `unknown` + narrowing
- `as any` for Prisma enums — works but loses type safety; use proper enum types

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prisma-generated types can be imported directly in controllers (`import { Appointment, Prisma } from '@prisma/client'`) | Standard Stack / Code Examples | LOW — even if import path differs, types are available somewhere in node_modules/.prisma/client |
| A2 | Props drilling is sufficient for 4 extracted dashboard components (no Context needed) | Architecture Patterns / Anti-Patterns | LOW — if wrong, can refactor to Context later; Decision D-06 explicitly chooses props drilling |
| A3 | `jsonwebtoken.JwtPayload` can be used to type the verify function return | Don't Hand-Roll | MEDIUM — jwt.verify has complex overloads; may need custom type or `as JwtPayload` cast |
| A4 | Frontend types should be independent from Prisma types (Decision D-11) | Architecture Patterns | LOW — if wrong, can import Prisma types in frontend (not recommended due to bundle size) |
| A5 | `@typescript-eslint/no-explicit-any': 'warn'` can be changed to `'error'` after phase completes | Common Pitfalls (Pitfall 5) | LOW — this is a recommendation, not required for phase completion |

## Open Questions

1. **Should the `verifyAccessToken` function in jwt.ts be typed to return a specific payload type?**
   - What we know: Currently returns `jwt.verify(token, SECRET)` which TypeScript infers as `any` or `string | JwtPayload`
   - What's unclear: Whether to type the function signature or use `as JwtPayload` at the call site (authMiddleware.ts line 26)
   - Recommendation: Type the function: `export const verifyAccessToken = (token: string): JwtPayload => { ... }` with proper error handling

2. **Should `parseInt(id as string)` patterns be replaced with `Number(id)` or route parameter validation?**
   - What we know: Express route params are strings; `parseInt(id as string)` is used in many controllers
   - What's unclear: Whether to use Zod validation (Phase 4) or simple `Number()` conversion with NaN checks
   - Recommendation: For this phase, use `Number(id)` with a NaN check, or remove the unnecessary `as string` cast since `id` from `req.params` is already a string

3. **Should the `as any` cast for Prisma enums be replaced with proper enum imports or validated against enum values?**
   - What we know: `payment_method: paymentMethod as any` exists because `paymentMethod` from `req.body` is typed as `string`, not `PaymentMethod`
   - What's unclear: Whether to import `{ PaymentMethod } from '@prisma/client'` and use `as PaymentMethod`, or validate the value
   - Recommendation: Import the enum type and cast to it, since Phase 4 will add Zod validation that ensures the value is valid

## Environment Availability

> Phase 2 has external dependencies (TypeScript compiler, Node.js runtime, Prisma CLI).

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | TypeScript compilation, Prisma CLI | YES | v24.15.0 | — |
| npm | Package management | YES | 11.12.1 | — |
| TypeScript (frontend) | Type checking frontend code | YES | 6.0.3 | — |
| TypeScript (backend) | Type checking backend code | YES | ~6.0.2 | — |
| Prisma CLI | Type generation from schema | YES | 6.4.1 | — |
| ESLint | Linting for `no-explicit-any` | YES | 9.39.4 (frontend), 10.2.1 (backend) | — |

**Missing dependencies with no fallback:**
- None — all required dependencies are available

**Missing dependencies with fallback:**
- None — all required dependencies are available

## Validation Architecture

> workflow.nyquist_validation is not explicitly set to false in .planning/config.json. Including this section per default-enabled policy.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently configured (TESTING.md recommends Jest + Supertest for backend, Vitest + RTL for frontend) |
| Config file | None exists — see Wave 0 |
| Quick run command | `npx jest --testPathPattern="phase-02" --watchAll=false` (once Jest is configured) |
| Full suite command | `cd backend && npx jest --coverage` or `cd frontend && npx vitest run` (once configured) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEBT-01 | Replace `any` with proper interfaces (50+ occurrences) | Static (TypeScript compilation) | `tsc --noEmit` in backend and frontend | N/A (static analysis) |
| DEBT-02 | Split ManagerDashboard.tsx into components | Static (import resolution) | `vite build` for frontend | N/A (build verification) |
| DEBT-03 | Split appointmentController.ts into modules | Static (import resolution) | `cd backend && npx tsc --noEmit` | N/A (static analysis) |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (backend) and `npx tsc --noEmit` (frontend) to verify type correctness
- **Per wave merge:** Full TypeScript compilation in both frontend and backend
- **Phase gate:** Both `vite build` (frontend) and `tsc --noEmit` (backend) must pass before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Test framework installation: `npm install --save-dev jest ts-jest @types/jest` (backend), `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom` (frontend) — Phase 7/8 will address this
- [ ] `backend/tsconfig.json` — already has `"strict": true`, sufficient for type checking
- [ ] `frontend/tsconfig.app.json` — already has strict-ish settings, sufficient for type checking
- [ ] ESLint configs already have `@typescript-eslint/no-explicit-any': 'warn'` — can be upgraded to `'error'` after phase completes

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

**Note:** Phase 2 is primarily about static type improvements and code organization. Runtime tests (Phase 7/8) will verify behavior is preserved after refactoring. The primary verification for this phase is successful TypeScript compilation (`tsc --noEmit`) and successful builds (`vite build` / `tsc` with output).

## Security Domain

> security_enforcement is not explicitly set to false. Including this section per default-enabled policy.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 2 does not modify auth logic; only type safety improvements |
| V3 Session Management | No | Phase 2 does not modify session handling |
| V4 Access Control | No | Phase 2 does not modify access control; AuthRequest interface already properly typed |
| V5 Input Validation | Yes (indirect) | Replacing `any` with proper types improves type-level input validation; Zod validation in Phase 4 will add runtime validation |
| V6 Cryptography | No | Phase 2 does not modify crypto usage; jwt.ts types may be improved but crypto logic unchanged |

### Known Threat Patterns for Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| TypeScript `any` bypassing type checks | Tampering (indirect) | Replace `any` with proper types; enable `@typescript-eslint/no-explicit-any': 'error'` after phase |
| `catch (error: any)` hiding error types | Information Disclosure | Use `catch (error: unknown)` + `instanceof Error` narrowing |

## Sources

### Primary (HIGH confidence)
- `backend/node_modules/.prisma/client/index.d.ts` - Prisma generated types verified
- `@types/express@5.0.6` - Express type definitions verified via npm registry
- `TypeScript 6.0.3` - TypeScript version verified via npm registry
- `ESLint configs` - `@typescript-eslint/no-explicit-any': 'warn'` verified in frontend/eslint.config.js and backend/eslint.config.mjs
- `authMiddleware.ts` - AuthRequest interface verified (lines 4-12)
- `schema.prisma` - Database schema verified (all models and enums present)

### Secondary (MEDIUM confidence)
- [TypeScript 4.4 Release Notes - Catch Clauses](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4.4.html#catch-clauses-can-now-be-typed-as-unknown) - Catch clause typing with `unknown`
- [Prisma Documentation - Generated Types](https://www.prisma.io/docs/concepts/components/prisma-client/type-safety) - Prisma type generation patterns

### Tertiary (LOW confidence)
- [ASSUMED] Prisma types import path is `@prisma/client` — verified by schema.prisma generator config
- [ASSUMED] Props drilling sufficient for 4 dashboard components — based on Decision D-06 and component complexity assessment

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via npm registry and package.json files
- Architecture: HIGH - Patterns verified against existing codebase conventions (CONTEXT.md, CONVENTIONS.md, STACK.md)
- Pitfalls: MEDIUM - Most pitfalls identified from codebase analysis; some assumptions about Prisma enum typing

**Research date:** 2026-05-02
**Valid until:** 2026-06-01 (30 days for TypeScript/tooling stack, which is relatively stable)
