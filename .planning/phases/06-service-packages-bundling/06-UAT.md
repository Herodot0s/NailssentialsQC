# Phase 6: Service Packages & Bundling — UAT

## Status
- **Current Test:** Test 4: End-to-End Booking
- **Progress:** 3/6 Tests Passed

## Test Suite

### 1. Package Browsing (Customer)
- **Objective:** Verify that customers can see the available service packages on the services page.
- **Pre-conditions:** Production data seeded (Packages A, B, C, D, I, J).
- **Steps:**
  1. Go to `/services`.
  2. Scroll to the "Packages" section.
  3. Verify that cards for "Package A", "Package B", etc., are displayed with correct prices.
- **Status:** PASSED (Verified via browser: Package cards A, B, C, D, I, J visible with correct discounted prices)

### 2. Package Cart Management
- **Objective:** Verify that adding a package to the cart works correctly.
- **Steps:**
  1. Click "Add to Cart" on a package.
  2. Open the cart (header).
  3. Verify the package and its child services are listed.
  4. Verify the total price matches the package price.
- **Status:** PASSED (Verified via browser: Package and child services correctly listed in cart)

### 3. Package Booking Configuration
- **Objective:** Verify that technicians and times can be selected for all services in a package.
- **Steps:**
  1. Go to `/booking` with a package in the cart.
  2. For each service in the package, open the "Select Technician" dropdown.
  3. Verify names and specializations are visible (and no ID numbers).
  4. Select a technician and a valid time slot.
  5. Verify the "Summary" section reflects these selections.
- **Status:** PASSED (Verified via browser: Clean names, specializations visible, no ID numbers, summary reflects selections)

### 4. End-to-End Booking
- **Objective:** Verify that a package booking can be successfully submitted.
- **Steps:**
  1. Complete selections for all services in the package.
  2. Click "Schedule Ritual".
  3. Verify redirect to "Reserved" success page.
  4. Verify redirect to `/appointments`.
- **Status:** PENDING

### 5. Appointment Verification (Manager)
- **Objective:** Verify that the package info is preserved in the backend.
- **Steps:**
  1. Log in as `manager1`.
  2. Go to the dashboard.
  3. Find the newly created appointment.
  4. Verify that each item is linked to the package.
- **Status:** PENDING

### 6. Commission Logic Verification
- **Objective:** Verify that commission is calculated on the catalog price.
- **Steps:**
  1. As a manager, mark the appointment as completed.
  2. Go to "Commissions" or check the database.
  3. Verify the commission amount is based on the service's base price, not the discounted package rate.
- **Status:** PENDING

## Issue Log
| ID | Test | Issue | Diagnosis | Fix | Status |
|----|------|-------|-----------|-----|--------|
| 1 | 3 | Technicians not appearing | Permissions blocked customers | Allowed GET /staff for customers | FIXED |
| 2 | 3 | ID numbers visible | UI showed ID in trigger/choices | Used textValue and removed span | FIXED |
| 3 | 3 | ReferenceError on staff fetch | Missing import in staffController | Added getCurrentUser import | FIXED |
