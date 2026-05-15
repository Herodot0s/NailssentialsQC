---
title: Remove non-functional heart icon from Gallery
status: complete
date: 2026-05-15
---

# Summary: Remove non-functional heart icon from Gallery

Removed the heart (like) icon from the Gallery page as requested since it was not functional.

## Changes
- Modified `frontend/src/pages/Gallery.tsx`:
    - Removed `Heart` from `lucide-react` imports.
    - Removed the heart button from the image overlay.
    - Cleaned up formatting.

## Verification
- Code builds without errors (import removed).
- UI overlay now only shows the "External Link" icon.
