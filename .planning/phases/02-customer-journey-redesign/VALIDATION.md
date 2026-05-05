# Phase 2: Customer Journey Redesign - Validation Map

This document maps Phase 2 requirements to specific, verifiable tests (both automated and manual) to ensure high-stakes correctness and "Sanctuary" brand integrity.

## Requirement Coverage

| Req ID | Requirement | Test Type | Verification Asset |
|--------|-------------|-----------|--------------------|
| UI-02 | Premium Landing Page | Manual | Visual inspection of Hero & Typography |
| UI-02 | Trending Treatments Grid | Automated | `frontend/src/components/home/TrendingTreatments.test.tsx` |
| UI-02 | 4-Step Ritual Booking | Integration | `frontend/src/pages/BookingRitual.test.tsx` |
| UI-02 | Design Tokens (rounded-3xl) | Snapshot | `frontend/src/components/ui/Card.test.tsx` |

## Automated Verification

### Component Tests
- `TrendingTreatments.test.tsx`: Verifies that only `is_popular` services are rendered.
- `Hero.test.tsx`: Verifies presence of premium typography and Rausch CTA.
- `BookingRitual.test.tsx`: Verifies state transitions between the 4 steps (Selection → Artisan → Time → Review).

### Integration Tests
- `CartPersistence.test.tsx`: Verifies that selections are persisted in `CartContext` across step transitions.

## Manual Verification (The "Ritual" Check)
1. **Entry**: Open `/`, verify Hero image loads instantly and typography matches `airbnb/DESIGN.md`.
2. **Discovery**: Scroll to "Trending Treatments", verify services load dynamically.
3. **Selection**: Click "Book Now", verify transition to Booking Step 1 (Selection).
4. **Artisan**: Select an Artisan, verify "Continue" button enables.
5. **Time**: Select a slot, verify transition to Review.
6. **Persistence**: Refresh the page mid-ritual, verify the ritual resumes at the current step with data intact.

## Success Criteria (Nyquist Compliance)
- [ ] `npm test` passes with 0 failures in the `frontend` suite.
- [ ] No visual regressions in existing components after applying `rounded-3xl`.
- [ ] Mobile Lighthouse score for Performance/Accessibility > 90.
