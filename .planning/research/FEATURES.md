# Feature Research

**Domain:** Salon Management System (Premium UI, CMS, Analytics, Packages)
**Researched:** 2026-05-04
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Premium UI Design System** | Users expect a modern, clean interface (Airbnb-style: ample whitespace, soft radii, consistent typography). | HIGH | Requires a comprehensive refactor of existing frontend components to strictly adhere to design tokens. |
| **Skeleton Loaders** | Enhances perceived performance compared to blocking spinners. | MEDIUM | Needs to be implemented across all data-fetching components (dashboard, gallery, lists). |
| **Basic Content CRUD** | Managers need to update business info (hours, policies) and gallery without developer intervention. | MEDIUM | Relational DB tables for content blocks; simple admin forms. |
| **Image Upload & Management** | Essential for the Nail Art Exhibit. | LOW | Leverage the existing Vercel Blob infrastructure used for user profiles. |
| **Revenue & Staff Reports** | Managers rely on software to track business health and staff output. | MEDIUM | Line/bar charts for revenue over time; data tables for staff service counts and commissions. |
| **Fixed Service Bundles** | Salons routinely sell combos (e.g., Mani + Pedi) at a discount. | HIGH | Needs to map one "Package" to multiple underlying "Services" for inventory and time tracking. |
| **Package Duration Calc** | Booking a package must block out the correct total time. | MEDIUM | Summing the duration of underlying services or allowing a custom override duration. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Interactive Visual Booking** | High-quality imagery integrated seamlessly into the service selection flow. | HIGH | Highly dependent on the success of the Premium UI overhaul. |
| **Gallery Tagging & Filtering** | Allows customers to filter the Nail Art Exhibit by style (e.g., "Acrylic", "Summer"). | MEDIUM | Requires many-to-many relationship between images and tags. |
| **Customer Retention Analysis** | Cohort analysis showing percentage of returning vs. new customers. | HIGH | Requires complex SQL queries against historical appointment data. |
| **Multi-Staff Packages** | Allows a customer to get a Manicure with Staff A and Pedicure with Staff B simultaneously. | HIGH | Very complex scheduling logic; creates overlapping appointments. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Dark Mode** | Trendy developer/user request. | Airbnb's core aesthetic is a "light, clean canvas." Adding dark mode doubles the UI testing surface area and design complexity for minimal salon business value. | Stick to a highly polished, single-theme light UI. |
| **Headless CMS Integration** | "Industry standard" for content (Contentful, Strapi). | Massive over-engineering for a single salon's landing page and simple gallery. Introduces another 3rd-party dependency. | Build a simple DB-backed CRUD module for specific site content blocks. |
| **Predictive AI Analytics** | Sounds advanced and modern. | Low data volume for a single salon makes predictions inaccurate. Extremely high implementation cost. | Focus on rock-solid historical reporting and month-over-month comparisons. |
| **Recurring Subscriptions** | Guaranteed monthly revenue. | Requires complex payment gateway integrations (Stripe) and recurring billing logic, explicitly Out of Scope for v1. | Pay-per-visit standard service bundles/packages. |

## Feature Dependencies

```
[Premium UI/UX]
    └──touches──> [All Existing Frontend Components]

[CMS Image Uploads]
    └──requires──> [Vercel Blob Integration] (Existing)

[Service Packages]
    └──requires──> [Service Catalog] (Existing)
    └──requires──> [Appointment Booking] (Existing)

[Advanced Analytics]
    └──requires──> [Basic Reports] (Existing)
    └──requires──> [Payroll & Attendance] (Existing)

[Multi-Staff Packages] ──conflicts──> [Standard Time Slot Logic]
```

### Dependency Notes

- **Premium UI touches All Existing Components:** The design system refactor cannot be done piecemeal; it requires updating base components and layouts globally to feel cohesive.
- **CMS Image Uploads requires Vercel Blob Integration:** Do not build a new S3 integration; reuse the existing blob storage logic from user profiles to minimize tech debt.
- **Service Packages requires Service Catalog:** Packages are composites of existing standard services. The underlying base services must be stable before building packages.
- **Advanced Analytics requires existing data:** Built on top of the foundation provided by the basic reporting and completed appointment data.
- **Multi-Staff Packages conflicts with Standard Time Slot Logic:** Existing logic likely assumes 1 appointment = 1 staff member. Concurrent multi-staff packages will require a major rewrite of the scheduling engine.

## MVP Definition

### Launch With (v2.0)

Minimum viable product for the current milestone.

- [x] **Premium UI Foundations** — Global color tokens, typography, soft radii, clean layouts applied.
- [x] **Nail Art Gallery (Basic)** — Admin image upload and public list view.
- [x] **Historical Analytics** — Basic revenue charts and staff performance tables with date filters.
- [x] **Sequential Service Packages** — 1 package = multiple services performed sequentially by the same staff member.

### Add After Validation (v2.x)

Features to add once core is working.

- [ ] **Gallery Enhancements** — Drag & drop ordering, tagging/filtering.
- [ ] **Advanced Retention Analytics** — Cohort analysis for returning customers.
- [ ] **Granular CMS** — Fully editable landing page sections via admin panel.

### Future Consideration (v3+)

Features to defer until product-market fit is established.

- [ ] **Multi-Staff Concurrent Packages** — Defer due to scheduling complexity.
- [ ] **Recurring Memberships** — Defer until online payment gateway integration is required.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Premium UI Overhaul | HIGH | HIGH | P1 |
| Nail Art Gallery | HIGH | LOW | P1 |
| Basic Web Content CMS | MEDIUM | MEDIUM | P1 |
| Revenue / Staff Analytics | HIGH | MEDIUM | P1 |
| Sequential Service Packages | HIGH | MEDIUM | P1 |
| Gallery Tagging / Sorting | LOW | MEDIUM | P2 |
| Customer Retention Analytics | HIGH | HIGH | P2 |
| Multi-Staff Packages | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for v2.0 milestone
- P2: Should have, add when possible (v2.x)
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Standard Salon Software | Enterprise Booking | Our Approach (Premium V2) |
|---------|-------------------------|--------------------|---------------------------|
| **UI/UX** | Often cluttered, dense, dated (like old POS systems). | Clinical, enterprise-focused. | **Airbnb-style:** clean, sparse, high-contrast, consumer-friendly. |
| **Packages**| Add-ons loosely grouped. | Complex subscription modules. | **Simple Bundles:** Fixed, sequential services to increase order value without subscription complexity. |
| **Analytics**| Basic CSV exports. | Predictive BI dashboards. | **Visual & Actionable:** Clean, interactive charts focusing on what managers actually care about (revenue, staff performance). |
| **Gallery** | Usually linked out to Instagram. | Often lacks native image handling. | **Native CMS:** Embedded visual gallery to keep users on-site and drive conversions. |

## Sources

- Project Context (`.planning/PROJECT.md`)
- Industry standards for salon management operations
- Airbnb Design System Principles (clean canvas, clear typography, intentional color)
