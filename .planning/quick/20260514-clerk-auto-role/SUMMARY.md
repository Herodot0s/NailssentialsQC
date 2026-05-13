---
status: complete
---

# Quick Task Summary: Clerk Auto-Role Assignment

## Changes
- Modified `backend/src/controllers/clerkWebhookController.ts` to automatically assign the `customer` role to a user's `publicMetadata` in Clerk when the `user.created` webhook is received.
- This ensures that Clerk itself knows the user's role, making it available in JWT tokens and Clerk's user management dashboard.

## Next Steps
- Verify by creating a new user in the Clerk development environment and checking their metadata in the Clerk dashboard.
