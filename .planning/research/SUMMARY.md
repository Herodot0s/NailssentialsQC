# Project Research Summary

**Project:** NailssentialsQC (V2 Premium Features)
**Domain:** Salon Management System (Premium UI, CMS, Analytics, Packages)
**Researched:** 2026-05-04
**Confidence:** HIGH

## Executive Summary

The project represents a V2 expansion of a Salon Management System, focusing on a Premium UI overhaul (Airbnb-style), a headless CMS for dynamic content (Nail Art Gallery), advanced analytics, and sequential service packages. The core approach emphasizes extending the existing Express.js and React 19 stack while decoupling complex logic: separating analytics processing to database queries rather than in-memory, moving media to Vercel Blob, and applying design tokens globally to maintain a cohesive premium feel.

Key risks include performance bottlenecks from real-time analytics queries locking the primary database, commission calculation errors due to conflating bundle sales with redemption, and "Frankenstein" UI if new components clash with legacy ones. Mitigations include enforcing database aggregations (`groupBy`) for reporting, triggering commission specifically on appointment completion, and employing the Strangler Pattern with strict CSS boundaries.

## Key Findings

### Recommended Stack

Core technologies prioritize React 19 compatibility and premium user experience out-of-the-box. The frontend avoids heavy bundle sizes and breaking changes (e.g., opting for Lexical over Tiptap), while the backend leverages existing infrastructure like Vercel Blob.

**Core technologies:**
- `framer-motion`: Complex UI animations — essential for achieving the soft, premium feel and works seamlessly with React 19.
- `lexical` & `@lexical/react`: Rich text editor — fully supports React 19 without peer dependency conflicts.
- `recharts`: Analytics charting — declarative, customizable, and compatible with the new Radix/shadcn design language.
- `sharp` & Vercel Blob: Backend image processing — critical for compressing nail art exhibits before storage to maintain performance.

### Expected Features

**Must have (table stakes):**
- **Premium UI Design System** — users expect a modern, clean interface (Airbnb-style).
- **Basic Content CRUD & Image Upload** — managers need to update galleries and policies without developers.
- **Revenue & Staff Reports** — essential for tracking business health and staff output.
- **Fixed Service Bundles** — mapping composite packages to underlying services with duration tracking.

**Should have (competitive):**
- **Interactive Visual Booking** — seamlessly integrating high-quality imagery into the flow.
- **Gallery Tagging & Filtering** — allowing customers to explore nail art styles.
- **Customer Retention Analysis** — cohort analysis for recurring visitors.

**Defer (v2+):**
- **Multi-Staff Packages** — deferred due to extreme scheduling and overlap complexity.
- **Recurring Subscriptions** — deferred until payment gateway integrations are required.

### Architecture Approach

The backend separates new V2 functionality into dedicated controllers (CMS, Analytics, Packages) to keep existing appointment systems lean.

**Major components:**
1. **Premium UI Kit** — Extends Tailwind config and Radix/shadcn overrides for consistent, tokenized visual styling.
2. **Package Resolver** — Backend logic that expands a single Service Package booking into multiple distinct `AppointmentItem` records.
3. **CMS Engine & Blob Manager** — Headless API exposing editable site content and processing multipart file uploads via Vercel Blob.
4. **Analytics Aggregator** — Executes complex Prisma `groupBy` or raw SQL aggregations to prevent Node.js memory exhaustion.

### Critical Pitfalls

1. **Commission Calculation on Bundle Sale** — Avoid paying commission on purchase; strictly trigger commission when underlying services are completed to prevent loss on refunds.
2. **OLTP vs. OLAP Database Contention** — Avoid running heavy analytics directly on booking tables; utilize materialized views or strict DB aggregation endpoints.
3. **CSS Specificity Wars** — Avoid piecemeal migrations; map existing variables to new design tokens and migrate by full user flows (page-by-page).
4. **Hardcoding CMS Content to UI** — Avoid creating CMS schemas that mirror frontend layouts; model content abstractly to allow UI flexibility without DB migrations.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Premium UI Foundations (UI-01)
**Rationale:** UI touches all existing frontend components; piecemeal updates will break the app. This must be the foundation.
**Delivers:** Global design tokens, Airbnb-style foundations, typography, spacing, and skeleton loaders.
**Addresses:** Premium UI Design System, Skeleton Loaders.
**Avoids:** CSS Specificity Wars and style leaking.

### Phase 2: Headless CMS & Nail Art Gallery (CMS-01)
**Rationale:** High value, low complexity feature that leverages the new UI and existing Vercel Blob infrastructure.
**Delivers:** Admin image uploads, content CRUD, and the public Nail Art Exhibit view.
**Uses:** `lexical`, `embla-carousel-react`, `sharp`, `react-dropzone`.
**Implements:** CMS Engine, Blob Manager.

### Phase 3: Sequential Service Packages (SERV-01)
**Rationale:** Extends the core booking and service catalog with composites. Requires careful data integrity logic.
**Delivers:** Fixed service bundles, duration calculations, and booking API extensions.
**Addresses:** Fixed Service Bundles, Package Duration Calc.
**Avoids:** Commission Calculation on Bundle Sale (by splitting items at booking).

### Phase 4: Manager Analytics Dashboard (ANLY-01)
**Rationale:** Dependent on historical data generated by existing and newly refined flows.
**Delivers:** Interactive revenue and staff performance reports.
**Uses:** `recharts`, `date-fns`.
**Implements:** Analytics Aggregator.
**Avoids:** OLTP vs. OLAP Database Contention (by strictly using `groupBy` queries).

### Phase Ordering Rationale

- **Dependencies:** The design system must lead, as all subsequent visual features (galleries, charts) rely on its tokens.
- **Architecture:** Moving from isolated backend services (CMS) to extending core business logic (Packages) reduces risk.
- **Pitfalls:** Grouping UI updates immediately prevents the "Frankenstein" anti-pattern, and tackling Analytics last ensures database performance optimizations aren't rushed.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Service Packages):** Needs specific definition on how package prorating will interact with existing staff commission logic.
- **Phase 4 (Analytics):** Needs DB performance review to verify if Prisma `groupBy` is performant enough, or if native SQL Materialized Views are mandatory.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Premium UI):** Well-documented Tailwind/Radix tokenization patterns.
- **Phase 2 (CMS):** Standard Headless REST API and Vercel Blob integrations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Explicit package compatibility verified, especially React 19 support for Lexical/Framer Motion. |
| Features | HIGH | Clear separation between must-haves and complex deferrals (multi-staff). |
| Architecture | HIGH | Clear data flows and isolated components identified. |
| Pitfalls | HIGH | Domain-specific edge cases (commission on sale vs redemption) clearly mapped out. |

**Overall confidence:** HIGH

### Gaps to Address

- **Prorated Package Commissions:** Need explicit product requirements on how discounts apply (evenly, or weighted by service value) to ensure staff are paid fairly.
- **Old Component Migration Strategy:** Need a definitive strategy for how V1 pages are displayed while the Premium UI is actively being integrated.

## Sources

### Primary (HIGH confidence)
- `STACK.md` — Technology compatibility, React 19 recommendations
- `FEATURES.md` — MVP requirements and competitive analysis
- `ARCHITECTURE.md` — V2 system boundaries, Composite Package pattern
- `PITFALLS.md` — Domain-specific risks and database performance anti-patterns

### Secondary (MEDIUM confidence)
- Airbnb Design System principles (as referenced in RESEARCH files)
- Prisma aggregation best practices

---
*Research completed: 2026-05-04*
*Ready for roadmap: yes*