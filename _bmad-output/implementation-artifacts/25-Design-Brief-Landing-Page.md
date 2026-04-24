# Design Brief: Premium Landing Page Overhaul

**Target File:** `frontend/src/App.tsx` (Home Component)
**Status:** ✅ COMPLETED

## Aesthetic Direction
The landing page has been transformed from a basic layout to a high-end luxury spa aesthetic, focusing on minimalism, dramatic typography, and high-quality imagery.

## Implementation Summary

### 1. The Hero Section
- **Imagery:** Replaced the solid background with a high-resolution, moody spa interior image with a dark overlay for text legibility.
- **Typography:** Updated the main headline to use `font-serif` (Playfair Display) with a light weight and increased line-height. Added uppercase tracking for the sub-header.
- **Refined Buttons:** Implemented a sharp-cornered, high-contrast primary CTA ("Book Your Sanctuary") and a subtle underlined secondary link.

### 2. Philosophy Section (Features)
- **Iconography:** Removed all emojis and replaced them with thin-line `lucide-react` icons (`Sparkles`, `Leaf`, `ShieldCheck`).
- **Typography:** Feature titles now use a refined uppercase font with wide tracking, paired with serif descriptions for an "editorial" look.
- **Separators:** Added delicate horizontal lines to separate feature blocks elegantly.

### 3. Signature Experience Section
- **Layout:** Added a split-screen (50/50) section featuring a large lifestyle image and a "ritual" description to reinforce brand storytelling.
- **Link Styling:** Used a sophisticated underlined link for "Discover the Menu".

### 4. Global Animation
- **Interactions:** Integrated smooth fade-in and slide-up animations using Tailwind's `animate-in` utilities to create a "fluid" feel upon entry.

## Verification
The design has been verified against the brand guidelines and successfully built for production. All elements are responsive and align with the "NailssentialsQC Sanctuary" identity.
