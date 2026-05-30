# Plan - Add Custom Comments and Image Uploads to Customer Reviews

## Context
Currently, the NailssentialsQC system allows customers to rate their completed appointments only by selecting a 1-5 star rating and pre-selected praise tags (e.g., "Highly skilled", "Professional"). It does not allow customers to type custom, free-form text comments or upload photos of their completed service (e.g., of their polished nails) to include with their review. The only service photo is uploaded by staff/managers during the check-out process.

To make the review system feature-rich and increase trust/social proof, we need to extend the database schema and application layers to fully support custom user reviews complete with descriptive text comments and customer-provided pictures.

## Recommended Approach
We will add `comment` and `image_url` fields directly to the `Review` model in the PostgreSQL database using Prisma ORM. Then we will adapt the backend controller to accept and save these fields. Finally, we will enhance the frontend by:
1. Updating TypeScript API interfaces.
2. Integrating a text comment box and an image upload handler in the customer's review submission modal.
3. Adding comment display and thumbnail preview links in the manager's feedback moderation table.

## Critical Files to Modify

### 1. Database Schema
- **Path**: `c:\Users\Administrator\Desktop\nailssentialsqc-system\backend\prisma\schema.prisma`
- **Changes**: Add the following fields to the `Review` model:
  ```prisma
  comment                String?
  image_url              String?
  ```
- **Migration**: Run `npx prisma migrate dev --name add_comment_and_image_to_reviews` in `backend/` to apply database changes.

### 2. Backend Controller
- **Path**: `c:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\reviewController.ts`
- **Changes**:
  - In `submitReview`, destructure `comment` and `imageUrl` from `req.body`.
  - Pass `comment: comment || null` and `image_url: imageUrl || null` when invoking `prisma.review.create`.

### 3. Frontend Types
- **Path**: `c:\Users\Administrator\Desktop\nailssentialsqc-system\frontend\src\types\api.ts`
- **Changes**:
  - Update `SubmitReviewRequest` to include optional `comment` and `imageUrl` properties.
  - Update `Review` to include optional/nullable `comment` and `image_url` properties.

### 4. Frontend Review Submission Modal
- **Path**: `c:\Users\Administrator\Desktop\nailssentialsqc-system\frontend\src\pages\CustomerAppointments.tsx`
- **Changes**:
  - Add `comment: ''` and `imageUrl: ''` to the `reviewForm` state.
  - Add helper states `uploadingImage`, `imageError`, and ref `reviewFileInputRef` to manage the file upload life-cycle.
  - Reset these states in `handleOpenReview`.
  - Include the `comment` and `imageUrl` values in `handleSubmitReview` payload.
  - In the JSX inside the `<Dialog>` before `DialogFooter`, add a styled section for "Comments" (using `<Textarea>`) and "Add a Photo" (reusing the upload patterns with file inputs, previews, loaders, and removal buttons).

### 5. Frontend Review Moderation View
- **Path**: `c:\Users\Administrator\Desktop\nailssentialsqc-system\frontend\src\components\dashboard\customers\ReviewModeration.tsx`
- **Changes**:
  - Inside the "Client Feedback" `TableCell`, check if `review.comment` exists and render it in a clean, italicized container.
  - Check if `review.image_url` exists and render a small thumbnail image that links to the full URL (opening in a new tab on click) with a smooth hover overlay.

## Verification Plan

### End-to-End Test Steps
1. **Database Migration**: Ensure `npx prisma migrate dev` runs successfully and updates the DB.
2. **Review Submission (Customer)**:
   - Log in as a customer.
   - Navigate to "My Rituals" and find a completed appointment item.
   - Click "Rate Ritual".
   - Select stars, pick tags, type a test comment (e.g., "Amazing experience, very details-oriented!"), and upload a nail picture file.
   - Click "Publish Review" and confirm the API receives the request (status 201).
3. **Review Moderation (Manager)**:
   - Log in as a manager.
   - Navigate to "Customer Care" -> "Public Feedback" or the Reviews tab.
   - Verify that the new review shows the custom comment and the clickable thumbnail image in the moderation table.
   - Moderate the review (approve or reject) and verify the state updates.
