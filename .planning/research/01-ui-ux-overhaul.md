# UI/UX Overhaul Requirements: Airbnb + Impeccable Design Translation

**Project:** NailssentialsQC
**Context:** Salon Management System (Customer Booking, Nail Art Exhibit, Staff/Manager Dashboards)

## Core Philosophy

The new UI/UX will merge Airbnb's warm, photography-led consumer marketplace aesthetic with the "impeccable" design principles of technical excellence, distinctive branding, and structural integrity. The result will be a premium, highly accessible, and visually distinct salon platform.

## Translating Airbnb to the Salon Context

### 1. The Canvas and Palette
- **Base Canvas:** Pure white (`#ffffff`). No secondary brand color in mainline customer marketing.
- **Text:** Deep ink (`#222222` or an OKLCH equivalent) for headlines and body text. No pure gray or pure black.
- **Primary Brand Voltage:** A single saturated accent color (e.g., a signature NailssentialsQC tone) used sparingly for primary CTAs, the booking orb, and active states. Following Impeccable's color rules, this will be defined in OKLCH for perceptual uniformity.
- **Neutrals:** All neutrals will be tinted with a tiny chroma (0.005-0.015) leaning toward the primary brand color to ensure the UI feels alive.

### 2. Typography
- **Primary Font:** Inter (as the closest open-source fallback to Airbnb Cereal VF), or a carefully selected bespoke font based on Impeccable's brand register (rejecting overused defaults).
- **Scale:** Modest weights. Headlines lean on 500-600 weight rather than heavy 700+. We trust photography (nail art, salon interiors) over typographic muscle.
- **Rhythm:** Strict vertical rhythm leveraging a modular scale. Fluid typography (`clamp()`) for the customer-facing landing page, but strict fixed `rem` scales for the manager/staff dashboards to maintain structural predictability.

### 3. Shape and Elevation
- **Soft Geometry:** Highly rounded, friendly shapes.
  - Primary buttons: 8px radius (`rounded-sm`).
  - Service/Nail Art cards: ~14px radius (`rounded-md`).
  - Booking/Search bar: Pill-shaped (`rounded-full`).
- **Elevation:** A single shadow tier (`box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px`) used exclusively for hover-floated cards, search dropdowns, and modals. The rest of the UI is flat.

### 4. Component Translation

**Customer Context (Booking & Discovery):**
- **The Booking Bar:** A translation of Airbnb's `search-bar-pill`. A white, pill-shaped global booking bar divided by 1px hairlines (Service / Staff / Date), terminated by a circular primary-color orb.
- **Nail Art Exhibit & Services:** Translations of the `property-card`. Photo-first aspect-ratio rectangles with soft corner clipping. Includes a "swipeable" image carousel of nail art, a "Popular" badge, and a heart icon for saving favorites.
- **Staff Profiles:** Translations of the `host-card`. White card, soft rounding, avatar, name, specialty, and a primary CTA to "Book [Name]".

**Staff/Manager Context (Dashboards):**
- **Layout:** While the customer side uses generous editorial spacing (64px vertical bands), the manager side will use predictable grids, consistent densities, and Flexbox-based layouts. Space is used to create hierarchy instead of nesting cards inside cards.
- **Density:** Introducing a layout token for density so staff can see more appointments in a tighter view.
- **Interaction:** Heavy reliance on the Popover API for dropdown menus (assigning staff, changing appointment status) to avoid z-index clipping issues.

## Applying Impeccable Principles

1. **The Slop Test & Photography:** The platform cannot look like an AI-generated template. Zero imagery is a bug. We must use high-quality, physical-object photography of nails, tools, and salon spaces.
2. **Interaction Polish:** Every interactive element must have 8 designed states (Default, Hover, Focus, Active, Disabled, Loading, Error, Success). Focus rings (`:focus-visible`) are mandatory for accessibility.
3. **Destructive Actions:** Use undo toasts instead of confirmation dialogs for manager actions (like canceling an appointment) unless highly critical.
4. **Spacing System:** Avoid identical card grids everywhere. Break monotony with asymmetric compositions on the marketing site, and strict grouping in the dashboard.