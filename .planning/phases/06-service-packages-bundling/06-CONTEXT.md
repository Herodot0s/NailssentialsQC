# Phase 6: Service Packages & Bundling - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase enables the salon to offer curated service bundles that increase ticket size and simplify booking. It delivers:
1. A new `ServicePackage` Prisma model (with a join table to `Service`) to persist package definitions
2. A backend Packages API (manager-only RBAC) for CRUD operations
3. A package management interface in the Manager Dashboard sidebar
4. Customer-facing package discovery and booking integration into the existing cart-based flow
5. Commission logic that correctly handles package redemption at discounted prices

**Requirements:** PKG-01 (create packages), PKG-02 (book packages), PKG-03 (commission on packages)

</domain>

<decisions>
## Implementation Decisions

### Package Pricing Model
- **D-01:** Packages use a **fixed bundle price** set by the manager (e.g., "Mani-Pedi Bundle: ₱1,500"). No automatic percentage-based discounting — the manager has full control over the package price.
- **D-02:** **Cross-category bundles are allowed** — manager can mix services from any category (Nail, Spa, Hair, Waxing, Threading) in a single package. Matches the SERV-01 requirement directly.
- **D-03:** Packages require a **minimum of 2 services** with **no maximum limit**. The manager decides what makes sense operationally.

### Booking Experience
- **D-04:** A package enters the cart as a **single cart item that auto-expands** into its component services on the booking page. The cart shows the bundle name + package price, but the booking detail exposes individual services so the customer can pick staff + time for each. This preserves the bundle identity while reusing the per-service scheduling UX.

### Commission Calculation
- **D-05:** Commission is calculated on **full individual service prices** — the salon absorbs the entire package discount. Staff earnings are completely unaffected by whether a service was booked individually or as part of a package. Each `AppointmentItem.price_at_booking` stores the original catalog price of the service.
- **D-06:** **Separate commission records per staff per service** — identical to the existing multi-item appointment pattern. No special package commission logic needed.
- **D-07:** `Transaction.amount` stores the **actual paid amount** (the package price), not the sum of individual prices. Revenue reports reflect real income. Commission `base_amount` fields independently reference full service prices.

### Commission System Clarification (from real payroll data)
- **D-08:** The tiered commission system works as follows:
  - **Base rate:** ₱500/day per staff (weekly payout)
  - **Tiered commission (ALL staff):** Rate based on **last month's total salon sales**:
    - Below ₱51,000 → 5% commission
    - ₱51,000 to ₱54,999 → 8% commission
    - ₱55,000 and above → 10% commission
  - Commission is calculated on each service performed by the staff member
- **D-09:** **Hair stylist bonus (ADDITIONAL, hair stylists only):**
  - Weekly hair services total ≥ ₱6,000 → additional 20% on hair services
  - Weekly hair services total < ₱6,000 → additional 10% on hair services
  - Non-hair-stylists receive no hair bonus
  - The ₱6,000 quota threshold is **fixed** (not configurable)
- **D-10:** For packages: full individual service prices count toward **all thresholds** — both the monthly salon sales total (tiered rate) and the weekly hair quota (hair stylist bonus).

### Package Management Interface
- **D-11:** **Rich package builder** with the following fields: package name, description, services multi-select from catalog, fixed price, featured image (Vercel Blob upload), display order/priority, validity dates (start/end for seasonal packages), max redemptions limit, active/inactive toggle.

### Agent's Discretion
- Whether to display savings/discount prominently to the customer or show package price only
- Package discovery placement (dedicated section on services page vs. separate /packages route)
- Whether packages and individual services can be mixed in the same cart
- Package display in appointment history and receipts (grouped under package name vs. individual services)
- Sidebar placement for package management (new "Packages" item vs. tab within a "Services" section)
- Soft deactivate vs. hard delete behavior for packages
- Whether to show inline performance stats (bookings, revenue) in the management view

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database & Backend
- `backend/prisma/schema.prisma` — Current schema with `Service`, `ServiceCategory`, `AppointmentItem`, `Commission`, `Transaction` models. Add `ServicePackage` and `ServicePackageItem` (join table) models here.
- `backend/src/controllers/appointmentCompletion.ts` — Commission calculation logic: `getTieredCommissionRate()` (tiered on last month's sales), `checkSpecialtyQuota()` (hair stylist bonus). Must handle package items correctly — commission on full individual prices.
- `backend/src/controllers/exhibitController.ts` — Reference pattern for manager-only CRUD controller (auth guard, error handling, response shape). Package controller follows the same pattern.
- `backend/src/routes/exhibitRoutes.ts` — Reference pattern for manager-only route registration with middleware.

### Frontend — Booking Flow
- `frontend/src/pages/Booking.tsx` — Cart-based booking page. Each cart item is one service with staff + time selection. Must be extended to support package items that expand into component services.
- `frontend/src/context/CartContext.tsx` — Cart state management. Must support a "package" cart item type that contains child service references.
- `frontend/src/pages/Services.tsx` — Service catalog browsing page. Package discovery may be added here.

### Frontend — Manager Dashboard
- `frontend/src/pages/ManagerDashboard.tsx` — Phase 4 sidebar shell. Add package management as a new sidebar view.
- `frontend/src/components/gallery/ExhibitForm.tsx` — Reference for form with image upload (Vercel Blob pattern).

### Design & Foundations
- `airbnb/DESIGN.md` — Visual reference for spacing, typography, and color tokens.
- `.planning/phases/04-operations-interface-overhaul/04-CONTEXT.md` — Phase 4 sidebar architecture decisions (D-01 through D-09).
- `.planning/phases/05-marketing-cms-content-control/05-CONTEXT.md` — Phase 5 CMS patterns (tabbed layout, manager RBAC, React Query caching).

### API Layer
- `frontend/src/api/apiClient.ts` — All API calls go through this client. Add package endpoints here.
- `frontend/src/types/api.ts` — Add TypeScript types for `ServicePackage` API responses.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **shadcn components** (`Card`, `Table`, `Tabs`, `Select`, `Dialog`, `Button`, `Input`, `Textarea`) — All styled with premium tokens. Use for package management forms and customer-facing package cards.
- **React Query** (`useQuery` / `useMutation`) — Established pattern for data fetching/caching. Apply for package list/detail queries.
- **Vercel Blob upload** — `uploadController.ts` + `ExhibitForm.tsx` pattern for featured image upload on packages.
- **`CartContext`** — Existing cart state management. Extend to support package item type.
- **Manager RBAC guard** — `requireManagerRole` middleware on exhibit/CMS routes. Apply same pattern to package routes.

### Established Patterns
- **Manager-only CRUD** — Controller pattern from `exhibitController.ts` and `cmsController.ts`: same auth guard, Prisma client usage, error response shape.
- **Cart item structure** — Each cart item has `serviceId`, `staffId`, `startTime`, `price`, `serviceName`, `duration`. Package items need to wrap multiple of these.
- **Commission per AppointmentItem** — `appointmentCompletion.ts` iterates over `appointment.items`, calculates commission per item using `price_at_booking`. Package services become individual `AppointmentItem` rows at full catalog prices.
- **Paginated/array API response guards** — `Array.isArray()` check before `.map()` (established from Phase 3 UAT).
- **Premium typography** — `font-serif` for headings, `text-[10px] tracking-widest uppercase font-bold` for section labels.

### Integration Points
- **Prisma schema** — New `ServicePackage` model with many-to-many relation to `Service` via join table `ServicePackageItem`.
- **`Booking.tsx`** — Package cart items expand to show individual services with staff/time selection per service.
- **`appointmentCompletion.ts`** — No changes needed for commission logic itself — package services become regular `AppointmentItem` rows. Only `Transaction.amount` uses the package price.
- **Manager Dashboard sidebar** — New view component for package CRUD, registered as a sidebar nav option.

</code_context>

<specifics>
## Specific Ideas
- The commission system clarification (D-08, D-09) was verified against a real payroll table provided by the user. The existing `checkSpecialtyQuota` code may need adjustment: it currently checks monthly, but the real system uses a **weekly** hair sales threshold.
- The `ServicePackage` model should include `valid_from` and `valid_until` fields for seasonal bundles, plus `max_redemptions` for limited offers.
- Package featured images follow the same Vercel Blob pattern as exhibit images.
- Package `price` is a fixed `Decimal` field — the system knows the sum of individual service prices for reference but the bundle price is independently set by the manager.

</specifics>

<deferred>
## Deferred Ideas
- **Multi-staff package booking optimization** — Smart scheduling that auto-assigns staff based on availability and specialization for all services in a package. Current approach: customer picks staff per service manually.
- **Package templates/cloning** — Duplicate an existing package to create a variation (e.g., seasonal version). Simple CRUD is sufficient for Phase 6.
- **Customer-facing package reviews/ratings** — Allow customers to rate their package experience. Reviews are per-appointment-item currently; package-level reviews would be a new concept.
- **Package analytics** — Detailed package performance metrics (conversion rate, revenue impact, most popular bundles). Belongs in Phase 7 (Advanced Analytics Dashboard).

</deferred>

---

*Phase: 06-Service Packages & Bundling*
*Context gathered: 2026-05-05*
