# Phase 4: Operations Interface Overhaul - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase redesigns the Manager Dashboard and Staff Dashboard into professional, distraction-free environments optimized for daily salon operations. The Manager Dashboard transforms from a monolithic 1,007-line single page into a sidebar-navigated admin panel. The Staff Dashboard gets mobile-first improvements for shift-based workflows. Both dashboards retain all existing functionality but restructure layout, navigation, and information hierarchy for a premium operational experience.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout & Navigation
- **D-01:** Manager Dashboard uses a **persistent sidebar navigation + content area** layout (like Notion/Linear). Each major section (Overview, Staff, Payroll, Attendance, Reviews, Scheduling, Exhibits) gets its own view accessible from the sidebar.
- **D-02:** The current monolithic `ManagerDashboard.tsx` (1,007 lines) must be decomposed into separate view components, each loaded by sidebar navigation state.
- **D-03:** Staff Dashboard keeps its existing tab structure (Schedule, Earnings, Messages) — it's simple enough and doesn't need sidebar complexity.

### Manager "Command Center" Priority
- **D-04:** The **default landing view** is "Today's Overview" — a glanceable morning-check summary showing: today's revenue, appointment count, active/checked-in staff, and pending reviews as status cards. Below the cards, today's appointment timeline.
- **D-05:** All other sections (Staff CRUD, Payroll, Attendance Ledger, Review Moderation, Scheduling, Exhibits) are accessible via sidebar navigation from this hub.

### Staff Mobile Experience
- **D-06:** Check-in/out uses a **full-screen takeover** on mobile. When staff opens the dashboard and hasn't checked in, the swipe-to-check-in dominates the entire viewport. After checking in, it collapses to a compact status bar and today's appointments take over.
- **D-07:** Appointments display as a **visual timeline/kanban** showing time slots with the current appointment highlighted. Must be touch-friendly and scannable on small screens.

### Visual Density & Information Hierarchy
- **D-08:** Use a **hybrid density approach**: overview/summary pages are spacious with large cards, generous whitespace, and big typography (the premium feel). Drill-down sections (payroll tables, attendance ledger, staff list) are compact and data-dense with operational tables (the back-office efficiency).
- **D-09:** Details are accessed through "View Details" expansions or sidebar navigation — not crammed into the overview.

### Claude's Discretion
- Specific sidebar icon choices and active-state styling.
- Exact card grid layouts for the overview (2-col, 3-col, 4-col breakpoints).
- Timeline component implementation approach (CSS Grid vs flexbox vs library).
- Animation and transition details between sidebar views.
- Responsive breakpoint for switching between sidebar and mobile layouts.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Dashboards (Source of Truth for Current Functionality)
- `frontend/src/pages/ManagerDashboard.tsx` — 1,007-line monolith to decompose. Contains all manager functionality.
- `frontend/src/pages/StaffDashboard.tsx` — 467 lines. Staff shift management, appointments, earnings, messaging.
- `frontend/src/pages/ManageExhibits.tsx` — Exhibit gallery management (already extracted in Phase 3).

### Dashboard Sub-Components (Already Extracted)
- `frontend/src/components/dashboard/StaffTable.tsx` — Staff CRUD table component.
- `frontend/src/components/dashboard/PayrollTable.tsx` — Payroll management table.
- `frontend/src/components/dashboard/AttendanceLedger.tsx` — Attendance tracking.
- `frontend/src/components/dashboard/ReviewModeration.tsx` — Review moderation panel.
- `frontend/src/components/DrillDownLineChart.tsx` — Analytics chart component.
- `frontend/src/components/SalarySlipModal.tsx` — Salary slip PDF generation.

### Design & Foundations
- `airbnb/DESIGN.md` — Visual reference for layout and spacing.
- `.planning/phases/03-nail-art-exhibit-gallery/03-CONTEXT.md` — Prior phase design decisions.

### API Layer
- `frontend/src/api/apiClient.ts` — All API endpoints used by dashboards.
- `frontend/src/types/api.ts` — TypeScript type definitions for API responses.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn` component library: Card, Table, Tabs, Select, Dialog, Sheet, Badge, Button — all already styled with premium tokens.
- `framer-motion` Button with scale animations already global.
- `SwipeButton` component for check-in/out gesture support.
- `DrillDownLineChart` for analytics visualization.
- `SalarySlipModal` for payroll PDF export.

### Established Patterns
- Tab-based navigation with `TabsList/TabsTrigger/TabsContent` (used in both dashboards).
- Paginated API responses requiring `Array.isArray()` guards (established pattern from Phase 3 UAT).
- Premium typography: `font-serif` for headings, `text-[10px] tracking-widest uppercase font-bold` for labels.
- Color system: `primary`, `muted-foreground`, `success-color`, `info-color`, `destructive`.

### Integration Points
- Manager sidebar state can use React state or URL-based routing (`/manager/overview`, `/manager/staff`, etc.).
- Staff full-screen check-in can use responsive classes or a dedicated mobile-first component.
- Existing dashboard sub-components (StaffTable, PayrollTable, etc.) can be lifted into sidebar views with minimal refactoring.

</code_context>

<specifics>
## Specific Ideas
- Sidebar should feel like a professional SaaS admin panel — compact, icon-led with text labels.
- Overview cards should use the existing Card component with subtle gradient backgrounds (already used in StaffDashboard earnings cards).
- The "Artisan Terminal" branding for staff and "Command Center" for manager.

</specifics>

<deferred>
## Deferred Ideas
- **Real-time updates via WebSocket** — Live appointment status updates. Too much infrastructure for this phase.
- **Drag-and-drop scheduling** — Visual schedule builder. Future phase capability.
- **Dark mode for staff** — Reduced eye strain during evening shifts. Theming deferred.

</deferred>

---

*Phase: 04-Operations Interface Overhaul*
*Context gathered: 2026-05-05*
