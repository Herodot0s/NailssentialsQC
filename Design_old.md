---
name: NailssentialsQC
description: Premium nail salon management and booking system in Quezon City
colors:
  kiln-terracotta: "#B8794E"
  kiln-terracotta-hover: "#9A6440"
  bisque-wash: "#F5E6D9"
  linen-mist: "#FDF8F4"
  warm-canvas: "#FAFAF9"
  charcoal-bark: "#2D2723"
  warm-stone: "#5C544F"
  clay-dust: "#8E8680"
  kiln-border: "#E7E2DF"
  forest-confirm: "#435334"
  brick-error: "#A94438"
  slate-info: "#5D7285"
  muted-terracotta-warning: "#C08261"
typography:
  display:
    fontFamily: "Playfair Display, ui-serif, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Playfair Display, ui-serif, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Playfair Display, ui-serif, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  container: "32px"
  utility: "12px"
  data: "8px"
  data-sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.kiln-terracotta}"
    textColor: "#FFFFFF"
    rounded: "{rounded.utility}"
    padding: "0 32px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "hsl(25 44% 51% / 0.8)"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-bark}"
    rounded: "{rounded.utility}"
    padding: "0 24px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-bark}"
    rounded: "{rounded.utility}"
    padding: "0 24px"
    height: "40px"
  button-destructive:
    backgroundColor: "hsl(0 60% 50% / 0.1)"
    textColor: "{colors.brick-error}"
    rounded: "{rounded.utility}"
    padding: "0 24px"
  card-default:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.container}"
    padding: "32px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-bark}"
    height: "40px"
  tab-active:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.kiln-terracotta}"
---

# Design System: NailssentialsQC

## 1. Overview

**Creative North Star: "The Artisan's Alcove"**

NailssentialsQC is a private retreat where every visual detail feels handmade. The system conveys warmth without saccharine, luxury without ostentation, and craft without pretension. Surfaces are warm off-white with terracotta accents that feel like fired clay, not digital gradient. The density is generous; spacing breathes. The overall impression is of walking into a well-lit studio where someone who cares deeply about their work has arranged everything with quiet intention.

The system explicitly rejects: clinical SaaS aesthetics, generic AI-generated spa templates, glassmorphism as decoration, identical card grids with icon-title-text patterns, and gradient text effects. If someone could look at a screen and say "AI made that," the implementation has failed.

Motion is responsive, not choreographed. Elements acknowledge interaction (hover lifts, focus rings, tap feedback) but don't perform. The one exception is the marketing landing page hero, which earns its entrance animation because first impressions are the product.

**Key Characteristics:**
- Warm terracotta-tinted palette with restrained accent usage in product surfaces, committed usage on brand surfaces
- Serif display + sans body pairing (Playfair Display + Inter)
- Flat-by-default elevation with terracotta-tinted shadows on state change
- Scale-based micro-interactions via Framer Motion (1.02× hover, 0.98× tap)
- Premium easing curve: `cubic-bezier(0.32, 0.72, 0, 1)` for all motion

## 2. Colors: The Kiln Palette

A terracotta-anchored palette tinted warm throughout. No pure black, no pure white. Every neutral leans toward hue 25 (warm amber-brown).

### Primary
- **Kiln Terracotta** (`#B8794E`, HSL 25 44% 51%): The brand identity color. Used on primary buttons, active states, accent icons, and the hero CTA. On brand surfaces (landing page), it carries 30-60% of the section in backgrounds and CTAs. On product surfaces (dashboards, forms), it stays below 10%.
- **Kiln Terracotta Hover** (`#9A6440`): Active/pressed state for primary buttons. Darker and warmer.
- **Bisque Wash** (`#F5E6D9`): Light tinted backgrounds for selected tabs, active filter pills, and subtle section differentiation. The "warm glow" behind featured elements.
- **Linen Mist** (`#FDF8F4`): The lightest brand tint. Card accents, signature section backgrounds, barely-visible hover surfaces.

### Neutral
- **Warm Canvas** (`#FAFAF9`, HSL 20 10% 98%): Page background. Not white, not gray; a warm off-white with enough hue to feel intentional.
- **Charcoal Bark** (`#2D2723`, HSL 25 20% 12%): Primary text and headings. Deep enough for contrast, warm enough to avoid coldness.
- **Warm Stone** (`#5C544F`, HSL 25 10% 45%): Secondary text, muted-foreground. Labels, subtitles, body copy that doesn't need to shout.
- **Clay Dust** (`#8E8680`): Disabled text, placeholder text. Never used for information a user needs to read.
- **Kiln Border** (`#E7E2DF`, HSL 25 15% 90%): Dividers, input borders, table lines. Warm enough to not feel stark.

### Semantic
- **Forest Confirm** (`#435334`): Success states. Deep muted green, not the generic `#4CAF50`. Always paired with a checkmark icon.
- **Brick Error** (`#A94438`): Error and destructive states. Deep brick red, earthy rather than alarming.
- **Slate Info** (`#5D7285`): Links, help text, informational badges. A cool counterpoint to the warm palette.
- **Muted Terracotta Warning** (`#C08261`): Pending/attention states. Stays in the terracotta family rather than introducing orange.

### Named Rules
**The Tinted Neutral Rule.** Every neutral surface uses HSL hue 25 (warm amber). Pure `#000000` and `#FFFFFF` are prohibited. Even "white" cards are `hsl(0 0% 100%)` which is the one exception; all backgrounds, foregrounds, and borders carry warmth.

**The Committed Brand Rule.** On brand surfaces (the landing page, marketing sections), terracotta carries 30-60% of the surface area in at least one section. On product surfaces (dashboards, forms, dialogs), terracotta stays below 10% as an accent. Never collapse the brand register to restrained.

## 3. Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)
**Label Font:** Inter (uppercase, tracked)

**Character:** Playfair Display brings editorial gravity to headings without being ornate. Its contrast strokes pair cleanly with Inter's geometric neutrality. The combination is warm-editorial, not magazine-precious; headings rarely go below `font-weight: 300` to keep the display cuts elegant.

### Hierarchy
- **Display** (300, `clamp(2rem, 5vw, 4.5rem)`, line-height 1.1): Hero headlines and full-bleed section titles. Reserved for the landing page and signature moments. Font-light only.
- **Headline** (400, `clamp(1.5rem, 3vw, 2.25rem)`, line-height 1.25): Section headings across all surfaces. The primary structural marker.
- **Title** (500, `1.25rem`, line-height 1.3): Card titles, dialog headers, list item names. The workhorse heading level.
- **Body** (400, `1rem`, line-height 1.6, max 65-75ch): All running text. Inter at 16px base prevents iOS auto-zoom. Line length capped for readability.
- **Label** (600, `0.75rem`, letter-spacing 0.2em, uppercase): Eyebrow text, category labels, metadata. Always uppercase with wide tracking. Minimum rendered size is 11px.

### Named Rules
**The Minimum Legibility Rule.** No rendered text below 11px. The `text-[10px]` utility is prohibited. Label-size text uses `text-[11px]` or `text-xs` (12px) minimum.

**The Italic Restraint Rule.** Italic spans wrapping single words for decoration are prohibited. Italic is for emphasis within running text or for the Display headline's signature treatment (one word per hero, maximum).

## 4. Elevation

Surfaces are flat by default. The system uses tonal layering (warmer/cooler tints of hue 25) to establish hierarchy, not shadow depth. Shadows appear as responses to state, not as resting decoration.

### Shadow Vocabulary
- **Premium** (`0 16px 32px rgba(184, 121, 78, 0.12)`): Featured cards, hero CTAs, elevated dialogs. The terracotta tint makes shadows feel warm rather than gray. Used via `shadow-premium` utility.
- **Card** (`0 8px 32px rgba(184, 121, 78, 0.08)`): Subtle resting shadow for interactive cards. Used via `shadow-card` utility.
- **Focus Ring** (`0 0 0 2px #F5E6D9, 0 0 0 4px #B8794E`): Double-ring focus indicator. Inner ring is Bisque Wash, outer is Kiln Terracotta. Applied via `focus-visible:ring` utilities.
- **Featured Border** (`border: 1.5px solid #B8794E` + `box-shadow: 0 0 0 4px #F5E6D9`): Selected/featured state for cards and packages. A warm glow ring via `.featured-border` utility.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, focus, elevation change). A card sitting untouched has no visible shadow; hovering adds `shadow-premium`. The exception is persistent premium cards (featured items, hero CTAs) that communicate permanence.

## 5. Components

### Buttons
Tactile and responsive. Every button uses Framer Motion for scale-based micro-interactions.

- **Shape:** Generous rounding (12px / `rounded-xl`), uppercase text, wide letter-spacing (0.05em+), font-weight 600
- **Primary:** Kiln Terracotta background, white text, 44px minimum height (touch-safe), 32px horizontal padding. Hover: 80% opacity. Motion: `whileHover: scale(1.02)`, `whileTap: scale(0.98)`, easing `[0.32, 0.72, 0, 1]` over 200ms
- **Outline:** Transparent background, Kiln Border stroke, foreground text. Hover: muted background fill
- **Ghost:** No background, no border. Hover: muted background. Used in toolbars, secondary actions
- **Destructive:** 10% opacity brick-error background, brick-error text. Soft and reversible-feeling, not alarming
- **Link:** Underlined text in primary color. For inline text actions only

### Cards / Containers
- **Corner Style:** Large rounded corners (32px / `rounded-3xl`). The signature shape of the system. Organic and spa-like.
- **Background:** Pure white (`hsl(0 0% 100%)`) on warm canvas. The contrast between warm background and white card creates depth without shadow.
- **Shadow Strategy:** Flat at rest. `shadow-premium` on hover via AnimatedCard wrapper. Motion: `whileHover: scale(1.02)` with staggered entrance animations.
- **Border:** None by default. `featured-border` class for selected/premium state.
- **Internal Padding:** 32px default (`px-8 py-8`), 20px compact (`data-[size=sm]`)

### Inputs / Fields
- **Style:** Borderless top/sides, bottom border only (`border-b-input`). Transparent background. Minimal and understated.
- **Focus:** Bottom border shifts to ring color (Kiln Terracotta). Clean focus transition without box shadows.
- **Error:** Bottom border shifts to destructive red. Error text appears below inline.
- **Height:** 40px default, 48px for prominent forms (booking flow)

### Navigation
- **Desktop Sidebar:** Fixed 240px width, white background, primary-highlighted active item
- **Mobile Bottom Nav:** Fixed bottom bar, max 5 items, active item highlighted with Kiln Terracotta fill
- **Tabs (Default variant):** Muted background container, white active tab with subtle shadow and primary text color
- **Tabs (Line variant):** Transparent background, 2px primary underline on active tab

### Signature: AnimatedCard
The system's distinctive motion component. Wraps any Card in a Framer Motion container with:
- Entrance: fade-in + 20px upward slide, staggered by 100ms per card
- Hover: scale to 1.02×
- Tap: scale to 0.98×
- Easing: `PREMIUM_EASE [0.32, 0.72, 0, 1]` (a custom expo-out curve)
- Duration: 250ms for interactions, 400ms for page transitions

## 6. Do's and Don'ts

### Do:
- **Do** tint every neutral toward hue 25. The warmth is the identity.
- **Do** use `shadow-premium` with terracotta-tinted rgba for elevated elements. Gray shadows feel foreign.
- **Do** use Framer Motion `whileHover: scale(1.02)` for interactive cards and buttons. The tactile feel is the signature.
- **Do** keep primary text at Charcoal Bark (`#2D2723`), never pure black. The contrast is sufficient (>7:1 on Warm Canvas) and the warmth is intentional.
- **Do** use the `featured-border` class (1.5px terracotta + 4px bisque glow) for selected/premium states instead of side-stripe borders.
- **Do** vary section layouts on the landing page. The Signature Experience's asymmetric split is the model; centered stacks are the exception.
- **Do** use `rounded-3xl` (32px) for cards and containers. The large radius is the system's shape signature.
- **Do** use Kiln Terracotta (`#B8794E`) at 30-60% surface coverage on at least one brand section (e.g., the Footer CTA with `bg-primary text-primary-foreground`).

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Use `featured-border`, background tints, or icons instead.
- **Don't** use `background-clip: text` with gradient backgrounds. Text is always a single solid color.
- **Don't** use `backdrop-blur` or glassmorphism as decoration. The hero card glassmorphism pattern was removed for this reason.
- **Don't** create identical card grids (same size, same icon + heading + text structure, repeated 3+ times). Vary the grid: feature one item large, size others differently, or use an asymmetric layout.
- **Don't** use `text-[10px]` or any rendered text below 11px. It fails WCAG readability.
- **Don't** wrap random words in `<span className="italic">` for decoration. One italic word per hero headline maximum; none in body copy.
- **Don't** use pure `#000000` or `#FFFFFF` for text or backgrounds. Tint toward hue 25.
- **Don't** use generic `#4CAF50` green or `#DC2626` red for semantic colors. Use the kiln-palette versions: Forest Confirm (`#435334`) and Brick Error (`#A94438`).
- **Don't** center-stack every section on the landing page. Asymmetric splits, left-aligned leads, and varied grids are what distinguish this from a template.
- **Don't** use `dangerouslySetInnerHTML` for decorative text effects. Use React nodes.
