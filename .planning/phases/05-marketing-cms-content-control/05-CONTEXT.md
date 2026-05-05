# Phase 5: Marketing CMS & Content Control - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase gives managers full self-service control over the salon's public-facing information — landing page copy, contact info, FAQ, and salon policies — without touching code. It delivers:
1. Two new Prisma models (`SiteSettings`, `SiteContent`) to persist CMS data
2. A backend CMS API (manager-only RBAC)
3. A "Content" tab in the Manager Dashboard sidebar (Phase 4 shell)
4. A refactored landing page (`Home.tsx`) that reads from the DB with hardcoded fallback defaults
5. A new public `/policies` page listing all policies and FAQs

</domain>

<decisions>
## Implementation Decisions

### Content Scope — Landing Page Sections
- **D-01:** The following landing page sections become manager-editable: **Hero** (tagline, headline, subheadline, background image URL, primary button label), **Signature Experience** (label, headline, body paragraph, link label), and **Footer CTA** (headline, button label). ~12 fields total. Philosophy pillars are structurally coupled to icons/layout and remain hardcoded.
- **D-02:** A new **Contact Info section** is added to the landing page (net-new, does not exist yet). Editable fields: phone number, address, operating hours, email, Google Maps embed/link (5 fields). Section renders below the Signature Experience section. If all contact fields are empty in the DB, the section gracefully hides itself — no toggle needed.

### Policies & FAQ Structure
- **D-03:** FAQ content uses **structured Q&A pairs** — each FAQ is its own `SiteContent` record (`type: 'faq'`). Manager adds/edits/deletes individual FAQ items. Renders as an accordion.
- **D-04:** Salon policies use the same **unified `SiteContent` model** with `type: 'policy'`. One Prisma model, one controller, one CRUD interface covers both FAQs and policies.
- **D-05:** FAQ accordion appears on the **landing page** (top 5 by `sort_order`) with a "View all FAQs →" link to `/policies`. The `/policies` page shows all active FAQs + all active policies in full. Manager controls prominence via `sort_order` and `is_active`.

### Content Storage
- **D-06:** **`SiteSettings`** (new Prisma model) stores landing page copy as `{ section, key, value, updated_at }` key-value rows. Separate from the existing `SystemSettings` model (which handles operational config like sales targets). A Prisma seed populates `SiteSettings` with the current hardcoded strings as defaults on first deploy.
- **D-07:** **`SiteContent`** (new Prisma model) stores FAQ and policy records as `{ type, title, body, sort_order, is_active, created_at, updated_at }`.
- **D-08:** Frontend fetches CMS content via **React Query with `staleTime: 10 minutes`**. CMS content changes rarely — no need for fresh fetch on every page load. Manager saves trigger a React Query cache invalidation via mutation.
- **D-09:** Landing page components use **graceful fallback to hardcoded defaults** when DB values are null/missing. The landing page always looks correct even before the manager configures anything.
- **D-10:** Manager saves via **explicit "Save Changes" button per section** (not autosave). Matches all existing form patterns in the manager dashboard.

### CMS Interface
- **D-11:** CMS editor lives as a new **"Content" sidebar nav item** in the Manager Dashboard (extending the Phase 4 sidebar shell). No new routing infrastructure — just a new view component registered in the existing sidebar nav.
- **D-12:** "Content" view uses a **tabbed layout**: "Landing Page" | "FAQ" | "Policies" tabs using the existing shadcn `Tabs` component pattern.
- **D-13:** **No live preview** — manager saves then visits the public landing page in a new tab to review. Consistent with how `ManageExhibits` works.
- **D-14:** "Content" sidebar item and all CMS API routes are **manager-only** (RBAC: `role === 'manager'`). No staff access.

### Agent's Discretion
- Specific tab icon choices for the "Content" sidebar item
- Exact layout of the Contact Info section on the landing page (grid vs. list vs. card)
- Accordion expand/collapse animation style for FAQ
- Field grouping within the "Landing Page" tab (whether hero fields are in a card vs. flat form)
- `/policies` page visual design and layout
- Error/success toast placement for save actions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Landing Page (Source of Truth for Current Content)
- `frontend/src/pages/Home.tsx` — All current landing page sections; hardcoded content to be DB-driven. Add Contact Info and FAQ accordion sections here.
- `frontend/src/components/home/Hero.tsx` — Hero section component with hardcoded headline/subheadline; wire to `SiteSettings`.
- `frontend/src/components/home/TrendingTreatments.tsx` — Already pulls from service catalog DB; no CMS changes needed here.

### Manager Dashboard (Extension Target)
- `frontend/src/pages/ManagerDashboard.tsx` — Phase 4 sidebar shell; add "Content" nav item and `ContentView` component here.

### Database & Backend
- `backend/prisma/schema.prisma` — Add `SiteSettings` and `SiteContent` models. `SystemSettings` already exists — do NOT repurpose it for CMS content.
- `backend/src/controllers/exhibitController.ts` — Reference pattern for manager-only CRUD controller (auth guard, error handling, response shape).
- `backend/src/routes/exhibitRoutes.ts` — Reference pattern for manager-only route registration with middleware.

### Design & Foundations
- `airbnb/DESIGN.md` — Visual reference for spacing, typography, and color tokens.
- `.planning/phases/04-operations-interface-overhaul/04-CONTEXT.md` — Phase 4 sidebar architecture decisions (D-01 through D-09).
- `.planning/phases/04-operations-interface-overhaul/04-UI-SPEC.md` — UI-SPEC for dashboard layout; CMS view must match this visual language.

### API Layer
- `frontend/src/api/apiClient.ts` — All API calls go through this client; add CMS endpoints here.
- `frontend/src/types/api.ts` — Add TypeScript types for `SiteSettings` and `SiteContent` API responses.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **shadcn `Tabs`** (`TabsList/TabsTrigger/TabsContent`) — Already used across dashboards; use for the CMS "Landing Page" | "FAQ" | "Policies" tab layout.
- **shadcn `Accordion`** — Use for FAQ display on landing page and `/policies` page.
- **shadcn `Card`, `Button`, `Input`, `Textarea`** — All styled with premium tokens; use for CMS editor forms.
- **React Query** (`useQuery` / `useMutation`) — Already established pattern for data fetching; apply `staleTime: 10 * 60 * 1000` for CMS queries.
- **`exhibitController.ts`** — Blueprint for the new `cmsController.ts`: same auth guard pattern, same Prisma client usage, same error response shape.

### Established Patterns
- **Manager RBAC guard** — `requireManagerRole` middleware already exists on exhibit routes; apply same pattern to all CMS routes.
- **Paginated/array API response guards** — `Array.isArray()` check before `.map()` (established from Phase 3 UAT). Apply to `SiteContent` list responses.
- **Premium typography** — `font-serif` for headings, `text-[10px] tracking-widest uppercase font-bold` for section labels.
- **Toast notifications** — Used across the dashboard for save/error feedback; use same pattern for CMS save actions.

### Integration Points
- **Manager Dashboard sidebar** (`ManagerDashboard.tsx`) — New `ContentView` component added as a sidebar nav option (alongside Staff, Payroll, Attendance, etc.).
- **`Home.tsx`** — Refactored to fetch from `/api/cms/settings` and `/api/cms/content?type=faq&limit=5` with fallback to current hardcoded strings.
- **New route `/policies`** — Registered in `App.tsx`; public (no auth required); fetches all active `SiteContent` records.
- **Prisma seed** (`backend/prisma/seed.ts` or equivalent) — Pre-populates `SiteSettings` with current hardcoded landing page strings so the landing page looks correct on first deploy.

</code_context>

<specifics>
## Specific Ideas
- `SiteSettings` key naming convention: `{section}.{field}` — e.g., `hero.headline`, `hero.tagline`, `contact.phone`, `footer.headline`.
- The "Content" sidebar icon could use `FileText` or `Layout` from lucide-react (agent's discretion).
- Contact Info section on the landing page should feel like a premium hotel footer — not a corporate directory. Use the Airbnb design tokens for clean whitespace and serif typography.

</specifics>

<deferred>
## Deferred Ideas
- **Live preview panel** — Side-by-side editor + rendered preview within the CMS. Significant extra scope; defer to a future polish phase.
- **Staff content editing access** — Allowing designated staff to edit content would require sub-roles. No sub-role system exists; deferred.
- **Rich text / Markdown editor** — A WYSIWYG editor for policy body text. Plain `<textarea>` is sufficient for Phase 5; upgrade later if needed.
- **Image upload for hero background** — Manager can paste an image URL into the hero background field, but a full drag-and-drop upload UX is deferred (Vercel Blob integration is significant extra scope).
- **Content versioning / history** — Rollback to previous content versions. Future phase capability.

</deferred>

---

*Phase: 05-Marketing CMS & Content Control*
*Context gathered: 2026-05-05*
