# Phase 8 Pattern Mapping

## Files to be Modified
1. `backend/prisma/schema.prisma`
2. `backend/src/controllers/staffController.ts` (or similar controller for Staff Profile)
3. `backend/src/controllers/payrollController.ts` (new or existing)
4. `backend/src/routes/staffRoutes.ts`
5. `backend/src/routes/payrollRoutes.ts`

## Discovered Patterns

### 1. Prisma Schema Modifications
**Location:** `backend/prisma/schema.prisma`
**Pattern:**
```prisma
model DeductionLog {
  id                Int      @id @default(autoincrement())
  staff_id          Int
  payroll_period_id Int?
  type              String   // Will be categorized or enum
  amount            Decimal  @db.Decimal(10, 2)
  notes             String?  @db.Text
  created_at        DateTime @default(now())

  staff StaffProfile @relation(fields: [staff_id], references: [id])
}
```
*Note: Use Prisma Decimal for currency values.*

### 2. Express Controllers (Manager Protected)
**Location:** `backend/src/controllers/staffController.ts`
**Pattern:**
```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateStaffCommission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { base_commission_rate, commission_tier } = req.body;
    
    // update logic
  } catch (error) {
    // error handling
  }
};
```
*Note: Ensure role-based access control (RBAC) restricts these to managers.*

### 3. Express Routes
**Location:** `backend/src/routes/staffRoutes.ts`
**Pattern:**
```typescript
import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
// ...
router.put('/:id/commission', authenticateToken, requireRole(['manager']), updateStaffCommission);
```
