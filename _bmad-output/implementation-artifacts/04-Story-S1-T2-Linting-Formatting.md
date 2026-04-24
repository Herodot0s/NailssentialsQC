# Story: S1.T2 - Linting & Formatting

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 1: Foundation & Security  
**Status:** ✅ COMPLETE  
**Type:** Setup Task  

---

## 1. Description
**Goal:** Configure consistent code style and quality checks across the monorepo using ESLint and Prettier.

**Technical Context:**
- **ESLint:** Use the new Flat Config (`eslint.config.js`).
- **Prettier:** Shared configuration for both frontend and backend.
- **Languages:** TypeScript (Frontend: React, Backend: Node).

---

## 2. Acceptance Criteria
- [x] ESLint is configured for both `frontend/` and `backend/`.
- [x] Prettier is configured with a root-level `.prettierrc`.
- [x] `npm run lint` and `npm run format` work in both directories.
- [x] No linting errors exist in the current boilerplate code.
- [x] Basic GitHub Actions workflow for linting is added (optional but recommended).

---

## 3. Tasks
- [x] **Task 1: Root Configuration**
  - Create `.prettierrc` and `.prettierignore` in the project root.
- [x] **Task 2: Configure Backend Linting**
  - Install ESLint and Prettier dependencies in `backend/`.
  - Create `backend/eslint.config.js` (renamed to `.mjs` for ESM support).
  - Add `lint` and `format` scripts to `backend/package.json`.
- [x] **Task 3: Configure Frontend Linting**
  - Install Prettier dependencies in `frontend/`.
  - Update `frontend/eslint.config.js` to integrate Prettier.
  - Add `format` script to `frontend/package.json`.
- [x] **Task 4: Monorepo Scripts (Root)**
  - Initialize root `package.json`.
  - Add scripts to run lint/format for both folders.
- [x] **Task 5: Verification**
  - Run lint and format from root and verify success.

---

## 4. Technical Notes
- **Prettier Config:** Standardize on: singleQuote: true, trailingComma: all, tabWidth: 2, semi: true.
- **Flat Config:** Ensure compatibility with ESLint v9+.
