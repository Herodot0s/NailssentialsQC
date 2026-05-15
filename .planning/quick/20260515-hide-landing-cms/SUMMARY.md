---
status: complete
---

# Quick Task Summary: Hide Landing Page CMS

Successfully hid the "Landing Page" editor from the Website CMS view in the Manager Dashboard to focus on system defense and stability.

## Changes

### Frontend

#### `ContentView.tsx`
- Removed the "Landing Page" tab from the CMS navigation.
- Set "FAQ" as the default tab for the Website CMS view.
- Removed the unused `LandingPageEditor` component and its import to maintain code cleanliness.

## Verification
- Navigating to "Website CMS" now defaults to the FAQ editor.
- The Landing Page tab is no longer visible to managers.
