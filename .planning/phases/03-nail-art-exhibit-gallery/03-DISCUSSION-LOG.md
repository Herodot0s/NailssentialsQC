# Phase 3: Nail Art Exhibit & Gallery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 3-Nail Art Exhibit & Gallery
**Areas discussed:** Gallery Layout, Exhibit Metadata, Booking Bridge, Media CMS, Artist Linking, Service Linking, Masonry Implementation

---

## Gallery Layout & Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Masonry Grid | Dynamic heights, modern and creative (Pinterest style). | ✓ |
| Fixed Grid | Uniform squares, predictable and clean (Airbnb/Instagram style). | |
| Carousel Showcase | Showcase items one-by-one with focus. | |

**User's choice:** Masonry Grid
**Notes:** Preferred for its modern and creative feel.

---

## Exhibit Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Title + Image Only | Minimalist, image is the focus. | |
| Artist Credits | Include credits to the technician who created it. | ✓ |
| Linked Service | Link directly to the salon service used. | ✓ |

**User's choice:** Artist Credits (Technician), Linked Service (for booking)
**Notes:** The user wants to show who did the work and what service it was.

---

## Booking Bridge

| Option | Description | Selected |
|--------|-------------|----------|
| Direct 'Book This' Button | Users can click 'Book this look' to start the booking flow. | |
| Inspiration Only | Gallery is purely for visual inspiration; users book normally. | ✓ |

**User's choice:** Inspiration Only
**Notes:** Keeps the initial implementation simpler and focuses on discovery first.

---

## Media CMS

| Option | Description | Selected |
|--------|-------------|----------|
| Basic List Management | Simple list view with upload, title edit, and delete. | ✓ |
| Reorderable Builder | Managers can drag-and-drop to reorder how images appear. | |

**User's choice:** Basic List Management
**Notes:** Sufficient for the initial launch of the feature.

---

## Artist Linking

| Option | Description | Selected |
|--------|-------------|----------|
| Link to StaffProfile | Link to an existing staff member in the system. | ✓ |
| Free-text Artist Name | Free-text field for artist name. | |

**User's choice:** Link to StaffProfile
**Notes:** Ensures data integrity and leverages existing staff records.

---

## Service Linking

| Option | Description | Selected |
|--------|-------------|----------|
| Mandatory Service Link | Every exhibit MUST be tied to a service. | |
| Optional Service Link | Optional; some exhibits might just be generic examples. | ✓ |

**User's choice:** Optional Service Link
**Notes:** Provides flexibility for the gallery content.

---

## Masonry Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Pure CSS/Tailwind | Standard CSS columns/flex for minimal bundle size. | |
| Component Library | More robust handling (e.g. react-masonry-css). | ✓ |

**User's choice:** Masonry Component Library
**Notes:** Chosen for robustness and better handling of dynamic layouts.

---

## Claude's Discretion

- Precise column counts and responsive breakpoints for the masonry grid.
- Visual styling of metadata overlays/cards in the gallery.
- Specific implementation details of the CMS list (e.g. pagination or infinite scroll for managers).

## Deferred Ideas

- **Reorderable Gallery Builder**: Noted for future CMS enhancements.
- **Direct 'Book this look' Integration**: Postponed to avoid scope creep in the booking flow logic.
