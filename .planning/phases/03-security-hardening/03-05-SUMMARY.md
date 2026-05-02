# Phase 03 Plan 05: Profile Picture URL Allowlist Validation - Summary

## Overview

**Plan:** 03-05
**Phase:** Security Hardening
**Wave:** 1
**Commit:** `68a729e`
**Executed:** 2026-05-02

## Task Completed

### Task 1: Add URL allowlist validation for profile picture uploads

**File modified:** `backend/src/controllers/uploadController.ts`

Added SEC-05 URL validation after blob upload completes, before returning the URL:

```typescript
// SEC-05: Validate the returned URL against allowlist
const allowedPattern = /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*$/;
if (!allowedPattern.test(blob.url)) {
  // Reject the upload if URL is not on allowlist
  await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  return res.status(400).json({
    success: false,
    message: 'Invalid profile picture URL. Only Vercel Blob URLs are allowed.',
  });
}
```

## Verification Results

| Check | Result |
|-------|--------|
| Allowlist regex pattern in file | PASS (`^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*$/`) |
| `allowedPattern.test(blob.url)` check present | PASS (line 34) |
| Rejection message present | PASS ("Invalid profile picture URL...") |
| Blob cleanup on rejection (`del(blob.url, ...)`) | PASS (line 36) |

## Deviations from Plan

None - the implementation matches the plan exactly.

## Requirements Satisfied

**SEC-05:** Profile picture URL validation
- Blob URL validated against allowlist pattern `https://*.public.blob.vercel-storage.com/*` at upload time
- Non-allowlisted URLs rejected with HTTP 400
- Uploaded blob is deleted (cleaned up) when URL is rejected
- Validation happens at upload time, not just display time

## Threat Surface

| Flag | File | Description |
|------|------|-------------|
| threat_flag: new_defense_layer | backend/src/controllers/uploadController.ts | URL allowlist validation prevents stored XSS via malicious profile picture URLs |

## Files Changed

| File | Change |
|------|--------|
| `backend/src/controllers/uploadController.ts` | Added 11 lines: validation block with allowlist regex, rejection handling, blob cleanup |

## Self-Check

- [x] Allowlist regex matches Vercel Blob public URLs
- [x] Invalid URLs rejected with 400 status
- [x] Blob deleted on rejection (no orphan uploads)
- [x] Commit `68a729e` verified in history
- [x] Other endpoints (deleteFile) unchanged