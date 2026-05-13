# NailssentialsQC: System Capabilities & Functional Overview

This document outlines the core functional capabilities of the NailssentialsQC Salon Management System, categorized by architectural module and user archetype.

## 1. Core Architecture & Security
*   **Identity Management**: Integrated with Clerk for secure authentication, supporting email verification and multi-factor authentication (MFA) potential.
*   **Role-Based Access Control (RBAC)**: Granular permission levels for `Customers`, `Staff`, and `Managers`.
*   **Full-Stack Integrity**: Built on React 19 (Frontend) and Express.js with Prisma ORM (Backend), utilizing PostgreSQL for relational data consistency.

## 2. Appointment & Booking Engine
*   **Real-Time Scheduling**: Dynamic availability checking based on staff schedules and existing bookings.
*   **Service-Aware Booking**: Logic to handle varying service durations and resource requirements.
*   **Lifecycle Management**: End-to-end tracking from booking (Pending) to execution (Completed) and cancellation.
*   **Automated Validation**: Prevents double-booking and ensures appointment integrity through backend constraints.

## 3. Service & Catalog Management
*   **Categorized Catalog**: Hierarchical management of salon services (e.g., Manicure, Pedicure, Nail Art).
*   **Service Bundling**: Support for "Packages" which group multiple services with custom pricing and duration.
*   **Price Control**: Dynamic pricing management for individual services and promotional bundles.
*   **Visibility Toggles**: Ability to hide/show services from the public booking interface without deleting records.

## 4. Workforce & Operations Management
*   **Attendance Tracking**: Clock-in/clock-out system for staff attendance monitoring.
*   **Commission Tracking**: Automated calculation of technician commissions based on completed services and salon-defined rates.
*   **Staff Portals**: Dedicated dashboards for technicians to view their daily schedule, performance metrics, and attendance history.

## 5. Payroll & Financial Automation
*   **Formula-Driven Payroll**: Highly flexible salary calculation engine using dynamic formulas, derived from field interviews and operational observations of salon workflows.
*   **Salary Components**: Management of earnings (basic, commissions) and deductions.
*   **Automated Generation**: One-click payroll processing for the entire staff based on attendance and commission data.
*   **Financial Reporting**: Generation of salary slips and itemized payroll breakdown for transparency.

## 6. Business Intelligence & Analytics
*   **Revenue Analytics**: Visual tracking of revenue trends over daily, weekly, and monthly intervals.
*   **Performance Metrics**: Data-driven insights into staff productivity, popular services, and customer retention rates.
*   **Dashboard Visuals**: High-craft data visualization using modern charting libraries for managerial oversight.

## 7. Content Management System (CMS)
*   **Marketing Control**: Centralized interface to manage landing page content, promotions, and salon policies.
*   **Visual Gallery**: "Nail Art Exhibit" module to showcase salon work, integrated with image upload and management capabilities.
*   **Notification System**: Integrated in-app notification engine to communicate system events and booking updates.

## 8. UX/UI & Accessibility
*   **Premium Design System**: aesthetic prioritizing spatial clarity, IBM Plex Sans typography, and subtle micro-animations.
*   **Responsive Performance**: Optimized for desktop, tablet, and mobile browsers to support on-the-floor salon operations.
*   **WCAG AA Alignment**: Focus on high contrast, large touch targets, and semantic HTML for broad accessibility.
