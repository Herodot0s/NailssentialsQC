# Phase 03: Nail Art Exhibit & Gallery - Validation

**Defined:** 2026-05-05
**Phase:** 03
**Status:** PENDING

## Validation Strategy

This phase uses a "Test-First" approach for the backend and "Component-First" for the frontend. We will verify the data integrity of exhibits, the reliability of image uploads via Vercel Blob, and the responsive behavior of the masonry grid.

## Requirements → Test Map

| Req ID | Requirement | Test Case | Test Type | Automated Command |
|--------|-------------|-----------|-----------|-------------------|
| CMS-01 | Public Gallery | Masonry grid renders all provided exhibit items | Integration | `npm test Gallery.test.tsx` |
| CMS-02 | Manager CRUD | API allows creating/deleting exhibits with Blob URLs | Unit | `npm test exhibitController.test.ts` |
| CMS-02 | Manager CRUD | Upload controller handles image files and returns URL | Unit | `npm test uploadController.test.ts` |
| CMS-01 | Artist Credit | Gallery item displays correct staff name from relation | Integration | `npm test ExhibitCard.test.tsx` |

## Wave 0: Test Skeletons

The following test files must be initialized before implementation begins:

- `backend/tests/exhibitController.test.ts`
- `backend/tests/uploadController.test.ts` (Update existing if needed)
- `frontend/src/pages/__tests__/Gallery.test.tsx`
- `frontend/src/components/gallery/__tests__/ExhibitCard.test.tsx`

## Verification Checklist

### Pre-Implementation
- [ ] Prisma schema is valid and migration can run.
- [ ] Vercel Blob tokens are present in `.env`.
- [ ] `react-masonry-css` is installed.

### Post-Implementation
- [ ] `npm run build` passes for both frontend and backend.
- [ ] `npm test` passes for all new tests.
- [ ] Exhibit images are correctly deleted from Vercel Blob when record is deleted.
- [ ] Masonry grid is responsive and handles different aspect ratios without layout thrashing.

## Success Criteria (Final Pass)
1. **Public View**: Customer can browse the gallery at `/gallery` and see the "Nail Art Exhibit" with masonry layout.
2. **Manager View**: Manager can add a new exhibit via the dashboard, upload an image, select an artist, and see it appear in the gallery.
3. **Data Integrity**: Deleting an exhibit removes both the DB record and the Vercel Blob file.
