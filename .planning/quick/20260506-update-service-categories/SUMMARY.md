---
task: Update Service Categories
status: complete
completed_at: 2026-05-06T12:45:00Z
---

# Summary: Update Service Categories

Updated the service categories to the requested list: Nails, Spa, Hair, Waxing & Threading, and Eyelash.

## Changes
- **Frontend**: Updated `categoryConfigs` in `Services.tsx` with new names, high-quality Unsplash images, and appropriate brand colors.
- **Backend**: Executed a synchronization script to update existing database categories to the new naming convention and deactivate unnecessary ones.

## Verification
- Verified that `Services.tsx` now uses the correct mapping for categories.
- Verified that database categories were updated/created and redundant ones were deactivated.
