# Phase 10: Manager Payroll UI & Excel Export - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 10-Manager Payroll UI & Excel Export
**Areas discussed:** Excel Report Layout, Editing & Finalization Flow, Deduction Management UI, UI Navigation & Placement

---

## Excel Report Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Staff as Columns | Dates as rows, staff as columns (legacy) | |
| Staff as Rows | Staff as rows, dates as columns (transposed) | ✓ |

**User's choice:** Staff as Rows
**Notes:** User confirmed the transposed layout and the specific column ordering (Sales -> Earnings -> Categorized Deductions -> Net Pay).

---

## Editing & Finalization Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Restricted Export | Export only after lock | |
| Open Export | Export available for both drafts and official | ✓ |

**User's choice:** both for drafts and official
**Notes:** Managers can export even in draft state for auditing purposes.

---

## Deduction Management UI

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-link | Automatically link global deductions to current period | |
| Manual link | Remain unlinked until manually assigned | ✓ |

**User's choice:** remain unlinked until the manager manually assigns it
**Notes:** Global ledger deductions will not be automatically swept into the current payroll.

---

## UI Navigation & Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Global Quick Action | "Generate" button on main dashboard overview | |
| Localized Action | "Generate" button inside payroll list view | ✓ |

**User's choice:** inside payroll list view
**Notes:** Navigation will be nested under Personnel -> Payroll.

---

## the agent's Discretion

- Visual styling of the "Draft" watermark on Excel exports.
- UX for pulling unlinked deductions into a payroll period.

## Deferred Ideas

None — discussion stayed within phase scope
