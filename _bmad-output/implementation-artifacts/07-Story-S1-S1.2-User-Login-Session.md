# Story: S1.2 - User Login & Session

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 1: Foundation & Security  
**Status:** ✅ COMPLETE  
**Type:** User Story  

---

## 1. Description
**Goal:** Allow users to authenticate with their email/phone and password, and maintain a secure session using JWTs.

**User Statement:**
As a registered user, I want to log in to my account so that I can access my personalized dashboard and book appointments.

**Technical Context:**
- **Backend:** Node/Express endpoint `/api/v1/auth/login`.
- **Database:** Prisma `User` model, `RefreshToken` model.
- **Security:** Password verification with Bcrypt, JWT for session management, login attempt tracking.
- **Frontend:** React login form, `AuthContext` for global auth state.

---

## 2. Acceptance Criteria
- [x] Backend endpoint `POST /api/v1/auth/login` accepts `identifier` (email or phone) and `password`.
- [x] Backend verifies password using `bcrypt.compare`.
- [x] Backend issues an Access Token (2h) and a Refresh Token (30d).
- [x] Backend tracks failed login attempts and implements a lockout (5 attempts, 15m).
- [x] Frontend `AuthContext` provides `user`, `login`, `logout`, and `isAuthenticated`.
- [x] Frontend Login page with validation and error handling.
- [x] Frontend implements "Remember Me" logic (persistent session).
- [x] Unauthorized access to protected routes redirects to Login.

---

## 3. Tasks

### 3.1 Backend Implementation
- [x] **Task 1: Implement Login Logic**
  - Create `login` function in `authController.ts`.
  - Add logic to verify identifier (email or phone).
  - Add failed attempt tracking and lockout logic.
- [x] **Task 2: Auth Middleware**
  - Create `authMiddleware.ts` to protect routes using the access token.
- [x] **Task 3: Refresh Token Endpoint**
  - Create `POST /api/v1/auth/refresh` to issue new access tokens.

### 3.2 Frontend Implementation
- [x] **Task 4: Create AuthContext**
  - Implement a provider to manage user state and token storage.
- [x] **Task 5: Create Login Page**
  - Implement the UI with `identifier`, `password`, and `rememberMe`.
  - Connect to the backend login endpoint.
- [x] **Task 6: Protected Routes**
  - Create a wrapper component to protect routes based on authentication state.

---

## 4. Technical Notes
- **Identifier:** The login endpoint checks both `email` and `phone` fields in the database for the provided `identifier`.
- **Lockout:** Implemented using `failed_login_attempts` and `locked_until` fields in the `User` model.
- **Remember Me:** Persistent session implemented using `localStorage` for tokens and user data.
- **Note:** Final integration verification pending live MySQL database connectivity.
