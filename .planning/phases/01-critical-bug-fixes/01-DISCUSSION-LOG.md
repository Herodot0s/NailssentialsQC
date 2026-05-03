# Phase 1: Critical Bug Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 1-Critical Bug Fixes
**Areas discussed:** Staff schedule upsert, Navbar JSX fix, Walk-in password, ManagerDashboard type

---

## Staff Schedule Upsert (BUG-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Composite key (staff_id + day_of_week) (Recommended) | Prisma schema: add @@unique([staff_id, day_of_week]). Upsert uses where: { staff_id_day_of_week: { staff_id: Number(id), day_of_week: s.day_of_week } }. Correct and future-proof. | ✓ |
| Check s.id existence | In the loop, check if s.id exists: if yes, upsert by id; else create new. No schema change needed. | |
| Delete + recreate | Delete all existing schedules for the staff, then create new ones from the request. Simpler but loses existing schedule IDs. | |

**User's choice:** Composite key (staff_id + day_of_week) (Recommended)
**Notes:** Requires Prisma schema update with @@unique constraint. Zod validation will be added for schedule entries.

---

## Navbar JSX Fix (BUG-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Fix JSX in place (Recommended) | Add space between DropdownMenuItem and render prop in all occurrences (lines 130, 136, 143, 150). Minimal change, fixes the bug. | ✓ |
| Switch to Radix DropdownMenu | Replace Base UI DropdownMenu with Radix equivalents. Larger change but Radix is more widely adopted. | |

**User's choice:** Fix JSX in place (Recommended)
**Notes:** No component library migration — bug fix only.

---

## Walk-in Password (BUG-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Generate random hash (Recommended) | Generate random 12-char password, hash with bcrypt (12 rounds). Valid hash even though user is inactive. | ✓ |
| Set null | Set password_hash to null. Only works if Prisma schema defines password_hash as String? (optional). | |
| Leave as 'N/A' | Leave 'N/A' but add a comment noting it's invalid. Not recommended, security risk. | |

**User's choice:** Generate random hash (Recommended)
**Notes:** Walk-in user is created with is_active: false so cannot login regardless.

---

## ManagerDashboard Type (BUG-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Define inline (Recommended) | Define type ActiveView = 'analytics' \| 'staff' \| 'attendance' \| 'deductions' \| 'payroll' \| 'reviews' directly in ManagerDashboard.tsx. | ✓ |
| Separate types file | Create frontend/src/types/manager.ts with the union type for reuse across components. | |

**User's choice:** Define inline (Recommended)
**Notes:** Valid view IDs taken from menuItems array (lines 411-416).

---

## Claude's Discretion

- For BUG-04 (parseInt validation): Apply Zod validation to highest-traffic routes first (appointments, payroll, staff) before covering remaining routes.

## Deferred Ideas

None — discussion stayed within Phase 1 scope.
