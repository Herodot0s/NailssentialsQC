---
slug: add-comment-and-image-to-reviews
title: Add custom comment and image uploads to customer reviews
date: 2026-05-30
status: complete
commit: local
---

# Summary - Add Custom Comments and Image Uploads to Customer Reviews

We successfully added support for custom comments and image uploads in customer reviews.

## Changes Completed

### 1. Database & Prisma Schema
- Added optional `comment` (String?) and `image_url` (String?) fields to the `Review` model in `backend/prisma/schema.prisma`.
- Synchronized database schema using `npx prisma db push`.
- Generated updated Prisma Client types.

### 2. Backend API
- Updated `submitReview` controller in `backend/src/controllers/reviewController.ts` to accept `comment` and `imageUrl` (or `image_url`) in `req.body` and save them.
- Created mock-based integration unit tests in `backend/src/__tests__/reviews.test.ts`.

### 3. Frontend Types & UI
- Added `comment` and `imageUrl` options to `SubmitReviewRequest` and `Review` interfaces in `frontend/src/types/api.ts`.
- Enhanced "Rate Ritual" review submission modal in `frontend/src/pages/CustomerAppointments.tsx` to include:
  - Textarea for typing custom reviews.
  - Invisible file upload input triggered by an "Upload Photo" button.
  - Image upload spinner, error text, preview thumbnail, and photo removal functionality.
- Upgraded the feedback moderation view in `frontend/src/components/dashboard/customers/ReviewModeration.tsx` to display custom comments in styled blocks and clickable review image thumbnails that open in new tabs.

## Verification
- Ran backend unit tests: `reviews.test.ts` successfully executed and passed.
- Ran type checks on both `backend` and `frontend` projects: all compiled successfully with zero compilation or lint errors.
