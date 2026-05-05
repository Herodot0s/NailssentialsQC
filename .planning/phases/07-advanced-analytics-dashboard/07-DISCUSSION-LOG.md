# Phase 7: Advanced Analytics Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 07-advanced-analytics-dashboard
**Areas discussed:** Dashboard Architecture, Date Filtering & Range Controls, Staff Performance Metrics, Customer Retention

---

## Dashboard Architecture

### Q1: Where does the Analytics Dashboard live?

| Option | Description | Selected |
|--------|-------------|----------|
| New sidebar section in Manager Dashboard | Adds "Analytics" nav item — consistent with Phase 4 shell, no new route | |
| Dedicated `/analytics` full-page route | Full-screen canvas, more room for charts, requires new route + nav link | |
| You decide | Agent picks placement | ✓ |

**User's choice:** You decide  
**Notes:** Agent selected sidebar section in Manager Dashboard — consistent with established Phase 4 pattern (same as how Packages, Exhibits, CMS were integrated).

---

### Q2: How is the Analytics section structured inside the sidebar?

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed sections | Three tabs: Revenue / Staff / Retention — consistent with Phase 5 CMS tabbed editor | ✓ |
| Single scrollable page | All charts stacked vertically, good for print/export | |
| You decide | Agent picks | |

**User's choice:** A — Tabbed sections  
**Notes:** Revenue / Staff / Retention as the three tab labels.

---

### Q3: What KPI summary cards appear above the tabs?

| Option | Description | Selected |
|--------|-------------|----------|
| Revenue-focused trio | "This Month's Revenue", "Total Appointments", "Avg. Ticket Size" | |
| Operational quartet | "Today's Revenue", "This Month's Revenue", "Active Staff", "Appointments This Month" | ✓ |
| No summary cards | Charts only, tabs start immediately | |

**User's choice:** B — Operational quartet  
**Notes:** All four cards always visible regardless of which tab is active.

---

### Q4: Does the global date filter apply to all tabs or each tab independently?

| Option | Description | Selected |
|--------|-------------|----------|
| Global filter, applies to all tabs | One picker controls everything — compare cross-tab data for same period | ✓ |
| Per-tab independent filters | Each tab remembers its own range — more flexible, more cognitive load | |

**User's choice:** A — Global filter  
**Notes:** Single date control at the top; all three tabs (Revenue, Staff, Retention) use the same period.

---

## Date Filtering & Range Controls

### Q1: What preset date ranges are available?

| Option | Description | Selected |
|--------|-------------|----------|
| Standard business presets | Today / This Week / This Month / Last Month / This Quarter | ✓ |
| Simplified presets | Today / This Week / This Month only | |
| You decide | Agent picks | |

**User's choice:** A — Standard business presets  
**Notes:** Five presets covering daily check, weekly team meeting, and monthly payroll review cadences.

---

### Q2: What is the default period on load?

| Option | Description | Selected |
|--------|-------------|----------|
| This Month | Aligns with monthly payroll cycle | ✓ |
| Last 30 days | Rolling window, calendar-agnostic | |
| Today | Mirrors existing daily stats widget | |

**User's choice:** A — This Month  
**Notes:** Consistent with how managers already think about performance (monthly payroll context).

---

### Q3: Is a custom date range picker available alongside presets?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, custom date picker | From/to date inputs for arbitrary windows | ✓ |
| Presets only | Simpler UI, 5 presets cover most needs | |

**User's choice:** A — Custom date picker  
**Notes:** Both presets AND custom range available. Useful for analysing specific promo weeks or holiday spikes.

---

### Q4: Does the Revenue tab show a stacked category breakdown?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, stacked area/bar chart by category | Nail / Spa / Hair / Waxing / Threading — `getHistoricalAnalytics` already returns this | ✓ |
| Line chart totals only | Simpler, category breakdown in a table below | |
| You decide | Agent picks | |

**User's choice:** A — Stacked category chart  
**Notes:** `getHistoricalAnalytics` already returns `categories` per day — rendering this is essentially free.

---

## Staff Performance Metrics (ANLY-02)

### Q1: What is the primary staff ranking metric?

| Option | Description | Selected |
|--------|-------------|----------|
| Revenue generated | Rank by `base_amount` sum from commissions | |
| Services completed | Rank by appointment item count | |
| Both, side by side | Revenue rank + service count in same leaderboard | ✓ |

**User's choice:** C — Both side by side  
**Notes:** Table shows Revenue Generated + Services Completed columns for each staff member.

---

### Q2: What chart type for staff performance?

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal bar chart | Staff on Y-axis, bar = revenue — Recharts `BarChart layout="vertical"` | ✓ |
| Grouped column chart | Two bars per staff (revenue + count) — can get crowded | |
| Table only | Pure data grid, sortable columns | |

**User's choice:** A — Horizontal bar chart  
**Notes:** Ranked descending by revenue. Clean, easy to compare across staff members.

---

### Q3: Should the table show commission earned or revenue generated?

| Option | Description | Selected |
|--------|-------------|----------|
| Revenue generated | Salon's perspective — who drives most income | |
| Commission earned | Staff's take-home — already in Payroll section | |
| Both columns in table | Revenue Generated + Commission Earned + Services Completed | ✓ |

**User's choice:** C — Both columns  
**Notes:** Full table: Staff Name | Revenue Generated | Commission Earned | Services Completed. Manager sees business impact AND staff cost together.

---

### Q4: Expandable row detail for category breakdown?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, expandable row | Click staff row to see Nail/Spa/Hair/etc. revenue breakdown | ✓ |
| No, top-level summary only | Category breakdown belongs on Revenue tab | |

**User's choice:** A — Expandable rows  
**Notes:** Clicking a staff row reveals their service mix breakdown. Useful for scheduling decisions ("Maria generates 80% from Nail — should she take more Spa slots?").

---

## Customer Retention (ANLY-03)

### Q1: What is the core retention metric?

| Option | Description | Selected |
|--------|-------------|----------|
| Simple repeat-visit rate | % of customers who came back within N days — one number + trend line | ✓ |
| New vs. returning split | Pie/donut chart: first-time vs. returning for the period | |
| Full monthly cohort grid | Row = month of first visit, columns = retention in subsequent months | |

**User's choice:** A — Repeat-visit rate  
**Notes:** Prominent metric card + trend line over the selected period.

---

### Q2: What is the "retained" return window?

| Option | Description | Selected |
|--------|-------------|----------|
| 60 days | Reasonable for nail salon refresh cycles (3–6 weeks) | ✓ |
| 30 days | Tighter window, may undercount 5–6 week returners | |
| Configurable by manager | Slider/input for 30/45/60/90 days | |

**User's choice:** A — 60 days  
**Notes:** Fixed threshold, not configurable. 60 days accounts for customers on 5–6 week cycles.

---

### Q3: Should the Retention tab also show new vs. returning split?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, donut + retention rate | Two visuals: retention % card + new vs. returning donut chart | ✓ |
| Retention rate only | Single focus metric, cleaner tab | |

**User's choice:** A — Donut + retention rate  
**Notes:** Donut shows new (first-ever appointment) vs. returning (2+ prior). Retention % card alongside. Gives full picture: "We're retaining 68% of customers, and 40% of this month's visits were new."

---

### Q4: Include top returning customers list?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, top customers list | Top 5–10 by visit count — VIP identification for loyalty outreach | ✓ |
| No, aggregate metrics only | Anonymous aggregate data only | |

**User's choice:** A — Top customers list  
**Notes:** Customer Name | Visit Count | Last Visit Date. Helps manager identify VIPs for loyalty rewards or personal outreach.

---

## Agent's Discretion

- **Dashboard placement:** Agent selected sidebar section in Manager Dashboard (vs. dedicated route) — consistent with Phase 4 pattern.
- **Chart color palette:** Agent to select colors harmonizing with Terracotta/Rausch design tokens for category stacking.
- **KPI card layout:** Agent to decide 2×2 vs. 4-in-a-row responsive grid.
- **Empty state design:** Agent to design illustrations/copy for no-data periods.
- **Package analytics placement:** Agent decides whether Phase 6 deferred package data appears as a sub-chart in Revenue tab or category breakdown row.
- **Loading state:** Agent picks between pulsing skeleton cards vs. spinner while data fetches.
- **Recharts tooltip formatting:** Agent to format with ₱ symbol and comma separators.

## Deferred Ideas

- **Full monthly cohort grid** — Most powerful retention view, deferred due to complexity. Candidate for v3.
- **Data export / CSV** — Per-tab or global export. Out of scope; trivial if agent adds it.
- **Real-time chart refresh** — React Query polling while salon is open. Not required for MVP.
- **Package performance deep-dive tab** — Full package analytics (conversion rates, popular bundles, bundle vs. individual revenue). Partial coverage via Revenue tab; full tab deferred.
- **Configurable retention window** — Manager-settable 30/45/60/90 day threshold. Fixed at 60 days for now.
