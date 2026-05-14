# Phase 8: Payroll Models & Backend Foundations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 8-Payroll Models & Backend Foundations
**Areas discussed:** Commission Rate Storage, Deduction Tracking, Payroll Period Creation

---

## Commission Rate Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Simple field | Add a simple `commission_rate` field to `StaffProfile` alongside existing `base_pay_per_week` | ✓ |
| Salary Structure System | Use the complex `SalaryStructure` models already in the schema | |

**User's choice:** "the commision tier but still allow manager intervention to change the base commision rate. yes i prefer to use simple fields on staff profile."
**Notes:** User preferred simplicity for manager intervention.

---

## Deduction Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Simple logs | Manager manually inputs the specific deduction amount each week | ✓ |
| Running balances | System automatically tracks remaining loan balances across periods | |

**User's choice:** "keep it simple and have the manager manually input the specific deduction"
**Notes:** User chose the manual/simple approach over automated long-term balance tracking.

---

## Payroll Period Creation

| Option | Description | Selected |
|--------|-------------|----------|
| Automated cron job | System auto-generates periods via background scheduled job | |
| Manual trigger | Manager manually clicks "Generate Next Period" | ✓ |

**User's choice:** "manager manually click"
**Notes:** Decided against background jobs in favor of direct manager control.

---

## the agent's Discretion

None

## Deferred Ideas

None
