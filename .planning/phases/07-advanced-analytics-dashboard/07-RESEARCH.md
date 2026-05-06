# Phase 7: Advanced Analytics Dashboard — Research

**Researched:** 2026-05-06
**Status:** Complete

## 1. Existing Codebase Patterns

### 1.1 Backend Controller Pattern

All report endpoints in `reportController.ts` follow this exact pattern:

```typescript
export const getXxx = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Date range required' });
    }
    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));
    // ... Prisma queries ...
    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('...error:', error);
    const message = error instanceof Error ? error.message : '...';
    return res.status(500).json({ success: false, message });
  }
};
```

**Key imports used:** `startOfDay`, `endOfDay`, `format`, `eachDayOfInterval` from `date-fns`.

### 1.2 Existing Endpoints to Reuse

| Endpoint | Controller | Returns | Reusable For |
|----------|-----------|---------|-------------|
| `GET /reports/historical-analytics` | `getHistoricalAnalytics` | `{ date, total, categories: Record<string,number>, services: Record<string,number> }[]` | ANLY-01 Revenue — already returns daily revenue by service category |
| `GET /reports/daily-sales` | `getDailySalesStats` | `{ totalRevenue, transactionCount, onlineCount, walkInCount, serviceBreakdown, target }` | KPI "Today's Revenue" card |

### 1.3 Route Registration Pattern

`reportRoutes.ts` uses: `router.get('/endpoint', authenticateToken, authorizeRoles('manager'), handler);`

New endpoints register in the same file with the same middleware chain.

### 1.4 Frontend API Client Pattern

`apiClient.ts` exports typed functions:
```typescript
export const getXxx = (params: { startDate: string; endDate: string }) =>
  apiClient.get('/reports/xxx', { params });
```

### 1.5 Recharts Usage Patterns (from DrillDownLineChart.tsx)

The codebase already uses Recharts v3.8.1 with these established patterns:

- `ResponsiveContainer` wrapper with `width="100%"` and explicit height
- `CartesianGrid` with `strokeDasharray="3 3"`, `vertical={false}`, `stroke="#f0f0f0"`
- `XAxis`/`YAxis` with `axisLine={false}`, `tickLine={false}`, small font sizing
- Custom `Tooltip` with `contentStyle` (no border radius, drop shadow)
- `Legend` with `iconType="circle"` and click handlers
- Color palette: `['#B8794E', '#D9A07E', '#E6B69E', '#F2CCBE', '#9A6440']`

**Existing chart components:**
- `DrillDownLineChart` — LineChart with drill-down (category → service)
- `OverviewView` — PieChart donut for revenue split

### 1.6 Manager Dashboard Sidebar Pattern

`ManagerSidebar.tsx` uses a `menuItems` array:
```typescript
const menuItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
  { id: 'analytics', label: 'Dashboard', icon: PieChartIcon },
  // ...
  { id: 'packages', label: 'Packages', icon: Package },
];
```

`ActiveView` type is a union in `types.ts`:
```typescript
export type ActiveView = 'analytics' | 'staff' | ... | 'packages';
```

Adding a new sidebar item requires:
1. Add to `ActiveView` union type
2. Add to `menuItems` array
3. Add conditional render in `ManagerDashboard.tsx`

## 2. Client Chart Preferences

**The client explicitly requested bar graphs and line graphs.** This overrides the original CONTEXT.md decisions:

| Tab | Original D-decision | Client Override |
|-----|---------------------|----------------|
| Revenue (D-08) | Stacked `<AreaChart>` | **Stacked `<BarChart>`** — grouped/stacked bars per category per day |
| Revenue total overlay | Dashed `<Line>` overlay on AreaChart | **`<LineChart>`** — separate line graph for total revenue trend |
| Staff (D-10) | Horizontal `<BarChart layout="vertical">` | **Bar chart** — already aligned ✓ |
| Retention (D-12) | `<LineChart>` trend line | **Line graph** — already aligned ✓ |

### 2.1 Recharts BarChart for Revenue

For a stacked bar chart by service category:

```tsx
<BarChart data={dailyData}>
  <CartesianGrid strokeDasharray="3 3" vertical={false} />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="Nail" stackId="revenue" fill="#B8794E" />
  <Bar dataKey="Spa" stackId="revenue" fill="#D9A07E" />
  <Bar dataKey="Hair" stackId="revenue" fill="#9A6440" />
  <Bar dataKey="Waxing" stackId="revenue" fill="#E6B69E" />
  <Bar dataKey="Threading" stackId="revenue" fill="#F2CCBE" />
</BarChart>
```

Using `stackId` groups bars into stacked columns. Each category gets its own `<Bar>` element.

### 2.2 Recharts LineChart for Revenue Trend

A companion line chart showing total revenue over time:

```tsx
<LineChart data={dailyData}>
  <CartesianGrid strokeDasharray="3 3" vertical={false} />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="total" stroke="#2D2723" strokeWidth={2} />
</LineChart>
```

### 2.3 Recharts Horizontal BarChart for Staff Leaderboard

```tsx
<BarChart layout="vertical" data={staffData}>
  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
  <XAxis type="number" />
  <YAxis dataKey="name" type="category" width={120} />
  <Bar dataKey="revenue" fill="#B8794E" radius={[0, 4, 4, 0]} />
</BarChart>
```

## 3. Backend Query Strategies

### 3.1 Staff Performance (ANLY-02) — New Endpoint

**Query approach:** Use Prisma `groupBy` on `Commission` table grouped by `staff_id`:

```typescript
const staffStats = await prisma.commission.groupBy({
  by: ['staff_id'],
  where: {
    commission_date: { gte: start, lte: end }
  },
  _sum: { base_amount: true, commission_amount: true },
  _count: { id: true }
});
```

Then join with `StaffProfile` for names. For category breakdown per staff (D-11 expandable rows), a second query:

```typescript
const staffCategories = await prisma.commission.findMany({
  where: { commission_date: { gte: start, lte: end } },
  include: { service: { include: { category: true } }, staff: true },
});
// Group in JS: Map<staffId, Map<categoryName, sum>>
```

**Performance note:** `groupBy` is efficient — single SQL query. The category breakdown is heavier (N commissions × 2 joins) but bounded by date range.

### 3.2 Customer Retention (ANLY-03) — New Endpoint

**Retention rate calculation (60-day window):**

1. Get all unique customers who had completed appointments in the date range
2. For each customer, check if they have a subsequent completed appointment within 60 days of their last visit in the period
3. Rate = returning / total unique customers

```typescript
// Step 1: Unique customers with completed appointments in range
const customers = await prisma.appointment.findMany({
  where: {
    status: 'completed',
    appointment_date: { gte: start, lte: end }
  },
  select: { customer_id: true, appointment_date: true },
  distinct: ['customer_id']
});

// Step 2: For each, check 60-day return window
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);

for (const cust of customerLastVisits) {
  const returnVisit = await prisma.appointment.findFirst({
    where: {
      customer_id: cust.customer_id,
      status: 'completed',
      appointment_date: {
        gt: cust.lastVisit,
        lte: addDays(cust.lastVisit, 60)
      }
    }
  });
  if (returnVisit) retainedCount++;
}
```

**Optimization:** Batch the 60-day check with a single raw query or use `IN` clause to avoid N+1.

**New vs. Returning donut:**
- "New" = customers whose first-ever completed appointment falls within the selected period
- "Returning" = customers who had at least one completed appointment before the selected period

```typescript
// First-ever visit per customer
const firstVisits = await prisma.appointment.groupBy({
  by: ['customer_id'],
  where: { status: 'completed' },
  _min: { appointment_date: true }
});
```

**Top returning customers:** Group appointments by customer_id within the period, count, sort desc, take 10.

### 3.3 Retention Trend Line Data

To show retention % over time (monthly), calculate the 60-day rate for each month in the range. This requires iterating month-by-month:

```typescript
const months = eachMonthOfInterval({ start, end });
const trendData = [];
for (const month of months) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  // Calculate retention for this month...
  trendData.push({ month: format(month, 'MMM yyyy'), rate: retentionRate });
}
```

## 4. Frontend Architecture

### 4.1 Component Structure

```
frontend/src/components/dashboard/analytics/
├── AnalyticsDashboard.tsx    — Main container (tabs, date filter, KPIs)
├── DateFilterBar.tsx         — Preset buttons + custom range picker
├── KpiCards.tsx              — Four summary metric cards
├── RevenueTab.tsx            — Stacked bar chart + line chart
├── StaffTab.tsx              — Horizontal bar chart + leaderboard table
├── RetentionTab.tsx          — Retention rate card + line chart + donut + top customers
└── hooks/
    ├── useAnalyticsData.ts   — React Query hooks for all analytics endpoints
    └── useDateFilter.ts     — Date range state management
```

### 4.2 State Management

Date filter state lives in `AnalyticsDashboard.tsx` (above tabs) so all three tabs share the same range:

```typescript
const [dateRange, setDateRange] = useState<DateRange>({
  preset: 'this-month',
  startDate: startOfMonth(new Date()).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
});
```

React Query hooks use `dateRange` as query key dependencies for automatic refetch.

### 4.3 TypeScript Types Needed

```typescript
// In frontend/src/types/api.ts
export interface StaffPerformanceStat {
  staffId: number;
  fullName: string;
  revenue: number;
  commission: number;
  serviceCount: number;
  categoryBreakdown?: Record<string, number>;
}

export interface RetentionData {
  retentionRate: number;
  totalCustomers: number;
  returningCustomers: number;
  newCustomers: number;
  trend: { month: string; rate: number }[];
  topCustomers: { name: string; visitCount: number; lastVisit: string }[];
}
```

## 5. Integration Points

### 5.1 Sidebar Registration

Add `'advanced-analytics'` to `ActiveView` union. Add menu item with `BarChart2` icon from Lucide. Render `<AnalyticsDashboard />` when active.

**Important:** The existing `'analytics'` view maps to `OverviewView` (Dashboard overview). The new analytics dashboard should be a separate view, not replace the overview.

### 5.2 API Types Registration

Add `StaffPerformanceStat`, `RetentionData`, and related types to `frontend/src/types/api.ts`.

### 5.3 Route Registration

Add to `reportRoutes.ts`:
```typescript
router.get('/staff-performance', authenticateToken, authorizeRoles('manager'), getStaffPerformance);
router.get('/retention', authenticateToken, authorizeRoles('manager'), getRetentionAnalytics);
```

### 5.4 KPI Data Sources

| KPI Card | Data Source | Endpoint |
|----------|-----------|---------|
| Today's Revenue | `getDailySalesStats` | `GET /reports/daily-sales` (existing) |
| This Month's Revenue | `getHistoricalAnalytics` summed | `GET /reports/historical-analytics` (existing) |
| Active Staff | StaffProfile count where is_available=true | New query or inline |
| Appointments This Month | Appointment count for current month | New query or inline |

### 5.5 Currency Formatting

Standardize with `Intl.NumberFormat`:
```typescript
const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
```

## 6. Validation Architecture

### 6.1 Backend Validation

- Date range params: Validate with Zod schema `z.object({ startDate: z.string().date(), endDate: z.string().date() })`
- Range sanity: `endDate >= startDate`, max 365-day range to prevent excessive queries
- Staff performance: Validate numeric aggregations handle NULL/zero safely
- Retention: Handle edge case of zero customers in period (return 0% rate, not NaN)

### 6.2 Frontend Validation

- Empty data handling: Show empty state when chart data arrays are empty
- Loading states: Skeleton placeholders per UI-SPEC
- Error states: Display error message with retry action
- Date range validation: Prevent from > to selection

### 6.3 Acceptance Criteria Patterns

- Backend endpoints return `{ success: true, data: ... }` format
- All monetary values as numbers (not strings) for chart rendering
- Staff names come from `StaffProfile.full_name`
- Customer names from `CustomerProfile.full_name`
- Charts render with `ResponsiveContainer` for fluid width

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Retention query N+1 for large customer sets | Slow API response | Batch with raw SQL or Prisma `IN` clause |
| Empty database (no commissions yet) | Charts render blank | Empty state UI per UI-SPEC |
| Date-fns timezone issues | Wrong day boundaries | Use `startOfDay`/`endOfDay` consistently (already established) |
| Large date ranges (1+ year) | Memory/performance | Cap max range at 365 days |
| Package revenue not in categories | Missing from bar chart | Include as sixth "Packages" bar in stacked chart |

## RESEARCH COMPLETE
