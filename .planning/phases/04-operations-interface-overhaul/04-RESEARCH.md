# Phase 4: Operations Interface Overhaul — Research

**Researched:** 2026-05-05
**Status:** Complete

## 1. Current Architecture Analysis

### ManagerDashboard.tsx (1,007 lines)
The monolith contains **all** manager functionality in a single component:

| Section | Lines | Complexity |
|---------|-------|------------|
| State declarations (15 useState hooks) | 102–164 | High — all loaded on mount |
| Data fetching (8 parallel API calls) | 166–207 | Medium — single Promise.all |
| Event handlers (12 handlers) | 209–387 | High — tightly coupled to state |
| Sidebar + Menu items | 389–447 | Low — already has sidebar nav |
| Analytics/Overview view | 476–558 | Medium — PieChart, DrillDown, cards |
| Staff view (delegates to StaffTable) | 561–566 | Low — already extracted |
| Attendance view (delegates to AttendanceLedger) | 568–573 | Low — already extracted |
| Deductions view (inline form + summary) | 575–646 | Medium — inline JSX |
| Payroll view (delegates to PayrollTable) | 648–655 | Low — already extracted |
| Reviews view (delegates to ReviewModeration) | 657–662 | Low — already extracted |
| Exhibits view (delegates to ManageExhibits) | 664–668 | Low — already extracted |
| Staff Sheet (slide-over detail panel) | 672–832 | High — complex tabbed sheet |
| Modals (Add Staff, Shift, Payroll, Deduction) | 842–1001 | Medium — 4 dialog components |

**Key finding:** The sidebar navigation and `activeView` state switching already exist (line 103-104, 389-430). The current architecture is already 70% decomposed — sub-components (StaffTable, PayrollTable, AttendanceLedger, ReviewModeration) are extracted. The main work is:
1. Moving the remaining inline views (Analytics, Deductions) into separate components
2. Moving the Staff Sheet and all 4 modals out of the monolith
3. Adding responsive sidebar collapse for mobile
4. Creating the "Today's Overview" landing view per D-04

### StaffDashboard.tsx (467 lines)
Already well-structured with tab-based navigation:

| Section | Lines | State |
|---------|-------|-------|
| State declarations (8 useState) | 84–95 | Reasonable |
| Data fetching (5 API calls) | 97–126 | Clean Promise.all |
| Event handlers (5 handlers) | 134–166 | Simple |
| Header + Tabs | 190–220 | Clean |
| Schedule tab (check-in + appointments) | 222–306 | Needs mobile-first rework |
| Earnings tab | 308–386 | Good as-is |
| Messages tab | 388–421 | Good as-is |
| Message modal | 425–461 | Simple dialog |

**Key finding:** Staff dashboard is already clean. The main work is:
1. Mobile-first check-in experience (D-06): full-screen takeover when not checked in
2. Appointment timeline display enhancement (D-07)
3. No structural decomposition needed — it's only 467 lines

## 2. Existing Patterns to Follow

### Sidebar Navigation (Already Implemented)
```tsx
// ManagerDashboard.tsx line 103-104
type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews' | 'exhibits';
const [activeView, setActiveView] = useState<ActiveView>('analytics');
```

The sidebar with icon+label buttons, active/inactive states, and view switching via React state is already built. No routing changes needed per D-01.

### Design Token Usage
- Labels: `text-[10px] tracking-widest uppercase font-bold` (consistent across both dashboards)
- Headings: `font-serif text-{size} font-light` (Playfair Display)
- Cards: `rounded-none border-none shadow-sm bg-white`
- Stat numbers: `text-4xl font-serif font-light`
- Active sidebar: `bg-primary text-white shadow-lg shadow-primary/20`
- Inactive sidebar: `text-muted-foreground hover:bg-gray-50 hover:text-foreground`

### API Data Handling
Paginated responses require `Array.isArray()` guards (established in Phase 3):
```tsx
const staffData = staffRes.data.data;
setStaffMembers(Array.isArray(staffData) ? staffData : (staffData?.items || []));
```

### Component Library
All shadcn components are already installed and styled: Card, Button, Badge, Tabs, Sheet, Dialog, Select, Input, Label, Avatar, Table, SwipeButton.

## 3. Decomposition Strategy

### Manager Dashboard — Component Extraction Plan

| New Component | Source Lines | Receives Props |
|---------------|-------------|----------------|
| `ManagerSidebar` | 414-447 | `activeView`, `onViewChange`, `menuItems` |
| `OverviewView` | 476-558 | `salesStats`, `historicalData`, `selectedCategory`, handlers |
| `DeductionsView` | 575-646 | `staffMembers`, `deductionForm`, `onSubmit`, handlers |
| `StaffDetailSheet` | 672-832 | `staff`, `schedule`, `categories`, handlers |
| `AddStaffDialog` | 842-875 | `form`, `onSubmit`, `open`, `onOpenChange` |
| `ShiftEditDialog` | 878-914 | `form`, `editingDay`, `onSubmit`, `open`, `onOpenChange` |
| `PayrollRunDialog` | 917-947 | `form`, `onSubmit`, `open`, `onOpenChange` |
| `DeductionEntryDialog` | 950-1001 | `form`, `staffMembers`, `onSubmit`, `open`, `onOpenChange` |

**State management:** Keep all state in `ManagerDashboard.tsx` (now the layout shell). Pass props down to view components. No context or state management library needed — the prop drilling depth is max 2 levels.

### New Components to Create

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `ManagerSidebar` | Persistent sidebar with responsive collapse | Medium |
| `OverviewCards` | Today's Overview stat cards (D-04) | Low |
| `AppointmentTimeline` | Today's appointment timeline for overview | Medium |
| `MobileCheckIn` | Full-screen check-in takeover (D-06) | Medium |

## 4. Responsive Strategy

### Manager Dashboard Breakpoints
| Breakpoint | Sidebar | Content |
|------------|---------|---------|
| < 768px (mobile) | Hidden, hamburger toggle | Full-width, p-4 |
| 768-1024px (tablet) | Collapsed icon-only (w-12) | flex-1, p-6 |
| > 1024px (desktop) | Full sidebar (w-64) | flex-1, p-10 |

**Implementation:** Use Tailwind responsive classes + a `sidebarCollapsed` state. Mobile uses a Sheet overlay for the sidebar menu.

### Staff Dashboard Mobile
- Check-in card: Already uses `lg:col-span-4` grid. For D-06, detect `!status?.isCheckedIn` and render a full-viewport overlay on mobile (< md breakpoint) with the SwipeButton centered.
- After check-in: Collapse to a compact status bar (flex row with badge + time) and show appointments below.

## 5. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| State management complexity after decomposition | Medium | Keep single source of truth in ManagerDashboard shell |
| Breaking existing event handlers during extraction | High | Extract JSX first, keep handlers in parent, pass as props |
| Sidebar responsive behavior on edge cases | Low | Test at exact breakpoints (768px, 1024px) |
| Mobile check-in overlay blocking navigation | Medium | Ensure Navbar remains accessible above the overlay |
| API call duplication if views lazy-load | Low | Keep single fetchData() in parent — all data loaded upfront |

## 6. Dependencies

### External (already installed)
- `recharts` — PieChart, ResponsiveContainer (used in analytics view)
- `framer-motion` — Already global for page transitions
- `date-fns` — Date formatting
- `lucide-react` — Icons

### Internal Components (reuse as-is)
- `StaffTable`, `PayrollTable`, `AttendanceLedger`, `ReviewModeration` — Already extracted
- `DrillDownLineChart`, `SalarySlipModal`, `SwipeButton` — Working components
- `ManageExhibits` — Phase 3 output, working

### No New Dependencies Required
The entire phase can be implemented with existing packages. No new npm installs needed.

## 7. Validation Architecture

### Automated Checks
1. **TypeScript compilation:** `npx tsc --noEmit` must pass after decomposition
2. **Build verification:** `npm run build` must complete without errors
3. **Component rendering:** Each extracted component must render without runtime errors
4. **Responsive breakpoints:** Sidebar collapses correctly at 768px and 1024px

### Manual Verification Points
1. Manager sidebar navigation switches views correctly
2. All 7 sidebar views load and display data
3. Staff Sheet opens from staff table row click
4. All 4 modals (Add Staff, Shift Edit, Payroll Run, Deduction) open and submit
5. Mobile check-in overlay appears when staff is not checked in
6. Check-in overlay dismisses after successful check-in
7. Today's Overview shows correct stat cards with live data

---

## RESEARCH COMPLETE

**Files analyzed:** 12
**Key insight:** The Manager Dashboard already has sidebar navigation and most sub-components extracted. This is primarily a decomposition and mobile-responsiveness phase, not a full rewrite. Estimated 8 new component files, 0 new dependencies.
