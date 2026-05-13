---
slug: fix-missing-sections
title: Fix Missing Home Sections
status: in-progress
---

# Fix Missing Home Sections

The `ContactInfoSection` and `FaqAccordionSection` are not showing on the landing page when CMS data is missing. I will modify them to show fallback data or at least the section headers.

## Tasks
- [x] Modify `ContactInfoSection.tsx` to show fallback values instead of returning `null`.
- [x] Modify `FaqAccordionSection.tsx` to show the section header even if `faqs` is empty.
- [x] Verify changes on the landing page.
