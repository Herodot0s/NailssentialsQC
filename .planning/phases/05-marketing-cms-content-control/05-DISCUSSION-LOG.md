# Phase 5: Marketing CMS & Content Control — Discussion Log

**Phase:** 05-marketing-cms-content-control
**Date:** 2026-05-05
**Status:** Complete — CONTEXT.md written

---

## Areas Discussed

### Area A — Content Scope

**A1 — Which landing page sections become manager-editable?**
- Options: Hero only / Hero + Signature Experience / Hero + Philosophy + Signature Experience + Footer CTA / You decide
- **Selected:** You decide → Agent picked **Hero + Signature Experience + Footer CTA** (~12 fields). Philosophy pillars are structurally coupled to icons/JSX layout and rarely change as marketing copy.

**A2 — Should Contact Info be part of Phase 5 scope?**
- Options: Add Contact Info section to landing page / Skip contact info / You decide
- **Selected:** Add a Contact Info section to the landing page (phone, address, hours, email, Google Maps link)

**A3 — What contact fields does the salon need?**
- Options: Basic (phone + address + hours) / Extended (phone + address + hours + email + Google Maps link) / You decide
- **Selected:** Extended — all 5 fields

**A4 — Should Contact Info be manager-toggled or always visible?**
- Options: Always visible / Manager-toggled / You decide
- **Selected:** Always visible — gracefully hides itself if all fields are empty

---

### Area B — Policies & FAQ Structure

**B1 — How is FAQ content structured?**
- Options: Structured Q&A pairs / Single freeform text block / You decide
- **Selected:** You decide → Agent picked **Structured Q&A pairs** (individual DB records, mirrors Exhibit pattern)

**B2 — How are salon policies structured?**
- Options: Named policy blocks / Unified SiteContent model with type enum / You decide
- **Selected:** You decide → Agent picked **Unified SiteContent model** (`type: 'faq' | 'policy'`) — one table for both content types

**B3 — Where does public policies/FAQ content render?**
- Options: Dedicated /policies page / Section on landing page / Both
- **Selected:** Both — FAQ accordion on landing page + full content on /policies page

**B4 — Should landing page show all FAQs or a curated subset?**
- Options: All active FAQ records / Top N only with "View all" link / You decide
- **Selected:** You decide → Agent picked **top 5 by sort_order** with "View all FAQs →" link to /policies

---

### Area C — Content Storage Model

**C1 — Where does landing page content live in the database?**
- Options: Extend SystemSettings / New dedicated SiteContent table / You decide
- **Selected:** You decide → Agent picked **two purpose-built models**: `SiteSettings` (landing copy, key-value) + `SiteContent` (FAQ/policies, records). SystemSettings remains operational config only.

**C2 — How does the frontend fetch CMS content?**
- Options: API call on page load / React Query with stale-while-revalidate / You decide
- **Selected:** You decide → Agent picked **React Query with staleTime: 10 minutes** — CMS content changes rarely; established pattern in codebase

**C3 — What happens when a CMS field has no value (fresh install)?**
- Options: Graceful fallback to hardcoded defaults / Show nothing / You decide
- **Selected:** You decide → Agent picked **graceful fallback to hardcoded defaults** — Prisma seed pre-populates SiteSettings; landing page always looks correct

**C4 — How does the manager save CMS changes?**
- Options: Explicit "Save Changes" button per section / Autosave on blur / You decide
- **Selected:** You decide → Agent picked **explicit "Save Changes" button per section** — matches all existing form patterns in manager dashboard

---

### Area D — CMS Interface Placement

**D1 — Where does the CMS editor live?**
- Options: New "Content" sidebar section in Manager Dashboard / Standalone /manager/cms route / You decide
- **Selected:** You decide → Agent picked **new "Content" sidebar section** — natural extension of Phase 4 sidebar pattern

**D2 — How is the CMS editor organized within the "Content" view?**
- Options: Tabbed layout (Landing Page / FAQ / Policies) / Vertical accordion sections / You decide
- **Selected:** You decide → Agent picked **tabbed layout** using existing shadcn Tabs — matches Staff Dashboard tab pattern

**D3 — Does the manager get a live preview?**
- Options: No preview — save and visit / Inline preview panel / You decide
- **Selected:** You decide → Agent picked **no preview** — significant extra scope; consistent with ManageExhibits pattern; deferred

**D4 — Is the "Content" sidebar item manager-only or available to staff?**
- Options: Manager-only / Manager + designated staff / You decide
- **Selected:** **Manager-only** — standard RBAC; no sub-roles in current system

---

## Deferred Ideas

| Idea | Reason Deferred |
|------|----------------|
| Live preview panel | Significant extra scope — future polish phase |
| Staff content editing access | Requires sub-roles not present in system |
| Rich text / WYSIWYG editor for policy body | Plain textarea sufficient for Phase 5 |
| Hero background image upload (drag-and-drop) | URL paste sufficient; full Vercel Blob upload UX is extra scope |
| Content versioning / history | Future phase capability |

---

*Discussion conducted: 2026-05-05*
*CONTEXT.md written: .planning/phases/05-marketing-cms-content-control/05-CONTEXT.md*
