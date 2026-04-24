# Story: S1.1 - Customer Registration

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 1: Foundation & Security  
**Status:** ✅ COMPLETE  
**Type:** User Story  

---

## 1. Description
**Goal:** Allow new customers to create an account by providing their name, email/phone, and password.

**User Statement:**
As a new customer, I want to register for an account so that I can book appointments online and track my history.

**Technical Context:**
- **Backend:** Node/Express endpoint `/api/v1/auth/register`.
- **Database:** Prisma `User` and `CustomerProfile` models.
- **Security:** Password hashing with Bcrypt, validation with `express-validator`.
- **Frontend:** React registration form with client-side validation.

---

## 2. Acceptance Criteria
- [x] Backend endpoint `POST /api/v1/auth/register` accepts `fullName`, `email`, `phone`, and `password`.
- [x] Backend validates:
  - `fullName` is not empty.
  - `email` or `phone` is provided and valid.
  - `password` is at least 8 characters.
- [x] Backend checks for duplicate email/phone.
- [x] Password is saved as a bcrypt hash.
- [x] Successful registration creates both a `User` and a `CustomerProfile` in a transaction.
- [x] Frontend registration form with validation messages.
- [x] Frontend redirects to login or dashboard (based on PRD "Automatic login after registration" - will implement basic JWT issuance).
- [x] Success/Error notifications are displayed to the user.

---

## 3. Tasks

### 3.1 Backend Implementation
- [x] **Task 1: Install Auth Dependencies**
  - `npm install bcrypt jsonwebtoken`
  - `npm install -D @types/bcrypt @types/jsonwebtoken`
- [x] **Task 2: Create Auth Controller & Route**
  - Implement registration logic with Prisma transaction.
  - Add input validation middleware.
- [x] **Task 3: JWT Utility**
  - Create a utility to generate access and refresh tokens.

### 3.2 Frontend Implementation
- [x] **Task 4: Setup Axios & API Client**
  - Install `axios`.
  - Create a base API instance.
- [x] **Task 5: Create Registration Page**
  - Implement the UI with `fullName`, `email`, `phone`, `password`, and `confirmPassword`.
  - Add client-side validation (matching passwords, email format).
- [x] **Task 6: Integration**
  - Connect the form to the backend endpoint.
  - Handle success (redirect) and error (display message) states.

---

## 4. Technical Notes
- **Prisma Transaction:** Use `$transaction` to ensure both `User` and `CustomerProfile` are created or neither.
- **Bcrypt Salt:** Use a salt factor of 12.
- **JWT Secret:** Use the secret from `.env`.
- **Note:** Final integration verification pending live MySQL database connectivity.
