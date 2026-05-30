---
slug: add-comment-and-image-to-reviews
title: Add custom comment and image uploads to customer reviews
date: 2026-05-30
status: in-progress
---

# Plan - Add Custom Comments and Image Uploads to Customer Reviews

## Tasks
- [ ] Update `backend/prisma/schema.prisma` with `comment` and `image_url` on `Review` model
- [ ] Run Prisma migration: `npx prisma migrate dev --name add_comment_and_image_to_reviews`
- [ ] Update `backend/src/controllers/reviewController.ts` to save comment and image URL
- [ ] Update `frontend/src/types/api.ts` with new API interfaces for Review/SubmitReviewRequest
- [ ] Update `frontend/src/pages/CustomerAppointments.tsx` to add custom comment box and upload image features to the rating modal
- [ ] Update `frontend/src/components/dashboard/customers/ReviewModeration.tsx` to display comment and thumbnail/image link in feedback moderation
- [ ] Verify reviews can be submitted and managed successfully
