# Phase 6: Missing Features - Pattern Map

**Mapped:** 2026-05-04
**Files analyzed:** 7
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/prisma/schema.prisma` | migration | CRUD | `backend/prisma/schema.prisma` | exact |
| `backend/src/utils/systemLog.ts` | utility | event-driven | `backend/src/utils/apiHelpers.ts` | role-match |
| `backend/src/controllers/payrollController.ts` | controller | file-I/O | `backend/src/controllers/payrollController.ts` | exact |
| `backend/src/controllers/staffController.ts` | controller | CRUD | `backend/src/controllers/staffController.ts` | exact |
| `backend/src/controllers/appointmentCompletion.ts` | controller | CRUD | `backend/src/controllers/appointmentCompletion.ts` | exact |
| `backend/src/controllers/reportController.ts` | controller | CRUD | `backend/src/controllers/reportController.ts` | exact |
| `backend/src/routes/payrollRoutes.ts` | route | request-response | `backend/src/routes/payrollRoutes.ts` | exact |

## Pattern Assignments

### `backend/prisma/schema.prisma` (migration, CRUD)

**Analog:** `backend/prisma/schema.prisma`

**Model definition pattern** (lines 280-289):
```prisma
model SystemLog {
  id          Int      @id @default(autoincrement())
  user_id     Int?
  action      String
  entity_type String?
  entity_id   Int?
  details     Json?
  ip_address  String?
  user_agent  String?  @db.Text
  created_at  DateTime @default(now())
```

---

### `backend/src/utils/systemLog.ts` (utility, event-driven)

**Analog:** `backend/src/utils/apiHelpers.ts`

**Utility method pattern** (lines 35-40):
```typescript
export const getCurrentUser = (req: any): { userId: number; role: string; email?: string | null; fullName?: string } | null => {
  const { sub, role, email, fullName } = req.user || {};
  if (!sub) return null;
  return { userId: sub as number, role: role as string, email: email as string | undefined, fullName: fullName as string | undefined };
};
```

---

### `backend/src/controllers/payrollController.ts` (controller, file-I/O)

**Analog:** `backend/src/controllers/payrollController.ts`

**Imports pattern** (lines 1-7):
```typescript
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendSuccess, sendError } from '../utils/apiHelpers';
```

**Error handling pattern** (lines 125-129):
```typescript
  } catch (error: unknown) {
    console.error('Generate payroll error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate payroll';
    return res.status(500).json({ success: false, message });
  }
```

---

### `backend/src/controllers/staffController.ts` (controller, CRUD)

**Analog:** `backend/src/controllers/staffController.ts`

**Try/Catch with Response Pattern** (lines 100-103):
```typescript
  } catch (error: unknown) {
    console.error('Create staff error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create staff member';
    res.status(500).json({ success: false, message });
  }
```

---

### `backend/src/controllers/appointmentCompletion.ts` (controller, CRUD)

**Analog:** `backend/src/controllers/appointmentCompletion.ts`

**Prisma Transaction Pattern** (lines 79-84):
```typescript
    const result = await prisma.$transaction(async (tx) => {
      // Update appointment status
      await tx.appointment.update({
        where: { id: parseInt(id) },
        data: { status: 'completed' },
      });
```

---

### `backend/src/controllers/reportController.ts` (controller, CRUD)

**Analog:** `backend/src/controllers/reportController.ts`

**Aggregate Data Pattern** (lines 80-87):
```typescript
export const getDailySalesStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Total Sales
    const salesData = await prisma.transaction.aggregate({
```

---

### `backend/src/routes/payrollRoutes.ts` (route, request-response)

**Analog:** `backend/src/routes/payrollRoutes.ts`

**Route Guard Pattern** (lines 24-26):
```typescript
router.get('/my-payroll', authenticateToken, authorizeRoles('staff', 'manager'), getMyPayroll);
router.get('/periods', authenticateToken, authorizeRoles('manager'), getPayrollPeriods);
router.get('/periods/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, getPayrollDetails);
```

---

## Shared Patterns

### Error Handling Wrapper
**Source:** `backend/src/utils/apiHelpers.ts`
**Apply to:** All controller files
```typescript
export const sendError = (
  res: Response,
  code: string,
  message: string,
  status: number = 400,
  fieldErrors?: Record<string, string[]>
) => { ... }
```

### Auth Context Extraction
**Source:** `backend/src/middleware/authMiddleware.ts`
**Apply to:** Audit logger utility
```typescript
// The req.user.sub should be used for user identification
// IP available via req.ip or req.socket.remoteAddress
// User-Agent via req.headers['user-agent']
```

## Metadata

**Analog search scope:** `backend/src/controllers/`, `backend/src/utils/`, `backend/src/routes/`, `backend/prisma/`
**Files scanned:** 7
**Pattern extraction date:** 2026-05-04