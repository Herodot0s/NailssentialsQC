# Phase 7: Advanced Analytics Dashboard - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a comprehensive analytics dashboard embedded in the Manager Dashboard sidebar. It provides three categories of business intelligence:

1. **Revenue Analytics (ANLY-01)** — Interactive revenue charts with date filtering, broken down by service category (Nail, Spa, Hair, Waxing, Threading) using Recharts stacked charts. Extends the existing `getHistoricalAnalytics` endpoint.
2. **Staff Performance Analytics (ANLY-02)** — Staff leaderboard ranked by revenue generated, with commission earned and services completed. Expandable rows show per-category service mix per staff member. New backend endpoint required.
3. **Customer Retention Analytics (ANLY-03)** — 60-day repeat-visit rate metric with trend line, new vs. returning customer donut chart, and a top 5–10 returning customers table. New backend endpoint required.

**Requirements:** ANLY-01 (Revenue), ANLY-02 (Staff Performance), ANLY-03 (Retention)

**Note from Phase 6 deferral:** Package analytics (most popular bundles, conversion rate, revenue impact) was explicitly deferred from Phase 6 to this phase. Include a "Packages" section within the Revenue tab or as a dedicated sub-section.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Architecture
- **D-01:** Analytics lives as a **new sidebar nav item ("Analytics")** in the existing Manager Dashboard sidebar shell — consistent with Phase 4's established sidebar pattern. No new route or page needed.
- **D-02:** The Analytics section uses **three tabs: Revenue / Staff / Retention**. Consistent with the CMS tabbed editor pattern from Phase 5.
- **D-03:** **Four KPI summary cards** appear above the tabs, always visible regardless of active tab:
  - "Today's Revenue" (from `getDailySalesStats`)
  - "This Month's Revenue"
  - "Active Staff" (current count of active staff profiles)
  - "Appointments This Month"
- **D-04:** The **global date filter applies to all three tabs simultaneously**. One date picker controls Revenue, Staff, and Retention data together. Manager can compare cross-tab data for the same period without re-selecting.

### Date Filtering
- **D-05:** **Five preset quick-select buttons:** Today / This Week / This Month / Last Month / This Quarter.
- **D-06:** **Default on load: This Month** — aligns with the monthly payroll review cycle.
- **D-07:** **Custom date range picker** available alongside presets — from/to date inputs for arbitrary windows (promo weeks, holiday spikes, etc.).
- **D-08:** The **Revenue tab shows a stacked area or bar chart by service category** (Nail / Spa / Hair / Waxing / Threading). The existing `getHistoricalAnalytics` endpoint already returns `categories` per day — this is essentially free to render. Total line overlaid.

### Staff Performance (ANLY-02)
- **D-09:** Staff leaderboard table shows **three metrics per staff member**: Revenue Generated (`base_amount` sum from `Commission`), Commission Earned (`commission_amount` sum), and Services Completed (count). Both revenue and service count visible side by side.
- **D-10:** **Horizontal bar chart** (Recharts `BarChart` with `layout="vertical"`) ranked by revenue generated. Each staff member is a row; bar length reflects total revenue for the period.
- **D-11:** **Expandable staff rows** — clicking a staff row reveals a category breakdown (Nail / Spa / Hair / Waxing / Threading revenue for that staff member). Useful for scheduling decisions (e.g., "Maria generates 80% from Nail — should she take more Spa slots?").

### Customer Retention (ANLY-03)
- **D-12:** **Core metric: repeat-visit rate %** — "Of all customers who visited in the selected period, what % came back within 60 days?" Displayed as a prominent metric card + trend line over time (line chart).
- **D-13:** **60-day return window** — a customer is counted as "retained" if they book again within 60 days of a prior visit. Fixed threshold, not configurable.
- **D-14:** **New vs. returning customer donut/pie chart** alongside the retention rate card. "New" = first-ever appointment; "Returning" = 2+ prior appointments before this period.
- **D-15:** **Top 5–10 returning customers table** by visit count for the selected period — customer name + visit count. Helps the manager identify VIPs for loyalty outreach.

### Agent's Discretion
- Chart color palette for category stacking (should harmonize with Terracotta/Rausch design tokens from DESIGN.md)
- Exact layout grid for the four KPI cards (2×2 vs. 4-in-a-row vs. responsive)
- Whether to include a data export button (CSV) per tab or overall
- Empty state illustrations/copy when no data exists for the selected period
- Whether the "Packages" performance data (from Phase 6 deferred) appears in the Revenue tab as a sub-chart or a dedicated row in the category breakdown
- Loading skeleton style (pulsing cards vs. spinner) while chart data fetches
- Recharts tooltip formatting (Philippine Peso ₱ symbol, comma separators)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend — Existing Analytics Endpoints
- `backend/src/controllers/reportController.ts` — Three existing functions: `getPayrollReport`, `getDailySalesStats`, `getHistoricalAnalytics`. New ANLY-02 and ANLY-03 endpoints must follow the same controller pattern. `getHistoricalAnalytics` already returns daily revenue by category — extend or reuse for ANLY-01.
- `backend/src/routes/reportRoutes.ts` — Current report routes: `GET /reports/daily-sales`, `GET /reports/payroll`, `GET /reports/historical-analytics`. New staff-performance and retention endpoints register here.

### Backend — Data Models (for new queries)
- `backend/prisma/schema.prisma` — Key models for analytics: `Commission` (fields: `staff_id`, `service_id`, `base_amount`, `commission_amount`, `commission_date`), `Appointment` (fields: `customer_user_id`, `appointment_date`, `is_walk_in`, `status`), `AppointmentItem`, `Transaction` (`amount`, `transaction_date`, `status`), `StaffProfile`.
- `backend/src/controllers/appointmentCompletion.ts` — Commission calculation reference (D-08/D-09 from Phase 6): tiered rate logic, hair stylist bonus. Understand how `base_amount` vs `commission_amount` are set.

### Frontend — Manager Dashboard Shell
- `frontend/src/pages/ManagerDashboard.tsx` — Sidebar shell from Phase 4. Add "Analytics" as a new sidebar nav item using the same registration pattern as Packages (Phase 6).

### Frontend — Design System
- `airbnb/DESIGN.md` — Visual tokens: Terracotta/Rausch color palette, typography, spacing radii. Chart colors must harmonize with these tokens.
- `.planning/phases/04-operations-interface-overhaul/04-CONTEXT.md` — Phase 4 sidebar architecture decisions (how new sidebar views are added).
- `.planning/phases/05-marketing-cms-content-control/05-CONTEXT.md` — Phase 5 tabbed editor pattern (how tabs are structured in the manager dashboard).
- `.planning/phases/06-service-packages-bundling/06-CONTEXT.md` — Package analytics deferred here (D-deferred from Phase 6: package conversion rates, revenue impact, popular bundles).

### Frontend — Chart Library
- `frontend/package.json` — Recharts `^3.8.1` is already installed as a dependency. No additional chart library needed. Use `AreaChart`, `BarChart` (with `layout="vertical"` for horizontal bars), `PieChart`/`RadialBarChart` for donut, `LineChart` for trend lines.

### API Layer
- `frontend/src/api/apiClient.ts` — All API calls go through this client. Add analytics endpoints here.
- `frontend/src/types/api.ts` — Add TypeScript types for analytics API responses (`StaffPerformanceStat`, `RetentionStat`, `DailyRevenueStat`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`reportController.ts` → `getHistoricalAnalytics`** — Already returns `{ date, total, categories, services }[]` per day for a date range. ANLY-01 Revenue tab can consume this directly with a Recharts stacked chart. Minor extension may be needed for package category inclusion.
- **`getDailySalesStats`** — Returns today's revenue, transaction count, online/walk-in counts, and target. Powers the "Today's Revenue" KPI card in D-03.
- **Recharts `^3.8.1`** — Already installed. Use `AreaChart` (stacked by category), `BarChart layout="vertical"` (staff leaderboard), `PieChart` (new vs. returning donut), `LineChart` (retention rate trend). No install step needed.
- **shadcn `Tabs` component** — Used in Phase 5 CMS. Apply same tabbed pattern for Revenue / Staff / Retention.
- **React Query `useQuery`** — Established pattern throughout the dashboard. All analytics endpoints should be wrapped in `useQuery` hooks with appropriate `staleTime`.
- **Manager RBAC guard** — `authenticateToken` + `authorizeRoles('manager')` already on all report routes. New endpoints follow same pattern.

### Established Patterns
- **Controller pattern** — `async (req, res) => { try { ... prisma query ... return res.json({ success: true, data: ... }) } catch { ... } }`. New ANLY-02 and ANLY-03 controllers follow this exactly.
- **Date range query pattern** — `startOfDay(new Date(startDate))` / `endOfDay(new Date(endDate))` with `date-fns` — already in `reportController.ts`. Reuse for new endpoints.
- **`commission.groupBy`** — Already used in `getDailySalesStats` for service breakdown. Extend for staff-level grouping (group by `staff_id`, aggregate `base_amount` + `commission_amount` + `_count`).
- **Paginated array guard** — `Array.isArray()` check before `.map()` (established from Phase 3 UAT). Apply to all chart data rendering.
- **Premium typography** — `font-serif` headings, `text-[10px] tracking-widest uppercase font-bold` for section labels. KPI card values use large serif numerals.

### Integration Points
- **Manager Dashboard sidebar** — New "Analytics" nav item triggers a new `AnalyticsDashboard` view component. Same pattern as `PackagesView` from Phase 6.
- **`reportRoutes.ts`** — Register two new endpoints: `GET /reports/staff-performance` (ANLY-02) and `GET /reports/retention` (ANLY-03). Both accept `?startDate=&endDate=` query params.
- **`Commission` table** — Primary data source for both ANLY-01 (revenue by category/day) and ANLY-02 (revenue per staff). Staff performance query: `groupBy(['staff_id'])` with `_sum: { base_amount, commission_amount }` and `_count: { id }`.
- **`Appointment` table** — Primary data source for ANLY-03 retention. Query: find all customers who visited in period, then check if each had a visit in the 60 days after their last visit in the period.

</code_context>

<specifics>
## Specific Ideas

- **Recharts stacked area chart for Revenue tab:** Use `<AreaChart>` with one `<Area>` per service category, colors mapped from the design token palette (Terracotta for Nail, muted tones for other categories). A total `<Line>` overlay shows aggregate.
- **Horizontal bar chart for Staff tab:** `<BarChart layout="vertical">` with staff names on Y-axis, revenue bars on X-axis. Sorted descending by revenue. Expandable row: clicking a staff row shows a mini horizontal bar chart of their category breakdown below.
- **Retention donut:** `<PieChart>` with two segments — new (first-ever) vs. returning (2+ prior). Center label shows retention rate %.
- **Top customers table:** Simple sortable table — Customer Name | Visit Count | Last Visit Date. Links to their appointment history if needed in a future phase.
- **KPI cards:** Four cards in a 2×2 or 4-column grid. Each card shows: label (small caps), value (large serif number), and a subtle trend indicator (↑/↓ vs. previous period). Similar to the Phase 4 manager overview cards.
- **Currency formatting:** All monetary values displayed with ₱ symbol and comma separators (e.g., ₱12,450). Use `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`.

</specifics>

<deferred>
## Deferred Ideas

- **Cohort grid (full monthly retention matrix)** — The richest retention view (rows = month of first visit, columns = retention in subsequent months). Deferred due to complexity. Current approach (simple 60-day repeat rate) is sufficient for ANLY-03. Consider for v3.
- **Data export / CSV download** — Manager can export any chart's data as a spreadsheet. Useful but out of scope for this phase. Agent may include if trivial to add.
- **Real-time / live updating charts** — Auto-refresh while the salon is open. Deferred; React Query polling could handle this but is not required for MVP analytics.
- **Package performance deep-dive tab** — Dedicated analytics tab for package conversion rates, most popular bundles, and bundle revenue vs. individual service revenue. Partial coverage via Revenue tab's category data; full package analytics deferred to a future phase.
- **Configurable retention window** — Letting the manager set the return window (30/45/60/90 days) via a UI control. Fixed at 60 days for now.

</deferred>

---

*Phase: 07-Advanced Analytics Dashboard*
*Context gathered: 2026-05-06*
