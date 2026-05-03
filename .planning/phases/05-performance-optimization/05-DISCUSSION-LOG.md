# Phase 5: Performance Optimization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 5-Performance Optimization
**Areas discussed:** Email failure handling, Promise.all error strategy

---

## Email Failure Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Log only (Recommended) | Log the error with console.error, don't block the user. Matches current fire-and-forget pattern and Phase 3 D-07. | ✓ |
| Retry once | Attempt to resend once after 2 seconds, then log if still fails. Adds complexity but improves delivery. | |
| Notify manager | Create an in-app notification for managers about the email failure. Requires notification system integration. | |

**User's choice:** Log only (Recommended)
**Notes:** Email only sends after successful Prisma transaction commit. In-app notifications inside transaction, email outside.

## Email Failure Handling (2nd question)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes (Recommended) | Only send receipt after successful transaction commit. If DB operations fail, no email attempted. Matches PERF-05 success criteria. | ✓ |
| No | Attempt email regardless of transaction outcome (current fire-and-forget behavior, but illogical if appointment not completed.) | |

**User's choice:** Yes (Recommended)
**Notes:** Email sending only after transaction commit.

## Email Failure Handling (3rd question)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, all notifications | Keep all side effects (email, in-app) outside transaction, log-only on failure. Consistent with async IIFE pattern. | |
| In-app inside transaction | In-app notifications are DB writes — they belong inside the transaction. Email stays outside with log-only. | ✓ |
| No, only email | Other notifications handled differently or not present. | |

**User's choice:** In-app inside transaction
**Notes:** In-app notifications are DB writes, belong inside transaction.

## Email Failure Handling (4th question)

| Option | Description | Selected |
|--------|-------------|----------|
| console.error (Recommended) | Standard for caught errors, matches existing try/catch pattern (Phase 2 D-04). | ✓ |
| console.warn | Less severe since user is not blocked. Matches Phase 3 D-07 for blocked notifications. | |
| No log | Silent failure. Violates existing logging patterns. | |

**User's choice:** console.error (Recommended)
**Notes:** Log level for email failures is console.error.

---

## Promise.all Error Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Fail whole request (Recommended) | Return 500 if any query fails. Simpler error handling, matches try/catch pattern (Phase 2 D-04). | ✓ |
| Return partial results | Continue with successful queries, return partial data with warning. More complex but resilient. | |
| Retry failed query | Attempt failed query again after 1 second, fail if still fails. Adds complexity. | |

**User's choice:** Fail whole request (Recommended)
**Notes:** If any independent query fails, fail whole request with 500.

## Promise.all Error Strategy (2nd question)

| Option | Description | Selected |
|--------|-------------|----------|
| All (Recommended) | Group all independent DB queries (base pay, commissions, deductions) in one Promise.all. Maximizes parallelism. | ✓ |
| Split into groups | Group base pay + deductions, commissions separately. More granular error handling. | |
| Commissions + base only | Deductions are fast/simple, not worth parallelizing. | |

**User's choice:** All (Recommended)
**Notes:** All independent DB queries grouped in one Promise.all.

## Promise.all Error Strategy (3rd question)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes (Recommended) | Compute totals/summaries after all parallel queries finish. Standard pattern, minimal overhead. | ✓ |
| No | All processing done in parallel queries, nothing left. Rare for payroll. | |
| Mixed | Some post-processing but minimal. Most work in parallel. | |

**User's choice:** Yes (Recommended)
**Notes:** Post-processing (compute totals) after parallel queries finish.

## Promise.all Error Strategy (4th question)

| Option | Description | Selected |
|--------|-------------|----------|
| No (Recommended) | Trust DB to respond, keep it simple. Matches try/catch pattern (Phase 2 D-04). | ✓ |
| Yes, per query | Wrap each query in Promise.race with timeout. Adds complexity per query. | |
| Yes, overall | Set timeout on entire Promise.all. Catches slow overall, not per query. | |

**User's choice:** No (Recommended)
**Notes:** No timeout on Promise.all, trust DB.

---

## Claude's Discretion

- PERF-02 (N+1 fix): Use Prisma `include` with `select` to batch fetch related services.
- PERF-03 (database index): Single-column index on `commission.commission_date`.
- PERF-04 (streaming): Use `busboy` or @vercel/blob streaming, threshold 5MB.
- PERF-05 (transaction): Wrap DB operations in `prisma.$transaction()`, email outside log-only.

## Deferred Ideas

None — discussion stayed within Phase 5 scope.
