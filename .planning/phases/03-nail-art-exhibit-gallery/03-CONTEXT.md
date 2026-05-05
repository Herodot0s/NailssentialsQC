# Phase 3: Nail Art Exhibit & Gallery - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a public "Nail Art Exhibit" gallery where customers can browse the salon's work and a management interface for salon managers to curate this gallery. It includes the database schema for exhibits, image upload integration with Vercel Blob, and the public-facing masonry gallery.

</domain>

<decisions>
## Implementation Decisions

### Gallery Presentation & UX
- **D-01:** Implement the public gallery using a **Masonry Grid Layout** (dynamic heights) for a modern, creative aesthetic.
- **D-02:** Use a **Masonry Component Library** (e.g., `react-masonry-css`) to ensure robust handling of dynamic item heights and image loading states.
- **D-03:** The gallery serves as **Inspiration Only** — it will display the service and artist details but will not provide a direct "Book this look" button that pre-fills the booking ritual.

### Data Model & Metadata
- **D-04:** Each exhibit item must capture a **Title**, **Image URL** (Vercel Blob), **Artist Credit**, and an **Optional Service Link**.
- **D-05:** **Artist Credits** must be linked to an existing `StaffProfile` record to maintain data integrity and allow for future "View all work by this artist" features.
- **D-06:** **Service Linking** is optional, allowing for generic nail art examples that may not map to a specific catalog item.

### Management CMS
- **D-07:** Implement a **Basic List Management** interface for managers to perform CRUD operations on exhibits (Upload, Edit Details, Delete).
- **D-08:** Reuse the existing `uploadFile` and `deleteFile` logic from `uploadController.ts` for handling media.

### Claude's Discretion
- Precise Masonry column counts and breakpoints.
- Detail view layout for individual exhibit items (Modal vs Overlay).
- Specific styling of the "Artist" and "Service" labels within the gallery cards.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data & Backend
- `backend/prisma/schema.prisma` — Needs update to include the `Exhibit` model.
- `backend/src/controllers/uploadController.ts` — Core logic for Vercel Blob image handling.

### Design & Foundations
- `airbnb/DESIGN.md` — Visual reference for grid spacing and card aesthetics.
- `.planning/phases/01-premium-ui-foundations/01-CONTEXT.md` — Global design tokens and radii (`rounded-3xl` for cards).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/controllers/uploadController.ts`: `uploadFile` can be leveraged for the exhibit upload flow.
- `CustomerProfile` image handling: Pattern for storing Vercel Blob URLs in the database.

### Established Patterns
- `StaffProfile` relationship: Linking exhibits to staff follows the same pattern as `AppointmentItem` -> `StaffProfile`.

### Integration Points
- `backend/prisma/schema.prisma`: A new `Exhibit` model is required to persist gallery items.
- `frontend/src/pages/Gallery.tsx`: New public-facing page to be created.
- `frontend/src/pages/manager/ExhibitCMS.tsx`: New management interface for curating the gallery.

</code_context>

<specifics>
## Specific Ideas
- "Nail Art Exhibit" as the public branding for the gallery.
- Use `react-masonry-css` for the frontend implementation.

</specifics>

<deferred>
## Deferred Ideas
- **Reorderable Gallery Builder**: Deferred to future phases; Phase 3 focuses on basic CRUD.
- **"Book this look" Integration**: Deferred to avoid complexity in the booking ritual state machine for now.

</deferred>

---

*Phase: 03-Nail Art Exhibit & Gallery*
*Context gathered: 2026-05-05*
