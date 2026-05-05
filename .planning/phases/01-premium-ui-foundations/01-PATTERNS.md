# Phase 1: Premium UI Foundations - Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 9
**Analogs found:** 6 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `frontend/tailwind.config.js` | config | N/A | Existing `frontend/tailwind.config.js` | exact |
| `frontend/src/index.css` | config | N/A | Existing `frontend/src/index.css` | exact |
| `frontend/src/components/ui/button.tsx` | component | N/A | Existing `frontend/src/components/ui/button.tsx` | exact |
| `frontend/src/components/ui/card.tsx` | component | N/A | Existing `frontend/src/components/ui/card.tsx` | exact |
| `frontend/src/App.tsx` | component | N/A | Existing `frontend/src/App.tsx` | exact |
| `frontend/src/lib/motion.ts` | utility | N/A | `frontend/src/lib/utils.ts` | role-match |
| `frontend/src/components/motion/PageTransition.tsx` | component | N/A | `frontend/src/App.tsx` (Route wrapper) | role-match |
| `frontend/src/components/motion/AnimatedCard.tsx` | component | N/A | `frontend/src/components/ui/card.tsx` | role-match |
| `frontend/package.json` | config | N/A | Existing `frontend/package.json` | exact |

## Pattern Assignments

### `frontend/tailwind.config.js` (config)

**Analog:** `frontend/tailwind.config.js`

**Theme Extension pattern** (lines 6-15):
```javascript
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#B8794E',
          // ...
```

**Border Radius pattern** (lines 41-45):
```javascript
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
```

---

### `frontend/src/index.css` (config)

**Analog:** `frontend/src/index.css`

**CSS Variable pattern** (lines 11-20):
```css
:root {
  /* Brand Colors - Terracotta Brown Palette */
  --primary: 24 45% 51%; /* #B8794E translated to HSL */
  --primary-foreground: 0 0% 100%;

  --primary-color: #b8794e; /* Terracotta Brown */
```

**Custom Shadow pattern** (lines 103-105):
```css
/* Custom shadow for cards */
.shadow-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
```

---

### `frontend/src/components/ui/button.tsx` (component)

**Analog:** `frontend/src/components/ui/button.tsx`

**CVA Pattern** (lines 6-10):
```typescript
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    // ...
```

---

### `frontend/src/App.tsx` (component)

**Analog:** `frontend/src/App.tsx`

**Router/Routes pattern** (lines 185-195):
```typescript
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* ... */}
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
```

---

## Shared Patterns

### Utility: Class Merging
**Source:** `frontend/src/lib/utils.ts`
**Apply to:** All new components
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Component: Shadcn Structure
**Source:** `frontend/src/components/ui/card.tsx`
**Apply to:** `AnimatedCard.tsx`
```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('...', className)}
      {...props}
    />
  );
}
```

### Animation: Page Transitions (from RESEARCH.md)
**Source:** `RESEARCH.md` verified pattern
**Apply to:** `PageTransition.tsx`
```typescript
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
};
```

## No Analog Found

Files with no close match in the codebase:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `frontend/src/lib/motion.ts` | utility | N/A | First file dedicated to shared animation constants. |
| `frontend/src/components/motion/PageTransition.tsx` | component | N/A | No existing `framer-motion` implementations. |

## Metadata

**Analog search scope:** `frontend/src/`, `frontend/tailwind.config.js`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-05
