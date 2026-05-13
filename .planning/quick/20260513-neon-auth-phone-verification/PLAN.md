# Plan: Neon Auth Integration and Phone Verification

Implement Neon Auth (Clerk integration) for user authentication and enforce verification rules for bookings.

## Phase 1: Infrastructure & Schema
- [x] Install Clerk SDKs in backend and frontend.
- [x] Add `clerk_id` to `User` model in `schema.prisma`.
- [x] Run Prisma migration to update the database.
- [x] Configure environment variables for Clerk.

## Phase 2: Backend Authentication
- [x] Update `authMiddleware.ts` to verify Clerk JWTs.
- [x] Create/Update `authController.ts` to handle user syncing (webhook or on-login sync).
- [x] Update `User` model queries to support `clerk_id`.

## Phase 3: Booking Restrictions
- [x] Update `appointmentController.ts` to:
    - [x] Verify user is authenticated via Clerk.
    - [x] Check if the user's email or phone is verified (via Clerk data).
    - [x] Ensure `phone` is present in the user profile or provided in the booking request.
- [ ] Update `validateZod` schemas for appointments to require phone number if not in profile.

## Phase 4: Frontend Integration
- [x] Initialize Clerk in the frontend application.
- [x] Replace custom login/register pages with Clerk's `SignIn` and `SignUp` components.
- [x] Update API client to include Clerk JWT in headers.
- [x] Update booking flow to prompt for phone number if missing.


## Verification
- [ ] Verify user can sign up/login via Clerk.
- [ ] Verify booking is blocked for unverified users.
- [ ] Verify booking is blocked if phone number is missing.
- [ ] Verify successful booking after meeting all criteria.
