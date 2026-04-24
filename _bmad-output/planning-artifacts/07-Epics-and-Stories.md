# Epics and Stories - NailssentialsQC System

**Project:** NailssentialsQC Salon Management System  
**Phase:** 3-Solutioning  
**Artifact:** 07-Epics-and-Stories.md  

This document breaks down the Product Requirements Document (PRD) and System Architecture into actionable Epics and User Stories. These will be used for Sprint Planning and Implementation.

---

## EPIC 1: User Authentication & Authorization
**Goal:** Provide secure access control for Customers, Staff, and Managers.

*   **Story 1.1: Customer Registration**
    *   **As a** Customer, **I want to** register for an account using my email/phone and a secure password, **so that** I can book appointments online.
    *   *Acceptance Criteria:* Registration form with validation, password strength rules (8+ chars, uppercase, number), unique email/phone check, auto-login post-registration.
*   **Story 1.2: User Login & Session**
    *   **As a** User, **I want to** log in securely and optionally stay logged in ("remember me"), **so that** I can access my respective dashboard without repeated sign-ins.
    *   *Acceptance Criteria:* Login form, 15-minute lockout after 5 failed attempts, password reset via email, 2-hour default session timeout (JWT), appropriate role-based redirection.
*   **Story 1.3: Role-Based Access Control (RBAC)**
    *   **As a** System Administrator (Manager), **I want to** enforce role-based permissions, **so that** Customers, Staff, and Managers only access the features they are authorized to see.
    *   *Acceptance Criteria:* Middleware validation for Customer/Staff/Manager roles, 403 Forbidden for unauthorized access, admin-only routes secured.

---

## EPIC 2: Service Catalog Management
**Goal:** Allow users to view and managers to maintain the salon's list of services.

*   **Story 2.1: View Service Catalog**
    *   **As a** Customer/Staff, **I want to** browse available services by category, price, and duration, **so that** I can easily find and choose the service I need.
    *   *Acceptance Criteria:* Display active services, categorize by Nails/Hair/Waxing/Lashes, show duration and price (₱), provide search and filter options.
*   **Story 2.2: Manage Services**
    *   **As a** Manager, **I want to** add, edit, and toggle the active status of services, **so that** the catalog is always up-to-date with current offerings and prices.
    *   *Acceptance Criteria:* CRUD interface for services (name, description, category, price, duration, image), validation rules, inactive services hidden from customers.

---

## EPIC 3: Appointment Booking & Scheduling
**Goal:** Enable seamless booking for customers and schedule management for the salon.

*   **Story 3.1: Online Appointment Booking**
    *   **As a** Customer, **I want to** select a service, optionally pick a technician, and book an available time slot, **so that** I can secure my appointment without calling the salon.
    *   *Acceptance Criteria:* Multi-step booking flow, real-time availability check, respects 12:00 PM - 10:00 PM operating hours, 10-minute buffer enforcement, prevents double-booking.
*   **Story 3.2: Customer Appointment Management**
    *   **As a** Customer, **I want to** view my upcoming/past appointments and reschedule or cancel them, **so that** I can manage my salon visits flexibly.
    *   *Acceptance Criteria:* Dashboard list of appointments, ability to cancel/reschedule up to 24 hours prior, status badges, automated time slot release upon cancellation.
*   **Story 3.3: Staff Schedule Management**
    *   **As a** Staff Member, **I want to** view my daily schedule and update the status of my appointments, **so that** I know my tasks for the day and can mark them as completed.
    *   *Acceptance Criteria:* Timeline/calendar view, color-coded statuses (pending, confirmed, in-progress, completed), ability to add service notes.
*   **Story 3.4: Walk-In Appointment Creation**
    *   **As a** Staff/Manager, **I want to** use the counter desktop to rapidly block out a walk-in appointment slot, **so that** online customers don't accidentally book that technician while the walk-in is waiting.
    *   *Acceptance Criteria:* Prominent "Add Walk-In" button, ultra-fast form (only requires service, technician, and time to block slot), prevents double-booking.

---

## EPIC 4: Customer Relationship Management (CRM)
**Goal:** Maintain detailed customer profiles to enhance personalization and service quality.

*   **Story 4.1: Manage Customer Profile**
    *   **As a** Customer, **I want to** update my contact info, preferences, and allergies, **so that** the salon can provide a personalized and safe service.
    *   *Acceptance Criteria:* Editable contact fields, preferences section (favorite services/technicians, allergies), secure password change.
*   **Story 4.2: View Customer History**
    *   **As a** Staff Member, **I want to** view a booked customer's history and specific preferences/allergies, **so that** I can tailor my service to their needs.
    *   *Acceptance Criteria:* Accessible from appointment view, displays past visits, total spend, and prominently highlights allergies or special notes.

---

## EPIC 5: Payment Processing & Receipts
**Goal:** Record payments and generate digital proofs of transaction.

*   **Story 5.1: Record Payment**
    *   **As a** Staff Member, **I want to** record a payment (Cash/GCash) once an appointment is completed, **so that** the salon's sales are accurately tracked.
    *   *Acceptance Criteria:* Payment form on completed appointments, exact amount recording (no negative values), selection of payment method, transaction timestamp.
*   **Story 5.2: Digital Receipt Generation**
    *   **As a** System, **I want to** automatically generate a digital receipt for every payment, **so that** the customer has proof of transaction and the salon maintains financial records.
    *   *Acceptance Criteria:* Auto-generated sequential receipt number (YYYYMMDD-NNN), accessible to customer, downloadable as PDF, voiding capabilities for managers.

---

## EPIC 6: Commission & Payroll Management
**Goal:** Automate technician commissions and generate manager payroll reports.

*   **Story 6.1: Base Commission Computation**
    *   **As a** System, **I want to** automatically calculate staff commission upon payment using flat base rates (complex tiered logic deferred), **so that** technicians earn their minimum share without manual tracking.
    *   *Acceptance Criteria:* Apply base rates (10% flat rate for all services initially, pending clarification on the complex 20% hair target rules), tie calculation to payment execution.
*   **Story 6.2: Staff Commission Dashboard**
    *   **As a** Staff Member, **I want to** view my daily/weekly commission earnings, **so that** I am motivated and informed of my expected pay based on the flat rates.
    *   *Acceptance Criteria:* Dashboard showing today's earnings and recent transaction breakdown (target tracking deferred).
*   **Story 6.3: Payroll Reporting**
    *   **As a** Manager, **I want to** generate complete payroll reports including commissions and deductions, **so that** I can accurately pay my staff.
    *   *Acceptance Criteria:* Report generation by date range and staff, showing net pay, exports to CSV/PDF.

---

## EPIC 7: Attendance & Tardiness Tracking
**Goal:** Track staff attendance to accurately apply payroll deductions.

*   **Story 7.1: Staff Check-In/Check-Out**
    *   **As a** Staff Member, **I want to** check in and out of my shift via the dashboard, **so that** my daily attendance and punctuality are logged.
    *   *Acceptance Criteria:* Check-in/out buttons, auto-timestamp, late check-in flag (>15 mins grace period), daily log visibility.
*   **Story 7.2: Attendance Review & Deductions**
    *   **As a** Manager, **I want to** view staff attendance records and automatic tardiness deductions, **so that** I can accurately enforce the attendance policy in payroll.
    *   *Acceptance Criteria:* Calendar view of staff attendance, tardiness logs with calculated minute deductions (₱1/minute after grace).

---

## EPIC 8: Sales & Analytics Reporting
**Goal:** Provide management with actionable insights on salon performance.

*   **Story 8.1: Daily Sales Dashboard**
    *   **As a** Manager, **I want to** see a daily summary of sales and appointments, **so that** I can quickly gauge the salon's daily performance against our targets.
    *   *Acceptance Criteria:* Widget showing today's sales, walk-in vs. online ratio, progress towards ₱8,000 team target.
*   **Story 8.2: Comprehensive Analytics**
    *   **As a** Manager, **I want to** access historical analytics on sales trends, popular services, and staff performance, **so that** I can make data-driven business decisions.
    *   *Acceptance Criteria:* Visualizations (charts) for sales trends, date range filters, exportable reports.

---

## EPIC 9: Notifications & Reminders
**Goal:** Keep customers informed about their appointments.

*   **Story 9.1: Automated Appointment Notifications**
    *   **As a** Customer, **I want to** receive confirmations and reminders for my appointments, **so that** I don't forget my scheduled salon visits.
    *   *Acceptance Criteria:* In-app alerts, email notifications (via SendGrid) sent on booking confirmation, rescheduling, cancellation, and 24 hours prior to appointment.
