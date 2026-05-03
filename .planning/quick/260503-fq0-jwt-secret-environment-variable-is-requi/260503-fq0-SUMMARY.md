---
status: complete
quick_id: 260503-fq0
description: JWT_SECRET environment variable is required but not set. Server cannot start. robust utility file (jwt.ts) that handles generating and verifying tokens with proper error handling and typing. make it secure
date: 2026-05-03
commit: ab52c33
---

## Summary

**Quick Task 260503-fq0: JWT utility improvements**

### Tasks Completed

1. **Task 1: Refactor jwt.ts with typed payloads, error handling, and token type discrimination** ✅
   - Added `AppJwtPayload` interface with proper typing (sub, email, role, type)
   - Added custom JWT error classes (`JwtMissingSecretError`, `JwtVerificationError`)
   - Added token type discrimination (access vs refresh) to prevent token mixing
   - Added `getTokenExpiration` utility function
   - Preserved fail-fast startup checks for JWT_SECRET and REFRESH_TOKEN_SECRET
   - Files: `backend/src/utils/jwt.ts`

2. **Task 2: Update authMiddleware.ts to use shared AppJwtPayload from jwt.ts** ✅
   - Removed local `AppJwtPayload` interface (now imported from jwt.ts)
   - Removed unnecessary type casts on `verifyAccessToken` calls
   - Files: `backend/src/middleware/authMiddleware.ts`

### Verification

- TypeScript compilation passed for both modified files
- All plan requirements met (token type checks, custom errors, shared types, fail-fast preserved)
- Backward compatibility maintained with existing authMiddleware.ts usage

### Commits

- `ab52c33`: feat(260503-fq0): refactor jwt.ts with typed payloads, error handling, and token type discrimination
- `628056e`: feat(260503-fq0): update authMiddleware.ts to use shared AppJwtPayload from jwt.ts
