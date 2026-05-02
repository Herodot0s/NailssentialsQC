# Phase 3: Security Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 3-Security Hardening
**Areas discussed:** Password validation scope, Notification permission enforcement

---

## Password Validation Scope (SEC-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Same rules everywhere (Recommended) | All password changes (staff, manager, customer) use same rules as registration: min 8, upper, lower, number, special | |
| Registration only (Recommended) | Customers registering get the full rules. Staff/manager password changes stay simpler (min 8 + number). Users rarely change credentials. | ✓ |
| Weak validation everywhere | Min 8 chars throughout. Uppercase, lowercase, numbers, special chars are hints but not enforced. | |

**User's choice:** Registration only
**Notes:** Password change/reset endpoints use min 8 + number at minimum. Full strength rules only at initial registration.

---

## Password Complexity Requirements (SEC-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Full complexity | Min 8, uppercase, lowercase, numbers, special chars required | |
| Upper + number only (Recommended) | Min 8, one uppercase, one number. Simple but blocks common patterns. | ✓ |
| Numbers only | Min 8 chars, numbers in UI hints but not blocking | |

**User's choice:** Upper + number only (Recommended)
**Notes:** Keep it simple — no required lowercase or special characters.

---

## Special Character Handling (SEC-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Add as optional hint only (Recommended) | Show "Tip: include a special character (!@#$) for a stronger password" — not enforced | ✓ |
| Make special chars required | Add special character to required rules | |
| Don't mention it at all | No change to current behavior | |

**User's choice:** Add as optional hint only
**Notes:** Educational hint on registration form — no enforcement.

---

## Notification Permission Enforcement (SEC-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Enforce at createNotification function (Recommended) | Add role check inside createNotification itself | |
| Enforce at each caller (Recommended) | Keep createNotification simple. Enforce at each call site. | ✓ |
| Build POST /notifications endpoint | New endpoint with route-level middleware (separate from function calls) | |

**User's choice:** Enforce at each caller (Recommended)
**Notes:** Central function stays simple DB insert. Each calling controller checks role before invoking.

---

## Notification Cross-Role Restrictions (SEC-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Manager-only for cross-user, self for all | Managers can notify anyone. Staff can only self-notify. Customers only own notifications. | |
| Any auth for personal, manager for bulk | Any authenticated can notify anyone, only managers can broadcast | |
| Customer-role block only (Recommended) | Customer role blocked from cross-user notifications. Staff/manager have no cross-role restrictions. | ✓ |

**User's choice:** Customer-role block only (Recommended)
**Notes:** Only customers are blocked. Staff and manager roles can notify any user — no further restrictions.

---

## Blocked Notification Attempt Handling (SEC-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Log blocked attempts (Recommended) | Log with WARNING including user ID and target user ID. Silent skip, no client-facing error. | ✓ |
| Silent skip + no logging | Don't expose blocked attempts. Logs nothing to avoid fill. | |
| Debug-only 403 response | 403 in dev builds, silent skip in production. | |

**User's choice:** Log blocked attempts (Recommended)
**Notes:** Consistent with existing console.error logging pattern. WARNING level distinguishes from error-level logs.

---

## Deferred Ideas

None — discussion stayed within Phase 3 scope.