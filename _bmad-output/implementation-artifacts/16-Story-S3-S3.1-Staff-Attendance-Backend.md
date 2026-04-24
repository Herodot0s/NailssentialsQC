# Story Implementation - Story 3.1: Staff Attendance (Backend)

**Project:** NailssentialsQC Salon Management System
**Phase:** 4-Implementation
**Sprint:** 3
**Date:** April 22, 2026
**Role:** Backend Developer

## 1. Overview
This document outlines the backend implementation for Story 3.1 (Staff Attendance). It provides the necessary API endpoints and business logic for staff members to check in and check out, including tardiness and deduction calculations.

## 2. Requirements Addressed
* **Story 7.1 (Renamed to 3.1 for Sprint 3): Staff Check-In/Check-Out**
    * As a Staff Member, I want to check in and out of my shift via the dashboard, so that my daily attendance and punctuality are logged.
    * Acceptance Criteria:
        * API endpoints for check-in and check-out.
        * Automated timestamping and today's record management.
        * Tardiness calculation: >15 minutes grace period.
        * Deduction calculation: ₱1 per minute of tardiness.
        * Recent history retrieval.

## 3. Implementation Details

### 3.1 Backend Controller (`backend/src/controllers/attendanceController.ts`)
* Implemented `getAttendanceStatus`: Fetches today's record and last 5 logs for the authenticated staff.
* Implemented `checkIn`:
    * Retrieves staff's `scheduled_start`.
    * Compares current time with `scheduled_start`.
    * Calculates `tardiness_minutes` if check-in is >15 mins late.
    * Records ₱1/min deduction.
    * Uses Prisma `upsert` to ensure only one record per day.
* Implemented `checkOut`: Updates the check-out timestamp for today's record.

### 3.2 Backend Routing (`backend/src/routes/attendanceRoutes.ts`)
* Defined `/api/v1/attendance` prefix.
* Added routes: `GET /status`, `POST /check-in`, `POST /check-out`.
* Secured routes using `authenticateToken` and `authorizeRoles(['staff', 'manager'])`.

### 3.3 Main Entry Point (`backend/src/index.ts`)
* Registered `attendanceRoutes` in the main Express application.

## 4. Maintenance & Bug Fixes
During this implementation, several existing compilation errors were fixed:
* Fixed missing `verifyRefreshToken` import in `authController.ts`.
* Corrected `is_active` field to `is_available` in `appointmentController.ts` for `StaffProfile` queries.
* Added explicit type casting for `id` parameters in `serviceController.ts` to satisfy TypeScript strict mode.

## 5. Verification
* Backend build successful (`tsc` passed).
* Logic verified against Prisma schema and frontend expectations.
