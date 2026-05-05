# Phase 02: Customer Journey Redesign - Research

**Researched:** 2026-05-05
**Domain:** Frontend UI/UX Redesign, Multi-step State Management
**Confidence:** HIGH

## Summary

This phase focuses on transitioning the NailssentialsQC digital experience from a functional tool to a premium "Sanctuary". The primary technical challenges involve refactoring the `App.tsx` entry point to move the landing page into its own domain, and re-engineering the booking flow from a flat form into a high-stakes, 4-step "Ritual".

The redesign leverages the "Soft System" principles from the Airbnb design language, emphasizing generous white space, soft radii (`rounded-3xl`), and a photography-first hierarchy.

**Primary recommendation:** Use a single-page state machine for the 4-step Booking Flow within `Booking.tsx`, backed by the existing `CartContext` for persistence, to ensure a seamless "Sanctuary" transition without full page reloads.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Landing Page | Browser / Client | — | Presentational components and client-side routing. |
| Multi-step Booking | Browser / Client | API / Backend | State managed in `CartContext`; final ritual submission to API. |
| Cart Persistence | Browser / Client | — | Managed via `localStorage` within `CartContext`. |
| Design Tokens | Browser / Client | — | Tailwind CSS configuration and global CSS variables. |
| Treatment Selection | Browser / Client | — | UI logic for Modals and Tabs (previously Sheets). |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | UI Framework | Project standard [VERIFIED: package.json] |
| Tailwind CSS | 3.4.1 | Styling | utility-first CSS for rapid design token application [VERIFIED: package.json] |
| Framer Motion | 11.0.8 | Animations | Industry standard for "Subtle Slide" and "Vertical Lift" [VERIFIED: package.json] |
| Lucide React | 0.344.0 | Icons | Clean, consistent iconography [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | — | UI Components | Base for Card, Dialog (Modal), Button, Tabs [VERIFIED: components/ui] |
| Radix UI | — | Primitive UI | Accessible base for Modals and Dialogs [VERIFIED: node_modules] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single Page State | Step-based Routing | Routing allows deep links but adds complexity to shared state/validation between steps. |
| Native Scroll | Smooth Scroll (Lenis) | Lenis adds premium feel but increases bundle size and potential for scroll-jack friction. |

**Installation:**
```bash
# No new packages required; existing stack supports requirements.
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── pages/
│   ├── Home.tsx            # NEW: Moved from App.tsx
│   ├── Booking.tsx         # UPDATED: Multi-step flow logic
│   └── ...
├── components/
│   ├── booking/            # NEW: Step-specific components
│   │   ├── SelectionStep.tsx
│   │   ├── ArtisanStep.tsx
│   │   ├── TimeStep.tsx
│   │   └── ReviewStep.tsx
│   ├── ui/
│   │   └── modal.tsx       # NEW: Wrapper for shadcn Dialog
│   └── ...
└── context/
    └── CartContext.tsx     # Persistence hub
```

### Pattern 1: Step State Machine
Maintain a `step` index in `Booking.tsx`. Use an array of step components that receive `CartContext` data.
**Example:**
```typescript
// Source: Standard React Step Pattern
const steps = [
  { id: 'selection', component: SelectionStep },
  { id: 'artisan', component: ArtisanStep },
  { id: 'time', component: TimeStep },
  { id: 'review', component: ReviewStep },
];

const [currentStep, setCurrentStep] = useState(0);
const StepComponent = steps[currentStep].component;

return (
  <AnimatePresence mode="wait">
    <motion.div key={steps[currentStep].id} ...>
      <StepComponent />
    </motion.div>
  </AnimatePresence>
);
```

### Anti-Patterns to Avoid
- **Prop Drilling:** Avoid passing cart data through multiple layers; always consume from `CartContext`.
- **Hard-coded Colors:** Use Tailwind config colors (e.g., `primary` for Rausch) instead of hex codes in components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal Logic | Custom absolute div | shadcn/ui Dialog | Handles focus trapping, aria-roles, and outside click. |
| Page Transitions | Custom CSS transitions | Framer Motion | Provides `AnimatePresence` for unmounting transitions. |
| Form Validation | Manual if/else | Zod / Hook Form | (Optional) Scalability for complex ritual data. |

## Common Pitfalls

### Pitfall 1: Cart Inconsistency
**What goes wrong:** User selects an Artisan in Step 2, goes back to Step 1, changes the service, but the Artisan selection remains (might be incompatible).
**How to avoid:** Clear dependent fields (Artisan, Time) in `CartContext` if the base `serviceId` is changed or removed.

### Pitfall 2: Mobile Viewport Height
**What goes wrong:** "Bottom navigation" gets cut off by mobile browser chrome.
**How to avoid:** Use `svh` or `dvh` units for the container height, or ensure the nav is fixed with adequate padding.

## Code Examples

### Modals vs Sheets (Radix Dialog)
```typescript
// Source: https://ui.shadcn.com/docs/components/dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function TreatmentModal({ service, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">{service.name}</DialogTitle>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat Forms | Progressive Disclosure | 2023+ | Reduces cognitive load; feels "Ritualistic". |
| Sheet/Drawers | Focused Modals | Design Trend | Sheets feel "utility"; Modals feel "premium/intentional". |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `is_popular` is enough to drive Trending section | Summary | Might need a manual sort order in Phase 3. |
| A2 | Users prefer single-page steps over deep links | Architecture | Loss of shareable step URLs. |

## Open Questions (RESOLVED)

1. **Artisan Availability:** Do we need to show Artisan photos in the selection step?
   - [RESOLVED] Use high-quality Unsplash placeholders for Artisans in Phase 2 to maintain the premium aesthetic.

## Environment Availability (VERIFIED)

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Development | ✓ | 20.x | — |
| Tailwind CSS | Styling | ✓ | 3.4.1 | — |
| Framer Motion | Animations | ✓ | 11.0.8 | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `frontend/vite.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOME-01 | Home moved to page | unit | `npm test Home.test.tsx` | ❌ Wave 0 |
| BOOK-04 | 4-step flow progress | integration | `npm test BookingFlow.test.tsx` | ❌ Wave 0 |
| STYLE-07| rounded-3xl applied | snapshot | `npm test Theme.test.tsx` | ❌ Wave 0 |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Validate `notes` and `startTime` format before API POST. |
| V12 Session Mgmt | yes | Ensure `CartContext` doesn't leak between users on shared machines (clear on logout). |

### Known Threat Patterns for React

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via Notes | Tampering | React auto-escapes, but ensure `notes` aren't used in `dangerouslySetInnerHTML`. |

## Sources

### Primary (HIGH confidence)
- `airbnb/DESIGN.md` - Design tokens and philosophy.
- `frontend/src/App.tsx` - Current implementation context.
- `schema.prisma` - Database schema verification for `is_popular`.

### Secondary (MEDIUM confidence)
- `frontend/src/context/CartContext.tsx` - Verified persistence mechanism.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing project stack confirmed.
- Architecture: HIGH - Step pattern is industry standard.
- Pitfalls: MEDIUM - State edge cases identified but need testing.

**Research date:** 2026-05-05
**Valid until:** 2026-06-05
