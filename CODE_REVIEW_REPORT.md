# NailssentialsQC Code Review Report
**Date:** May 30, 2026

This document details critical issues, logic warnings, and code-quality items discovered during the comprehensive inspection of the `backend/src` and `frontend/src` codebase.

---

## 1. Critical Issues (Blockers)

### CR-01: Receipt Number Generation Race Condition
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\appointmentCompletion.ts`
* **Line:** 158-165
* **Issue:** The count of completed transactions for the day (`transactionCount`) is queried outside of the database transaction block. Under concurrent usage (e.g., if a manager completes multiple appointments concurrently or if two different terminals complete transactions at the same time), both requests will retrieve the same transaction count. Because `receipt_number` is defined as `@unique` in the database schema, this race condition will cause the database to throw a unique constraint violation error and fail to complete one of the appointments.
* **Fix:** Move the transaction count query inside the Prisma transaction (`$transaction`) and execute it with locking or utilize a Postgres sequence or UUID generator for guaranteed receipt number uniqueness.
```typescript
const result = await prisma.$transaction(async (tx) => {
  // Query transaction count inside the transaction block
  const transactionCount = await tx.transaction.count({
    where: {
      transaction_date: {
        gte: startOfToday,
      },
    },
  });
  
  const receiptNumber = `REC-${monthYearStr}-${(transactionCount + 1).toString().padStart(4, '0')}-${id}`;
  
  // Proceed to create transaction
  const transaction = await tx.transaction.create({
    data: {
      appointment_id: parseInt(id as string),
      amount: totalAmount,
      payment_method: paymentMethod as PaymentMethod,
      status: 'completed',
      receipt_number: receiptNumber,
      gcash_reference_no: paymentMethod === 'gcash' ? gcashReferenceNo : null,
    },
  });
  // ...
});
```

### CR-02: Date and Timezone Mismatch in Weekly Commission Calculations
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\appointmentCompletion.ts`
* **Line:** 234-237
* **Issue:** Commissions are created with `commission_date: today` (which represents `new Date()` and is written to PostgreSQL as a UTC date). However, the commission's temporal helper fields (`period_week`, `period_month`, and `period_year`) are calculated using `date-fns` timezone-sensitive functions based on the Manila local timezone (`process.env.TZ = 'Asia/Manila'`).
On Sunday morning in Manila (which is Saturday night UTC), `commission_date` gets written to the database as the UTC date representing Saturday, but `period_week` is calculated as Sunday's week (Week N+1). When weekly payroll is generated in `payrollController.ts`, it queries commissions using the date field `commission_date` (attributing the commission to Week N), but the weekly quota aggregation logic groups commissions using the `period_week` field (attributing it to Week N+1). This timezone misalignment breaks weekly hair specialization quota allocations and results in incorrect payroll calculations.
* **Fix:** Ensure both the `commission_date` and week calculations are derived consistently. Write the Manila local date string (e.g. `"YYYY-MM-DD"`) or adjust the UTC date object before writing.
```typescript
const manilaTodayStr = format(new Date(), 'yyyy-MM-dd');
const localToday = new Date(manilaTodayStr + 'T00:00:00Z');

const commission = await tx.commission.create({
  data: {
    transaction_id: transaction.id,
    staff_id: item.staff_id,
    service_id: item.service_id,
    base_amount: Number(item.price_at_booking),
    commission_rate: commissionRate * 100,
    commission_amount: commissionAmount,
    commission_date: localToday,
    period_week: getISOWeek(localToday),
    period_month: getMonth(localToday) + 1,
    period_year: getYear(localToday),
  },
});
```

### CR-03: Reporting Date Shifting and Previous Day Metric Contamination
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\reportController.ts`
* **Line:** 23-24, 38-41 (also affects `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\analyticsController.ts` lines 101-102)
* **Issue:** When date queries are processed, the code parses incoming YYYY-MM-DD date strings as `new Date(startDate)`. By default, ISO date strings parsed without a time component are evaluated as UTC (e.g., `2026-05-30T00:00:00.000Z`). However, `startOfDay` and `endOfDay` operate in the process's local timezone (`Asia/Manila`, UTC+8).
Calling `startOfDay(new Date("2026-05-30"))` shifts the local time back to `00:00` Manila local time, which corresponds to `2026-05-29T16:00:00.000Z` in UTC. When querying the `@db.Date` column `commission_date`, Prisma converts this UTC timestamp into a simple date string by extracting its UTC component, producing `"2026-05-29"`. Consequently, a query for `startDate = "2026-05-30"` executes as `WHERE commission_date >= '2026-05-29'`, contaminating reports with the entire previous day's metrics.
* **Fix:** Use raw ISO date strings for date comparison on `@db.Date` columns to bypass timezone-shifting by `date-fns` and Prisma.
```typescript
const start = startDate as string;
const end = endDate as string;

const commissionData = await prisma.commission.aggregate({
  where: {
    staff_id: staff.id,
    commission_date: {
      gte: new Date(start + 'T00:00:00Z'),
      lte: new Date(end + 'T23:59:59Z'),
    },
  },
  // ...
});
```

### CR-04: Midnight Check-Out Failure for Evening Shifts
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\attendanceController.ts`
* **Line:** 292-298
* **Issue:** When a staff member checks out, `attendanceController.ts` queries their active attendance log using `date = today`. Because `today` evaluates to the current calendar date in Manila, if a shift spans past midnight or if clean-up work continues past midnight, `today` will resolve to the new calendar day. Since the staff check-in was registered on the previous calendar day, the query fails to find the record and returns a `P2025` Prisma error, causing the application to return "You must check in before checking out" and preventing successful checkout.
* **Fix:** Instead of querying strictly by the current calendar date, search for the most recent active check-in record for the staff member where `check_out` is `null`.
```typescript
const attendance = await prisma.attendance.findFirst({
  where: {
    staff_id: staffProfile.id,
    check_out: null,
  },
  orderBy: {
    date: 'desc'
  }
});

if (!attendance) {
  return res.status(400).json({
    success: false,
    error: { code: 'NOT_CHECKED_IN', message: 'You must check in before checking out' }
  });
}

const updatedAttendance = await prisma.attendance.update({
  where: { id: attendance.id },
  data: { check_out: now },
});
```

---

## 2. Warnings

### WR-01: Salary Structure Assignments Ignored in Payroll Calculation
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\payrollController.ts`
* **Line:** 222
* **Issue:** While a detailed schema and CRUD API exist in `payrollSetupController.ts` for managing `SalaryStructure` and `SalaryStructureAssignment` components, the actual payroll calculation engine completely ignores them. Instead, it calculates base pay using a simple hardcoded fallback: `Number(staff.base_pay_per_week) * weeksInPeriod`. Any custom salary components, custom earnings, or custom deductions configured for staff profiles are bypassed.
* **Fix:** Update the `generatePayroll` controller to retrieve the active `SalaryStructureAssignment` for each staff member and compute pay dynamically using the structure's base pay and associated salary components.
```typescript
const assignment = await prisma.salaryStructureAssignment.findFirst({
  where: {
    staff_id: staff.id,
    is_active: true,
    effective_from: { lte: endDate }
  },
  include: {
    salary_structure: {
      include: {
        components: {
          include: { salary_component: true }
        }
      }
    }
  }
});

const basePay = assignment 
  ? Number(assignment.base_pay) * weeksInPeriod 
  : Number(staff.base_pay_per_week) * weeksInPeriod;
```

### WR-02: Overlapping Slots Allowed During Multi-Slot Service Bookings
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\appointmentAvailability.ts`
* **Line:** 69-102
* **Issue:** The available slots endpoint `getAvailableSlots` calculates availability strictly in static 30-minute intervals. If a technician is free at 1:00 PM but booked at 1:30 PM, the 1:00 PM slot is reported as available. If a customer attempts to book a 90-minute service starting at 1:00 PM, the UI will present 1:00 PM as an option. However, upon submitting the reservation, the booking transaction in `createAppointment` will correctly identify the 1:30 PM conflict and reject the booking, leading to a frustrating user experience.
* **Fix:** Modify the availability check to accept a dynamic `duration` parameter in the query and evaluate technician availability across the entire required duration instead of a static 30-minute window.
```typescript
const duration = req.query.duration ? parseInt(req.query.duration as string) : 30;
// Use dynamic duration to calculate slotEnd instead of hardcoded 30 minutes
const slotEnd = addMinutes(slotStart, duration);
```

### WR-03: Svix Webhook Payload Verification Fragility
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\clerkWebhookController.ts`
* **Line:** 31
* **Issue:** The webhook controller stringifies the parsed request body with `JSON.stringify(req.body)` to perform signature verification. If the incoming raw request payload contains whitespace, differing key ordering, or formatting that differs from the default stringification output of the V8 JavaScript engine, signature verification will fail.
* **Fix:** Use a raw-body parser middleware on the Clerk webhook route to preserve the exact raw request payload as a buffer for signature validation.
```typescript
// In index.ts, register the webhook route before global body parsers, or use a verify hook:
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl.startsWith('/api/v1/auth/webhooks/clerk')) {
      req.rawBody = buf.toString();
    }
  }
}));

// In clerkWebhookController.ts:
const payload = req.rawBody || JSON.stringify(req.body);
```

### WR-04: Sub-optimal Salt Rounds for Hashing New Staff Passwords
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\staffController.ts`
* **Line:** 321
* **Issue:** `updateStaff` hashes passwords using a hardcoded `10` salt rounds, violating the project configuration guidelines in `CLAUDE.md` which specify a default of `12` rounds (`BCRYPT_SALT_ROUNDS`).
* **Fix:** Read the salt rounds from environment variables with a fallback to `12`.
```typescript
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
data.password_hash = await bcrypt.hash(password, saltRounds);
```

### WR-05: Missing Parameter Validation on Delete Deduction Log
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\payrollController.ts`
* **Line:** 702
* **Issue:** In the `deleteDeduction` function, the ID parameter is parsed with `parseInt(idStr as string)` but is not validated to check if it parses to `NaN`. If a non-numeric ID is passed, the Prisma call `prisma.deductionLog.findUnique({ where: { id: idNum } })` will crash the application server with a 500 error instead of returning a proper 400 validation error.
* **Fix:** Add a validation check after parsing the ID.
```typescript
const idNum = parseInt(idStr as string);
if (isNaN(idNum)) {
  return res.status(400).json({ success: false, message: 'Invalid deduction ID parameter' });
}
```

---

## 3. Info / Quality Items

### IN-01: Unused Import and Dead Code
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\payrollController.ts`
* **Line:** 20
* **Issue:** `evaluatePayrollFormula` is imported at the top of the file, and `payrollEvaluator.ts` has a simple formula evaluation implementation. However, the function is never referenced anywhere in `payrollController.ts` or the wider application logic, contributing to dead code.
* **Fix:** Remove the unused import from `payrollController.ts` and clean up `payrollEvaluator.ts`.

### IN-02: Double Response End Call
* **File:** `C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\payrollController.ts`
* **Line:** 670-671
* **Issue:** Inside `exportPayrollExcel`, the response is finalized twice in consecutive statements:
  ```typescript
  await workbook.xlsx.write(res);
  res.end();
  res.end();
  ```
  Calling `res.end()` multiple times is redundant.
* **Fix:** Remove the second `res.end()` statement.
