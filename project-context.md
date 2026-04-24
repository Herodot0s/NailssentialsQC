# Project Context - NailssentialsQC System

## Overview
**Project Name:** NailssentialsQC Salon Management System
**Description:** A web-based salon management platform enabling online appointment booking, staff schedule management, automated commission computation, and sales reporting.
**Team:** SFIT-2B Group 4, Quezon City University
**Current Phase:** 4-Implementation (Sprint 3/4)

## Technical Stack
- **Frontend:** React (TypeScript) built with Vite
- **Backend:** Node.js with Express.js (Adapted for Vercel Serverless)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **Deployment:** Vercel (Frontend & Backend), Neon (Database)

## Key Entities & Roles
- **Users/Roles:**
  - **Customer:** Public portal, book appointments, manage profile.
  - **Staff:** Staff dashboard, manage own schedule, record payments, view commissions.
  - **Manager:** Full admin access, manage services/staff, view payroll and analytics.
- **Core Models:** User, Service, Appointment, Payment, Commission, Attendance.

## Project Structure
- `_bmad-output/planning-artifacts/`: Contains all product requirements, UX design, and architecture documentation.
  - `04-PRD.md`: Core requirements and constraints.
  - `05-UX-Design.md`: Brand guidelines, colors (Terracotta Brown #B8794E), and UI specifications.
  - `06-System-Architecture.md`: REST API design, database schema, and deployment architecture.
  - `07-Epics-and-Stories.md`: 9 detailed Epics broken down into User Stories.
  - `08-Implementation-Readiness-Report.md`: Readiness sign-off.
- `_bmad-output/implementation-artifacts/`: Contains implementation planning.
  - `01-Sprint-Plan.md`: 6-sprint rollout plan (Weeks 1-12).

## Current Status
- **Planning:** Complete. MVP scope is locked.
- **Solutioning:** Complete. Architecture and Design are approved.
- **Implementation:** Currently finishing **Sprint 3 (Staff Attendance & Commissions)** and preparing to transition into **Sprint 4**. We have successfully pivoted our database to PostgreSQL (Neon) and our backend deployment strategy to Vercel Serverless.

## Development Guidelines
- **UI/UX:** Mobile-first approach, simplistic design, maximum 3 clicks for common tasks.
- **Performance:** Fast load times (< 3s initial, < 1s subsequent).
- **Security:** Strict RBAC, parameter-based SQL injection prevention, and password hashing (Bcrypt).
