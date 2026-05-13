# Plan: Sync Clerk Production Users

**Task:** Sync Clerk production users to the local database and ensure the system is aligned with production settings.

## Objectives
1. Import all existing users from Clerk Production into the local database.
2. Link existing local users to Clerk accounts if they share the same email.
3. (Optional but recommended) Implement a webhook endpoint for real-time synchronization.

## Steps

### Step 1: Manual Sync Script
- Create `backend/src/scripts/syncClerk.ts`.
- Use `clerkClient` to fetch all users.
- Upsert each user into the Prisma `User` and `CustomerProfile` tables.
- Handle roles: Default to `customer`, but check if there's any logic to determine other roles.

### Step 2: Webhook Implementation
- Create `backend/src/controllers/clerkWebhookController.ts`.
- Use `svix` for webhook verification (Clerk requirement).
- Handle `user.created`, `user.updated`, and `user.deleted` events.
- Update `backend/src/routes/authRoutes.ts` to include the webhook endpoint.
- (Manual action for user) Add the webhook URL in the Clerk Dashboard.

### Step 3: Verification
- Run the sync script.
- Check the database to ensure Clerk users are present.
- Test the webhook if possible (or provide instructions).

## Implementation Details

### User Mapping
- `clerk_id` -> `clerk_id`
- `primaryEmailAddress` -> `email`
- `firstName + lastName` -> `CustomerProfile.full_name`
- `username` (or fallback) -> `username`
