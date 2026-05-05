# Phase 1: Premium UI Foundations - Research

**Researched:** 2026-05-05
**Domain:** Global Design System & Interaction Model
**Confidence:** HIGH

## Summary

This phase establishes the foundational design tokens and motion primitives required for the "Airbnb-inspired" premium overhaul of the NailssentialsQC system. The current implementation uses a "Terracotta Brown" palette with sharp corners (`rounded-none`) and basic CSS transitions. 

The research confirms that transitioning to the "Premium" look requires a shift to the **Radical Red (Rausch)** palette, a "Soft" radius system (`12px` for buttons, `24-32px` for containers), and the introduction of `framer-motion` for orchestrated page transitions.

**Primary recommendation:** Centralize all "Premium" tokens in `index.css` and `tailwind.config.js`, then perform a global audit of `frontend/src/` to remove hardcoded `rounded-none` classes that currently override the design system.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Token Mechanism:** Use CSS Variables in `index.css` mapped to the Tailwind theme.
- **Palette:** 
  - `--brand-rausch`: `#FF385C` (Core brand color).
  - `--brand-rausch-muted`: `#FFF1F2` (Used for large background areas and subtle borders).
  - `--bg-canvas`: `#FFFFFF` (Pure white canvas).
- **Animation Curve:** `[0.32, 0.72, 0, 1]` (Premium Ease-Out).
- **Animation Duration:** `400ms` for page transitions; `250ms` for micro-interactions.
- **Page Transitions:** Subtle Slides (Vertical lift + Fade-in).
- **Radii:** 
  - Container/Card: `24px` to `32px` (`rounded-3xl`).
  - Utility/Button: `12px` (`rounded-xl`).
  - Data Tables: `8px` (`rounded-lg`).
- **Shadows:** Diffuse and subtle (`0 8px 28px rgba(0,0,0,0.08)`).
- **Icons:** Use Lucide-React.

### the agent's Discretion
- Mapping specific shadcn component variants to the new tokens.
- Organizing the `framer-motion` provider and transition wrappers.
- Defining the "Featured" border pattern for elements like the Booking Card.

### Deferred Ideas (OUT OF SCOPE)
- **Dark Mode:** Postponed to V2+.
- **Custom Iconography:** Postponed; use Lucide-React for now.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Implement Design Tokens (Airbnb radii, spacing, Terracotta palette) | Verified current palette is legacy; mapped new Rausch tokens and radius system to Tailwind config. |
| UI-04 | Add smooth transitions using framer-motion | Verified `framer-motion` is missing; defined installation and setup strategy for orchestrated page transitions. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design Tokens | Browser / CSS | — | Defined via CSS variables for runtime flexibility and theme consistency. |
| Theme Configuration | Frontend Build | — | Tailwind configuration maps tokens to utility classes. |
| Animation Primitives | Browser / JS | — | `framer-motion` handles orchestration and hardware-accelerated transitions. |
| Layout Transitions | Frontend Router | Browser / JS | React Router 7 + Framer Motion `AnimatePresence` manages entry/exit states. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4.19 [VERIFIED] | Utility-first CSS | Project standard; handles token distribution. |
| Framer Motion | ^11.0.0 [RECOMMENDED] | Animation library | Standard for complex React animations; handles `AnimatePresence`. |
| Lucide React | 1.8.0 [VERIFIED] | Iconography | Already integrated and used in current layouts. |
| shadcn/ui | 4.4.0 [VERIFIED] | Component primitives | Already used for buttons, cards, and dialogs. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | 0.7.1 [VERIFIED] | Variant management | Defining "Premium" vs "Utility" component styles. |
| tailwind-merge | 3.5.0 [VERIFIED] | Class merging | Ensuring `cn` utility works with new custom radii. |

**Installation:**
```bash
# Add framer-motion (missing from current package.json)
npm install framer-motion --prefix frontend
```

## Technical Audit

### Current State
- **Radii:** Hardcoded `rounded-none` is prevalent in `button.tsx`, `card.tsx`, and page-level layouts (e.g., `Home.tsx`, `Booking.tsx`).
- **Colors:** Primary color is currently Terracotta Brown (`#B8794E`).
- **Animations:** Uses `tailwind-animate` (CSS-based) for basic entry. No global page transition orchestrator.
- **Glassmorphism:** `Navbar.tsx` has `backdrop-blur-md` but lacks the supporting "Premium" borders and translucent backgrounds defined in the new vision.

### Mapping Tokens to Tailwind
| Token | CSS Variable | Tailwind Class | Value |
|-------|--------------|----------------|-------|
| Brand Rausch | `--brand-rausch` | `bg-primary` | `#FF385C` |
| Rausch Muted | `--brand-rausch-muted`| `bg-primary-muted` | `#FFF1F2` |
| Radius Container| `--radius-container` | `rounded-3xl` | `24px` to `32px` |
| Radius Utility | `--radius-utility` | `rounded-xl` | `12px` |
| Radius Data | `--radius-data` | `rounded-lg` | `8px` |

## Animation Primitives

### Framer Motion Defaults
**Primary Curve:** `[0.32, 0.72, 0, 1]`
**Transitions:**
- **Page:** `opacity: 0, y: 20` -> `opacity: 1, y: 0` (400ms)
- **Micro:** `scale: 0.98` (hover/active, 250ms)

### Project Structure Recommendation
```
frontend/src/
├── components/
│   ├── motion/
│   │   ├── PageTransition.tsx    # Wrapper for Routes
│   │   └── AnimatedCard.tsx      # Motion-enhanced cards
├── lib/
│   └── motion.ts                 # Shared easing and duration constants
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page Orchestration | Custom `useEffect` | `AnimatePresence` | Handles exit animations before the component unmounts from the DOM. |
| Complex Easings | `transition: all ...` | `framer-motion` transition prop | Precise control over cubic-bezier and spring physics. |
| Layout Shifts | Manual calc | `layout` prop (Framer) | Automatically animates between CSS layouts (e.g., flex to grid). |

## Common Pitfalls

### Pitfall 1: Hardcoded Overrides
**What goes wrong:** New tokens are ignored because components have `rounded-none` or `!important` classes.
**Prevention:** Perform a grep for `rounded-none` and `bg-primary` (hardcoded) and replace with semantic variants.

### Pitfall 2: Exit Animation Clipping
**What goes wrong:** Page exit animations are cut off because the parent container unmounts or lacks `AnimatePresence`.
**Prevention:** Wrap `Routes` in `App.tsx` with `AnimatePresence` and a unique `location.key`.

## Code Examples

### Verified Pattern: Page Transition Wrapper
```typescript
// Source: Standard Framer Motion + React Router pattern
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
};

export const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);
```

### Verified Pattern: "Featured" Border Token
```css
/* index.css */
.featured-border {
  border: 1.5px solid var(--brand-rausch);
  box-shadow: 0 0 0 4px var(--brand-rausch-muted);
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| npm | Installation | ✓ | 10.8.2 | — |
| tailwindcss | UI Styling | ✓ | 3.4.19 | — |
| framer-motion | Animations | ✗ | — | Install in Wave 1 |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (Recommended) |
| Quick run command | `npm run test` |

### Wave 0 Gaps
- [ ] `frontend/src/lib/motion.ts` — needs to be created to hold shared constants.
- [ ] `frontend/src/components/motion/` — needs to be created for animation wrappers.

## Security Domain

### Known Threat Patterns for Premium UI
- **Insecure URL injection in theme vars:** If theme colors are ever dynamic/user-controlled, they must be sanitized to prevent CSS injection. (N/A for Phase 1 as tokens are static).

## Sources

### Primary (HIGH confidence)
- `frontend/package.json` - Checked for existing libraries.
- `frontend/src/index.css` - Verified current color and radius tokens.
- `airbnb/DESIGN.md` - Verified brand principles.

### Secondary (MEDIUM confidence)
- Official Framer Motion docs - Verified `AnimatePresence` implementation.

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH - Libraries are standard and versions are verified.
- Architecture: HIGH - Mapping tokens to CSS vars is a robust pattern.
- Pitfalls: MEDIUM - Based on common React transition issues.

**Research date:** 2026-05-05
**Valid until:** 2026-06-05
