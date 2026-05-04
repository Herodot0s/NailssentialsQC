# Architecture Research

**Domain:** Salon Management System (V2 Premium Expansion)
**Researched:** 2026-05-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           Frontend (React 19 + Vite)                        │
 │                                                                             │
 │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
 │  │ Premium UI Kit │  │  Booking App   │  │  Manager CMS   │  │ Analytics │  │
 │  │(Airbnb tokens) │  │(w/ Packages)   │  │ (Exhibit/Docs) │  │ Dashboard │  │
 │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └─────┬─────┘  │
 └──────────│───────────────────│───────────────────│─────────────────│────────┘
            │                   │                   │                 │
            ▼                   ▼                   ▼                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                     Backend (Express.js + TypeScript)                       │
 │                                                                             │
 │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
 │  │ Image Uploads  │  │ Pkg Resolver   │  │ CMS Controller │  │ Aggregator│  │
 │  │ (Vercel Blob)  │  │ (Appt Logic)   │  │ (DB Content)   │  │ (Reports) │  │
 │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └─────┬─────┘  │
 └──────────│───────────────────│───────────────────│─────────────────│────────┘
            │                   │                   │                 │
            ▼                   ▼                   ▼                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                          PostgreSQL Database                                │
 │   ┌───────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────────┐ │
 │   │ Blob Metadata │ │Packages/Items  │ │ Content Schema │ │ Transactions  │ │
 │   └───────────────┘ └────────────────┘ └────────────────┘ └───────────────┘ │
 └─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Premium UI Kit** | Consistent typography, spacing, colors matching Airbnb design | Extended Tailwind config, Radix/shadcn overrides |
| **Package Resolver** | Expands composite packages into individual service items | Backend business logic in `appointmentController` |
| **CMS Engine** | Exposes editable site content (Exhibit gallery, policies) via API | `cmsController.ts` CRUD routes + Prisma models |
| **Blob Manager** | Handles multipart file streams, uploads to Vercel Blob | Utility class wrapping Vercel Blob SDK |
| **Analytics Aggregator** | Computes staff retention, revenue trends, and performance | Complex Prisma `groupBy` / raw SQL queries |

## Recommended Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── cmsController.ts          # New: Gallery & Content endpoints
│   │   ├── analyticsController.ts    # New: Advanced reporting logic
│   │   └── packageController.ts      # New: Service package CRUD
│   └── routes/
│       ├── cmsRoutes.ts
│       ├── analyticsRoutes.ts
│       └── packageRoutes.ts
frontend/
├── src/
│   ├── components/
│   │   ├── premium/                  # New: Airbnb-style base UI elements
│   │   ├── exhibit/                  # New: Nail art gallery components
│   │   └── analytics/                # New: Charts and metric cards
│   └── pages/
│       ├── ExhibitGallery.tsx        # New: Public-facing nail art
│       ├── ManagerCMS.tsx            # New: Content editing interface
│       └── ManagerAnalytics.tsx      # New: Analytics dashboard
```

### Structure Rationale

- **Backend Separation:** Dedicated controllers for CMS, Analytics, and Packages ensure that the existing `appointmentController` and `staffController` do not become overly bloated.
- **Premium Component Isolation:** Isolating "Premium" styled components in their own directory ensures they are not mixed with legacy v1 components until the migration is fully rolled out.
- **Dedicated Pages:** Separation of concerns between daily operations (`ManagerDashboard.tsx`) and new, heavy features (`ManagerCMS.tsx`, `ManagerAnalytics.tsx`).

## Architectural Patterns

### Pattern 1: Composite Package Expansion

**What:** When a user books a "Service Package" (e.g., Spa + Nail Bundle), the backend expands this single logical entity into distinct `AppointmentItem` records associated with the relevant individual services.
**When to use:** Handling service bundles without breaking the existing commission, attendance, and assignment logic.
**Trade-offs:** Makes history tracking easier (since an appointment remains a collection of items), but requires logic to prorate bundle discounts across the individual items to ensure accurate commission calculations.

**Example:**
```typescript
// Book Package Flow
const packageServices = await prisma.servicePackageItem.findMany({ where: { packageId }});
const itemsToCreate = packageServices.map(ps => ({
  service_id: ps.service_id,
  price_at_booking: applyDiscount(ps.service.price, packageDiscountRatio)
  // ... other details
}));
await prisma.appointmentItem.createMany({ data: itemsToCreate });
```

### Pattern 2: Headless Content API (CMS)

**What:** Treating the backend as a headless CMS for dynamic site content (Nail Art Exhibits, Policy text, Landing page hero text) rather than hardcoding.
**When to use:** To empower managers to update the Nail Art Gallery and salon landing info without a developer needing to deploy code.
**Trade-offs:** Adds minor database overhead for data that doesn't change often. Easily mitigated by client-side or CDN-level caching.

### Pattern 3: Backend Data Aggregation

**What:** Performing heavy analytics calculations (staff retention, revenue trends) in the database via Prisma `groupBy` or views instead of fetching raw records and iterating over arrays in memory.
**When to use:** Generating the new Manager Advanced Analytics dashboards.
**Trade-offs:** Queries are harder to write and maintain, but memory usage is strictly bounded and response times are vastly improved.

## Data Flow

### CMS Upload Flow (Exhibit Gallery)

```
[Manager User]
    ↓ (Selects Image + Details)
[CMS Component] → [multipart/form-data POST]
    ↓ 
[CMS Controller] → [Vercel Blob SDK] → (Stores Image)
    ↓                      ↓ (Returns URL)
[Prisma DB] ← (Saves Exhibit Metadata + URL)
```

### Package Booking Flow

```
[Customer]
    ↓ (Selects "Premium Spa Package")
[Booking API] 
    ↓
[Package Resolver] (Fetches Package details & sub-services)
    ↓
[Appointment Controller] (Calculates time blocks & prices)
    ↓
[Prisma Transaction] (Creates 1 Appointment, N AppointmentItems)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Current (V1)** | Express monolithic logic; hardcoded UI components. |
| **Next Phase (V2 Premium)** | Database-backed CMS; Vercel Blob for large gallery images to offload bandwidth; database aggregations for analytics to save Node.js memory. |
| **Future Growth** | Implement Redis caching for CMS endpoints (e.g., public exhibit gallery) so DB isn't hit for static content. |

### Scaling Priorities

1. **First bottleneck: Image Hosting.** Gallery exhibits will quickly bloat repository and database. **Fix:** Integrate Vercel Blob immediately for all media.
2. **Second bottleneck: Analytics performance.** V1 report generation is currently prone to N+1 queries. **Fix:** Advanced analytics must strictly use aggregated queries.

## Anti-Patterns

### Anti-Pattern 1: Bloated Appointment Schema

**What people do:** Adding `package_id` directly to the `Appointment` model and trying to infer the services inside it on the fly.
**Why it's wrong:** Breaks existing commission and scheduling logic which relies on atomic `AppointmentItem`s mapped to a specific `Service` and `StaffProfile`.
**Do this instead:** Expand the package into distinct `AppointmentItem` records at booking time (Composite Pattern).

### Anti-Pattern 2: Base64 Database Image Storage

**What people do:** Storing Nail Art exhibit images as Base64 strings in PostgreSQL.
**Why it's wrong:** Exponentially inflates database size, kills backup speeds, and degrades API response times.
**Do this instead:** Use Vercel Blob Storage, and store only the resulting `image_url` in the CMS database tables.

### Anti-Pattern 3: Client-Side Data Crunching

**What people do:** Fetching all `Transaction` and `Commission` records for the year and using `Array.reduce` in React to build charts.
**Why it's wrong:** Leads to massive API payload sizes, high memory usage on mobile devices, and slow renders.
**Do this instead:** Write Prisma `groupBy` queries or raw SQL aggregations; return only chart-ready data points to the frontend.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Vercel Blob** | Direct SDK upload | Used for User Profiles and new Exhibit Gallery. Ensure proper MIME-type and size validation before upload. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Packages ↔ Appointments** | Direct Service expansion | `AppointmentItems` generated from a package should hold a reference or note indicating they were part of a bundle for receipt printing purposes. |
| **CMS ↔ UI** | REST API | The public Landing/Exhibit pages fetch content dynamically; requires loading states and error boundaries. |

## Schema Additions (Proposed)

*To support the new features, `schema.prisma` will require these additions:*

1. `ExhibitItem`: `id`, `title`, `description`, `image_url`, `is_featured`, `created_at`
2. `SiteContent`: `id`, `key` (e.g., 'landing_hero'), `value_json`
3. `ServicePackage`: `id`, `name`, `description`, `total_price`, `is_active`
4. `ServicePackageItem`: `package_id`, `service_id` (Junction table)

## Sources

- GSD Codebase Mapping (`.planning/codebase/ARCHITECTURE.md`)
- Prisma Schema (`backend/prisma/schema.prisma`)
- Vercel Blob Documentation
- Airbnb Design System principles (as documented in `DESIGN.md`)

---
*Architecture research for: NailssentialsQC (V2 Premium Features)*
*Researched: 2026-05-04*