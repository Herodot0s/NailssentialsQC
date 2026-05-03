# Phase 1: Critical Bug Fixes - Research

**Researched:** 2026-05-02
**Domain:** Bug fixes across React frontend (JSX, TypeScript) and Express.js backend (validation, Prisma, bcrypt)
**Confidence:** HIGH

## Summary

Phase 1 addresses five critical bugs that prevent normal operation of the NailssentialsQC system. The bugs span frontend React components (Navbar.tsx JSX syntax, ManagerDashboard.tsx type safety) and backend Express controllers (parseInt validation, Prisma upsert logic, password hashing). All five bugs have been verified by reading the source files. The fixes require introducing Zod for input validation (replacing express-validator incrementally per project decision), adding a Prisma composite unique constraint, and correcting syntax/type errors.

**Primary recommendation:** Fix each bug in isolation with a dedicated plan per bug, introducing Zod validation incrementally starting with the highest-traffic routes (appointments, payroll, staff).

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `staff_id + day_of_week` composite key for upsert logic in `updateStaffSchedule`. Requires adding `@@unique([staff_id, day_of_week])` to StaffSchedule model in Prisma schema.
- **D-02:** Add Zod validation for schedule entries (day_of_week, start_time, end_time, is_active) in the `updateStaffSchedule` route, per project decision to use Zod incrementally.
- **D-03:** Fix JSX syntax in place — add space between `DropdownMenuItem` and `render` prop in all occurrences (Navbar.tsx lines 130, 136, 143, 150). Do not migrate to Radix DropdownMenu (out of scope for bug fixes).
- **D-04:** Generate a random 12-character password, hash it with bcrypt (12 rounds), and set as `password_hash` for walk-in users. Existing code already sets `is_active: false` so walk-in users cannot login regardless.
- **D-05:** Define `ActiveView` union type inline in ManagerDashboard.tsx: `type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews'`. Replace `as any` cast with `as ActiveView`.
- **D-06:** Add Zod validation for all numeric route params (`id`, etc.) across controllers (payrollController, attendanceController, serviceController). Use Zod schemas per project decision, not express-validator. Validate at route level before controllers.

### Claude's Discretion
- For BUG-04, apply Zod validation to the highest-traffic routes first (appointments, payroll, staff) before covering remaining routes.

### Deferred Ideas (OUT OF SCOPE)
- Component library migrations (Base UI to Radix)
- New features or capabilities
- Schema changes beyond what's required for bug fixes (e.g., adding `is_walk_in` field is out of scope)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| JSX syntax fix (BUG-01) | Browser / Client | — | JSX渲染错误在浏览器中触发，需要修复前端代码 |
| Walk-in password hashing (BUG-02) | API / Backend | — | 密码生成和哈希在后端完成，存储在数据库中 |
| TypeScript type fix (BUG-03) | Browser / Client | — | TypeScript类型和状态管理在前端 |
| Route param validation (BUG-04) | API / Backend | — | 输入验证在后端路由/控制器层处理 |
| Staff schedule upsert (BUG-05) | API / Backend | Database | Upsert逻辑在后端，需要数据库schema约束 |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | 4.4.2 | Input validation for route params and request bodies | Project decision (D-02, D-06) to replace express-validator incrementally; TypeScript-first schema validation [VERIFIED: npm registry] |
| Prisma | 6.4.1 | ORM with upsert support and unique constraints | Existing project stack; supports composite unique constraints via `@@unique` [VERIFIED: package.json] |
| bcrypt | 6.0.0 | Password hashing for walk-in users | Existing project stack; used for all password hashing [VERIFIED: package.json] |
| React | 19.2.5 | UI framework for frontend fixes | Existing project stack [VERIFIED: package.json] |
| Express.js | 5.2.1 | HTTP server framework for backend fixes | Existing project stack [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| Node.js crypto | Built-in | Random password generation for walk-in users | BUG-02 fix - generate random bytes for password [ASSUMED: Node.js built-in module] |
| express-validator | 7.3.2 | Legacy validation (to be replaced) | Keep for unchanged routes during incremental migration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod | Joi, express-validator | Project already decided on Zod (D-02, D-06); Zod has better TypeScript inference |
| bcrypt | bcryptjs | bcrypt is already installed (6.0.0); bcryptjs is pure JS but slower |

**Installation:**
```bash
cd backend
npm install zod@">=3 <5"
```

**Version verification:**
- Zod: 4.4.2 [VERIFIED: npm registry 2026-05-02]
- Prisma: 6.4.1 [VERIFIED: backend/package.json]
- bcrypt: 6.0.0 [VERIFIED: backend/package.json]
- Node.js: v24.15.0 [VERIFIED: local environment]

## Architecture Patterns

### System Architecture Diagram

```
BUG-01 (Navbar JSX)
====================
User Action → Navbar.tsx (DropdownMenu) → [BUG: JSX syntax error] → X Browser Error
Fix: Correct JSX syntax → DropdownMenu renders correctly

BUG-02 (Walk-in Password)
=======================
Staff creates walk-in appointment → appointmentController.ts → [BUG: password_hash: 'N/A']
Fix: Generate random password → bcrypt.hash() → Store hashed password

BUG-03 (ManagerDashboard Type)
=============================
User clicks sidebar menu → setActiveView(item.id) → [BUG: as any cast]
Fix: Define ActiveView union type → TypeScript type safety restored

BUG-04 (parseInt Validation)
============================
HTTP Request → Route Param (e.g., /api/v1/payroll/periods/:id) → [BUG: parseInt without validation]
Fix: Zod schema validation → Reject invalid params with 400 error

BUG-05 (Staff Schedule Upsert)
================================
PUT /api/v1/staff/:id/schedule → updateStaffSchedule controller → [BUG: upsert where: { id: s.id || -1 }]
Fix: Add @@unique([staff_id, day_of_week]) → upsert where: { staff_id_day_of_week: { staff_id, day_of_week } }
```

### Recommended Project Structure (No changes needed for bug fixes)
```
backend/src/
├── controllers/        # Bug fixes in staffController.ts, appointmentController.ts, payrollController.ts, attendanceController.ts, serviceController.ts
├── routes/            # Add Zod validation middleware (new files or inline)
├── utils/             # No changes needed
└── prisma/
    └── schema.prisma  # Add @@unique([staff_id, day_of_week]) to StaffSchedule model
```

### Pattern 1: Zod Validation for Route Params
**What:** Use Zod schemas to validate numeric route parameters before they reach controllers
**When to use:** All routes with numeric IDs (BUG-04)
**Example:**
```typescript
// Source: [ASSUMED: Zod documentation - standard pattern]
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// Usage in route or controller
const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'ID must be a valid number' }
    });
  }
  next();
};
```

### Pattern 2: Prisma Upsert with Composite Unique
**What:** Use composite unique constraint for upsert operations
**When to use:** Staff schedule updates (BUG-05)
**Example:**
```typescript
// Source: [ASSUMED: Prisma documentation - upsert with composite unique]
// In schema.prisma:
// model StaffSchedule {
//   id          Int      @id @default(autoincrement())
//   staff_id    Int
//   day_of_week Int
//   ...
//   @@unique([staff_id, day_of_week], name: "staff_day_unique")
// }

// In controller:
await prisma.staffSchedule.upsert({
  where: {
    staff_day_unique: {  // This is the composite unique constraint name
      staff_id: parseInt(id as string),
      day_of_week: s.day_of_week
    }
  },
  update: { start_time: s.start_time, end_time: s.end_time, is_active: s.is_active },
  create: {
    staff_id: parseInt(id as string),
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
    is_active: s.is_active
  }
});
```

### Anti-Patterns to Avoid
- **Mixing validation libraries:** Don't use both express-validator and Zod on the same route during migration - use Zod for new/modified routes (BUG-04)
- **Skipping Prisma migration:** After adding `@@unique` to schema, you MUST run `npx prisma migrate dev` before using the composite key in upsert (BUG-05)
- **Hardcoding passwords:** Never use 'N/A' or any hardcoded value for password_hash - always generate and hash (BUG-02)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route param validation | Custom parseInt with if/else checks | Zod schema validation | Zod provides consistent error messages, TypeScript inference, and reusable schemas [ASSUMED: Zod best practices] |
| Random password generation | Math.random() based generation | Node.js `crypto.randomBytes()` | crypto module provides cryptographically secure random bytes; Math.random() is predictable [ASSUMED: Node.js crypto documentation] |
| Password hashing | Custom hashing function | bcrypt (already installed) | bcrypt handles salt generation, timing attacks; never hand-roll crypto [VERIFIED: bcrypt installed] |
| Composite unique upsert | Manual find + create/update | Prisma upsert with @@unique | Prisma's upsert is atomic; manual approach has race conditions [ASSUMED: Prisma best practices] |

**Key insight:** The codebase already uses established libraries (bcrypt, Prisma, express-validator). For bug fixes, we extend existing patterns (Zod for validation) rather than introducing entirely new approaches.

## Runtime State Inventory

> Not applicable — Phase 1 involves bug fixes only, no rename/refactor/migration.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None related to bug fixes | — |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None affected by bug fixes | — |
| Build artifacts | None affected by bug fixes | — |

## Common Pitfalls

### Pitfall 1: Prisma Migration Not Run After Schema Change
**What goes wrong:** Adding `@@unique([staff_id, day_of_week])` to StaffSchedule model without running migration causes runtime errors when trying to use the composite key in upsert.
**Why it happens:** Prisma schema changes don't automatically sync to the database.
**How to avoid:** After editing `schema.prisma`, always run `npx prisma migrate dev --name add_staff_schedule_composite_unique` and verify the migration was applied.
**Warning signs:** Prisma errors about "Unique constraint not found" or "Field does not exist in where clause".

### Pitfall 2: Zod Version Mismatch
**What goes wrong:** Installing Zod v4 (latest) when following v3 tutorials leads to API differences (e.g., `z.string().transform()` vs different patterns).
**Why it happens:** Zod v4 has breaking changes from v3.
**How to avoid:** Pin to v3 (`npm install zod@">=3 <5"`) for stability, or verify v4 API docs before use.
**Warning signs:** TypeScript errors about Zod types or missing methods.

### Pitfall 3: JSX Syntax Fix Creates New Syntax Errors
**What goes wrong:** Adding a space before `render` prop might accidentally break other parts of the JSX structure in Navbar.tsx.
**Why it happens:** The JSX in Navbar.tsx has multiple DropdownMenuItem components with similar syntax errors.
**How to avoid:** Fix ALL occurrences (lines 105, 130, 136, 143, 150, 206, 210, 211) in a single pass. Verify the component renders without errors.
**Warning signs:** React rendering errors in browser console, "Unexpected token" errors.

### Pitfall 4: TypeScript `as any` Cast Hides Bugs
**What goes wrong:** Using `as any` bypasses TypeScript type checking, potentially allowing invalid state values.
**Why it happens:** Quick fix to silence TypeScript errors without proper type definitions.
**How to avoid:** Define proper union types (ActiveView) and let TypeScript enforce correctness. Remove `as any` casts.
**Warning signs:** TypeScript not catching invalid state values; runtime errors from unexpected values.

## Code Examples

### Fix JSX Syntax in Navbar.tsx (BUG-01)
```tsx
// Source: [VERIFIED: Navbar.tsx lines 105-117]
// BEFORE (broken):
<DropdownMenuTrigger render={>
  <Button variant="ghost" className="relative h-10 w-10 rounded-full...">
    ...
  </Button>
} </DropdownMenuTrigger>

// AFTER (fixed):
<DropdownMenuTrigger
  render={() => (
    <Button variant="ghost" className="relative h-10 w-10 rounded-full...">
      ...
    </Button>
  )}
</DropdownMenuTrigger>

// Also fix DropdownMenuItem components (lines 130, 136, 143, 150):
// BEFORE: <DropdownMenuItemrender={<Link to="/profile">
// AFTER:  <DropdownMenuItem render={() => <Link to="/profile">... </Link>} />
```

### Fix Walk-in Password Hashing (BUG-02)
```typescript
// Source: [VERIFIED: appointmentController.ts line 414]
// BEFORE (broken):
const walkInUser = await prisma.user.upsert({
  where: { username: 'walkin_guest' },
  update: {},
  create: {
    username: 'walkin_guest',
    password_hash: 'N/A',  // BUG: Hardcoded password
    role: 'customer',
    is_active: false
  }
});

// AFTER (fixed):
import crypto from 'crypto';

function generateRandomPassword(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const randomPassword = generateRandomPassword(12);
const hashedPassword = await bcrypt.hash(randomPassword, 12);

const walkInUser = await prisma.user.upsert({
  where: { username: 'walkin_guest' },
  update: {},
  create: {
    username: 'walkin_guest',
    password_hash: hashedPassword,  // FIXED: Properly hashed random password
    role: 'customer',
    is_active: false
  }
});
```

### Fix ManagerDashboard Type (BUG-03)
```tsx
// Source: [VERIFIED: ManagerDashboard.tsx lines 154, 444]
// BEFORE (broken):
const [activeView, setActiveView] = useState<'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews'>('analytics');
// ...
onClick={() => setActiveView(item.id as any)}  // BUG: as any cast

// AFTER (fixed):
type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews';

const [activeView, setActiveView] = useState<ActiveView>('analytics');
// ...
onClick={() => setActiveView(item.id as ActiveView)}  // FIXED: Proper type cast
```

### Fix parseInt Validation with Zod (BUG-04)
```typescript
// Source: [ASSUMED: Zod standard pattern]
// BEFORE (broken):
export const getPayrollDetails = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: parseInt(id as string) },  // BUG: No validation
    ...
  });
};

// AFTER (fixed):
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

export const getPayrollDetails = async (req: AuthRequest, res: Response) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  const { id } = result.data;
  const period = await prisma.payrollPeriod.findUnique({
    where: { id },
    ...
  });
};
```

### Fix Staff Schedule Upsert (BUG-05)
```typescript
// Source: [VERIFIED: staffController.ts lines 208-236, schema.prisma lines 124-138]
// Step 1: Update schema.prisma - add composite unique constraint:
// model StaffSchedule {
//   id          Int      @id @default(autoincrement())
//   staff_id    Int
//   day_of_week Int
//   start_time  String
//   end_time    String
//   is_active   Boolean  @default(true)
//   ...
//   @@unique([staff_id, day_of_week], name: "staff_day_unique")
// }

// Step 2: Run migration:
// npx prisma migrate dev --name add_staff_schedule_composite_unique

// Step 3: Update the upsert logic:
export const updateStaffSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schedules } = req.body;

    await prisma.$transaction(
      schedules.map((s: any) =>
        prisma.staffSchedule.upsert({
          where: {
            staff_day_unique: {
              staff_id: parseInt(id as string),
              day_of_week: s.day_of_week
            }
          },
          update: {
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          },
          create: {
            staff_id: parseInt(id as string),
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          },
        })
      )
    );

    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error: any) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| express-validator for input validation | Zod (being introduced) | Project decision 2026-05-02 | Better TypeScript inference, easier schema composition |
| `parseInt(id)` without validation | Zod schema validation | Phase 1 (BUG-04) | Catches invalid params early, consistent error responses |
| `password_hash: 'N/A'` | bcrypt.hash(randomPassword) | Phase 1 (BUG-02) | Proper security even for inactive accounts |
| `upsert where: { id: s.id || -1 }` | `upsert where: { staff_day_unique }` | Phase 1 (BUG-05) | Correct upsert behavior using composite key |

**Deprecated/outdated:**
- `as any` casts in TypeScript — replaced with proper union types (BUG-03)
- `express-validator` — being incrementally replaced by Zod per project decision

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Zod v3 API pattern (z.object, z.string, z.number) is correct for validation | Standard Stack, Code Examples | MEDIUM: Zod v4 may have different API; verify before implementing |
| A2 | Node.js `crypto.randomBytes()` is the recommended approach for random password generation | Code Examples, Don't Hand-Roll | LOW: Even if wrong, bcrypt.hash() will still securely hash whatever password is provided |
| A3 | Prisma `@@unique([field1, field2])` creates a composite unique constraint usable in upsert | Code Examples, Architecture Patterns | HIGH: If syntax is wrong, migration will fail and upsert won't work |
| A4 | Prisma upsert with composite unique uses constraint name as nested object key | Code Examples (BUG-05) | HIGH: If syntax is wrong, the upsert where clause will fail |
| A5 | Zod can be installed as `npm install zod@">=3 <5"` to get v3 | Standard Stack | LOW: If v4 is needed, adjust installation command |

## Open Questions (RESOLVED)

1. **Zod v3 vs v4 API differences** ✅ RESOLVED**
   - What we know: npm registry shows v4.4.2 as latest, Context7 showed v3.24.2 and v4.0.1
   - What's unclear: Which version should we use? Project has no Zod yet.
   - Resolution: Use Zod v3 (`npm install zod@">=3 <5"`) for stability, as most online examples are for v3. Plan 01-04 uses Zod v3 API patterns.

2. **Prisma migration strategy for composite unique** ✅ RESOLVED**
   - What we know: Need to add `@@unique([staff_id, day_of_week])` to StaffSchedule model
   - What's unclear: Will this affect existing data? Are there duplicate staff_id + day_of_week combinations?
   - Resolution: Check for duplicates before running migration. Plan 01-05 Task 2 includes a step to query for duplicate `staff_id + day_of_week` combinations before running `npx prisma migrate dev`.

3. **Navbar.tsx DropdownMenu render prop syntax** ✅ RESOLVED**
   - What we know: Base UI DropdownMenu uses `render` prop for custom trigger/items
   - What's unclear: Exact syntax for `DropdownMenuTrigger render` prop (is it `render={() => <Component />}` or `render={<>...}`?)
   - Resolution: Use `render={() => (<Component />)}` syntax as confirmed by working examples in Navbar.tsx lines 157-165. Plan 01-01 implements this fix.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All backend fixes | ✓ | v24.15.0 | — |
| npm | Package installation (Zod) | ✓ | 11.12.1 | — |
| Prisma 6.4.1 | BUG-05 (schema, upsert) | ✓ | 6.4.1 | — |
| bcrypt 6.0.0 | BUG-02 (password hashing) | ✓ | 6.0.0 | — |
| Zod | BUG-04 (validation) | ✗ | — | Install via npm (required) |
| TypeScript | All TypeScript fixes | ✓ | 5.x (via package) | — |
| React 19 | BUG-01, BUG-03 (frontend) | ✓ | 19.2.5 | — |
| PostgreSQL | BUG-05 (migration) | [ASSUMED] | 17+ expected | — |

**Missing dependencies with no fallback:**
- None — Zod can be installed via npm

**Missing dependencies with fallback:**
- None

## Validation Architecture

> nyquist_validation is enabled in config.json

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently configured (Jest + Supertest for backend, Vitest + RTL for frontend per PROJECT.md) |
| Config file | None — must be created in Wave 0 |
| Quick run command | `cd backend && npx jest --testPathPattern="BUG-0[1-5]" --no-coverage` (after setup) |
| Full suite command | `cd backend && npx jest --no-coverage && cd ../frontend && npx vitest run` (after setup) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Navbar.tsx DropdownMenu renders without JSX errors | manual/e2e | Visual inspection in browser | ❌ Wave 0 |
| BUG-02 | Walk-in customer gets properly hashed password | unit | `jest tests/unit/appointmentController.test.ts -t "walk-in password"` | ❌ Wave 0 |
| BUG-03 | ManagerDashboard activeView accepts only valid values | unit | `vitest tests/unit/ManagerDashboard.test.tsx -t "ActiveView type"` | ❌ Wave 0 |
| BUG-04 | Route params validated with Zod before controller | integration | `jest tests/integration/paramValidation.test.ts` | ❌ Wave 0 |
| BUG-05 | Staff schedule upsert uses composite key correctly | integration | `jest tests/integration/staffSchedule.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && npx jest --testPathPattern="[relevant]" --no-coverage` (after Wave 0 setup)
- **Per wave merge:** `cd backend && npx jest --no-coverage && cd ../frontend && npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `backend/jest.config.js` — Jest configuration for backend tests
- [ ] `frontend/vitest.config.ts` — Vitest configuration for frontend tests
- [ ] `backend/tests/setup.ts` — Shared test setup (Prisma test client, etc.)
- [ ] `frontend/tests/setup.ts` — Shared test setup (React Testing Library)
- [ ] Install test dependencies: `cd backend && npm install --save-dev jest @types/jest ts-jest supertest @types/supertest`
- [ ] Install test dependencies: `cd frontend && npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom`

*(No existing test infrastructure — all items need creation in Wave 0)*

## Security Domain

> Required when `security_enforcement` is enabled (absent = enabled).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | BUG-02 fix ensures walk-in users have properly hashed passwords (even though `is_active: false`) |
| V3 Session Management | No | No session management changes in this phase |
| V4 Access Control | No | No access control changes in this phase |
| V5 Input Validation | Yes | BUG-04 introduces Zod validation for all numeric route params |
| V6 Cryptography | Yes | BUG-02 uses bcrypt with 12 rounds (matching existing `BCRYPT_SALT_ROUNDS` default) |

### Known Threat Patterns for Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Invalid route params causing Prisma errors | Tampering | Zod validation at route level (BUG-04) |
| SQL injection via malformed params | Tampering | Prisma ORM (parameterized queries by default) + Zod validation |
| Weak/hardcoded passwords | Information Disclosure | bcrypt with random password generation (BUG-02) |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: package.json] - Backend dependencies (express 5.2.1, bcrypt 6.0.0, express-validator 7.3.2)
- [VERIFIED: npm registry] - Zod version 4.4.2 (2026-05-02)
- [VERIFIED: Source file reading] - Navbar.tsx, ManagerDashboard.tsx, staffController.ts, appointmentController.ts, payrollController.ts, attendanceController.ts, serviceController.ts, schema.prisma
- [VERIFIED: Local environment] - Node.js v24.15.0, npm 11.12.1

### Secondary (MEDIUM confidence)
- [CITED: CLAUDE.md] - Project conventions, tech stack, Phase 1 requirements
- [CITED: CONTEXT.md] - Locked decisions D-01 through D-06, Claude's Discretion
- [CITED: CONCERNS.md] - Known bugs documentation (BUG-01 through BUG-05 confirmed)

### Tertiary (LOW confidence)
- [ASSUMED] - Zod v3 API patterns (z.object, z.string, etc.)
- [ASSUMED] - Prisma @@unique composite key syntax
- [ASSUMED] - Prisma upsert with composite unique constraint name
- [ASSUMED] - Node.js crypto.randomBytes for password generation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Versions verified via npm registry and package.json
- Architecture: MEDIUM - Zod/Prisma patterns based on training (ASSUMED)
- Pitfalls: HIGH - Identified from actual code reading and common Prisma/TypeScript issues

**Research date:** 2026-05-02
**Valid until:** 2026-06-01 (30 days - stable technologies, but Zod v4 adoption may change recommendations)
