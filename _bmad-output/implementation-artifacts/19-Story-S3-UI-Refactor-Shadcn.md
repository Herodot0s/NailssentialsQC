# Story Implementation - UI Refactor to Shadcn UI

**Project:** NailssentialsQC Salon Management System
**Phase:** 4-Implementation
**Sprint:** 3 (End of Sprint Pivot)
**Date:** April 23, 2026
**Role:** Frontend Developer

## 1. Overview
The client has mandated a complete visual refactor to transition the frontend UI framework to **Shadcn UI** combined with **Tailwind CSS**. This ensures a highly polished, responsive, and robust component library before we begin the heavy Manager Admin work in Sprint 4.

**CRITICAL MANDATE:** This refactor is strictly limited to the **Presentation Layer (UI/Styling)**. 
You MUST NOT alter the underlying business logic, state management (Context), React hooks, routing, API calls, or the authentication flows. We are only changing the "skin" of the application, not the "brain".

## 2. Requirements Addressed
* **UI/UX Modernization:**
    * Transition from pure CSS (`index.css`) to Tailwind CSS utility classes and Shadcn components.
    * Ensure 100% responsiveness (mobile-first and desktop-friendly).
* **Brand Consistency (Refer to `05-UX-Design.md`):**
    * Retain Terracotta Brown (`#B8794E`) as the primary brand color.
    * Retain the font pairing: `Playfair Display` for Headings and `Inter` for Body text.
    * Retain 8px border radiuses on cards and buttons.

## 3. Implementation Steps

### Phase 1: Infrastructure Setup
1. **Install Dependencies:**
   * Install Tailwind CSS, PostCSS, and Autoprefixer in the `frontend/` directory.
   * Initialize Tailwind (`npx tailwindcss init -p`).
2. **Configure Tailwind & Vite:**
   * Update `tailwind.config.js` to include `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`.
   * Add the custom Nailssentials brand colors (Primary: `#B8794E`, Primary Dark: `#9A6440`, etc.) to the Tailwind theme config.
   * Add font-family overrides for `Playfair Display` and `Inter`.
   * Configure `vite.config.ts` and `tsconfig.json` to support path aliases (e.g., `@/*` pointing to `./src/*`), which is required by Shadcn.
3. **Initialize Shadcn UI:**
   * Run `npx shadcn-ui@latest init` inside the frontend directory.
   * Use standard settings (Neutral colors, Global CSS variables).
4. **CSS Migration:**
   * Add Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) to `src/index.css` or the newly created `global.css`.
   * Ensure existing custom CSS in `index.css` is carefully phased out as Tailwind/Shadcn replaces it.

### Phase 2: Component Replacement (Iterative Approach)
Do NOT delete all components at once. Execute this page-by-page.

1. **Install Base Components:**
   * `npx shadcn-ui@latest add button card input badge avatar dropdown-menu table dialog`
2. **Refactor the Landing Page (`App.tsx`):**
   * Swap out custom HTML/CSS buttons and sections with Shadcn components (`<Button>`, `<Card>`, etc.).
   * Verify responsiveness.
3. **Refactor Authentication Flows (`Login.tsx`, `Register.tsx`):**
   * Update inputs and buttons using Shadcn's form components.
   * **Do not touch** the API calls or the `AuthContext` logic.
4. **Refactor Dashboards (`CustomerAppointments.tsx`, `StaffDashboard.tsx`):**
   * Replace tables, badges, and cards with their Shadcn equivalents.
   * Maintain the data fetching and rendering logic.

## 4. Verification & QA
* The application must compile successfully without TypeScript or ESLint errors.
* The authentication flow must still work perfectly.
* Appointments must still load, render, and execute actions accurately.
* Visually, the app must look identical to or better than the original designs specified in `05-UX-Design.md`, utilizing Shadcn's robust interaction states.
