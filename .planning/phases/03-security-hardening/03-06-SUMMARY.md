# Phase 03 Plan 06: Refresh Token Rotation Ordering Fix - Summary

## Overview

**Plan:** 03-06
**Phase:** Security Hardening
**Wave:** 1
**Commit:** `1e88cf2`
**Executed:** 2026-05-02

## Task Completed

### Task 1: Fix refresh token rotation ordering - create before delete

**File modified:** `backend/src/controllers/authController.ts`

Fixed the race condition in the `refresh` function by swapping the order of refresh token rotation. Now creates the new token BEFORE deleting the old one:

**BEFORE (incorrect - race condition gap):**
```typescript
// Delete old, store new
await prisma.refreshToken.delete({
  where: { id: storedToken.id },
});

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 30);
await prisma.refreshToken.create({
  data: {
    user_id: storedToken.user.id,
    token: newRefreshToken,
    expires_at: expiresAt,
  },
});
```

**AFTER (correct - no race condition gap):**
```typescript
// SEC-06: Create new token first, then delete old
// This ensures there is always a valid token (no race condition gap)
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 30);
await prisma.refreshToken.create({
  data: {
    user_id: storedToken.user.id,
    token: newRefreshToken,
    expires_at: expiresAt,
  },
});

await prisma.refreshToken.delete({
  where: { id: storedToken.id },
});
```

## Verification Results

| Check | Result |
|-------|--------|
| Line number ordering | PASS (`refreshToken.create` at line 315, `refreshToken.delete` at line 323) |
| Node.js char position check | PASS (create_pos < delete_pos) |
| SEC-06 comment added | PASS ("Create new token first, then delete old") |

## Deviations from Plan

None - the implementation matches the plan exactly.

## Requirements Satisfied

**SEC-06:** Refresh token rotation race condition fix
- New refresh token created BEFORE old token is deleted
- If server crashes between create and delete, user can still authenticate with old token
- No explicit transaction wrapper (ordering alone is sufficient per SEC-06 decision)
- Full rotation flow preserved: generate -> create new -> delete old

## Threat Surface

| Flag | File | Description |
|------|------|-------------|
| threat_flag: bug_fix_race_condition | backend/src/controllers/authController.ts | Fixed race condition in token rotation that could cause auth failures |

## Files Changed

| File | Change |
|------|--------|
| `backend/src/controllers/authController.ts` | Moved `refreshToken.delete` after `refreshToken.create`, added SEC-06 comment |

## Self-Check

- [x] Create operation appears before delete operation in refresh function
- [x] `expiresAt` remains with create operation
- [x] No `$transaction` wrapper added (per SEC-06 decision)
- [x] Commit `1e88cf2` verified in history
- [x] Other auth functions (login, register, logout) unchanged