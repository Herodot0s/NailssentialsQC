# Quick Task: Auto-assign Clerk Role Metadata

## Objective
Automatically set `publicMetadata: { role: "customer" }` in Clerk when a new user signs up.

## Proposed Changes

### Backend
#### 1. Update `clerkWebhookController.ts`
- Import `clerkClient` from `@clerk/express`.
- In `handleClerkWebhook`, for `user.created` event:
  - If `public_metadata.role` is missing, update Clerk user metadata.

## Steps
1. Modify `backend/src/controllers/clerkWebhookController.ts`.
2. Verify logic.
