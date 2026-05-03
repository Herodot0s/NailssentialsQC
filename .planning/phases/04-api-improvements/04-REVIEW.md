---
phase: 04-api-improvements
reviewed: 2026-05-03T12:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - backend/src/controllers/appointmentCompletion.ts
  - backend/src/controllers/appointmentController.ts
  - backend/src/controllers/authController.ts
  - backend/src/controllers/notificationController.ts
  - backend/src/controllers/payrollController.ts
  - backend/src/controllers/staffController.ts
  - backend/src/middleware/authMiddleware.ts
  - backend/src/routes/appointmentRoutes.ts
  - backend/src/routes/authRoutes.ts
  - backend/src/routes/payrollRoutes.ts
  - backend/src/routes/staffRoutes.ts
  - backend/src/utils/apiHelpers.ts
  - backend/src/validators/appointmentSchemas.ts
  - backend/src/validators/authSchemas.ts
  - backend/src/validators/payrollSchemas.ts
  - backend/src/validators/staffSchemas.ts
findings:
  critical: 7
  warning: 10
  info: 5
  total: 22
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-05-03T12:00:00Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Reviewed 16 backend source files related to API improvements (phase 04), including controllers, middleware, routes, utilities, and validators. The review identified 7 critical issues (blockers), 10 warnings, and 5 info items. Critical issues include incorrect transaction handling, improper commission marking, missing input validation on key routes, and unhandled promise rejections. All findings require attention before shipping.

## Critical Issues

### CR-01: Transaction helpers use global Prisma client instead of transaction context

**File:** `backend/src/controllers/appointmentCompletion.ts:15-52, 122-129`
**Issue:** The `getTieredCommissionRate` and `checkSpecialtyQuota` helper functions query the database using the global `prisma` instance, even when called inside a `prisma.$transaction` callback. The transaction callback receives a `tx` client that should be used for all queries within the transaction to ensure atomicity and consistent data snapshots. Using the global client risks data inconsistency and non-atomic operations.
**Fix:**
Pass the `tx` client from the transaction callback to the helper functions, and update the helpers to use `tx` instead of `prisma`:
```typescript
const getTieredCommissionRate = async (tx: Prisma.TransactionClient) => {
  const lastMonth = subMonths(new Date(), 1);
  const start = startOfMonth(lastMonth);
  const end = endOfMonth(lastMonth);

  const totalSales = await tx.transaction.aggregate({
    where: {
      transaction_date: { gte: start, lte: end },
      status: 'completed',
    },
    _sum: { amount: true },
  });
  // ... rest of logic
};

// Inside the transaction:
const baseRate = await getTieredCommissionRate(tx);
```

### CR-02: Payroll marks all unpaid commissions as paid instead of previous month's only

**File:** `backend/src/controllers/payrollController.ts:151-159`
**Issue:** When generating payroll, the code marks all unpaid commissions for a staff member as `is_paid: true`, not just the previous month's commissions that were used to calculate the "divide by 4" rule. This incorrectly marks older unpaid commissions as paid, leading to data loss and incorrect commission tracking.
**Fix:**
Update the `updateMany` query to only mark the previous month's commissions as paid, matching the commissions used in the calculation:
```typescript
// Get previous month's commission IDs for this staff
const prevMonthCommissionIds = prevMonthCommissions
  .filter(c => c.staff_id === staff.id)
  .map(c => c.id);

if (prevMonthCommissionIds.length > 0) {
  await prisma.commission.updateMany({
    where: {
      id: { in: prevMonthCommissionIds },
      is_paid: false,
    },
    data: { is_paid: true },
  });
}
```

### CR-03: Staff creation lacks input validation

**File:** `backend/src/controllers/staffController.ts:89-148`, `backend/src/routes/staffRoutes.ts:60`
**Issue:** The `createStaff` route does not use the `createStaffSchema` Zod validator, leading to unvalidated input. This allows invalid data (e.g., short passwords, invalid emails, missing required fields) and uses an insecure default password (`password123`) if no password is provided.
**Fix:**
Add the Zod validation middleware to the staff creation route:
```typescript
// staffRoutes.ts
import { createStaffSchema } from '../validators/staffSchemas';

router.post('/', validateZod(createStaffSchema), createStaff);
```
Also remove the default password fallback in `staffController.ts`:
```typescript
// Remove this line:
const hashedPassword = await bcrypt.hash(password || 'password123', 10);
// Replace with:
if (!password) {
  return sendError(res, 'PASSWORD_REQUIRED', 'Password is required for staff creation', 400);
}
const hashedPassword = await bcrypt.hash(password, 10);
```

### CR-04: Staff update lacks input validation and param validation

**File:** `backend/src/controllers/staffController.ts:153-199`, `backend/src/routes/staffRoutes.ts:61`
**Issue:** The `updateStaff` route does not validate the `:id` param or the request body. The `updateStaffSchema` is not used, leading to unvalidated updates and potential invalid data.
**Fix:**
Add param and body validation to the update route:
```typescript
// staffRoutes.ts
import { updateStaffSchema } from '../validators/staffSchemas';

router.put('/:id', validateIdParam, validateZod(updateStaffSchema), updateStaff);
```
Update `updateStaff` to use `req.validatedParams` and `req.validatedBody`:
```typescript
export const updateStaff = async (req: Request, res: Response) => {
  const { id } = req.validatedParams; // Now a number from validateIdParam
  const { fullName, email, phone, isActive, specializations, basePayPerWeek, dailyTarget, sssNumber, tinNumber, govId, profilePictureUrl, role } = req.validatedBody;
  // ... rest of logic
};
```

### CR-05: Unawaited async calls in fire-and-forget IIFEs cause unhandled rejections

**File:** `backend/src/controllers/appointmentController.ts:168-204`, `backend/src/controllers/appointmentCompletion.ts:154-171`
**Issue:** Async functions like `createNotification` and `sendAppointmentCompletion` are called without `await` inside the async IIFEs. Since they are not awaited, any rejections are not caught by the try/catch block, leading to unhandled promise rejections.
**Fix:**
Await all async calls inside the IIFE:
```typescript
(async () => {
  try {
    // ...
    await createNotification(...);
    // ...
  } catch (err: unknown) {
    console.error('Post-booking notification error:', err);
  }
})();
```

### CR-06: Appointment complete route lacks :id param validation

**File:** `backend/src/routes/appointmentRoutes.ts:21`
**Issue:** The `/:id/complete` route does not validate the `:id` param, allowing non-numeric IDs that cause `parseInt` to return `NaN`, leading to Prisma errors.
**Fix:**
Add the `validateIdParam` middleware (define it in appointmentRoutes.ts similar to payrollRoutes.ts):
```typescript
// appointmentRoutes.ts
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

router.post('/:id/complete', authenticateToken, authorizeRoles('staff', 'manager'), validateIdParam, validateZod(completeAppointmentSchema), completeAppointment);
```
Update `completeAppointment` to use `req.validatedParams.id`:
```typescript
const { id } = req.validatedParams; // Now a number
// Remove parseInt(id)
```

### CR-07: Deduction creation lacks input validation

**File:** `backend/src/controllers/payrollController.ts:243-274`, `backend/src/routes/payrollRoutes.ts:35`
**Issue:** The `addDeduction` route does not validate the request body, allowing invalid data (e.g., non-numeric `staff_id`, negative `amount`, missing required fields).
**Fix:**
Create a `addDeductionSchema` in payrollSchemas.ts and add validation middleware:
```typescript
// payrollSchemas.ts
export const addDeductionSchema = z.object({
  staff_id: z.number().int().positive('Staff ID must be a positive integer'),
  payroll_period_id: z.number().int().positive().optional(),
  type: z.string().min(1, 'Type is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

// payrollRoutes.ts
import { addDeductionSchema } from '../validators/payrollSchemas';

router.post('/deductions', authenticateToken, authorizeRoles('manager'), validateZod(addDeductionSchema), addDeduction);
```
Update `addDeduction` to use `req.validatedBody`.

## Warnings

### WR-01: Race condition in receipt number generation

**File:** `backend/src/controllers/appointmentCompletion.ts:84-95`
**Issue:** The receipt number is generated by counting today's transactions and incrementing, outside the database transaction. Concurrent requests can read the same count, leading to duplicate receipt numbers.
**Fix:**
Generate the receipt number inside the transaction, or use a database sequence/atomic increment. For example:
```typescript
// Inside the transaction:
const transactionCount = await tx.transaction.count({
  where: {
    transaction_date: { gte: startOfToday },
  },
});
const receiptNumber = `REC-${monthYearStr}-${(transactionCount + 1).toString().padStart(4, '0')}`;
```

### WR-02: No validation of pagination query params

**File:** `backend/src/controllers/appointmentController.ts:30-31`, `backend/src/controllers/payrollController.ts:177-178`, `backend/src/controllers/staffController.ts:14-15`
**Issue:** Routes that support cursor-based pagination do not validate `cursor` and `limit` query params. `limit` can be negative, leading to invalid Prisma queries.
**Fix:**
Add validation for query params, e.g., using Zod:
```typescript
const paginationSchema = z.object({
  cursor: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// In the controller:
const result = paginationSchema.safeParse(req.query);
if (!result.success) {
  return sendError(res, 'INVALID_PARAMETER', 'Invalid pagination params', 400);
}
const { cursor, limit } = result.data;
const validatedLimit = Math.min(limit || 20, 100);
```

### WR-03: Unvalidated :id params in staff schedule routes

**File:** `backend/src/controllers/staffController.ts:204-217`, `backend/src/routes/staffRoutes.ts:62`
**Issue:** `getStaffSchedule` and `updateStaffSchedule` (for schedule get) do not validate the `:id` param, leading to possible NaN when parsing.
**Fix:**
Add `validateIdParam` to the schedule routes:
```typescript
router.get('/:id/schedule', validateIdParam, getStaffSchedule);
```

### WR-04: Insecure default password for staff

**File:** `backend/src/controllers/staffController.ts:108`
**Issue:** If no password is provided for staff creation, the code uses `password123` as the default, which is a well-known insecure password.
**Fix:**
Require a password for staff creation (see CR-03 fix), or generate a secure random password if not provided (similar to walk-in customers):
```typescript
const password = password || generateRandomPassword(12);
const hashedPassword = await bcrypt.hash(password, 12);
```

### WR-05: BCRYPT_SALT_ROUNDS not validated

**File:** `backend/src/controllers/authController.ts:36`
**Issue:** If `BCRYPT_SALT_ROUNDS` environment variable is not a valid number, `parseInt` returns `NaN`, leading to invalid salt rounds for bcrypt.
**Fix:**
Validate the salt rounds:
```typescript
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
if (isNaN(saltRounds) || saltRounds < 1 || saltRounds > 31) {
  throw new Error('Invalid BCRYPT_SALT_ROUNDS');
}
```

### WR-06: Decimal fields converted to Number with potential precision loss

**File:** `backend/src/controllers/payrollController.ts:90`
**Issue:** `staff.base_pay_per_week` is a Prisma Decimal, converted to `Number` which can lose precision for large values.
**Fix:**
Use `staff.base_pay_per_week.toNumber()` (if using Prisma's Decimal) or keep it as a Decimal for calculations:
```typescript
const basePay = staff.base_pay_per_week.toNumber() * weeksInPeriod;
```

### WR-07: Unnecessary type assertions

**File:** `backend/src/controllers/authController.ts:334`, `backend/src/controllers/payrollController.ts:287`, `backend/src/controllers/staffController.ts:229`
**Issue:** Unnecessary type assertions are used to access nested properties that are already included in the Prisma query.
**Fix:**
Remove the type assertions, rely on Prisma's generated types:
```typescript
// authController.ts
const fullName = user.customer_profile?.full_name || user.staff_profile?.full_name || 'User';
```

### WR-08: Inconsistent error response formats

**File:** `backend/src/controllers/payrollController.ts:32`, `backend/src/controllers/staffController.ts:185-186`
**Issue:** Some error responses use `res.status().json()` directly instead of the `sendError` helper, leading to inconsistent response formats.
**Fix:**
Use `sendError` for all error responses:
```typescript
return sendError(res, 'OVERLAPPING_PERIOD', 'Payroll period overlaps with existing period', 400);
```

### WR-09: Unvalidated notification :id param

**File:** `backend/src/controllers/notificationController.ts:26-33`
**Issue:** `markAsRead` uses `parseInt(id as string)` without validating the `:id` param, leading to possible NaN.
**Fix:**
Add param validation for notification routes (similar to other routes).

### WR-10: Fire-and-forget async operations not tracked

**File:** `backend/src/controllers/appointmentController.ts:168-204`, `backend/src/controllers/appointmentCompletion.ts:154-171`
**Issue:** Notification and email sending are fire-and-forget, with no tracking of success/failure. If they fail, the user is not notified and the operations are not retried.
**Fix:**
Consider using a job queue for async operations, or at least log the success/failure status clearly.

## Info

### IN-01: Unnecessary fallback to req.body

**File:** `backend/src/controllers/appointmentCompletion.ts:57`, `backend/src/controllers/appointmentController.ts:81`
**Issue:** Since validation middleware is applied, `req.validatedBody` is always set, making the `|| req.body` fallback unnecessary.
**Fix:**
Remove the fallback:
```typescript
const { paymentMethod } = req.validatedBody;
```

### IN-02: Unnecessary non-null assertions

**File:** `backend/src/controllers/appointmentController.ts:165`
**Issue:** `userId!` non-null assertion is unnecessary since `userId` is checked earlier.
**Fix:**
Remove the non-null assertion:
```typescript
const callerId = userId;
```

### IN-03: Hardcoded walk-in customer details

**File:** `backend/src/controllers/appointmentController.ts:96-115`
**Issue:** Walk-in customer name and username are hardcoded, which could cause issues if they need to change.
**Fix:**
Move these to environment variables or config constants:
```typescript
const WALK_IN_CUSTOMER_NAME = process.env.WALK_IN_CUSTOMER_NAME || 'Walk-in Customer';
const WALK_IN_USERNAME = process.env.WALK_IN_USERNAME || 'walkin_guest';
```

### IN-04: Unnecessary parseInt on validated number fields

**File:** `backend/src/controllers/appointmentController.ts:93, 139, 152`
**Issue:** `serviceId`, `staffId`, etc. are already validated as numbers by the Zod schema, making `parseInt` unnecessary.
**Fix:**
Remove `parseInt`:
```typescript
const service = await tx.service.findUnique({ where: { id: serviceId } });
```

### IN-05: Missing await on notification creation

**File:** `backend/src/controllers/appointmentController.ts:192`
**Issue:** `createNotification` is called without `await`, leading to unhandled rejections (also covered in CR-05).
**Fix:**
Await the call (see CR-05 fix).

---

_Reviewed: 2026-05-03T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
