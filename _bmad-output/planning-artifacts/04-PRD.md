# Product Requirements Document (PRD) - NailssentialsQC System

**Product:** NailssentialsQC Salon Management System  
**Version:** 1.0  
**Status:** Draft  
**Team:** SFIT-2B Group 4, Quezon City University  
**Date:** April 14, 2026

---

## 1. INTRODUCTION

### 1.1 Purpose

This Product Requirements Document (PRD) defines the functional and non-functional requirements for the NailssentialsQC Salon Management System. It serves as the authoritative reference for development, testing, and stakeholder alignment.

### 1.2 Scope

The system is a web-based salon management platform that enables:
- Online appointment booking for customers
- Schedule and customer management for staff
- Automated commission computation and payroll for management
- Service catalog with pricing
- Customer profiles and CRM
- Payment recording and receipt generation
- Sales reporting and analytics

**Excluded from Scope:**
- Inventory tracking (deferred to future version)
- Online payment gateway integration
- SMS notifications (email/push only initially)
- Multi-branch support
- Mobile native applications

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|-----------|
| PRD | Product Requirements Document |
| MVP | Minimum Viable Product |
| CRM | Customer Relationship Management |
| GCash | Digital wallet payment method (Philippines) |
| JWT | JSON Web Token (authentication) |
| API | Application Programming Interface |
| UI/UX | User Interface / User Experience |
| CRUD | Create, Read, Update, Delete |

---

## 2. USER ROLES AND PERMISSIONS

### 2.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|--------------|
| **Customer** | Salon client using the booking system | Public-facing portal |
| **Staff** | Technician providing services | Staff dashboard |
| **Manager** | Salon owner/administrator | Full admin access |

### 2.2 Permission Matrix

| Feature | Customer | Staff | Manager |
|---------|----------|-------|---------|
| View service catalog | ✓ | ✓ | ✓ |
| Book appointments | ✓ | ✗ | ✗ (can create on behalf) |
| View own appointments | ✓ (own only) | ✓ (own schedule) | ✓ (all staff) |
| Manage appointments | ✓ (own only) | ✓ (approve/cancel) | ✓ (all) |
| View customer profiles | ✗ | ✓ (booked customers) | ✓ (all) |
| Edit customer profiles | ✗ | ✗ | ✓ |
| Record payments | ✗ | ✓ | ✓ |
| View commissions | ✗ | ✓ (own only) | ✓ (all staff) |
| Manage commissions | ✗ | ✗ | ✓ |
| Manage services | ✗ | ✗ | ✓ |
| Manage staff | ✗ | ✗ | ✓ |
| View sales reports | ✗ | ✗ | ✓ |
| Attendance check-in | ✗ | ✓ | ✓ |
| Manage attendance | ✗ | ✗ | ✓ |

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Module: User Authentication & Authorization

**FR-AUTH-001: User Registration**
- **Priority:** P0 (Critical)
- **Description:** Customers can create accounts with email/phone and password
- **Acceptance Criteria:**
  - Registration form with: name, email/phone, password, confirm password
  - Email/phone validation
  - Password strength requirements (minimum 8 characters, 1 uppercase, 1 number)
  - Duplicate account prevention (unique email/phone)
  - Success notification upon registration
  - Automatic login after registration
- **Business Rules:**
  - Each email/phone can only have one account
  - Password stored as bcrypt hash (never plaintext)
  - Registration timestamp recorded

**FR-AUTH-002: User Login**
- **Priority:** P0 (Critical)
- **Description:** Users can authenticate with credentials
- **Acceptance Criteria:**
  - Login form with email/phone and password
  - "Remember me" option (30-day session)
  - Failed login attempts limited to 5 (15-minute lockout)
  - Password reset via email link
  - Redirect to appropriate dashboard (customer/staff/manager)
- **Business Rules:**
  - Session timeout after 2 hours of inactivity
  - Failed attempts tracked per IP address
  - Password reset link expires after 1 hour

**FR-AUTH-003: Role-Based Access Control**
- **Priority:** P0 (Critical)
- **Description:** System enforces role permissions on all routes and actions
- **Acceptance Criteria:**
  - Middleware validates user role on every request
  - Unauthorized access returns 403 Forbidden
  - Role stored in JWT token
  - Admin-only routes protected
- **Business Rules:**
  - Role cannot be changed by user (manager only)
  - Session invalidated if role changes

---

### 3.2 Module: Service Catalog

**FR-SVC-001: View Services**
- **Priority:** P0 (Critical)
- **Description:** All users can browse services organized by category
- **Acceptance Criteria:**
  - Services displayed in categories: Nails, Hair, Waxing, Lashes
  - Each service shows: name, description, duration, price, thumbnail
  - Grid/list view toggle
  - Filter by category, price range, duration
  - Search functionality (by name or keyword)
  - Popular services highlighted
  - Package deals clearly marked
- **Business Rules:**
  - Only active services shown (inactive hidden from customers)
  - Prices displayed in PHP (₱)
  - Duration shown in minutes

**FR-SVC-002: Manage Services (Manager Only)**
- **Priority:** P0 (Critical)
- **Description:** Manager can add, edit, enable/disable services
- **Acceptance Criteria:**
  - CRUD interface for services
  - Form fields: name, description, category, duration, price, thumbnail, is_active
  - Category selection from predefined list
  - Price validation (positive number, max ₱10,000)
  - Duration validation (15-480 minutes)
  - Bulk enable/disable
  - Changes reflected immediately in customer view
- **Business Rules:**
  - Services with upcoming appointments cannot be deleted (only disabled)
  - Price changes apply to future bookings only (existing appointments retain old price)
  - Service deletion audit trail maintained

---

### 3.3 Module: Appointment Booking

**FR-APT-001: Book Appointment (Customer)**
- **Priority:** P0 (Critical)
- **Description:** Customers can book appointments online
- **Acceptance Criteria:**
  - Multi-step booking flow:
    1. Select service(s)
    2. Select preferred technician (optional, filtered by specialization)
    3. Select date (calendar view, next 14 days)
    4. Select available time slot
    5. Review and confirm
  - Real-time availability check
  - Time slots respect:
    - Operating hours (12:00 PM - 10:00 PM)
    - Technician availability
    - Service duration
    - 10-minute buffer between appointments
  - Confirmation notification sent
  - Appointment added to staff schedule immediately
- **Business Rules:**
  - Booking window: 1 day to 14 days in advance
  - Maximum 3 active appointments per customer
  - Pre-booked appointments prioritized over walk-ins
  - Double-booking prevention (real-time lock)

**FR-APT-002: View Appointments (Customer)**
- **Priority:** P0 (Critical)
- **Description:** Customers can view their upcoming and past appointments
- **Acceptance Criteria:**
  - List view with status badges (pending, confirmed, completed, cancelled)
  - Appointment details: service, technician, date/time, price, status
  - Filter by status, date range
  - Sort by date (ascending/descending)
  - Upcoming appointments at top by default
- **Business Rules:**
  - Only own appointments visible
  - Past appointments (completed > 30 days) archived but accessible

**FR-APT-003: Reschedule/Cancel Appointment (Customer)**
- **Priority:** P1 (High)
- **Description:** Customers can modify their appointments
- **Acceptance Criteria:**
  - Reschedule button on appointment details
  - Same booking flow as new appointment
  - Cancel button with confirmation dialog
  - Cancellation reason (optional)
  - Notifications sent to staff
  - Time slot released immediately
- **Business Rules:**
  - Reschedule/cancel allowed up to 24 hours before appointment
  - Within 24 hours: cancellation allowed but noted in customer history
  - No-show after appointment time + 15 minutes grace period
  - Excessive cancellations (>3 in 30 days) may require manager approval

**FR-APT-004: Manage Schedule (Staff)**
- **Priority:** P0 (Critical)
- **Description:** Staff can view and manage their daily/weekly schedule
- **Acceptance Criteria:**
  - Calendar/timeline view (day, week)
  - Appointments displayed with customer name, service, time
  - Color-coded by status (pending, confirmed, in-progress, completed)
  - Click appointment for details
  - Approve/reject pending appointments
  - Mark appointment as started/completed
  - Add service notes (e.g., "customer requested nude pink")
- **Business Rules:**
  - Only own schedule visible (except manager)
  - Appointment status transitions: pending → confirmed → in-progress → completed
  - Cannot skip statuses
  - Completion timestamp recorded automatically

**FR-APT-005: Walk-In Appointment (Staff/Manager)**
- **Priority:** P1 (High)
- **Description:** Staff can rapidly create appointments for walk-in customers using the counter desktop to immediately block out time slots.
- **Acceptance Criteria:**
  - "Add Walk-In" button prominently displayed on schedule/dashboard
  - Ultra-fast entry form: service, technician, and time are the only required fields initially
  - Customer name and details can be added later (allows immediate blocking of schedule)
  - Immediately added to schedule to prevent double-booking with online system
  - System optimized for use on a desktop computer at the shop counter
- **Business Rules:**
  - Walk-in flag set on appointment
  - Subject to availability, but designed for rapid blocking
  - Can override availability (manager only, with reason logged)

---

### 3.4 Module: Customer Management

**FR-CUST-001: Customer Profile**
- **Priority:** P1 (High)
- **Description:** Customers can manage their profile information
- **Acceptance Criteria:**
  - Editable fields: name, email, phone, password
  - Preferences section:
    - Favorite services (multi-select)
    - Favorite technicians (multi-select)
    - Allergies/sensitivities (text)
    - Notes (text, e.g., "prefers nude pink")
  - Profile photo upload (optional)
  - Save changes with confirmation
- **Business Rules:**
  - Email/phone uniqueness enforced
  - Password change requires current password
  - Preferences visible to staff before service

**FR-CUST-002: Customer History (Staff View)**
- **Priority:** P1 (High)
- **Description:** Staff can view customer booking history and preferences
- **Acceptance Criteria:**
  - Customer profile accessible from appointment details
  - Displays:
    - Contact information
    - Preferences and allergies
    - Booking history (service, date, technician, notes)
    - Total visits, total spent
    - Last visit date
    - Favorite services/technicians
  - Staff can add post-service notes
- **Business Rules:**
  - Read-only for staff (except notes)
  - Notes visible to all staff
  - Sensitive information (allergies) prominently displayed

---

### 3.5 Module: Payment & Receipts

**FR-PAY-001: Record Payment**
- **Priority:** P1 (High)
- **Description:** Staff can record payment after service completion
- **Acceptance Criteria:**
  - Payment form on completed appointment
  - Payment method selection: Cash, GCash
  - Amount field (defaults to service price, editable for tips/discounts)
  - Submit payment
  - Receipt generated automatically
  - Transaction recorded in system
- **Business Rules:**
  - Payment can only be recorded after appointment marked completed
  - Amount cannot be negative
  - Partial payments not supported (full payment required)
  - Payment timestamp recorded

**FR-PAY-002: Digital Receipt**
- **Priority:** P1 (High)
- **Description:** System generates digital receipts for all transactions
- **Acceptance Criteria:**
  - Receipt displays:
    - Receipt number (auto-generated, sequential)
    - Date/time of transaction
    - Service(s) rendered
    - Technician name
    - Amount paid
    - Payment method
    - Customer name (if available)
  - Receipt accessible to customer (My Appointments > View Receipt)
  - Receipt printable (print-friendly format)
  - Receipt downloadable as PDF
- **Business Rules:**
  - Receipt number format: YYYYMMDD-NNN (e.g., 20260414-001)
  - Sequential numbering (no gaps)
  - Receipts cannot be deleted (voided status available)
  - Voided receipts require manager approval and reason

---

### 3.6 Module: Commission & Payroll

**FR-COM-001: Automatic Commission Calculation**
- **Priority:** P0 (Critical)
- **Description:** System computes commissions automatically upon payment
- **Acceptance Criteria:**
  - Commission calculated when payment recorded
  - Correct rates applied:
    - Hair services: 20% if total hair ≥ ₱6,000, else 10%
    - Nails/Lashes/Waxing: Flat 10%
  - Commission breakdown visible to staff in real-time
  - Daily total displayed on staff dashboard
  - Weekly tiered commission applied (rates TBD with management)
- **Business Rules:**
  - Commission tied to payment, not appointment completion
  - Commission computed per service
  - Daily individual target: ₱6,000
  - Team break-even target: ₱8,000
  - Commission computation monthly, distribution weekly

**FR-COM-002: Commission Dashboard (Staff)**
- **Priority:** P1 (High)
- **Description:** Staff can view their commission earnings and performance
- **Acceptance Criteria:**
  - Dashboard displays:
    - Today's earnings (commission earned)
    - Daily target progress (bar chart: earned vs. ₱6,000)
    - Weekly total and tier level
    - Estimated commission rate
    - Recent transactions (list)
  - Filter by date range
  - Export commission summary
- **Business Rules:**
  - Commissions visible only to respective staff
  - Manager can view all staff commissions
  - Historical data retained indefinitely

**FR-COM-003: Payroll Report (Manager)**
- **Priority:** P1 (High)
- **Description:** Manager can generate payroll reports for all staff
- **Acceptance Criteria:**
  - Select staff and date range
  - Report includes:
    - Total services completed
    - Total sales generated
    - Commission breakdown (per service)
    - Total commission earned
    - Deductions (tardiness, loans, etc.)
    - Net pay
  - Export to CSV/PDF
  - Print payroll summary
- **Business Rules:**
  - Payroll period: weekly (manager-defined start day)
  - Monthly computation for accuracy
  - Deductions applied in last week of month
  - Payroll data locked after distribution (edit requires manager override)

---

### 3.7 Module: Attendance & Tardiness

**FR-ATT-001: Check-In/Check-Out**
- **Priority:** P2 (Medium)
- **Description:** Staff can record attendance
- **Acceptance Criteria:**
  - Check-in button on staff dashboard
  - Check-out button at end of shift
  - Timestamp recorded automatically
  - Late check-in flagged if after scheduled time + 15 minutes
  - Daily attendance log visible
- **Business Rules:**
  - One check-in and one check-out per day
  - Scheduled shift hours set by manager
  - Late check-in deduction: ₱1/minute after 15-minute grace
  - Early check-out deduction: pro-rated

**FR-ATT-002: Attendance Report (Manager)**
- **Priority:** P2 (Medium)
- **Description:** Manager can view attendance records and deductions
- **Acceptance Criteria:**
  - Staff attendance calendar (color-coded: on-time, late, absent)
  - Tardiness log with minutes and deductions
  - Monthly attendance summary
  - Export attendance report
- **Business Rules:**
  - Attendance data used for payroll deductions
  - Poor attendance may affect cash advance eligibility (manager discretion)
  - Attendance records retained for 1 year

---

### 3.8 Module: Sales & Reporting

**FR-RPT-001: Daily Sales Summary**
- **Priority:** P1 (High)
- **Description:** Manager can view daily sales performance
- **Acceptance Criteria:**
  - Dashboard widget showing:
    - Today's total sales
    - Number of appointments
    - Walk-in vs. online booking ratio
    - Team target progress (₱8,000 break-even)
    - Top services by revenue
  - Comparison with previous day/week
  - Export daily summary
- **Business Rules:**
  - Sales data updates in real-time
  - Includes completed and paid appointments only
  - Excludes cancelled/voided transactions

**FR-RPT-002: Analytics Dashboard**
- **Priority:** P2 (Medium)
- **Description:** Manager can access comprehensive analytics
- **Acceptance Criteria:**
  - Reports available:
    - Sales trends (daily, weekly, monthly)
    - Service popularity (bookings, revenue)
    - Staff performance (services, sales, commissions)
    - Customer insights (new vs. returning, frequency)
    - Peak hours analysis
  - Date range selector
  - Visualizations: line charts, bar charts, pie charts
  - Export data (CSV, PDF)
- **Business Rules:**
  - Analytics based on completed transactions only
  - Data refreshed daily (overnight batch)
  - Historical data available from system launch date

---

### 3.9 Module: Notifications

**FR-NTF-001: Appointment Confirmations**
- **Priority:** P1 (High)
- **Description:** System sends notifications for appointment events
- **Acceptance Criteria:**
  - Confirmation sent upon booking
  - Reminder sent 24 hours before appointment
  - Notification sent for rescheduled/cancelled appointments
  - Notification includes: date, time, service, technician
  - In-app notifications (bell icon)
  - Email notifications (if email provided)
- **Business Rules:**
  - Notifications sent to customer only
  - Staff notified of new/changed bookings via dashboard alert
  - Reminder timing: 24 hours before (configurable)

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-001 | Page load time (initial) | < 3 seconds |
| NFR-PERF-002 | Page load time (subsequent) | < 1 second |
| NFR-PERF-003 | API response time (95th percentile) | < 500ms |
| NFR-PERF-004 | Concurrent users supported | 50+ |
| NFR-PERF-005 | Booking availability check | < 1 second |
| NFR-PERF-006 | Commission calculation | < 200ms |

### 4.2 Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-USE-001 | Learnability (new user completes first booking) | < 5 minutes |
| NFR-USE-002 | Task completion rate (common tasks) | > 95% |
| NFR-USE-003 | Error rate (form submissions) | < 5% |
| NFR-USE-004 | User satisfaction (post-use survey) | > 4/5 |
| NFR-USE-005 | Clicks to book appointment | < 7 clicks |
| NFR-USE-006 | Mobile-responsive | All screen sizes (320px+) |

### 4.3 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-001 | Uptime during operating hours (12 PM - 10 PM) | 99% |
| NFR-REL-002 | Data backup frequency | Daily (automated) |
| NFR-REL-003 | Recovery time objective (RTO) | < 4 hours |
| NFR-REL-004 | Recovery point objective (RPO) | < 24 hours |
| NFR-REL-005 | Transaction integrity | 100% (no lost bookings/payments) |

### 4.4 Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SEC-001 | Password storage | Bcrypt hash (cost factor 12) |
| NFR-SEC-002 | Session management | JWT with 2-hour expiry |
| NFR-SEC-003 | Input validation | All user inputs sanitized |
| NFR-SEC-004 | SQL injection prevention | Parameterized queries only |
| NFR-SEC-005 | XSS prevention | Output encoding on all views |
| NFR-SEC-006 | HTTPS | Enforced on all routes |
| NFR-SEC-007 | Role-based access control | Enforced on all routes |
| NFR-SEC-008 | Failed login lockout | 5 attempts, 15-minute lockout |
| NFR-SEC-009 | Data privacy compliance | RA 10173 (Data Privacy Act 2012) |

### 4.5 Compatibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-CMP-001 | Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-CMP-002 | Mobile support | iOS Safari, Android Chrome |
| NFR-CMP-003 | Screen sizes | 320px (mobile) to 2560px (desktop) |
| NFR-CMP-004 | Internet speed | 3G+ (minimum 1 Mbps) |

---

## 5. DATABASE REQUIREMENTS

### 5.1 Data Integrity

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-DB-001 | Referential integrity | Enforced (foreign keys) |
| NFR-DB-002 | ACID compliance | All transactions |
| NFR-DB-003 | Data normalization | 3NF (Third Normal Form) |
| NFR-DB-004 | Indexing | All frequently queried columns |
| NFR-DB-005 | Soft deletes | Timestamp-based (no hard deletes) |

### 5.2 Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Customer profiles | Indefinite (until deletion requested) |
| Appointment history | 2 years |
| Payment records | 5 years (BIR requirement) |
| Commission records | 5 years |
| Attendance records | 1 year |
| System logs | 90 days |

---

## 6. INTEGRATION REQUIREMENTS

### 6.1 Current Integrations

| Integration | Type | Status | Notes |
|-------------|------|--------|-------|
| QR Code System | Display | Required | In-store service menu access |
| GCash (Manual) | Recording | Required | Staff confirms payment, no API |

### 6.2 Future Integrations (Deferred)

| Integration | Type | Priority | Notes |
|-------------|------|----------|-------|
| PayMongo/Xendit | Payment Gateway | P2 | Online payment processing |
| Semaphore | SMS API | P2 | Automated SMS notifications |
| SendGrid | Email API | P1 | Email confirmations (100 free/day) |
| Firebase | Push Notifications | P2 | Browser push notifications |

---

## 7. DEPLOYMENT REQUIREMENTS

### 7.1 Hosting

| Component | Platform | Tier | Cost |
|-----------|----------|------|------|
| Frontend | Vercel/Netlify | Free | $0 |
| Backend | Railway/Render | Free | $0 |
| Database | Railway/PlanetScale | Free | $0 |
| Alternative | School Server | N/A | Provided |

### 7.2 Environment Configuration

| Environment | Purpose | Access |
|-------------|---------|--------|
| Development | Local development | Developers only |
| Staging | Testing, UAT | Developers, QA |
| Production | Live system | All users |

### 7.3 CI/CD Pipeline

- Version control: GitHub
- Automated testing on pull request
- Manual deployment approval
- Deployment logs retained

---

## 8. TESTING REQUIREMENTS

### 8.1 Test Coverage

| Test Type | Coverage Target |
|-----------|----------------|
| Unit tests | > 70% code coverage |
| Integration tests | All API endpoints |
| End-to-end tests | Critical user flows (booking, payment) |
| Performance tests | Load testing (50 concurrent users) |
| Security tests | OWASP Top 10 vulnerabilities |

### 8.2 User Acceptance Testing (UAT)

- Test participants: 2 staff, 1 manager, 3 customers
- Test scenarios: All P0 and P1 features
- Success criteria: > 90% task completion rate
- Feedback collection: Structured survey + open feedback

---

## 9. CONSTRAINTS

### 9.1 Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No dedicated devices in shop | Staff use personal devices | Mobile-first responsive design |
| Existing internet only | Dependent on shop wifi | Optimize for low bandwidth |
| Free hosting tiers | Usage limits (bandwidth, compute) | Monitor usage, optimize performance |
| Semester timeline | Limited development time (~4 months) | Strict MVP scope, defer nice-to-haves |
| Student team (intermediate skill) | Learning curve for new tech | Use familiar tech stack, thorough testing |

### 9.2 Business Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Single salon only | No multi-branch architecture needed | Design for single location, allow future expansion |
| No historical digital data | Cannot migrate past records | Start fresh, manual data entry for active customers |
| Staff training required | Adoption delay | Hands-on training sessions, user manuals |
| Zero budget | No paid services/APIs | Use free tiers, open-source tools |

---

## 10. ASSUMPTIONS

| Assumption | Validation Required |
|------------|---------------------|
| Staff have access to personal smartphones/tablets | Confirm with management |
| Internet connection stable during operating hours | Monitor for 1 week |
| Commission rules stable during development | Weekly check-ins with management |
| Manager will provide service catalog and pricing | Schedule data collection session |
| Peak booking times predictable (weekends) | Analyze booking patterns after launch |
| Customers willing to register online | Promote during booking process |

---

## 11. ACCEPTANCE CRITERIA

### 11.1 MVP Acceptance

The MVP is considered complete and acceptable when:

- [ ] All P0 features implemented and passing tests
- [ ] All P1 features implemented with known bugs documented
- [ ] End-to-end booking flow works without errors (register → book → pay → commission)
- [ ] Commission computation matches manual calculations (within ±₱1 for 50 test cases)
- [ ] System handles 50 concurrent users without degradation (< 3 second response time)
- [ ] All user roles can complete their primary tasks without assistance
- [ ] Mobile-responsive design verified on iOS Safari and Android Chrome
- [ ] Security basics implemented (authentication, authorization, input validation, HTTPS)
- [ ] Staff trained and comfortable with system (post-training survey > 4/5 satisfaction)
- [ ] UAT completed with > 90% task completion rate

### 11.2 Production Readiness

The system is production-ready when:

- [ ] All critical and high-severity bugs resolved
- [ ] Performance testing passed (all NFR-PERF targets met)
- [ ] Security audit completed (no OWASP Top 10 vulnerabilities)
- [ ] Data backup configured and tested
- [ ] Error monitoring configured (logging, alerting)
- [ ] User documentation complete (user manual, FAQ)
- [ ] Manager approval obtained

---

## 12. APPENDICES

### Appendix A: Requirements Traceability Matrix

| Requirement ID | Feature | Test Case | Status |
|----------------|---------|-----------|--------|
| FR-AUTH-001 | User Registration | TC-AUTH-001 | Pending |
| FR-AUTH-002 | User Login | TC-AUTH-002 | Pending |
| FR-SVC-001 | View Services | TC-SVC-001 | Pending |
| FR-APT-001 | Book Appointment | TC-APT-001 | Pending |
| FR-COM-001 | Commission Calculation | TC-COM-001 | Pending |
| ... (all requirements) | ... | ... | Pending |

### Appendix B: Change Request Template

| Field | Value |
|-------|-------|
| Change Request ID | CR-YYYYMMDD-NNN |
| Date | |
| Requested By | |
| Description | |
| Impact Assessment | |
| Priority | P0/P1/P2 |
| Approved By | |
| Status | Pending/Approved/Rejected |

### Appendix C: Glossary

(See Glossary in Product Brief document)

---

**Document Status:** Draft - For Review  
**Review Date:** April 21, 2026  
**Next Step:** UX Design → System Architecture → Sprint Planning  
**Prepared by:** SFIT-2B Group 4
