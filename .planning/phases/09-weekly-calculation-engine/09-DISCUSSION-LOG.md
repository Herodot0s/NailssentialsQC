# Phase 9: Weekly Calculation Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 9-Weekly Calculation Engine
**Areas discussed:** Daily Breakdown Storage, Regeneration Workflow, Commission Rate Precedence

---

## Daily Breakdown Storage

| Option | Description | Selected |
|--------|-------------|----------|
| JSON Snapshot in DB | Store a `daily_breakdown` JSON field directly on the `StaffPayroll` model during generation. | ✓ (Agent decided) |
| Dynamic Computation | Calculate daily metrics from raw `Commission` records on the fly every time. | |
| You decide | Let the agent pick the most appropriate approach. | ✓ (User Selected) |

**User's choice:** You decide
**Notes:** Agent decided on JSON Snapshot in DB to ensure historical immutability.

| Option | Description | Selected |
|--------|-------------|----------|
| Total daily sales only | Matches the current spreadsheet format exactly. | ✓ |
| Detailed breakdown per day | Include a breakdown of service categories/tiers. | |
| You decide | Agent picks balance. | |

**User's choice:** Total daily sales only
**Notes:**

---

## Regeneration Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Wipe and Regenerate | Completely delete draft items and recalculate from scratch. | ✓ (Agent decided) |
| Item-level Editing | Modify the draft via specific endpoints. | |
| You decide | Let the agent decide. | ✓ (User Selected) |

**User's choice:** You decide
**Notes:** Agent decided on Wipe and Regenerate for deterministic math.

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve them | Detach manual deductions and re-attach them to the new draft. | ✓ (Agent decided) |
| Delete them | Complete reset. | |
| You decide | Let the agent decide. | ✓ (User Selected) |

**User's choice:** You decide
**Notes:** Agent decided to preserve them for better UX.

---

## Commission Rate Precedence

| Option | Description | Selected |
|--------|-------------|----------|
| Default to 8% | Safe fallback. | ✓ |
| Throw an error | Block payroll generation. | |
| You decide | Agent handles edge cases. | |

**User's choice:** Default to 8%
**Notes:**

| Option | Description | Selected |
|--------|-------------|----------|
| Apply the new rate to the entire week | Use the current rate at generation time. | ✓ (Agent decided) |
| Calculate daily based on historical rate | Highly accurate but complex. | |
| You decide | Let the agent decide. | ✓ (User Selected) |

**User's choice:** You decide, but lets give the manager the power to give custom commission rate
**Notes:** Agent decided to apply to the entire week, respecting the manager's ability to set a custom rate.

---

## the agent's Discretion

- Daily Breakdown Storage: JSON Snapshot in DB
- Regeneration Workflow: Wipe and Regenerate
- Regeneration Workflow (Manual Deductions): Preserve them
- Commission Rate Precedence (Mid-week changes): Apply to the entire week

## Deferred Ideas

None
