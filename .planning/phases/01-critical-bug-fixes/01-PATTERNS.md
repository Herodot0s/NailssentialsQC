# Phase 01: Critical Bug Fixes - Pattern Map

**Mapped:** 2026-05-02
**Files analyzed:** 12 (7 controllers/routes to modify, 3 frontend files, 1 schema, 1 new validation approach)
**Analogs found:** 11 / 12 (Zod validation is new to the codebase)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/src/controllers/staffController.ts` | controller | CRUD | Self (existing file) | exact |
| `backend/src/controllers/appointmentController.ts` | controller | CRUD | Self (existing file) | exact |
| `backend/src/controllers/payrollController.ts` | controller | CRUD | Self (existing file) | exact |
| `backend/src/controllers/attendanceController.ts` | controller | CRUD | Self (existing file) | exact |
| `backend/src/controllers/serviceController.ts` | controller | CRUD | Self (existing file) | exact |
| `frontend/src/components/Navbar.tsx` | component | request-response (UI) | Self (existing file) | exact |
| `frontend/src/pages/ManagerDashboard.tsx` | page | request-response (UI) | Self (existing file) | exact |
| `backend/prisma/schema.prisma` | config | transform | Attendance model (line 264-282) | exact |
| `backend/src/routes/staffRoutes.ts` | route | request-response | Self (existing file) | exact |
| `backend/src/routes/payrollRoutes.ts` | route | request-response | Self (existing file) | exact |
| `backend/src/routes/attendanceRoutes.ts` | route | request-response | Self (existing file) | exact |
| `backend/src/routes/serviceRoutes.ts` | route | request-response | Self (existing file) | exact |

## Pattern Assignments

### `backend/src/controllers/staffController.ts` (controller, CRUD) — BUG-05

**Analog:** Self (existing code)

**Imports pattern** (lines 1-3):
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
```

**Error handling pattern** (lines 62-65, 129-132, 177-180, 193-196, 232-235):
```typescript
} catch (error: any) {
  console.error('Update schedule error:', error);
  res.status(500).json({ success: false, message: 'Failed to update schedule' });
}
```

**Current upsert logic (BUG-05)** (lines 208-229):
```typescript
await prisma.$transaction(
  schedules.map((s: any) =>
    prisma.staffSchedule.upsert({
      where: {
        id: s.id || -1,  // BUG: wrong key, won't upsert correctly
      },
      update: {
        day_of_week: s.day_of_week,
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
```

**Corrected upsert pattern (post-fix, reference from Prisma docs):**
```typescript
// After adding @@unique([staff_id, day_of_week], name: "staff_day_unique") to schema
await prisma.$transaction(
  schedules.map((s: any) =>
    prisma.staffSchedule.upsert({
      where: {
        staff_day_unique: {
          staff_id: parseInt(id as string),
          day_of_week: s.day_of_week,
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
```

**Prisma transaction pattern** (lines 208-229):
```typescript
await prisma.$transaction(
  schedules.map((s: any) => prisma.staffSchedule.upsert({ ... }))
);
```

---

### `backend/src/controllers/appointmentController.ts` (controller, CRUD) — BUG-02

**Analog:** Self (existing code)

**Imports pattern** (lines 1-6):
```typescript
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, parse, format, areIntervalsOverlapping, getISOWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendBookingConfirmation, sendAppointmentCompletion } from '../utils/email';
import { createNotification } from './notificationController';
```

**Current walk-in user creation (BUG-02)** (lines 409-418):
```typescript
const walkInUser = await prisma.user.upsert({
  where: { username: 'walkin_guest' },
  update: {},
  create: {
    username: 'walkin_guest',
    password_hash: 'N/A',  // BUG: hardcoded password
    role: 'customer',
    is_active: false
  }
});
```

**bcrypt hashing pattern (from staffController.ts lines 93-94):**
```typescript
const hashedPassword = await bcrypt.hash(password || 'password123', 10);
```

**Fixed walk-in password pattern (BUG-02 fix):**
```typescript
import crypto from 'crypto';

function generateRandomPassword(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// In createAppointment function:
const randomPassword = generateRandomPassword(12);
const hashedPassword = await bcrypt.hash(randomPassword, 12);

const walkInUser = await prisma.user.upsert({
  where: { username: 'walkin_guest' },
  update: {},
  create: {
    username: 'walkin_guest',
    password_hash: hashedPassword,  // FIXED: properly hashed random password
    role: 'customer',
    is_active: false
  }
});
```

---

### `backend/src/controllers/payrollController.ts` (controller, CRUD) — BUG-04

**Analog:** Self (existing code)

**Imports pattern** (lines 1-4):
```typescript
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
```

**parseInt without validation (BUG-04)** (lines 196, 290, 302):
```typescript
// Line 196:
const { id } = req.params;
const period = await prisma.payrollPeriod.findUnique({
  where: { id: parseInt(id as string) },  // BUG: no validation
  ...
});

// Line 290:
const { id } = req.params;
const period = await prisma.payrollPeriod.findUnique({
  where: { id: parseInt(id as string) },  // BUG: no validation
  ...
});

// Line 302:
const updatedPeriod = await prisma.payrollPeriod.update({
  where: { id: parseInt(id as string) },  // BUG: no validation
  ...
});
```

**Zod validation pattern (new to codebase, from RESEARCH.md):**
```typescript
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// Usage in controller:
export const getPayrollDetails = async (req: AuthRequest, res: Response) => {
  try {
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
    ...
  } catch (error: any) {
    console.error('Get payroll details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll details' });
  }
};
```

---

### `backend/src/controllers/attendanceController.ts` (controller, CRUD) — BUG-04

**Analog:** Self (existing code)

**Imports pattern** (lines 1-4):
```typescript
import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from './notificationController';
```

**parseInt without validation (BUG-04)** (line 289):
```typescript
const attendance = await prisma.attendance.update({
  where: { id: parseInt(id as string) },  // BUG: no validation
  ...
});
```

**Same Zod validation pattern as payrollController.ts**

---

### `backend/src/controllers/serviceController.ts` (controller, CRUD) — BUG-04

**Analog:** Self (existing code)

**Imports pattern** (lines 1-2):
```typescript
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
```

**parseInt without validation (BUG-04)** (lines 43, 104, 124, 139, 165, 171):
```typescript
// Line 43 (with partial validation - good pattern to follow):
const parsedId = parseInt(categoryId as string);
if (isNaN(parsedId)) {
  return res.status(400).json({
    success: false,
    error: { code: 'INVALID_PARAMETER', message: 'categoryId must be a number' },
  });
}

// Lines 104, 124, 139, 165, 171 (without validation - BUG):
where: { id: parseInt(id as string) },  // No validation!
```

**Note:** serviceController.ts line 43-52 already shows a better pattern with `isNaN` check. For BUG-04, replace all `parseInt(id as string)` without validation with Zod schema validation.

---

### `frontend/src/components/Navbar.tsx` (component, UI rendering) — BUG-01

**Analog:** Self (existing code)

**Imports pattern** (lines 1-17):
```tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Calendar, Settings, LayoutDashboard, Menu, ShoppingCart } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';
```

**BUG-01 JSX syntax errors (lines 105, 130, 136, 143, 150, 206, 210-211):**
```tsx
// BROKEN (line 105):
<DropdownMenuTrigger render={>
  <Button variant="ghost" className="relative h-10 w-10 rounded-full...">
    ...
  </Button>
} </DropdownMenuTrigger>

// BROKEN (line 130):
<DropdownMenuItemrender={<Link to="/profile">
  <User className="mr-3 h-4 w-4 stroke-[1.5]" />
  <span className="text-xs font-medium">Profile Settings</span>
</Link>
</DropdownMenuItem>

// Same pattern broken on lines 136, 143, 150, 206, 210, 211
```

**Corrected JSX pattern (fixed in place):**
```tsx
// FIXED (line 105 - DropdownMenuTrigger):
<DropdownMenuTrigger
  render={() => (
    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/5 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary-ultra text-primary font-serif font-bold text-sm border-[0.5px] border-primary/20">
          {user?.fullName ? (
            getInitials(user.fullName)
          ) : (
            <User className="h-4 w-4 stroke-[1.5]" />
          )}
        </AvatarFallback>
      </Avatar>
    </Button>
  )}
</DropdownMenuTrigger>

// FIXED (line 130 - DropdownMenuItem):
<DropdownMenuItem
  render={() => (
    <Link to="/profile">
      <User className="mr-3 h-4 w-4 stroke-[1.5]" />
      <span className="text-xs font-medium">Profile Settings</span>
    </Link>
  )}
/>

// Same fix pattern for lines 136, 143, 150, 206, 210-211
```

**Working DropdownMenuItem pattern (line 157-165 - correct syntax example in same file):**
```tsx
<DropdownMenuItem
  className="rounded-none px-4 py-3"
  render={
    <Link to="/manage-services">
      <Settings className="mr-3 h-4 w-4 stroke-[1.5]" />
      <span className="text-xs font-medium">Manage Services</span>
    </Link>
  }
/>
```

---

### `frontend/src/pages/ManagerDashboard.tsx` (page, UI state) — BUG-03

**Analog:** Self (existing code)

**Imports pattern** (lines 1-84):
```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ... } from 'recharts';
import { ... } from '@/components/ui/card';
import { ... } from '@/components/ui/table';
import { ... } from '@/components/ui/sheet';
import { ... } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ... } from 'lucide-react';
import { ... } from '../api/apiClient';
import { format } from 'date-fns';
```

**BUG-03: Type definition and useState (line 153-154):**
```typescript
// BROKEN: No explicit union type, relies on inline type
const [activeView, setActiveView] = useState<'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews'>('analytics');

// Then later (line 444):
onClick={() => setActiveView(item.id as any)}  // BUG: as any cast
```

**Menu items that define valid values (lines 410-417):**
```typescript
const menuItems = [
  { id: 'analytics', label: 'Dashboard', icon: PieChartIcon },
  { id: 'staff', label: 'Employee Files', icon: Users },
  { id: 'attendance', label: 'Attendance Tool', icon: Clock },
  { id: 'deductions', label: 'Deductions Ledger', icon: Wallet },
  { id: 'payroll', label: 'Salary Slips', icon: DollarSign },
  { id: 'reviews', label: 'Reviews', icon: Star },
];
```

**Fixed type pattern (BUG-03 fix):**
```typescript
// Define union type matching menuItems id values
type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews';

// Use proper type in useState
const [activeView, setActiveView] = useState<ActiveView>('analytics');

// Fix the onClick handler (line 444)
onClick={() => setActiveView(item.id as ActiveView)}
```

---

### `backend/prisma/schema.prisma` (config, transform) — BUG-05

**Analog:** Attendance model (lines 264-282) with composite unique constraint

**Existing composite unique pattern (Attendance model, line 279):**
```prisma
model Attendance {
  id                Int      @id @default(autoincrement())
  staff_id          Int
  date              DateTime @db.Date
  ...

  staff StaffProfile @relation(fields: [staff_id], references: [id])

  @@unique([staff_id, date], name: "uk_staff_date")
  @@index([staff_id, date])
  @@map("attendance")
}
```

**StaffSchedule model (current, lines 124-138):**
```prisma
model StaffSchedule {
  id          Int      @id @default(autoincrement())
  staff_id    Int
  day_of_week Int      // 0-6 (Sunday-Saturday)
  start_time  String
  end_time    String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  staff StaffProfile @relation(fields: [staff_id], references: [id], onDelete: Cascade)

  @@index([staff_id])
  @@map("staff_schedules")
}
```

**Fixed StaffSchedule model (BUG-05 fix - add composite unique):**
```prisma
model StaffSchedule {
  id          Int      @id @default(autoincrement())
  staff_id    Int
  day_of_week Int      // 0-6 (Sunday-Saturday)
  start_time  String
  end_time    String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  staff StaffProfile @relation(fields: [staff_id], references: [id], onDelete: Cascade)

  @@unique([staff_id, day_of_week], name: "staff_day_unique")
  @@index([staff_id])
  @@map("staff_schedules")
}
```

---

### `backend/src/routes/staffRoutes.ts` (route, request-response) — BUG-05

**Analog:** Self (existing code)

**Imports and route pattern** (lines 1-17):
```typescript
import { Router } from 'express';
import { getAllStaff, createStaff, updateStaff, getStaffSchedule, updateStaffSchedule } from '../controllers/staffController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// All staff routes are restricted to managers
router.use(authenticateToken);
router.use(authorizeRoles('manager'));

router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.get('/:id/schedule', getStaffSchedule);
router.put('/:id/schedule', updateStaffSchedule);

export default router;
```

**Zod validation middleware pattern (new for BUG-04/05):**
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { getAllStaff, createStaff, updateStaff, getStaffSchedule, updateStaffSchedule } from '../controllers/staffController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Validation schemas
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

const scheduleEntrySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  is_active: z.boolean().optional()
});

const updateScheduleSchema = z.object({
  schedules: z.array(scheduleEntrySchema)
});

// Validation middleware
const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  req.validatedParams = result.data;
  next();
};

const validateScheduleBody = (req: any, res: any, next: any) => {
  const result = updateScheduleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid schedule data', details: result.error.flatten() }
    });
  }
  req.validatedBody = result.data;
  next();
};

// All staff routes are restricted to managers
router.use(authenticateToken);
router.use(authorizeRoles('manager'));

router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', validateIdParam, updateStaff);
router.get('/:id/schedule', validateIdParam, getStaffSchedule);
router.put('/:id/schedule', validateIdParam, validateScheduleBody, updateStaffSchedule);

export default router;
```

---

### `backend/src/routes/payrollRoutes.ts` (route, request-response) — BUG-04

**Analog:** Self (existing code)

**Route pattern with Zod validation (BUG-04 fix):**
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { generatePayroll, getPayrollPeriods, getPayrollDetails, addDeduction, getMyPayroll, lockPayroll } from '../controllers/payrollController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  req.validatedParams = result.data;
  next();
};

router.get('/my-payroll', authenticateToken, authorizeRoles('staff', 'manager'), getMyPayroll);
router.get('/periods', authenticateToken, authorizeRoles('manager'), getPayrollPeriods);
router.get('/periods/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, getPayrollDetails);
router.post('/generate', authenticateToken, authorizeRoles('manager'), generatePayroll);
router.post('/deductions', authenticateToken, authorizeRoles('manager'), addDeduction);
router.patch('/periods/:id/lock', authenticateToken, authorizeRoles('manager'), validateIdParam, lockPayroll);

export default router;
```

---

### `backend/src/routes/attendanceRoutes.ts` (route, request-response) — BUG-04

**Analog:** Self (existing code)

**Route pattern with Zod validation (BUG-04 fix):**
```typescript
import { Router } from 'express';
import { z } from 'zod';
import {
  getAttendanceStatus,
  checkIn,
  checkOut,
  getAllAttendance,
  updateAttendance,
} from '../controllers/attendanceController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  req.validatedParams = result.data;
  next();
};

// All attendance routes require authentication
router.use(authenticateToken);

// Staff and Managers can manage their own attendance
router.get('/status', authorizeRoles('staff', 'manager'), getAttendanceStatus);
router.post('/check-in', authorizeRoles('staff', 'manager'), checkIn);
router.post('/check-out', authorizeRoles('staff', 'manager'), checkOut);

// Manager only: Review all attendance and override
router.get('/all', authorizeRoles('manager'), getAllAttendance);
router.put('/:id', authorizeRoles('manager'), validateIdParam, updateAttendance);

export default router;
```

---

### `backend/src/routes/serviceRoutes.ts` (route, request-response) — BUG-04

**Analog:** Self (existing code)

**Route pattern with Zod validation (BUG-04 fix):**
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { getCategories, getServices, createCategory, updateCategory, createService, updateService } from '../controllers/serviceController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  req.validatedParams = result.data;
  next();
};

// Public routes
router.get('/categories', getCategories);
router.get('/', getServices);

// Manager only routes
router.post('/categories', authenticateToken, authorizeRoles('manager'), createCategory);
router.put('/categories/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, updateCategory);

router.post('/', authenticateToken, authorizeRoles('manager'), createService);
router.put('/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, updateService);

export default router;
```

---

## Shared Patterns

### Authentication Middleware
**Source:** `backend/src/middleware/authMiddleware.ts` (lines 4-10, 12-33, 35-45)
**Apply to:** All route files (already applied)
```typescript
export interface AuthRequest extends Request {
  user?: {
    sub: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'ACCESS_DENIED', message: 'Access token required' },
    });
  }
  try {
    const decoded = verifyAccessToken(token) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired access token' },
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You do not have permission to perform this action' },
      });
    }
    next();
  };
};
```

### Controller Error Handling
**Source:** All controller files
**Apply to:** All controller bug fixes
```typescript
try {
  // ... controller logic
} catch (error: any) {
  console.error('Operation error:', error);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to ...' }
  });
}
```

### Zod Validation (New to Codebase)
**Source:** RESEARCH.md / Zod documentation
**Apply to:** All route files for BUG-04 and BUG-05
```typescript
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  req.validatedParams = result.data;
  next();
};
```

### Prisma Composite Unique Constraint
**Source:** `backend/prisma/schema.prisma` (Attendance model, line 279)
**Apply to:** StaffSchedule model for BUG-05
```prisma
@@unique([staff_id, day_of_week], name: "staff_day_unique")
```

### bcrypt Hashing
**Source:** `backend/src/controllers/staffController.ts` (line 93)
**Apply to:** BUG-02 fix in appointmentController.ts
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
```

### Node.js Crypto for Random Password
**Source:** Node.js built-in module
**Apply to:** BUG-02 fix in appointmentController.ts
```typescript
import crypto from 'crypto';

function generateRandomPassword(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}
```

### TypeScript Union Type for State
**Source:** `frontend/src/pages/ManagerDashboard.tsx` (line 153)
**Apply to:** BUG-03 fix
```typescript
type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews';
const [activeView, setActiveView] = useState<ActiveView>('analytics');
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Zod validation middleware | middleware | request-response | Zod is new to the codebase (project decision to introduce incrementally per D-02, D-06) |

---

## Metadata

**Analog search scope:** `backend/src/controllers/`, `backend/src/routes/`, `backend/src/middleware/`, `backend/prisma/`, `frontend/src/components/`, `frontend/src/pages/`
**Files scanned:** 12 controller/route files, 1 middleware file, 1 schema file, 2 frontend files
**Pattern extraction date:** 2026-05-02
**Zod version:** Install with `cd backend && npm install zod@">=3 <5"` (v3 for stability, matches project decision)
