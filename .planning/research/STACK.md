# Stack Research

**Domain:** Premium UI/UX, CMS, Analytics, Service Packages for Salon Platform
**Researched:** 2026-05-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `framer-motion` | `^12.0.0` | Complex UI animations and micro-interactions | Essential for achieving the "soft, premium" Airbnb feel. Fully compatible with React 19 and works seamlessly with Tailwind CSS. |
| `lexical` & `@lexical/react` | `^0.20.0` | Rich text editor for Manager CMS | Meta's modern editor explicitly built with full React 19 support. Chosen over Tiptap to avoid React 19 `peerDependency` and `forwardRef` breaking changes. |
| `recharts` | `^3.8.0` | Advanced Analytics Dashboard charting | Standard for React apps. Declarative, highly customizable, matches Radix/shadcn design language easily, and works flawlessly in React 19. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `embla-carousel-react` | `^8.6.0` | Inline image carousels | Use for the Nail Art Exhibit previews and service package images on the landing page. |
| `yet-another-react-lightbox` | `^3.32.0` | Full-screen image viewing | Use when a customer clicks an image in the Nail Art Exhibit to view it in detail with zoom and swipe support. |
| `react-dropzone` | `^15.0.0` | Drag-and-drop image upload | Use in the Manager CMS for uploading gallery images and service thumbnails. |
| `sharp` | `^0.34.0` | Backend image processing | Use in Express.js backend to compress and resize manager-uploaded images before sending them to Vercel Blob. |
| `date-fns` | `^4.1.0` | Date manipulation | Use for calculating retention rates, week-over-week revenue, and complex analytics queries. |
| `lucide-react` | `^0.370.0` | Clean, modern icons | Matches the minimal, premium design tokens set in DESIGN.md. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@types/d3-shape` | Type definitions for Recharts internals | Often needed when customizing Recharts extensively in a strict TypeScript environment. |

## Installation

```bash
# Frontend Core & UI
npm install framer-motion lexical @lexical/react recharts lucide-react

# Frontend Gallery & Upload
npm install embla-carousel-react yet-another-react-lightbox react-dropzone

# Backend Processing & Utils
npm install sharp date-fns
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `lexical` | `@tiptap/react` | If the team already has extensive Tiptap experience. *Note: Requires `--legacy-peer-deps` due to React 19 incompatibilities as of 2.10.x.* |
| `recharts` | `chart.js` + `react-chartjs-2` | If you need canvas-based rendering for massive datasets (10,000+ points), which is unlikely for salon analytics. |
| `embla-carousel` | `swiper` | Swiper is heavier but includes more out-of-the-box UI elements if you don't want to build custom Next/Prev buttons. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@tiptap/react` | Several extensions and the core library currently have peer dependency conflicts and `forwardRef` issues with React 19. | `lexical` (fully supports React 19). |
| `moment.js` | Extremely large bundle size, mutable API, and officially in maintenance mode. | `date-fns` (modular, immutable). |
| `multer-s3` or AWS SDK | The project already uses Vercel Blob for existing features. Adding AWS S3 SDK introduces unnecessary infrastructure fragmentation. | Continue using standard `multer` + `@vercel/blob`. |

## Stack Patterns by Variant

**If implementing the Service Packages:**
- Use **Prisma Transactions** (`prisma.$transaction`)
- Because booking a package means creating multiple related service appointments simultaneously; if one fails, the entire package booking must roll back to avoid partial states.

**If rendering the Nail Art Gallery:**
- Use `sharp` to generate WebP thumbnails (e.g., 400x400) on upload, storing both original and thumbnail in Vercel Blob.
- Because loading 20+ full-resolution nail art images on the landing page will ruin the premium feel due to slow load times.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `lexical@0.20.0` | `react@19.0.0` | Verified full React 19 compatibility out-of-the-box. |
| `framer-motion@12.x` | `react@19.0.0` | v12 specifically targets modern React environments. |

## Sources

- Official Lexical Docs — React 19 Compatibility verified.
- Official Tiptap Docs — React 19 Issues (`--legacy-peer-deps`) verified.
- npm info via CLI — Current package versions checked.

---
*Stack research for: Premium UI, CMS, Analytics, Service Packages*
*Researched: 2026-05-04*