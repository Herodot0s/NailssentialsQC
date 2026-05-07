# Plan: Colorize Manage Services

Add strategic color to the `ManageServices.tsx` page to improve wayfinding and brand alignment, following the "Artisan's Alcove" design system.

## Proposed Changes

### 1. Dynamic Category Coloring
- Implement a `getCategoryColor` helper using OKLCH to generate harmonious tints for each category.
- Apply these colors to:
    - Category chips in the toolbar.
    - Category badges in the service list.
    - Subtle background tints for service rows on hover.

### 2. Semantic Enrichment
- Refine `Active` and `Disabled` status indicators with Kiln-palette semantic colors (`Forest Confirm`, `Brick Error`).
- Add a soft glow effect to active status indicators.

### 3. Brand Accentuation
- Update the "New Service" button with a premium, subtle terracotta gradient.
- Enhance the "Popular" badge with a richer, more saturated `Kiln Terracotta` treatment.
- Ensure all neutrals are tinted towards HSL hue 25 (warm amber).

### 4. Polish & Accessibility
- Verify all color combinations meet WCAG AA contrast requirements.
- Use OKLCH for all new color definitions to ensure perceptual uniformity.

## Task List
- [x] Implement `getCategoryColor` helper and category logic
- [x] Apply category-specific colors to UI elements
- [x] Refine semantic status indicators and brand accents
- [x] Verify accessibility and final polish
