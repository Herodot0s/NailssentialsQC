---
status: testing
phase: 09-weekly-calculation-engine
source: ["09-01-SUMMARY.md"]
started: 2026-05-14T15:58:00Z
updated: 2026-05-14T15:59:30Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 2
name: Generate Weekly Payroll
expected: |
  Trigger the `generatePayroll` endpoint for a period. A new `StaffPayroll` record should be created. Checking the database (or API response) shows the `daily_breakdown` field populated with a JSON object mapping dates to sales amounts.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass

### 2. Generate Weekly Payroll
expected: Trigger the `generatePayroll` endpoint for a period. A new `StaffPayroll` record should be created. Checking the database (or API response) shows the `daily_breakdown` field populated with a JSON object mapping dates to sales amounts.
result: [pending]

### 3. Payroll Recalculation (Preserve Deductions)
expected: Add a manual deduction (e.g., Cash Advance) to a generated payroll record. Trigger `generatePayroll` for the same period again. The payroll record is regenerated, but the manual deduction remains associated with the new/updated record.
result: [pending]

### 4. Commission Rate Accuracy
expected: Update a staff profile's `base_commission_rate` (e.g., to 10%). Generate payroll. The resulting commission calculation in the payroll record should reflect the 10% rate rather than the default 8%.
result: [pending]

### 5. Tardiness Logging
expected: Ensure attendance records with lates exist for the period. Generate payroll. Verify that `TardinessLog` entries are created/updated for the staff members in that period.
result: [pending]

## Summary

total: 5
passed: 1
issues: 0
pending: 4
skipped: 0

## Gaps

[none yet]
