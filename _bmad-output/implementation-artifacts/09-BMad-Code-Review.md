# BMad Code Review Report: Auth & User Implementation

## 1. Blind Hunter (Immediate Technical Faults)

* **[CRITICAL] Runtime Crash in Registration:**
  In `backend/src/controllers/authController.ts`, the code attempts to create a profile using `tx.customer_profile.create(...)`. However, Prisma generates delegate names based on the camelCased model name. Because the model is named `CustomerProfile`, the correct syntax is `tx.customerProfile.create(...)`. The current code will throw `TypeError: Cannot read properties of undefined (reading 'create')` during registration.

* **[HIGH] Missing JWT Signature Check on Refresh:**
  In `backend/src/controllers/authController.ts` (the `refresh` function), the code queries the database for the refresh token and checks its expiration, but it completely fails to call `verifyRefreshToken(refreshToken)`. This means it does not validate the cryptographic signature or secret of the provided token.

* **[HIGH] Frontend Refresh Token Handling Missing:**
  In `frontend/src/api/apiClient.ts`, there is no response interceptor to handle `401 Unauthorized` responses. The refresh token logic is implemented on the backend, but the frontend will never automatically request a new access token when the current one expires, breaking the user session.

## 2. Edge Case Hunter (Logic Flaws)

* **[MEDIUM] Lockout Reset Edge Case:**
  In `login` (`authController.ts`), if an account becomes locked (`failed_login_attempts >= 5`), the user must wait 15 minutes. However, if the lock expires and the user enters the *wrong* password again, the attempts counter continues from 5, instantly locking the account for another 15 minutes. The attempts counter should reset to 1 if the `locked_until` period has passed and a failed attempt occurs.

* **[MEDIUM] Empty String Unique Constraints:**
  If the frontend sends an empty string `""` for `email` or `phone` during registration, the validation allows it (due to `checkFalsy: true` coupled with `.optional()`). However, Prisma will attempt to insert the `""` string. A second user registering with an empty string will trigger a unique constraint violation on the database. Empty strings must be coalesced to `null` before insertion.

* **[LOW] Unverified Session Hydration on Frontend:**
  In `frontend/src/context/AuthContext.tsx`, on initial load, the app immediately considers the user authenticated if `user` and `accessToken` exist in `localStorage`. It does not call the `/me` endpoint to verify if the token is still valid. If the token is expired, the user sees protected routes briefly before API calls fail.

## 3. Acceptance Auditor (Security & Standards)

* **[MEDIUM] Token Storage Security:**
  Tokens are returned in the response body and stored in `localStorage` in `AuthContext.tsx`. Storing refresh tokens in `localStorage` makes them susceptible to XSS attacks. The `refreshToken` should ideally be issued as an `HttpOnly` cookie.

* **[LOW] Lack of Refresh Token Rotation:**
  The `/refresh` endpoint generates a new access token but reuses the same refresh token. Implementing Refresh Token Rotation (returning a new refresh token and deleting the old one) is strongly recommended for enhanced security.

* **[LOW] Hardcoded Salt Rounds:**
  In `authController.ts`, `const saltRounds = 12` is hardcoded. It is best practice to pull cost factors from `.env` to allow environments (like testing vs prod) to scale the hashing workload appropriately.