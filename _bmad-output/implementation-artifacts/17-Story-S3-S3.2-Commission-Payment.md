# Story Implementation - Story 3.2 & 5.1: Commission & Payments

**Project:** NailssentialsQC Salon Management System
**Phase:** 4-Implementation
**Sprint:** 3
**Date:** April 22, 2026
**Role:** Fullstack Developer

## 1. Overview
This document outlines the implementation for recording payments (Story 5.1) and automatically calculating staff commissions (Story 3.2) upon appointment completion.

## 2. Requirements Addressed
* **Story 5.1: Record Payment**
    * As a Staff Member, I want to record a payment (Cash/GCash) once an appointment is completed.
    * Acceptance Criteria:
        * Create `Transaction` record with amount and payment method.
        * Generate sequential `receipt_number` (Format: `YYYYMMDD-NNN`).
* **Story 3.2 (Renamed from 6.1): Base Commission Computation**
    * As a System, I want to automatically calculate staff commission upon payment using flat base rates (10%).
    * Acceptance Criteria:
        * Calculate 10% commission on service price.
        * Link commission to transaction and technician.
        * Store commission date and period (week/month/year).

## 3. Implementation Details

### 3.1 Backend Controller (`backend/src/controllers/appointmentController.ts`)
* Implemented `getAppointments`: Fetches appointments based on user role (Customer, Staff, Manager).
* Implemented `completeAppointment`:
    * Marks `Appointment` as `completed`.
    * Calculates total amount from linked services.
    * Generates a unique `receipt_number` based on today's transaction count.
    * Calculates 10% flat commission for the technician.
    * Uses Prisma `$transaction` to ensure all records (`Appointment`, `Transaction`, `Commission`) are updated/created atomically.

### 3.2 Backend Routing (`backend/src/routes/appointmentRoutes.ts`)
* Added `GET /` to list appointments.
* Added `POST /:id/complete` for staff/managers to finalize appointments and record payments.

### 3.3 Frontend API (`frontend/src/api/apiClient.ts`)
* Added `getAppointments` and `completeAppointment` methods to the API client.

## 4. Verification
* Backend build successful (`tsc` passed).
* Logic verified against Prisma schema and business requirements.
* Receipt generation logic ensures sequential numbering per day.
