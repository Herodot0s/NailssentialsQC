# Sprint Plan - NailssentialsQC System

**Project:** NailssentialsQC Salon Management System  
**Phase:** 4-Implementation  
**Artifact:** 01-Sprint-Plan.md  
**Date:** April 21, 2026  

This document outlines the implementation strategy, grouping the defined Epics and Stories into logical development sprints. The goal is to build foundational features first, followed by core business logic, and concluding with analytics and polish to deliver the MVP within the semester timeframe.

---

## Sprint 1: Foundation & Security (Weeks 1-2)
**Goal:** Establish the project repository, set up the database schema, and implement secure user authentication and role-based access.

*   **Setup Tasks:**
    *   Initialize monorepo (React/Vite frontend, Node.js/Express backend).
    *   Set up ESLint, Prettier, and basic CI workflow.
    *   Configure Prisma ORM and provision the local MySQL database.
*   **Epic 1: User Authentication & Authorization**
    *   Story 1.1: Customer Registration (Backend & Frontend)
    *   Story 1.2: User Login & Session Management (JWT implementation)
    *   Story 1.3: Role-Based Access Control (RBAC middleware)

## Sprint 2: Services & Core Booking (Weeks 3-4)
**Goal:** Allow managers to populate the service catalog and enable customers to book appointments online.

*   **Epic 2: Service Catalog Management**
    *   Story 2.1: View Service Catalog (Public view)
    *   Story 2.2: Manage Services (Manager CRUD operations)
*   **Epic 3: Appointment Booking & Scheduling (Part 1)**
    *   Story 3.1: Online Appointment Booking (Customer flow & real-time availability check)
    *   Story 3.2: Customer Appointment Management (View, reschedule, cancel)

## Sprint 3: Staff Operations & CRM (Weeks 5-6)
**Goal:** Empower staff to manage their schedules, handle walk-ins, and view customer preferences.

*   **Epic 3: Appointment Booking & Scheduling (Part 2)**
    *   Story 3.3: Staff Schedule Management (Daily/weekly views, status updates)
    *   Story 3.4: Walk-In Appointment Creation
*   **Epic 4: Customer Relationship Management (CRM)**
    *   Story 4.1: Manage Customer Profile (Customer updates)
    *   Story 4.2: View Customer History (Staff view of past bookings and notes)

## Sprint 4: Financials & Payroll (Weeks 7-8)
**Goal:** Implement payment recording, receipt generation, and automate the complex commission logic.

*   **Epic 5: Payment Processing & Receipts**
    *   Story 5.1: Record Payment (Cash/GCash tracking)
    *   Story 5.2: Digital Receipt Generation (PDF generation and storage)
*   **Epic 6: Commission & Payroll Management**
    *   Story 6.1: Automatic Commission Computation (Core backend logic)
    *   Story 6.2: Staff Commission Dashboard (Frontend view for technicians)
    *   Story 6.3: Payroll Reporting (Manager exportable reports)

## Sprint 5: Attendance & Analytics (Weeks 9-10)
**Goal:** Track staff attendance for accurate payroll deductions and provide management with business insights.

*   **Epic 7: Attendance & Tardiness Tracking**
    *   Story 7.1: Staff Check-In/Check-Out (Time tracking)
    *   Story 7.2: Attendance Review & Deductions (Manager view & payroll integration)
*   **Epic 8: Sales & Analytics Reporting**
    *   Story 8.1: Daily Sales Dashboard (Manager overview)
    *   Story 8.2: Comprehensive Analytics (Historical charts and trends)

## Sprint 6: Notifications, Polish & UAT (Weeks 11-12)
**Goal:** Integrate email notifications, finalize the UI/UX polish, and conduct User Acceptance Testing.

*   **Epic 9: Notifications & Reminders**
    *   Story 9.1: Automated Appointment Notifications (SendGrid integration)
*   **Testing & Stabilization:**
    *   End-to-End Testing of critical flows (Booking, Payment).
    *   Performance optimizations (database indexing, caching if necessary).
    *   User Acceptance Testing (UAT) with staff and customers.
    *   Bug fixes and final deployment readiness.

---

## Current Status
**Active Sprint:** Ready to start Sprint 1
**Next Action:** Begin implementation of **Sprint 1: Foundation & Security** (Repository setup & Epic 1).