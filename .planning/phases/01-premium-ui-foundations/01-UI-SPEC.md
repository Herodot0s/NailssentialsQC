---
phase: 1
slug: premium-ui-foundations
status: approved
shadcn_initialized: true
preset: base-sera
created: 2026-05-05
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for Phase 1: Premium UI Foundations. Establishing the global design language and motion primitives for the V2.0 overhaul.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | base-sera (customized for Rausch) |
| Component library | Radix UI |
| Icon library | Lucide React |
| Font | Inter (Sans), Playfair Display (Serif) |

---

## Visual Focal Point (Dimension 2)

To ensure visual hierarchy, every primary view must have a clear focal point.

| View | Focal Point | Visual Treatment |
|------|-------------|------------------|
| Landing Page | Booking Card | `rounded-3xl` with persistent `border-brand-rausch` and `shadow-premium`. |
| Staff Dashboard | Today's Schedule | Elevated card with high contrast header. |
| Manager View | Service Analytics | Prominent display cards with subtle Rausch backgrounds. |

---

## Spacing Scale

Standard 8-point scale (multiples of 4) for consistent layout rhythms.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Button padding, small gaps |
| md | 16px | Standard card padding, grid gaps |
| lg | 24px | Section padding, container gutters |
| xl | 32px | Major component spacing |
| 2xl | 48px | Page section vertical margins |
| 3xl | 64px | Hero section padding |

Exceptions: none

---

## Typography

Declarative typography set focused on readability and premium contrast.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 (Regular) | 1.5 |
| Label | 14px | 600 (Semibold) | 1.4 |
| Heading | 24px | 600 (Semibold) | 1.2 |
| Display | 48px | 600 (Semibold) | 1.1 |

*Note: Headings and Display roles use 'Playfair Display' (Serif), Body and Label use 'Inter' (Sans).*

---

## Color

The "60/30/10" split following the Airbnb-inspired "Rausch" palette.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #FFFFFF | Canvas background, pure white surfaces |
| Secondary (30%) | #FFF1F2 | Muted Rausch for cards, sidebar, and section backgrounds |
| Accent (10%) | #FF385C | Rausch (Radical Red) |
| Destructive | #DC2626 | Critical errors and destructive actions |

**Accent reserved for:**
- Primary CTAs (Buttons)
- Active navigation highlights
- Featured element borders (e.g., Booking Card)
- Progress indicators

---

## Motion Primitives

High-end interactions using `framer-motion` to create a tactile, premium feel.

| Pattern | Value | Detail |
|---------|-------|--------|
| Ease Curve | `[0.32, 0.72, 0, 1]` | Premium Ease-Out (Swift entry, soft finish) |
| Page Transition | 400ms | 20px Vertical Lift + Fade-in |
| Micro-interaction | 250ms | Scale down (0.98) on press; Scale up (1.02) on hover |
| Exit Animation | 300ms | Subtle fade-out + negative vertical shift |

---

## Layout System

| Property | Value |
|----------|-------|
| Grid | 12-column (standard), 1-column (mobile) |
| Max Width | 1280px (Standard), 1536px (Ultra-wide) |
| Radii: Container | 24px - 32px (`rounded-3xl`) |
| Radii: Utility | 12px (`rounded-xl`) |
| Radii: Data | 8px (`rounded-lg`) |
| Shadows | `0 8px 28px rgba(0,0,0,0.08)` (Diffuse & Subtle) |

---

## Copywriting Contract

Tone: Premium, boutique, welcoming. Focus on "Experiences" rather than "Appointments."

| Element | Copy |
|---------|------|
| Primary CTA | "Book an Experience" |
| Empty state heading | "A clean slate." |
| Empty state body | "Nothing here yet. Start your journey by exploring our featured services." |
| Error state | "We've hit a small snag. Please try refreshing the page or contact support if the issue persists." |
| Destructive confirmation | "Cancel Appointment" / "Are you sure you want to cancel this experience? This cannot be undone." |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | button, card, dialog, input, label, select, sheet, table, tabs, textarea | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-05
