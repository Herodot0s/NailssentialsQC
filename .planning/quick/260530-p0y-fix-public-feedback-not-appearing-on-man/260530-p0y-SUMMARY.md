---
quick_id: 260530-p0y
status: complete
description: Fix public feedback not appearing on Manager Dashboard Client Care page
---

# Summary: Fix Public Feedback Not Appearing

## What Changed

### 1. Fixed `tags: null` crash in ReviewModeration.tsx
- **File:** `frontend/src/components/dashboard/customers/ReviewModeration.tsx:82`
- **Bug:** `(review.tags as string[]).map(...)` crashed when `tags` was `null` (Prisma schema allows `Json?`). This killed the entire component, showing a blank page.
- **Fix:** Guarded with `Array.isArray(review.tags) ? review.tags : []` — null tags now render as empty (no badges), component stays alive.

### 2. Switched Promise.all to Promise.allSettled in ManagerDashboard.tsx
- **File:** `frontend/src/pages/ManagerDashboard.tsx:189-212`
- **Bug:** 6 parallel API calls wrapped in `Promise.all` — if any single call failed (network, auth, 500), the entire catch block fired and `setReviews()` was never called. Reviews stayed as empty `[]`.
- **Fix:** Replaced `Promise.all` with `Promise.allSettled`. Each call's result is checked independently. Reviews now populate even if another API call (e.g., getDailySales) fails.

## Root Cause
Reviews existed in the Neon DB but the `tags: null` value on one or more reviews crashed the ReviewModeration component during render, preventing any feedback from displaying. The Promise.all cascade was a secondary failure mode that could also suppress reviews silently.

## Files Modified
- `frontend/src/components/dashboard/customers/ReviewModeration.tsx`
- `frontend/src/pages/ManagerDashboard.tsx`
