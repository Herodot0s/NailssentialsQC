---
phase: 10
slug: manager-payroll-ui-excel-export
status: draft
shadcn_initialized: true
preset: none
created: 2026-05-14
---

# Phase 10 — UI Design Contract

> Visual and interaction contract for frontend phases.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | not applicable |
| Component library | radix-ui |
| Icon library | lucide-react |
| Font | Noto Sans / Playfair Display |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing |
| md | 16px | Default element spacing |
| lg | 24px | Section padding |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5 |
| Label | 12px | 500 | 1.2 |
| Heading | 20px | 600 | 1.2 |
| Display | 28px | 700 | 1.1 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #ffffff | Background, surfaces |
| Secondary (30%) | #f9fafb | Cards, sidebar, nav |
| Accent (10%) | #000000 | Primary CTA, focus states |
| Destructive | #ef4444 | Destructive actions only |

Accent reserved for: Primary CTA buttons, active sidebar state.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Finalize & Lock Payroll |
| Empty state heading | No Payroll Periods Generated |
| Empty state body | Click "Generate Next Period" to start a new weekly payroll. |
| Error state | Export failed. Please check your connection and try again. |
| Destructive confirmation | Lock Period: This action cannot be undone. Are you sure? |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | table, button, dialog, sheet, dropdown-menu | not required |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
