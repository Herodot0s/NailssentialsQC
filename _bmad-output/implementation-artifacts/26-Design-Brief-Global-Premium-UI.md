# Design Brief: Premium UI Overhaul (Navbar & Services)

**Target Files:** `frontend/src/components/Navbar.tsx`, `frontend/src/pages/Services.tsx`
**Status:** ✅ COMPLETED

## Aesthetic Direction
The global Navigation and Services directory have been successfully transformed into an "Editorial Luxury" aesthetic, characterized by high-contrast typography, minimalist borders, and generous whitespace.

## Implementation Summary

### 1. Global Navbar (`Navbar.tsx`)
- **Layout:** Removed heavy bottom borders and implemented a `backdrop-blur-md` background for a clean, floating feel.
- **Branding:** The `NailssentialsQC` logo is now set to the brand's Terracotta color (`text-primary`) by default, using Playfair Display.
- **Navigation:** Links have been refined to a sophisticated `text-[10px]` uppercase sans-serif with wide tracking (`tracking-[0.2em]`).
- **CTAs:** Simplified the "Sign Up" button to a minimalist outlined variant with sharp corners.
- **Dropdowns:** Menus are now shadow-heavy, borderless, and use sharp corners to match the premium editorial theme.

### 2. Services Page (`Services.tsx`)
- **Header:** Created a massive, thin-light serif title over a soft `primary-ultra` wash for a "printed menu" effect.
- **Filter Navigation:** Redesigned `TabsList` as a transparent, underlined list. Replaced boxed buttons with elegant, minimal text triggers.
- **Catalog Layout:** Switched from a strict grid to a clean list-style layout. Each service is separated by a delicate `primary/10` border.
- **Service Details:** 
    - Added delicate, oversized initial circles for each service.
    - Used Playfair Display for service titles and wide-tracked Inter for duration labels.
- **Booking CTA:** Replaced heavy buttons with minimalist text links and animated "ArrowRight" icons for a more intentional user flow.

## Verification
Verified with a production build. The UI is consistent, responsive, and aligns with the premium branding of the NailssentialsQC sanctuary.
