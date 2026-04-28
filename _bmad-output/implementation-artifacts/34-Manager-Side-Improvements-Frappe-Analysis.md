# Manager-Side Improvement Proposal: Frappe HRMS Analysis

**Project:** NailssentialsQC Salon Management System
**Date:** April 27, 2026
**Author:** John (Product Manager)
**Purpose:** Analyze Frappe HRMS modules and recommend best-fit improvements for the Manager Dashboard

---

## Executive Summary

After scanning the Frappe HRMS reference system (100+ doctypes, 20+ dashboard charts, 20+ reports) against our current NailssentialsQC implementation, I've identified critical gaps. Our backend V2 infrastructure is complete and live, but the Manager Dashboard is lagging behind on the frontend.

**Current State:** We have payroll, attendance, basic analytics, deductions ledger, and reviews.
**Frappe HRMS State:** Full enterprise HR suite with leave management, overtime, appraisals, recruitment, training, expense claims, advanced analytics, and 20+ dashboard charts.

---

## 1. Critical Gaps (From Handover Document)

These three features are explicitly requested by the owner and NOT yet implemented:

| # | Feature | Current State | Frappe Reference | Priority |
|---|---------|---------------|-------------------|----------|
| 1 | **Interactive Drill-Down Line Graphs** | Static bar/pie charts from recharts | `dashboard_chart/hiring_vs_attrition_count`, `employees_by_age` — Frappe uses dynamic multi-series line charts with drill-down | **P0** |
| 2 | **Comprehensive Salary Slip Modal** | Basic payroll table with aggregated Net Pay | `Salary Slip` doctype — Frappe itemizes (Base + Commission + Bonus) - (Lates + Advances) = Net Pay | **P0** |
| 3 | **Employee Profile Pictures (HR CRUD)** | `profile_picture_url` exists in Prisma but UI ignores it | `employee.employee_image` field in Frappe — displayed via Avatar components | **P0** |

---

## 2. High-Impact Improvements (Frappe-Inspired)

### 2.1 Leave Management System
**Frappe Module:** `leave_type`, `leave_application`, `leave_allocation`, `leave_policy`, `leave_balance`

| Aspect | Current NailssentialsQC | Frappe HRMS | Recommended Implementation |
|--------|------------------------|--------------|----------------------------|
| Leave Requests | ❌ None | Employees submit leave applications; managers approve/reject | Add `LeaveType` (Sick, Vacation, Emergency), `LeaveApplication` with status flow: Pending → Approved/Rejected |
| Leave Balance | ❌ None | Auto-calculated based on allocations and policies | Show remaining leave balance per staff in Employee File sheet |
| Leave Reports | ❌ None | `employee_leave_balance`, `monthly_attendance_sheet` | Add "Leave Ledger" tab in Manager Dashboard |

**Why for Salon:** Staff call out sick or request vacation time. Without this, managers manually deduct ₱500/day for absences with no distinction between authorized leave and no-call-no-show.

**Prisma Model Needed:**
```prisma
model LeaveType {
  id           Int       @id @default(autoincrement())
  name         String    @unique // Sick, Vacation, Emergency
  max_days     Int?
  is_paid      Boolean   @default(true)
  created_at   DateTime  @default(now())
  applications LeaveApplication[]
  @@map("leave_types")
}

model LeaveApplication {
  id           Int       @id @default(autoincrement())
  staff_id     Int
  leave_type_id Int
  start_date   DateTime  @db.Date
  end_date     DateTime  @db.Date
  reason       String?   @db.Text
  status       String    @default("pending") // pending, approved, rejected
  created_at   DateTime  @default(now())
  
  staff      StaffProfile @relation(fields: [staff_id], references: [id])
  leave_type LeaveType    @relation(fields: [leave_type_id], references: [id])
  
  @@map("leave_applications")
}
```

---

### 2.2 Overtime Tracking & Compensation
**Frappe Module:** `overtime_slip`, `overtime_details`, `overtime_type`, `overtime_salary_component`

| Aspect | Current NailssentialsQC | Frappe HRMS | Recommended Implementation |
|--------|------------------------|--------------|----------------------------|
| Overtime Logging | ❌ None | `Overtime Slip` with start/end times, duration, salary component mapping | Add overtime entry in Attendance tab; auto-calculate hours worked beyond shift end |
| Overtime Pay | ❌ None | Configurable hourly rate or percentage of base | Add overtime amount to payroll calculation (separate from commission) |
| Overtime Reports | ❌ None | `overtime_slip` report with employee filter | Show "Overtime Ledger" in Manager Dashboard |

**Why for Salon:** Salon staff frequently work beyond scheduled hours during peak periods. Currently, this uncompensated time hurts morale and creates payroll disputes.

**Prisma Model Needed:**
```prisma
model OvertimeLog {
  id            Int      @id @default(autoincrement())
  staff_id      Int
  date          DateTime @db.Date
  start_time    String   // Actual overtime start (beyond shift end)
  end_time      String   // Actual overtime end
  total_hours   Decimal  @db.Decimal(5, 2)
  rate_per_hour Decimal  @db.Decimal(10, 2) @default(100.00)
  amount        Decimal  @db.Decimal(10, 2)
  is_paid       Boolean  @default(false)
  created_at    DateTime @default(now())
  
  staff StaffProfile @relation(fields: [staff_id], references: [id])
  
  @@index([staff_id, date])
  @@map("overtime_logs")
}
```

---

### 2.3 Employee Performance Appraisal (Beyond Star Ratings)
**Frappe Module:** `appraisal`, `appraisal_cycle`, `appraisal_kra`, `appraisal_goal`, `employee_performance_feedback`

| Aspect | Current NailssentialsQC | Frappe HRMS | Recommended Implementation |
|--------|------------------------|--------------|----------------------------|
| Performance Goals | ❌ None | `Appraisal Goal` with KRA (Key Result Area) mapping | Add quarterly goals per staff (e.g., "Achieve ₱50k monthly sales") |
| Self Appraisal | ❌ None | Employees rate themselves before manager review | Add self-rating in Staff Dashboard |
| Manager Review | Basic 1-5 star + tags | `Appraisal` with scored goals, final score, feedback | Expand review system to structured appraisals with weighted scores |
| Promotion Tracking | ❌ None | `employee_promotion`, `employee_transfer` | Track promotion history in Employee File |

**Why for Salon:** Star ratings from customers measure service quality, but managers need internal KPIs (sales targets, attendance record, punctuality score) to make promotion/bonus decisions.

---

### 2.4 Shift Request & Swap System
**Frappe Module:** `shift_request`, `shift_assignment`, `shift_type`, `shift_schedule`

| Aspect | Current NailssentialsQC | Frappe HRMS | Recommended Implementation |
|--------|------------------------|--------------|----------------------------|
| Shift Assignment | Manager-only (backend) | `Shift Assignment` with date range, shift type | ✅ Already have `StaffSchedule` — needs UI improvement |
| Shift Requests | ❌ None | Employees request shift changes; manager approves | Add "Request Shift Change" in Staff Dashboard |
| Shift Swaps | ❌ None | Employees can swap shifts with peer approval | Add shift swap coordination feature |

**Why for Salon:** Currently, staff must text/call the manager for any schedule changes. A formal request system creates an audit trail and reduces miscommunication.

---

## 3. Analytics & Dashboard Enhancements (Frappe-Inspired)

Frappe HRMS has **20+ dashboard charts**. We have **2 charts** (LineChart + PieChart). Here are the best additions for a salon:

### 3.1 New Dashboard Charts

| Chart Name | Frappe Reference | Data Source | Business Value |
|------------|-------------------|--------------|----------------|
| **Staff Performance Leaderboard** | `designation_wise_employee_count` pattern | Sum of commissions per staff per period | Identify top performers and underperformers |
| **Attendance Heatmap** | `attendance_count` report | Daily attendance records | Spot patterns (e.g., "Staff X is always late on Mondays") |
| **Hiring vs. Attrition** | `hiring_vs_attrition_count` | New hires vs. terminated staff | Track staff turnover (critical for salon business) |
| **Service Category Trend** | `department_wise_expense_claims` pattern | Sales by category over time | Identify which services are growing/shrinking |
| **Employee Tenure Distribution** | `employees_by_age` pattern | Hire date to now | Understand staff loyalty and plan retention strategies |

### 3.2 Enhanced Analytics Tab in Manager Dashboard

```
Analytics Tab (Current → Proposed)
├── Current Revenue (✅ Already have)
├── Active Rituals (✅ Already have)
├── Monthly Sales Target (✅ Already have)
├── Performance Analytics (Line Chart) (✅ Already have - needs drill-down fix)
├── Revenue Split (Pie Chart) (✅ Already have)
├── NEW: Staff Leaderboard (Table + Bar Chart)
├── NEW: Attendance Heatmap (Calendar-style view)
├── NEW: Service Trend Analysis (Multi-series area chart)
└── NEW: Financial Summary Cards (Total payroll, total deductions, net profit)
```

---

## 4. Medium-Impact Improvements

### 4.1 Employee Onboarding Checklist
**Frappe Module:** `employee_onboarding`, `employee_onboarding_template`, `employee_boarding_activity`

| Feature | Benefit |
|---------|---------|
| Digital onboarding form | Replace paper forms; collect SSS, TIN, Gov ID digitally |
| Onboarding task checklist | Ensure uniform issuance, tool assignment, and policy acknowledgment |
| ID photo capture | Upload profile picture during onboarding |

### 4.2 Expense Reimbursement Claims
**Frappe Module:** `expense_claim`, `expense_claim_type`, `expense_claim_detail`

| Feature | Benefit |
|---------|---------|
| Staff submit expense claims | For supplies purchased with own money |
| Manager approves/rejects | Control unauthorized expenses |
| Auto-deduct from payroll | Similar to cash advances but for reimbursements |

### 4.3 Advanced Payroll Reports
**Frappe Module:** `employee_advance_summary`, `project_profitability`, `employee_hours_utilization_based_on_timesheet`

| Report | Current | Recommended |
|--------|---------|-------------|
| Payroll History | Basic cycle cards | Full `Payroll History Report` with filters (date range, staff, status) |
| Commission Breakdown | Shown in salary slip | `Commission Report` showing per-service commissions |
| Deduction Summary | Basic ledger form | `Deduction Report` with type breakdown (CA vs. Uniform vs. Late) |
| Net Profit Analysis | ❌ None | Revenue - (Salaries + Deductions) = Net Profit card |

---

## 5. Low Priority / Not Recommended

| Frappe Module | Why NOT for Salon |
|---------------|-------------------|
| **Vehicle Log** (`vehicle_log`, `vehicle_service`) | Salon has no company vehicles |
| **Asset Management** | Not relevant for service-based business |
| **Recruitment Pipeline** (`job_applicant`, `interview`, `job_offer`) | Too complex; small salon hires via walk-in/referral |
| **Training Events** (`training_event`, `training_program`) | Nice-to-have but not critical for MVP |
| **Grievance Management** (`employee_grievance`) | Overkill; small team resolves issues informally |

---

## 6. Implementation Priority Matrix

```
Priority 0 (Owner-Requested - DO FIRST):
├── P0-1: Interactive Drill-Down Line Graphs
├── P0-2: Comprehensive Salary Slip Modal
└── P0-3: Employee Profile Pictures (HR CRUD)

Priority 1 (High Business Value):
├── P1-1: Leave Management System
├── P1-2: Overtime Tracking & Compensation
└── P1-3: Staff Performance Leaderboard (Analytics)

Priority 2 (Should Have):
├── P2-1: Shift Request & Swap System
├── P2-2: Advanced Payroll Reports
└── P2-3: Expense Reimbursement Claims

Priority 3 (Nice to Have):
├── P3-1: Employee Performance Appraisal (Structured)
├── P3-2: Employee Onboarding Checklist
└── P3-3: Enhanced Analytics (Heatmap, Trends)
```

---

## 7. Recommended Sprint Plan

### Sprint 4 (Current — Finish Strong)
**Focus:** Complete the 3 owner-requested features from handover document

| Story | Description | Frappe Inspiration |
|-------|-------------|-------------------|
| S4-1 | Fix drill-down line graph (replace static charts) | `dashboard_chart` dynamic series pattern |
| S4-2 | Build `SalarySlipModal` with itemized math | Frappe `Salary Slip` structure |
| S4-3 | Add profile picture upload + Avatar display | Frappe `employee.employee_image` |

### Sprint 5 (Next — HR Foundation)
**Focus:** Leave Management + Overtime (biggest payroll gaps)

| Story | Description | Frappe Inspiration |
|-------|-------------|-------------------|
| S5-1 | `LeaveType` + `LeaveApplication` backend + UI | `leave_type`, `leave_application` |
| S5-2 | `OvertimeLog` backend + UI in Attendance tab | `overtime_slip`, `overtime_details` |
| S5-3 | Update payroll engine to include leave pay + overtime | Frappe payroll integration |

### Sprint 6 (Analytics Expansion)
**Focus:** Manager Dashboard analytics parity with Frappe

| Story | Description | Frappe Inspiration |
|-------|-------------|-------------------|
| S6-1 | Staff Performance Leaderboard | `designation_wise_employee_count` |
| S6-2 | Attendance Heatmap + Patterns | `attendance_count` report |
| S6-3 | Financial Summary Cards (Net Profit) | `project_profitability` report |

---

## 8. Summary: Best Improvements (Top 5)

If you could only do 5 things from this analysis, here's what I recommend:

| Rank | Improvement | Reason |
|------|-------------|--------|
| 🥇 1 | **Interactive Drill-Down Analytics** | Owner explicitly requested; Frappe shows this is the heart of a good dashboard |
| 🥈 2 | **Salary Slip Modal (Itemized)** | Transparency builds trust; Frappe's salary slip is their #1 used feature |
| 🥉 3 | **Leave Management System** | Salon staff need authorized leave vs. absence distinction; Frappe's leave module is core HR |
| 4 | **Overtime Tracking** | Currently uncompensated; Frappe's `overtime_slip` shows the pattern |
| 5 | **Staff Performance Leaderboard** | Frappe's `designation_wise_employee_count` pattern — motivate top performers |

---

## 9. Frappe HRMS Feature Comparison Table

| Feature Category | Frappe HRMS | NailssentialsQC | Gap Level |
|-----------------|--------------|-----------------|-----------|
| **Employee Management** | Full employee profiles with 50+ fields | Basic `StaffProfile` with 8 fields | 🟡 Medium |
| **Leave Management** | 10 doctypes (type, app, allocation, policy, balance) | ❌ None | 🔴 Critical |
| **Attendance** | Checkin/checkout, shift assignment, attendance requests | Basic check-in with tardiness penalty | 🟡 Medium |
| **Overtime** | Overtime slip with duration, rate, salary component | ❌ None | 🔴 Critical |
| **Payroll** | Full payroll with 20+ salary components, tax, benefits | Commission + deduction engine (good!) | 🟢 Low |
| **Appraisal** | Goal-based appraisal with KRA, self-rating, manager review | Basic 1-5 star customer reviews | 🟡 Medium |
| **Shift Management** | Shift type, assignment, request, schedule | Basic weekly schedule | 🟡 Medium |
| **Expense Claims** | Employee reimbursement with approval flow | Manager-side deductions only | 🟡 Medium |
| **Recruitment** | Job opening, applicant, interview, offer | ❌ None | ⚪ Not Needed |
| **Training** | Training program, event, result | ❌ None | ⚪ Not Needed |
| **Onboarding** | Onboarding template, checklist, activities | Basic add-staff form | 🟢 Low |
| **Analytics** | 20+ dashboard charts, 20+ reports | 2 charts (line + pie) | 🔴 Critical |
| **Grievance** | Grievance type, employee grievance | ❌ None | ⚪ Not Needed |
| **Vehicle/Assets** | Vehicle log, service, asset management | ❌ None | ⚪ Not Needed |

---

**Next Step:** Which improvement would you like to tackle first? I recommend starting with **S4-1 through S4-3** (the 3 owner-requested features), then moving to **Leave Management** (S5-1) as the highest-value Frappe-inspired addition.
