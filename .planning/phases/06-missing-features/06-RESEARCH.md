<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01: Scope of Operations**: Log the following sensitive operations only:
  - Payroll: `generatePayroll`, `lockPayroll`, `addDeduction`
  - Staff: `createStaff`, `updateStaff`, `updateStaffSchedule`
  - Commissions: `completeAppointment` (creation of commission records)
- **D-02: Detail Level**: "Action Only" logging. The `details` field in `SystemLog` should capture a human-readable summary (e.g., `{"message": "Manager updated staff profile for ID 5"}`) and the relevant entity ID. No full "diff" (old vs new values) is required.
- **D-03: IP/User Agent**: Capture IP address and User Agent in `SystemLog` where available (via middleware or req object).
- **D-04: Format**: Excel (XLSX) only. Use the `exceljs` library.
- **D-05: Required Fields**: Each row in the payroll export must include:
  - Staff Full Name
  - Payroll Period (Start Date - End Date)
  - Base Pay
  - Commissions
  - Deductions
  - Net Pay
  - TIN (Tax Identification Number)
  - SSS (Social Security System number)
- **D-06: Delivery**: A dedicated GET endpoint `backend/api/payroll/export/:id` that returns the XLSX file as a buffer with appropriate headers for download.
- **D-07: Storage**: Database-driven.
  - Create a new `SystemSettings` table (Key-Value pair or single row) for `global_sales_target`.
  - Add a `sales_target` Decimal field to the `PayrollPeriod` model in `schema.prisma`.
- **D-08: Logic**: "Global Default + Override".
  - The Daily Sales Stats dashboard pulls the target from the currently active (unlocked) `PayrollPeriod` if one exists and has a `sales_target` set.
  - Otherwise, it falls back to the `global_sales_target` from `SystemSettings`.
  - Initial `global_sales_target` should be seeded as `8000.00`.
- **D-09: Fallback**: If no DB entry exists, default to `8000.00` in code as a safety measure.

### the agent's Discretion
- For FEAT-01: Create a utility helper `logSystemAction(userId, action, entityType, entityId, details, req)` to standardize logging across controllers.
- For FEAT-02: Column widths in Excel should be auto-sized or reasonably fixed for readability.
- For FEAT-03: Use a Prisma migration to add the `SystemSettings` table and the `PayrollPeriod.sales_target` field.

### Deferred Ideas (OUT OF SCOPE)
- **Audit Trail UI**: A manager-only view to browse system logs.
- **Settings UI**: A page for managers to update the global sales target.
- **Other Export Formats**: PDF or CSV for payroll records.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEAT-01 | Add audit trail (SystemLog entries) for all sensitive operations | Researched utility pattern (`logSystemAction`), verified `SystemLog` model exists in `schema.prisma`. |
| FEAT-02 | Add data export/backup endpoint (Excel for payroll data) | `exceljs` library verified (v4.4.0), data mapping identified from `PayrollPeriod` relations. |
| FEAT-03 | Make sales target configurable via database | Schema update pattern outlined for `SystemSettings` table and `PayrollPeriod` modifications. |
</phase_requirements>

# Phase 6: Missing Features - Research

**Researched:** 2026-05-04
**Domain:** Backend API, Database Schema extensions, file generation
**Confidence:** HIGH

## Summary

Phase 6 implements the missing features required for the salon's daily operations and compliance tracking. The work centers on three separate capabilities: (1) capturing sensitive operation events in a `SystemLog` table for auditing, (2) generating and serving `.xlsx` reports for payroll records using the `exceljs` library, and (3) adding flexible DB-driven configuration for sales targets instead of hardcoding values. 

The strategy introduces a centralized audit logging utility, implements an Excel stream-to-buffer controller endpoint, and executes a database migration to introduce a `SystemSettings` Key-Value model and a new field on `PayrollPeriod`.

**Primary recommendation:** Implement the audit logger utility immediately, and weave its usage into controllers while ensuring it captures the request IP and User Agent silently (using `try/catch` without failing the parent request). Proceed with Prisma schema updates to provide the data structure needed for the sales target logic.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| System Auditing | API / Backend | Database | Backend routes are aware of IPs, user agents, and the context of the sensitive action before writing to the database. |
| Excel Payroll Export | API / Backend | Database | The API controller aggregates data from the DB, writes to the `exceljs` workbook, and streams directly to the Express `Response`. |
| Configurable Targets | Database | API / Backend | Source of truth sits in the DB (`SystemSettings`, `PayrollPeriod`), and the API evaluates the override logic to deliver it to the client. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `exceljs` | `^4.4.0` | Excel file creation | Excellent layout support, memory-efficient streams and buffers, well-typed in TS, industry standard for `.xlsx`. |
| `@prisma/client` | `6.4.1` | Database ORM | Existing application ORM; used to perform the needed schema adjustments for FEAT-03. |

**Installation:**
```bash
npm install exceljs
npm install --save-dev @types/exceljs
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── prisma/
│   └── schema.prisma         # Update with SystemSettings & PayrollPeriod.sales_target
├── src/
│   ├── utils/
│   │   └── systemLog.ts      # New utility: logSystemAction()
│   ├── controllers/
│   │   ├── payrollController.ts     # Modified: +exportPayrollExcel, +audit logs
│   │   ├── staffController.ts       # Modified: +audit logs
│   │   ├── appointmentCompletion.ts # Modified: +audit logs
│   │   └── reportController.ts      # Modified: +dynamic target logic
│   └── routes/
│       └── payrollRoutes.ts         # Modified: register GET /export/:id
```

### Pattern 1: Silent Audit Logging Utility
**What:** Central utility that writes to `SystemLog`.
**When to use:** Whenever FEAT-01 requires an audit entry.
**Example:**
```typescript
import { Request } from 'express';
import prisma from './prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const logSystemAction = async (
  req: AuthRequest | Request,
  action: string,
  entityType?: string,
  entityId?: number,
  details?: Record<string, any>
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub as number | undefined;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await prisma.systemLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      }
    });
  } catch (error) {
    console.error('Audit Log failed (non-fatal):', error);
  }
};
```

### Pattern 2: Excel API Delivery
**What:** Generating Excel and sending it as a download response without writing to local disk.
**When to use:** Delivering payroll report files on demand (FEAT-02).
**Example:**
```typescript
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `attachment; filename="Payroll_Report_${periodId}.xlsx"`);

// Use workbook.xlsx.write directly to the response stream
await workbook.xlsx.write(res);
res.end();
```

### Anti-Patterns to Avoid
- **Blocking Business Logic on Audits:** Using an `await logSystemAction()` without an internal `try/catch` inside the logger, causing a payroll generation failure if the log write fails.
- **Saving Excel to disk:** Writing XLSX to `/tmp` before sending it to the client. This introduces unnecessary disk I/O and cleanup tasks. Always stream to `res`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel File generation | Manual string/CSV builder for XLSX | `exceljs` | Proper XLSX needs correct XML file structures and ZIP archiving. |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Prisma `SystemSettings` table doesn't exist | Need database schema generation and `npx prisma migrate dev` |
| Live service config | None | |
| OS-registered state | None | |
| Secrets/env vars | None | |
| Build artifacts | None | |

## Common Pitfalls

### Pitfall 1: Sales Target Fallback Logic Failure
**What goes wrong:** The target reports as `null` or crashes if the `global_sales_target` is unseeded.
**Why it happens:** The database misses a seed and the code lacks the final safety net fallback.
**How to avoid:** Ensure `D-09: Fallback` is strictly implemented in `reportController.ts`: `const finalTarget = dbValue ?? 8000;`.

### Pitfall 2: Express Response Hanging
**What goes wrong:** Client request times out waiting for the file.
**Why it happens:** Calling `res.end()` too early, or forgetting it entirely after `workbook.xlsx.write(res)`.
**How to avoid:** Ensure `await workbook.xlsx.write(res);` resolves completely before finishing the Express route cycle.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded 8000 target | DB `SystemSettings` table | Phase 6 | Sales dashboard automatically adapts without code deployments. |
| No logging | `SystemLog` entries | Phase 6 | Meets security and compliance standards for sensitive actions. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `req.ip` and `req.socket.remoteAddress` are available in this express environment to fulfill D-03 | Architectural Patterns | Audit logs miss IP data. |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `exceljs` | FEAT-02 | ✗ | — | Add to package.json |
| PostgreSQL | DB Schema changes | ✓ | Current | — |

**Missing dependencies with no fallback:**
- `exceljs` (must be installed during plan execution)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + Supertest (Backend) |
| Config file | none — see Wave 0 |
| Quick run command | `npm test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEAT-01 | Sensitive actions create SystemLog | integration | `npx jest tests/audit.test.ts` | ❌ Wave 0 |
| FEAT-02 | GET /export/:id returns Excel blob | integration | `npx jest tests/export.test.ts` | ❌ Wave 0 |
| FEAT-03 | Sales stats uses configurable target | unit | `npx jest tests/report.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] Testing framework setup is incomplete (package.json indicates `echo "Error: no test specified"`)
- [ ] No test files currently exist for backend.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V7 Error Handling and Logging | yes | `SystemLog` custom utility |
| V4 Access Control | yes | `authorizeRoles('manager')` on export endpoint |

### Known Threat Patterns for Express.js
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Broken Access Control | Elevation of Privilege | Ensure the new Excel export endpoint explicitly demands `manager` role via `authorizeRoles`. |

## Sources

### Primary (HIGH confidence)
- Prisma Schema (`backend/prisma/schema.prisma`) - Verified existing models.
- Code Context (`backend/src/controllers/*.ts`) - Verified controller integration points.
- Local `npm.cmd` output - Confirmed `exceljs` current version 4.4.0.

### Secondary (MEDIUM confidence)
- `exceljs` documentation logic - Buffer rendering patterns.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `exceljs` is practically the only robust choice for JS/TS `.xlsx` generation.
- Architecture: HIGH - the API mapping directly to Prisma is standard for this repo.
- Pitfalls: HIGH - common issues with streams and fallbacks.

**Research date:** 2026-05-04
**Valid until:** 2026-06-04