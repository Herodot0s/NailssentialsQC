---
title: Fix paginated data mismatch in frontend and attendance robustness
date: 2026-05-04
status: complete
---

# Plan - Fix paginated data mismatch

## Problem
Recent backend changes introduced cursor-based pagination for `appointments`, `staff`, and `payroll periods`. This wrapped the data in an object `{ items, nextCursor, hasMore }`, causing the frontend (which expected arrays) to crash or fail to display data. Additionally, a "Check-in failed" error was observed, likely due to missing `scheduled_start` in `StaffProfile`.

## Tasks
1. [x] Fix `StaffDashboard.tsx` to handle paginated `appointments`.
2. [x] Fix `ManagerDashboard.tsx` to handle paginated `staff` and `payroll periods`.
3. [x] Fix `Booking.tsx` to handle paginated `staff`.
4. [x] Fix `CustomerAppointments.tsx` to handle paginated `appointments`.
5. [x] Add robustness to `attendanceController.ts` for missing `scheduled_start`/`end`.
6. [x] Verify with clean build.
