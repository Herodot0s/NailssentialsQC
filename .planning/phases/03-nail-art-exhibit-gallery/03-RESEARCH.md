# Phase 03: Nail Art Exhibit & Gallery - Research

**Researched:** 2026-05-05
**Domain:** Frontend (Masonry Gallery), Backend (CRUD API, Vercel Blob)
**Confidence:** HIGH

## Summary

This phase focuses on the "Nail Art Exhibit," a public-facing gallery showcasing salon quality. It requires a modern Masonry grid for visual appeal and a management interface for staff to curate content. The implementation leverages existing Vercel Blob integration for image hosting and establishes a new `Exhibit` entity in the database linked to `StaffProfile` (Artists) and `Service` (optional catalog link).

**Primary recommendation:** Use `react-masonry-css` for the gallery layout to handle dynamic image heights gracefully, and strictly follow the "Inspiration Only" decision to avoid booking ritual complexity.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Implement the public gallery using a **Masonry Grid Layout** (dynamic heights) for a modern, creative aesthetic.
- **D-02:** Use a **Masonry Component Library** (e.g., `react-masonry-css`) to ensure robust handling of dynamic item heights and image loading states.
- **D-03:** The gallery serves as **Inspiration Only** — it will display the service and artist details but will not provide a direct "Book this look" button that pre-fills the booking ritual.
- **D-04:** Each exhibit item must capture a **Title**, **Image URL** (Vercel Blob), **Artist Credit**, and an **Optional Service Link**.
- **D-05:** **Artist Credits** must be linked to an existing `StaffProfile` record to maintain data integrity and allow for future "View all work by this artist" features.
- **D-06:** **Service Linking** is optional, allowing for generic nail art examples that may not map to a specific catalog item.
- **D-07:** Implement a **Basic List Management** interface for managers to perform CRUD operations on exhibits (Upload, Edit Details, Delete).
- **D-08:** Reuse the existing `uploadFile` and `deleteFile` logic from `uploadController.ts` for handling media.

### the agent's Discretion
- Precise Masonry column counts and breakpoints.
- Detail view layout for individual exhibit items (Modal vs Overlay).
- Specific styling of the "Artist" and "Service" labels within the gallery cards.

### Deferred Ideas (OUT OF SCOPE)
- **Reorderable Gallery Builder**: Deferred to future phases; Phase 3 focuses on basic CRUD.
- **"Book this look" Integration**: Deferred to avoid complexity in the booking ritual state machine for now.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-01 | Public "Nail Art Exhibit" gallery with masonry grid. | `react-masonry-css` identified as the standard for this layout. [D-01, D-02] |
| REQ-02 | Manager CRUD for uploading images via Vercel Blob. | Existing `uploadController.ts` verified for reuse. [D-07, D-08] |
| REQ-03 | Link images to StaffProfile (Artist) and optionally to a Service. | `Exhibit` model drafted with relations to `StaffProfile` and `Service`. [D-04, D-05, D-06] |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Masonry Layout | Browser (React) | — | Purely visual layout logic managed by client-side library. |
| Image Storage | Vercel Blob | — | External CDN for high-performance image serving and persistence. |
| Exhibit Metadata | Database (Prisma) | API | Title, artist, and service links stored in PostgreSQL. |
| Exhibit CRUD | API (Node/Express) | — | Business logic for validating artist/service links and managing records. |
| Artist Selection | API (Node/Express) | Browser | Backend provides available staff; UI allows selection. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-masonry-css` | ^1.0.16 | Masonry grid layout | [VERIFIED: npm registry] Lightweight, widely used with React. |
| `@vercel/blob` | ^0.27.1 | Image hosting | [VERIFIED: package.json] Project standard for media. |
| `lucide-react` | ^0.474.0 | UI Icons | [VERIFIED: package.json] Project standard for icons. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `framer-motion` | ^12.38.0 | Hover effects | Page transitions and image reveal animations. |

**Installation:**
```bash
# Frontend
npm install react-masonry-css
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── pages/
│   ├── Gallery.tsx           # Public Masonry Gallery
│   └── manager/
│       └── ExhibitCMS.tsx    # Manager-only Exhibit CRUD
└── components/
    └── gallery/
        ├── ExhibitCard.tsx    # Individual gallery item
        └── ExhibitDialog.tsx  # CRUD Form (Dialog pattern)
backend/src/
├── routes/
│   └── exhibitRoutes.ts      # New routes
└── controllers/
    └── exhibitController.ts  # CRUD logic
```

### Pattern 1: Image Upload Lifecycle
**What:** Decoupled upload and metadata save.
**When to use:** In the Exhibit CMS to avoid complex multipart/JSON combined requests.
**Flow:**
1. Frontend calls `/api/upload` (multipart) -> returns URL.
2. Frontend calls `/api/exhibits` (JSON) with metadata + URL.
3. On record deletion, frontend (or backend hook) calls `deleteFile` to clean up Vercel Blob.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Masonry Grid | Custom Flex/Grid CSS | `react-masonry-css` | Hand-rolling masonry (columns with dynamic heights) is error-prone and requires complex DOM measuring. |
| Multi-file selection | Custom drag-and-drop | `Input type="file"` | Standard browser input is sufficient for basic CRUD and more accessible. |

## Common Pitfalls

### Pitfall 1: Layout Thrashing (Cumulative Layout Shift)
**What goes wrong:** Images load at different times, causing the masonry columns to jump around.
**Why it happens:** Browser doesn't know the image dimensions until they download.
**How to avoid:** Use a placeholder (skeleton or solid color) or pass `aspect-ratio` if known. Since Blob URLs don't provide dimensions, use `framer-motion` for a smooth fade-in once loaded.

### Pitfall 2: Orphaned Blobs
**What goes wrong:** Deleting a database record but leaving the image in Vercel Blob.
**Why it happens:** Metadata and storage are decoupled.
**How to avoid:** Ensure the `deleteExhibit` controller calls the Blob deletion logic before or after removing the Prisma record.

## Code Examples

### Prisma Model (backend/prisma/schema.prisma)
```prisma
// Link to StaffProfile and Service
model Exhibit {
  id           Int      @id @default(autoincrement())
  title        String
  image_url    String
  staff_id     Int
  service_id   Int?
  is_active    Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  artist  StaffProfile @relation(fields: [staff_id], references: [id])
  service Service?     @relation(fields: [service_id], references: [id])

  @@index([staff_id])
  @@index([service_id])
  @@map("exhibits")
}

// BACK-REFERENCES required in existing models:
// StaffProfile: exhibits Exhibit[]
// Service: exhibits Exhibit[]
```

### API Endpoint: Create Exhibit (backend/src/controllers/exhibitController.ts)
```typescript
export const createExhibit = async (req: Request, res: Response) => {
  try {
    const { title, image_url, staff_id, service_id } = req.body;

    const exhibit = await prisma.exhibit.create({
      data: {
        title,
        image_url,
        staff_id: parseInt(staff_id),
        service_id: service_id ? parseInt(service_id) : null,
      },
      include: {
        artist: true,
        service: true
      }
    });

    return res.status(201).json({ success: true, data: exhibit });
  } catch (error) {
    console.error('Create exhibit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create exhibit' });
  }
};
```

### Frontend Masonry Implementation (frontend/src/pages/Gallery.tsx)
```tsx
import Masonry from 'react-masonry-css';

const Gallery = () => {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl mb-8">Nail Art Exhibit</h1>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {exhibits.map(exhibit => (
          <ExhibitCard key={exhibit.id} exhibit={exhibit} />
        ))}
      </Masonry>
    </div>
  );
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multi-page Gallery | Infinite Scroll / Masonry | 2020+ | Better UX for visual-heavy content. |
| Local Uploads | Edge/Blob Storage | 2023+ | Faster image delivery (Vercel Blob). |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `react-masonry-css` is compatible with React 19. | Standard Stack | LOW. If incompatible, `react-plock` or CSS Grid `masonry` (experimental) are fallbacks. |
| A2 | Vercel Blob token is already in `.env`. | Architecture | MEDIUM. If missing, manager upload will fail. |

## Open Questions

1. **Detail View**: Should clicking an image open a full-screen lightbox or a side-drawer with details?
   - *Recommendation*: Start with a simple Radix UI Dialog (Lightbox) as it aligns with the "Inspiration Only" goal.
2. **Staff Access**: Does the manager want staff to be able to upload their own work, or is it strictly for managers?
   - *Recommendation*: Locked to `manager` per D-07, but can be expanded later.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vercel Blob | Image Storage | ✓ | ^0.27.1 | Local storage (not recommended) |
| PostgreSQL | Data layer | ✓ | 15+ | — |
| Node.js | Backend | ✓ | 20+ | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-01 | Public Gallery renders items | Integration | `npm test Gallery.test.tsx` | ❌ Wave 0 |
| REQ-02 | Upload API returns Blob URL | Unit | `npm test uploadController.test.ts` | ❌ Wave 0 |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Zod schemas for exhibit metadata |
| V12 File Upload | yes | Mime-type checking in `uploadController.ts` |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Insecure Direct Object Reference (IDOR) | Tampering | Restrict `deleteExhibit` to `manager` role only. |
| Malicious File Upload | Elevation of Privilege | Restrict mime-type to `image/*` and limit file size (4MB). |

## Sources

### Primary (HIGH confidence)
- `backend/src/controllers/uploadController.ts` - Verified Vercel Blob implementation.
- `backend/prisma/schema.prisma` - Existing schema structure.
- `frontend/tailwind.config.js` - Global design tokens.

### Secondary (MEDIUM confidence)
- `react-masonry-css` documentation - Verified implementation pattern.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are standard and versions verified.
- Architecture: HIGH - Follows existing project patterns.
- Pitfalls: MEDIUM - Relying on smooth CSS/Framer transitions.

**Research date:** 2026-05-05
**Valid until:** 2026-06-05
