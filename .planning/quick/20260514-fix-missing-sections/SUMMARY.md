---
slug: fix-missing-sections
status: complete
---

# Summary: Fix Missing Home Sections

Fixed the issue where `ContactInfoSection` and `FaqAccordionSection` were hidden when CMS data was unavailable.

## Changes
- Removed early return in `ContactInfoSection.tsx` that hid the section if all props were empty. It now uses built-in fallback values.
- Updated `FaqAccordionSection.tsx` to remove the early return for empty FAQ lists. It now displays the section header and a "Coming Soon" fallback message if no FAQs are present.
- Fixed TS6133 unused variable errors for `facebookLink` and `instagramLink` in `ContactInfoSection.tsx` by using them in the JSX with fallbacks.
- Ensured both sections now render on the landing page even if the backend CMS returns empty or null data.
