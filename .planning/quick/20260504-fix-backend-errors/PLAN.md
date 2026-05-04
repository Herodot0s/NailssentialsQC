---
status: in-progress
---

# Quick Task: Fix Backend Build Errors

The backend build (`npm run build`) is failing with 26 TypeScript errors in 8 files. This task involves fixing these errors to achieve a clean build.

## Errors Identified

1.  **Type Mismatches in `src/controllers/appointmentAvailability.ts`**:
    *   `dateStr` from `req.query` is `string | ParsedQs`. Needs to be cast or checked as `string`.
    *   `userId` (from `req.user.id`) is `string | number`, but Prisma expects `number`.

2.  **Type Mismatches in `src/controllers/appointmentCompletion.ts`**:
    *   `id` from `req.params` or `req.query` is `string | string[]`. Needs to be checked or cast as `string`.

3.  **Request Extension Issues in `src/controllers/authController.ts` & `src/middleware/authMiddleware.ts`**:
    *   `validatedBody` property is missing from the Express `Request` type.
    *   `JwtPayload` mismatch in `verifyRefreshToken`.

4.  **Type Mismatches in `src/controllers/messageController.ts`**:
    *   `userId` and `senderId` mismatches (Prisma expects `number`).
    *   `id` from `req.params` needs check/cast.

5.  **Type Mismatches in `src/controllers/notificationController.ts`**:
    *   `userId` mismatch.

6.  **Type Mismatches in `src/controllers/reviewController.ts`**:
    *   `userId` and `staffId` mismatches.

7.  **Type Mismatches in `src/controllers/serviceController.ts`**:
    *   `parentId` from `req.query` mismatch.

## Proposed Fixes

1.  **Extend Express Request**: Update the global type definition or the specific middleware to include `validatedBody`.
2.  **Cast Query/Params**: Explicitly cast or check `req.query` and `req.params` values to `string` before passing to `parseInt` or other functions.
3.  **Cast User ID**: Ensure `req.user.id` is cast to `number` (after verification) before using it in Prisma queries.
4.  **Fix JWT Types**: Align `AppJwtPayload` with `JwtPayload` or use a type assertion where safe.

## Tasks

- [ ] Extend Express Request type to include `validatedBody`
- [ ] Fix errors in `src/controllers/appointmentAvailability.ts`
- [ ] Fix errors in `src/controllers/appointmentCompletion.ts`
- [ ] Fix errors in `src/controllers/authController.ts`
- [ ] Fix errors in `src/controllers/messageController.ts`
- [ ] Fix errors in `src/controllers/notificationController.ts`
- [ ] Fix errors in `src/controllers/reviewController.ts`
- [ ] Fix errors in `src/controllers/serviceController.ts`
- [ ] Fix errors in `src/middleware/authMiddleware.ts`
- [ ] Verify build with `npm run build`
