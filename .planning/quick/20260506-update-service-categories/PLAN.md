---
task: Update Service Categories
status: in-progress
created_at: 2026-05-06T12:43:00Z
---

# Plan: Update Service Categories

Update the `categoryConfigs` in `frontend/src/pages/Services.tsx` to match the user's requested list and remove unnecessary ones.

## Proposed Changes

### 1. `frontend/src/pages/Services.tsx`
- Update `categoryConfigs` mapping:
  - `Nail Care` -> `Nails`
  - `Spa Treatments` -> `Spa`
  - `Waxing` -> `Waxing & Threading`
  - Add `Hair`
  - Add `Eyelash`
- Ensure Unsplash images and brand colors are assigned to each.
- Ensure the `getCategoryConfig` helper and other logic still work with the new names.

## Categories & Assets
- **Nails**: `#B8794E` | Image: https://images.unsplash.com/photo-1632345033839-23190224213d
- **Spa**: `#435334` | Image: https://images.unsplash.com/photo-1544161515-4af6b1d462c2
- **Hair**: `#5D7285` | Image: https://images.unsplash.com/photo-1560869713-7d0a29430863
- **Waxing & Threading**: `#C08261` | Image: https://images.unsplash.com/photo-1570172619644-dfd03ed5d881
- **Eyelash**: `#A94438` | Image: https://images.unsplash.com/photo-1583001931096-959e9a1a6223

## Verification
- Verify that category triggers in the sidebar/top-bar show the correct names.
- Verify that filtering still works.
