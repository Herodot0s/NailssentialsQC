# Pitfalls Research

**Domain:** Salon Management Platform (Adding Premium UI, CMS, Analytics, Service Packages)
**Researched:** 2026-05-04
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Commission Calculation on Bundle Sale instead of Redemption

**What goes wrong:**
Salons pay staff commission when a service package (e.g., 5-pack manicures) is sold, but the stylist might leave or the client may request a refund before the services are actually performed.

**Why it happens:**
Developers link commission calculation triggers to the `Invoice` creation or payment event rather than the individual `Appointment Completion` event.

**How to avoid:**
Decouple payment from commission logic. The system must treat the bundle purchase as a "credit balance" applied to the user. Trigger staff commissions strictly and individually when a service from that bundle is successfully checked-in/completed.

**Warning signs:**
Stylists' commission reports show sudden massive spikes that do not align with their actual clocked-in hours or appointment logs.

**Phase to address:**
Service Expansion (SERV-01)

---

### Pitfall 2: OLTP vs. OLAP Database Contention (Analytics)

**What goes wrong:**
Running heavy reporting queries (e.g., retention rates, staff performance across years) directly on the primary Postgres database locks tables or consumes all connection pools, causing the main booking application to freeze for customers.

**Why it happens:**
Defaulting to running complex, unoptimized `GROUP BY` and raw SQL queries against massive `appointments` or `users` tables directly in the main web app request cycle (OLAP workloads running on an OLTP database).

**How to avoid:**
Do not query raw rows for dashboards. Create specific reporting endpoints that rely on pre-calculated Materialized Views or separate indexed summary tables. Populate these tables asynchronously via background cron jobs (e.g., nightly rollups).

**Warning signs:**
The main booking API latency spikes significantly whenever a manager opens or refreshes the Analytics Dashboard.

**Phase to address:**
Manager Analytics (ANLY-01)

---

### Pitfall 3: CSS Specificity Wars & Style Leaking

**What goes wrong:**
Integrating a highly polished design system (like Airbnb's) conflicts with the existing Tailwind, Base UI, or Radix components. New components look correct, but old legacy components suddenly break, or new components inherit unwanted legacy padding/margins.

**Why it happens:**
Attempting a piece-meal, component-by-component migration without strict CSS boundaries, or mixing old global stylesheets with new scoped design tokens. 

**How to avoid:**
Map existing variables to the new design tokens first. Use CSS variables to control themes, and migrate page-by-page (the Strangler Pattern) to ensure a consistent experience within specific user flows. Enforce new design tokens via ESLint rules.

**Warning signs:**
Developers increasingly using `!important` in CSS, writing deep nested selectors to override inherited styles, or resorting to inline styles in React.

**Phase to address:**
Premium UI Overhaul (UI-01)

---

### Pitfall 4: Hardcoding CMS Content to Visual Components

**What goes wrong:**
The custom Manager CMS schema is built to perfectly mirror the frontend layout (e.g., fields named "Hero Header Text", "Left Column Image"). Managers cannot reuse content across different pages, and any UI layout change requires a database migration.

**Why it happens:**
Developers think in terms of React UI components instead of semantic content entities.

**How to avoid:**
Model the CMS around abstract entities (e.g., `ExhibitItem`, `Policy`, `ServiceInfo`) rather than visual pages. Keep the presentation logic strictly in the React frontend. The CMS should return JSON data objects, leaving the frontend to decide *how* to render them.

**Warning signs:**
Database columns or API responses are named after CSS properties or UI layout positions (e.g., `top_banner_text`, `button_color`).

**Phase to address:**
Manager CMS (CMS-01)

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| N+1 Queries in Analytics | Fast implementation using existing Prisma relations | "Death by Dashboard," taking down the main API under load | Never (always use `.groupBy()` or native SQL for analytics) |
| Direct UI-to-DB coupling in CMS | Quickest way to build a functional admin form | Every future UI layout change requires a backend DB migration | Prototyping only |
| Pro-rating bundle discounts evenly | Easy math for package sales | Disputes over staff commission equity when services vary in cost | MVP only, needs explicit configuration later |
| Mixing old and new UI patterns | Faster individual feature delivery | "Frankenstein" UI that degrades user trust and conversions | Only behind feature flags during active transition |

## Integration Gotchas

Common mistakes when connecting to external services or existing tech.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel Blob (Gallery) | Allowing managers to upload raw, uncompressed 10MB+ images directly | Add image compression/resizing middleware (e.g., sharp) before upload |
| Prisma (Analytics) | Using `.findMany()` and calculating sums/averages in JS memory | Use Prisma's native aggregation functions (`.aggregate`, `.groupBy`) |
| Shadcn / Radix UI | Modifying the underlying Radix primitives directly for the new UI | Extend visually via Tailwind classes and standard `className` props |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Real-time Analytics Queries | Dashboard takes 5+ seconds to load | Cache results (Redis/memory) or use nightly DB rollups | >10k appointment records |
| Fetching full image payloads | Public Gallery page causes browser lag / high memory usage | Implement infinite scroll, cursor pagination, and lazy loading (`loading="lazy"`) | >50 images in gallery |
| Unindexed Foreign Keys | Extremely slow dashboard joins (`appointments` -> `users`) | Add explicit database indexes to `staff_id`, `customer_id`, and `date` | >100k rows |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Insecure Direct Object Reference in CMS | Staff or unauthorized users modifying/deleting website content | Strict RBAC checks on every CMS edit/delete/upload endpoint (Managers only) |
| Unsanitized CMS HTML inputs | Stored XSS on the public Landing or Gallery pages | Use strict DOM sanitization (e.g., DOMPurify) on the backend before saving |
| Over-fetching API Analytics | Exposing PII (customer names/emails) in network payloads for manager graphs | Ensure the analytics API strictly returns aggregated numeric data, zero PII |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Non-transparent Package Pricing | Customers confused about the actual bundle savings | Clearly show "Original Price" crossed out next to the "Bundle Price" |
| Hidden Commission Rules | Staff feel cheated by complex package commission splits | Provide a transparent breakdown of commission per service in the Staff Dashboard |
| "Frankenstein" Design | Platform looks broken/untrustworthy during UI transition | Migrate complete user flows (e.g., entirely new booking flow) at once, not isolated buttons |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Service Packages:** Often missing partial refund logic — verify what happens if a customer demands a refund mid-package.
- [ ] **Analytics Dashboard:** Often missing date-range constraints — verify queries are clamped to a max 1-year range to prevent accidental database freezing.
- [ ] **Nail Art Gallery:** Often missing image optimization — verify Vercel Blob URLs use appropriate sizing/compression and cache headers.
- [ ] **Design System:** Often missing error states — verify form validation and empty states look visually consistent with the new premium aesthetic.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Commission Paid on Sale (Early) | HIGH | Run a manual database audit script to reclaim overpaid commissions, fix the DB trigger logic, and communicate clearly to staff. |
| DB Locked by Analytics Load | HIGH | Immediately restart the DB, temporarily disable the dashboard endpoint, and urgently implement a caching layer. |
| Mixed UI Chaos (Frankenstein) | MEDIUM | Roll back or feature-flag the new UI until a full, cohesive user journey is complete and tested. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSS Specificity Wars | UI-01 | Check for the absence of `!important` flags and run visual regression tests. |
| Hardcoded CMS Content | CMS-01 | Code review DB schema to ensure tables represent content entities, not layout properties. |
| OLTP Database Contention | ANLY-01 | Monitor database CPU/Memory usage during load tests of the manager dashboard. |
| Bundle Commission Error | SERV-01 | Write explicit backend unit tests for "package sale" vs "package redemption" commission triggers. |

## Sources

- Domain analysis of common salon management software failures (e.g., Phorest, Zenoti patterns)
- Known database performance anti-patterns (N+1, OLAP vs OLTP contention)
- Post-mortems on integrating custom CMSs into existing web applications
- Standard React/Tailwind design system integration best practices
