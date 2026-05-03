# Phase 05: Performance Optimization - Pattern Map

**Mapped:** 2026-05-04
**Files analyzed:** 5
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/src/controllers/payrollController.ts` | controller | CRUD | `backend/src/controllers/payrollController.ts` (self) | exact |
| `backend/src/controllers/reportController.ts` | controller | CRUD | `backend/src/controllers/reportController.ts` (self) | exact |
| `backend/prisma/schema.prisma` | config | transform | `backend/prisma/schema.prisma` (self) | exact |
| `backend/src/controllers/uploadController.ts` | controller | file-I/O | `backend/src/controllers/uploadController.ts` (self) + `busboy` docs | partial (new streaming pattern) |
| `backend/src/controllers/appointmentCompletion.ts` | controller | CRUD | `backend/src/controllers/appointmentCompletion.ts` (self) | exact |

## Pattern Assignments

### `backend/src/controllers/payrollController.ts` (controller, CRUD) — PERF-01

**Analog:** `backend/src/controllers/payrollController.ts` (current file)

**Imports pattern** (lines 1-6):
```typescript
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendSuccess, sendError } from '../utils/apiHelpers';
```

**Auth pattern** (applied via route middleware, not in controller):
```typescript
// Routes use: router.use(authenticateToken); router.use(authorizeRoles('manager'));
// Controller uses AuthRequest type for type-safe user access
export const generatePayroll = async (req: AuthRequest, res: Response) => {
```

**Core CRUD pattern** (lines 11-168) — CURRENT sequential pattern to be refactored with Promise.all:
```typescript
export const generatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.validatedBody || req.body;

    if (!start_date || !end_date) {
      return sendError(res, 'MISSING_FIELDS', 'start_date and end_date are required', 400);
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Check for overlapping payroll periods
    const existingPeriod = await prisma.payrollPeriod.findFirst({
      where: {
        OR: [{ start_date: { lte: endDate }, end_date: { gte: startDate } }],
      },
    });

    if (existingPeriod) {
      return res.status(400).json({ success: false, message: 'Payroll period overlaps with existing period' });
    }

    // Calculate total salon sales (completed transactions in period)
    const transactions = await prisma.transaction.findMany({
      where: { transaction_date: { gte: startDate, lte: endDate }, status: 'completed' },
    });
    const totalSalonSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Create payroll period
    const payrollPeriod = await prisma.payrollPeriod.create({
      data: { start_date: startDate, end_date: endDate, total_salon_sales: totalSalonSales, is_locked: false },
    });

    // Get all active staff
    const staffProfiles = await prisma.staffProfile.findMany({
      where: { is_available: true },
    });
    // ... (sequential queries continue)
```

**Promise.all refactoring pattern** (to apply for PERF-01):
```typescript
// Group independent queries into Promise.all (PERF-01, D-06)
const [existingPeriod, transactions, staffProfiles] = await Promise.all([
  prisma.payrollPeriod.findFirst({
    where: { OR: [{ start_date: { lte: endDate }, end_date: { gte: startDate } }] },
  }),
  prisma.transaction.findMany({
    where: { transaction_date: { gte: startDate, lte: endDate }, status: 'completed' },
  }),
  prisma.staffProfile.findMany({
    where: { is_available: true },
  }),
]);
// Post-process totals after parallel queries (D-07)
const totalSalonSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
```

**Error handling pattern** (lines 164-168):
```typescript
  } catch (error: unknown) {
    console.error('Generate payroll error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate payroll';
    return res.status(500).json({ success: false, message });
  }
};
```

**Per-staff parallel queries pattern** (to apply for PERF-01, D-06):
```typescript
for (const staff of staffProfiles) {
  // Per-staff queries can be parallelized within the loop (D-06)
  const [manualDeductions, attendanceRecords] = await Promise.all([
    prisma.deductionLog.findMany({ where: { staff_id: staff.id, payroll_period_id: null } }),
    prisma.attendance.findMany({ where: { staff_id: staff.id, date: { gte: startDate, lte: endDate } } }),
  ]);
  // ... process staff payroll
}
```

---

### `backend/src/controllers/reportController.ts` (controller, CRUD) — PERF-02

**Analog:** `backend/src/controllers/reportController.ts` (current file)

**Imports pattern** (lines 1-4):
```typescript
import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
```

**Auth pattern** (applied via route middleware):
```typescript
export const getDailySalesStats = async (req: AuthRequest, res: Response) => {
```

**Core CRUD pattern** — CURRENT N+1 pattern to be fixed (lines 122-140):
```typescript
// Sales by Category
const serviceStats = await prisma.commission.groupBy({
  by: ['service_id'],
  where: { commission_date: { gte: start, lte: end } },
  _sum: { base_amount: true },
  _count: { id: true }
});

// N+1 ANTI-PATTERN: Fetching service name per stat in a loop (PERF-02)
const statsWithNames = await Promise.all(serviceStats.map(async (stat) => {
  const service = await prisma.service.findUnique({ where: { id: stat.service_id } });
  return {
    name: service?.name || 'Unknown',
    amount: Number(stat._sum.base_amount || 0),
    count: stat._count.id
  };
}));
```

**Batch findMany fix pattern** (to apply for PERF-02):
```typescript
// Batch fetch all services in one query (PERF-02 fix)
const serviceStats = await prisma.commission.groupBy({
  by: ['service_id'],
  where: { commission_date: { gte: start, lte: end } },
  _sum: { base_amount: true },
  _count: { id: true }
});

// Batch fetch instead of N+1
const serviceIds = [...new Set(serviceStats.map((stat) => stat.service_id))];
const services = await prisma.service.findMany({
  where: { id: { in: serviceIds } },
});
const serviceMap = new Map(services.map((s) => [s.id, s]));

const statsWithNames = serviceStats.map((stat) => ({
  name: serviceMap.get(stat.service_id)?.name || 'Unknown',
  amount: Number(stat._sum.base_amount || 0),
  count: stat._count.id,
}));
```

**Error handling pattern** (lines 154-158):
```typescript
  } catch (error: unknown) {
    console.error('Get daily sales stats error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch sales stats';
    return res.status(500).json({ success: false, message });
  }
```

---

### `backend/prisma/schema.prisma` (config, transform) — PERF-03

**Analog:** `backend/prisma/schema.prisma` (current file)

**Index pattern** — Commission model already has the required index (line 261):
```prisma
model Commission {
  id                Int      @id @default(autoincrement())
  transaction_id    Int
  staff_id          Int
  service_id        Int
  base_amount       Decimal  @db.Decimal(10, 2)
  commission_rate   Decimal  @db.Decimal(5, 2)
  commission_amount Decimal  @db.Decimal(10, 2)
  commission_date   DateTime @db.Date
  period_week       Int
  period_month      Int
  period_year       Int
  is_paid           Boolean  @default(false)
  created_at        DateTime @default(now())

  transaction Transaction @relation(fields: [transaction_id], references: [id])
  staff       StaffProfile @relation(fields: [staff_id], references: [id])
  service     Service      @relation(fields: [service_id], references: [id])

  @@index([staff_id, period_year, period_week])  // line 260
  @@index([commission_date])                     // line 261 - ALREADY EXISTS
  @@map("commissions")
}
```

**No migration needed** — RESEARCH.md confirms the index already exists. Just verify with `npx prisma validate`.

**Index pattern reference** (other models for style consistency):
```prisma
// User model indexes (lines 72-75)
@@index([username])
@@index([email])
@@index([phone])
@@index([role])

// Appointment model indexes (lines 194-196)
@@index([customer_id])
@@index([status, appointment_date])
@@index([appointment_date])
```

---

### `backend/src/controllers/uploadController.ts` (controller, file-I/O) — PERF-04

**Analog:** `backend/src/controllers/uploadController.ts` (current file) + busboy streaming pattern from RESEARCH.md

**Current imports pattern** (lines 1-2):
```typescript
import { Request, Response } from 'express';
import { put, del } from '@vercel/blob';
```

**New imports pattern** (to apply for PERF-04):
```typescript
import { Request, Response } from 'express';
import busboy from 'busboy';
import { put, del } from '@vercel/blob';
```

**Current Base64 upload pattern** (lines 9-55) — TO BE REPLACED:
```typescript
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { base64Data, filename, mimeType } = req.body;

    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No file data provided. Send base64Data.' });
    }

    // Validate mime type
    if (!mimeType?.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only image files are allowed' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Vercel Blob
    const blob = await put(filename || 'upload.png', buffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    // ...
```

**Streaming upload pattern** (to apply for PERF-04, from RESEARCH.md Pattern 3):
```typescript
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const bb = busboy({ headers: req.headers, limits: { fileSize: 4 * 1024 * 1024 } }); // 4MB limit
    let filename = '';
    let mimeType = '';
    let fileStream: NodeJS.ReadableStream | null = null;

    bb.on('file', (name, file, info) => {
      filename = info.filename;
      mimeType = info.mimeType;
      fileStream = file;
    });

    bb.on('close', async () => {
      if (!fileStream) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      if (!mimeType?.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'Only image files allowed' });
      }

      const blob = await put(filename || 'upload.png', fileStream, {
        access: 'public',
        contentType: mimeType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      // SEC-05: Validate URL
      const allowedPattern = /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*$/;
      if (!allowedPattern.test(blob.url)) {
        await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
        return res.status(400).json({ success: false, message: 'Invalid blob URL' });
      }

      return res.json({ success: true, data: { url: blob.url } });
    });

    req.pipe(bb);
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return res.status(500).json({ success: false, message });
  }
};
```

**Route update needed** (`backend/src/routes/uploadRoutes.ts`):
```typescript
// Current: router.post('/', uploadFile);
// No change needed to route itself - busboy parses the multipart body
// Client must now send multipart/form-data instead of JSON with base64Data
```

**Error handling pattern** (lines 47-54) — PRESERVE:
```typescript
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return res.status(500).json({
      success: false,
      message,
    });
  }
```

---

### `backend/src/controllers/appointmentCompletion.ts` (controller, CRUD) — PERF-05

**Analog:** `backend/src/controllers/appointmentCompletion.ts` (current file) + `backend/src/controllers/authController.ts` (transaction pattern reference)

**Imports pattern** (lines 1-9):
```typescript
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, getISOWeek, getMonth, getYear, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { sendAppointmentCompletion } from '../utils/email';
import { createNotification } from './notificationController';
import { AppointmentWithDetails } from '../types/appointmentTypes';
import { sendSuccess, sendError } from '../utils/apiHelpers';
import { PaymentMethod } from '@prisma/client';
```

**Prisma transaction pattern** (current, lines 98-151) — MODIFY to add notifications inside transaction:
```typescript
// 3. Complete appointment and record transaction & commissions in a database transaction
const result = await prisma.$transaction(async (tx) => {
  // Update appointment status
  await tx.appointment.update({
    where: { id: parseInt(id) },
    data: { status: 'completed' },
  });

  // Also update all items to completed
  await tx.appointmentItem.updateMany({
    where: { appointment_id: parseInt(id) },
    data: { status: 'completed' }
  });

  // Create transaction
  const transaction = await tx.transaction.create({
    data: {
      appointment_id: parseInt(id),
      amount: totalAmount,
      payment_method: paymentMethod as PaymentMethod,
      status: 'completed',
      receipt_number: receiptNumber,
    },
  });

  // Calculate and create commissions
  const baseRate = await getTieredCommissionRate(tx); // NOTE: Fix this to use tx (RESEARCH.md Open Q3)

  const commissionsCreated = [];
  for (const item of appointment.items) {
    const hasHitQuota = await checkSpecialtyQuota(item.staff_id, tx);
    const commissionRate = hasHitQuota ? 0.20 : baseRate;
    const commissionAmount = Number(item.price_at_booking) * commissionRate;

    const commission = await tx.commission.create({
      data: {
        transaction_id: transaction.id,
        staff_id: item.staff_id,
        service_id: item.service_id,
        base_amount: Number(item.price_at_booking),
        commission_rate: commissionRate * 100,
        commission_amount: commissionAmount,
        commission_date: today,
        period_week: getISOWeek(today),
        period_month: getMonth(today) + 1,
        period_year: getYear(today),
      },
    });
    commissionsCreated.push(commission);
  }

  return { transaction, commissions: commissionsCreated };
});
```

**In-app notification inside transaction pattern** (to apply for PERF-05, D-03):
```typescript
const result = await prisma.$transaction(async (tx) => {
  // ... existing DB operations (appointment update, items update, transaction create, commissions)

  // NEW: Create in-app notifications inside transaction (D-03)
  // Notification for customer
  await tx.notification.create({
    data: {
      user_id: appointment.customer_id,
      type: 'APPOINTMENT_COMPLETED',
      title: 'Appointment Completed',
      message: `Your appointment on ${format(today, 'yyyy-MM-dd')} is complete. Receipt: ${receiptNumber}`,
    },
  });

  // Notification for each staff member
  for (const item of appointment.items) {
    const staffProfile = await tx.staffProfile.findUnique({
      where: { id: item.staff_id },
      select: { user_id: true },
    });
    if (staffProfile) {
      await tx.notification.create({
        data: {
          user_id: staffProfile.user_id,
          type: 'APPOINTMENT_COMPLETED',
          title: 'Appointment Completed',
          message: `You completed an appointment. Commission: ₱${commissionAmount.toFixed(2)}`,
        },
      });
    }
  }

  return { transaction, commissions: commissionsCreated };
});
```

**Email outside transaction pattern** (current, lines 153-171) — PRESERVE with log-only failure (D-01, D-02):
```typescript
// 4. Send Completion Notification (Async, outside transaction per D-02)
(async () => {
  try {
    const customer = await prisma.customerProfile.findUnique({
      where: { id: appointment.customer_id },
      include: { user: true }
    });

    if (customer?.user.email && !appointment.is_walk_in) {
      sendAppointmentCompletion(customer.user.email, {
        customerName: customer.full_name,
        receiptNumber: receiptNumber,
        totalAmount: totalAmount.toFixed(2)
      });
    }
  } catch (err: unknown) {
    console.error('Post-completion notification error:', err); // D-01: log only
  }
})();
```

**Error handling pattern** (lines 179-186):
```typescript
  } catch (error: unknown) {
    console.error('Complete appointment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete appointment';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message }
    });
  }
```

**Helper function fix pattern** (lines 15-33) — Fix getTieredCommissionRate to use tx (RESEARCH.md Open Q3):
```typescript
// CURRENT: Uses prisma (wrong - should use tx inside transaction)
const getTieredCommissionRate = async (tx: typeof prisma) => {
  // ...
  const totalSales = await prisma.transaction.aggregate({  // BUG: uses prisma instead of tx
    // ...
  });
  // ...
};

// FIXED: Accept tx parameter and use it
const getTieredCommissionRate = async (tx: Prisma.TransactionClient) => {
  const lastMonth = subMonths(new Date(), 1);
  const start = startOfMonth(lastMonth);
  const end = endOfMonth(lastMonth);

  const totalSales = await tx.transaction.aggregate({  // Use tx instead of prisma
    where: { transaction_date: { gte: start, lte: end }, status: 'completed' },
    _sum: { amount: true },
  });

  const salesAmount = Number(totalSales._sum.amount || 0);
  if (salesAmount >= 55000) return 0.10;
  if (salesAmount >= 51000) return 0.08;
  return 0.05;
};
```

**Additional helper fix** (lines 39-52) — Fix checkSpecialtyQuota to use tx:
```typescript
const checkSpecialtyQuota = async (staffId: number, tx: Prisma.TransactionClient) => {
  const startOfCurrMonth = startOfMonth(new Date());

  const staffSales = await tx.commission.aggregate({  // Use tx instead of prisma
    where: { staff_id: staffId, commission_date: { gte: startOfCurrMonth } },
    _sum: { base_amount: true }
  });

  const totalSales = Number(staffSales._sum.base_amount || 0);
  return totalSales >= 6000;
};
```

---

## Shared Patterns

### Authentication and Request Types
**Source:** `backend/src/middleware/authMiddleware.ts` (lines 5-9)
**Apply to:** All controller files
```typescript
export interface AuthRequest extends Request {
  user?: AppJwtPayload;
  validatedParams?: Record<string, any>;
  validatedBody?: Record<string, any>;
}
```

### Error Handling
**Source:** All controllers consistently use this pattern
**Apply to:** All controller files
```typescript
try {
  // ... controller logic
} catch (error: unknown) {
  console.error('[Operation] error:', error);
  const message = error instanceof Error ? error.message : '[Default message]';
  return res.status(500).json({ success: false, message });
}
```

### Standardized Response Helpers
**Source:** `backend/src/utils/apiHelpers.ts` (lines 18-45)
**Apply to:** All controller files (already used in payrollController, authController, notificationController)
```typescript
export const sendSuccess = (res: Response, data: any, status: number = 200) => {
  return res.status(status).json({ success: true, data });
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  status: number = 400,
  fieldErrors?: Record<string, string[]>
) => {
  return res.status(status).json({
    success: false,
    error: { code, message, ...(fieldErrors && { fieldErrors }) },
  });
};
```

### Prisma Singleton
**Source:** `backend/src/utils/prisma.ts` (lines 1-22)
**Apply to:** All controller and utility files
```typescript
import prisma from '../utils/prisma';
// Uses global singleton pattern for serverless compatibility
```

### Prisma Transaction Pattern
**Source:** `backend/src/controllers/authController.ts` (lines 40-59) and `appointmentCompletion.ts` (lines 98-151)
**Apply to:** PERF-05 (appointmentCompletion.ts modifications)
```typescript
const result = await prisma.$transaction(async (tx) => {
  // All DB writes use tx instead of prisma
  const created = await tx.model.create({ data: { ... } });
  return created;
});
```

### Email Sending with Log-Only Failure
**Source:** `backend/src/controllers/appointmentCompletion.ts` (lines 153-171) and `backend/src/utils/email.ts`
**Apply to:** PERF-05 (preserve for appointment completion)
```typescript
// Async IIFE for fire-and-forget email (outside transaction)
(async () => {
  try {
    await sendEmail(...);
  } catch (err: unknown) {
    console.error('Email failed:', err); // D-01: log only, no retry
  }
})();
```

### URL Validation (SEC-05)
**Source:** `backend/src/controllers/uploadController.ts` (lines 33-41)
**Apply to:** PERF-04 (preserve in streaming refactor)
```typescript
const allowedPattern = /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*$/;
if (!allowedPattern.test(blob.url)) {
  await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  return res.status(400).json({
    success: false,
    message: 'Invalid blob URL. Only Vercel Blob URLs are allowed.',
  });
}
```

### Notification Creation Helper
**Source:** `backend/src/controllers/notificationController.ts` (lines 59-73)
**Apply to:** PERF-05 (in-app notifications inside transaction)
```typescript
export const createNotification = async (userId: number, type: string, title: string, message: string) => {
  try {
    return await prisma.notification.create({
      data: { user_id: userId, type, title, message },
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};
// Note: Inside transaction, use tx.notification.create() instead
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `backend/src/controllers/uploadController.ts` (streaming refactor) | controller | file-I/O (streaming) | No existing streaming multipart controller exists in codebase. Use `busboy` pattern from RESEARCH.md Pattern 3. |

---

## Metadata

**Analog search scope:** `backend/src/controllers/`, `backend/src/middleware/`, `backend/src/utils/`, `backend/prisma/`
**Files scanned:** 10 (payrollController, reportController, uploadController, appointmentCompletion, authController, notificationController, authMiddleware, apiHelpers, prisma.ts, email.ts, schema.prisma)
**Pattern extraction date:** 2026-05-04
**Phase:** 05 - Performance Optimization
**Total files modified:** 5
**New dependencies:** `busboy@1.6.0` (for PERF-04)
