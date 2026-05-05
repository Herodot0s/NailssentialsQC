# Phase 2: Customer Journey Redesign - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a premium overhaul of the customer's entry and booking experience. It includes the structural separation and visual redesign of the landing page, and the transformation of the booking process from a single-page cart into a boutique multi-step "Ritual".

</domain>

<decisions>
## Implementation Decisions

### Landing Page Architecture & Content
- **D-01:** Move `Home` component from `App.tsx` to a dedicated page at `frontend/src/pages/Home.tsx`.
- **D-02:** Transition to a **Photography-Led Hero** section with modest, high-end typography (22px-28px, weight 500) per `airbnb/DESIGN.md`.
- **D-03:** Add a **"Trending Treatments"** section on the landing page, dynamically highlighting popular services (using the `is_popular` flag from the database).

### Multi-Step Booking Flow
- **D-04:** Transition the single-page booking list into a **4-step "Ritual" flow**:
  1. **Selection**: Treatment confirmation/selection.
  2. **The Artisan**: Technician selection.
  3. **The Time**: Slot selection.
  4. **Review & Sanctuary**: Final ritual summary and confirmation.
- **D-05:** Use **Bottom Navigation** (simple "Continue" / "Back" actions) to maintain a clean, distraction-free "Sanctuary" aesthetic.
- **D-06:** Persist in-progress selections in `CartContext` to allow users to navigate between steps or leave and return without losing their progress.

### Design Token Integration
- **D-07:** Apply **Soft Radii** tokens globally across the journey: `rounded-3xl` (32px) for main cards/containers and `rounded-xl` (12px) for inputs and buttons.
- **D-08:** Use **Rausch (#FF385C)** primarily for "Voltage" (Primary CTAs) and as a **Persistent Border** for the "Active" selection or featured elements to reinforce brand identity.

### Treatment Selection UX
- **D-09:** Transition treatment details from a `Sheet` (Drawer) to a **Modal** for a more focused, premium presentation during selection.
- **D-10:** Maintain high-quality photography as the primary driver for service selection, using generous white space and clean "Ink" typography.

### Claude's Discretion
- Specific layout of the "Trending Treatments" grid.
- Precise implementation of "Vertical Lift" and "Subtle Slide" animations during step transitions.
- Selection of specific Unsplash photography for the initial redesign.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `airbnb/DESIGN.md` — Visual reference, color palette, and "Soft System" principles.
- `.planning/phases/01-premium-ui-foundations/01-CONTEXT.md` — Base design tokens and animation easing definitions.

### Frontend Components
- `frontend/src/App.tsx` — Current location of the Home component (to be moved).
- `frontend/src/pages/Booking.tsx` — Current single-page booking implementation.
- `frontend/src/pages/Services.tsx` — Service selection and treatment detail Sheet.
- `frontend/src/context/CartContext.tsx` — Cart state management for persistence.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/motion/PageTransition`: Used for existing page transitions; can be extended for sub-step transitions.
- `frontend/src/components/ui/card`: Base card component to be updated with `rounded-3xl`.

### Established Patterns
- `is_popular` flag in Service model: Use this to drive the "Trending Treatments" landing page section.
- `CartContext`: The hub for cross-step booking persistence.

### Integration Points
- `AppRoutes` in `App.tsx`: Needs update when `Home` is moved.
- `apiClient.ts`: Existing `getAvailability` and `createAppointment` methods support the data needs of the multi-step flow.

</code_context>

<specifics>
## Specific Ideas
- "Inspiration for future getaways" layout pattern from Airbnb for the treatment discovery section.
- "The Nailssentials Ritual" as the branding for the booking process.

</specifics>

<deferred>
## Deferred Ideas
- **"Enhance your Ritual" (Upselling)**: Deferred to avoid scope creep; focus on the core redesign for now.
- **Manager-led Media Management**: Part of Phase 3; Phase 2 will use high-quality Unsplash placeholders.

</deferred>

---

*Phase: 02-Customer Journey Redesign*
*Context gathered: 2026-05-05*
