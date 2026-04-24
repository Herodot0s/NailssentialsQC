# Story: S1.T1 - Initialize Monorepo

**Project:** NailssentialsQC Salon Management System  
**Sprint:** Sprint 1: Foundation & Security  
**Status:** ✅ COMPLETE  
**Type:** Setup Task  

---

## 1. Description
**Goal:** Establish the foundational directory structure for the NailssentialsQC monorepo, including the React (Vite) frontend and Node.js (Express) backend.

**Technical Context:**
- **Monorepo Structure:** Root folder with `frontend/` and `backend/` subdirectories.
- **Frontend:** React with TypeScript, scaffolded using Vite.
- **Backend:** Node.js with Express and TypeScript.

---

## 2. Acceptance Criteria
- [x] Project root contains a `package.json` (optional, for monorepo scripts) or clearly separated `frontend/` and `backend/` folders.
- [x] `frontend/` directory contains a functional Vite + React + TypeScript starter.
- [x] `backend/` directory contains a basic Express + TypeScript setup.
- [x] Both frontend and backend can be started independently.
- [x] `.gitignore` file exists in the root and correctly ignores `node_modules`, `.env`, and build artifacts.

---

## 3. Tasks
- [x] **Task 1: Initialize Root Directory**
  - Create `frontend/` and `backend/` folders.
  - Initialize a root-level `.gitignore`.
- [x] **Task 2: Scaffold Frontend**
  - Run `npm create vite@latest frontend -- --template react-ts`.
  - Verify `frontend/package.json` and basic folder structure.
- [x] **Task 3: Scaffold Backend**
  - Initialize `backend/` with `npm init -y`.
  - Install dependencies: `express`, `cors`, `dotenv`.
  - Install dev dependencies: `typescript`, `@types/node`, `@types/express`, `@types/cors`, `ts-node-dev`.
  - Create `tsconfig.json` and a basic `src/index.ts`.
- [x] **Task 4: Verification**
  - Run `npm install` in both directories.
  - Ensure `npm run dev` works for both.

---

## 4. Technical Notes
- **Vite:** Use the standard React-TS template.
- **Backend:** Use `ts-node-dev` for hot-reloading during development.
- **Dependencies:** Keep dependencies minimal for this foundation task.
