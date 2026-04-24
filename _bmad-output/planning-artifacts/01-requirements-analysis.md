# NailssentialsQC System - Requirements Analysis

**Project:** NailssentialsQC System  
**Client:** NailssentialsQC Salon, Quezon City  
**Team:** SFIT-2B Group 4, QC University  
**Date:** February 2026  
**Analysis Phase:** Phase 1 - Requirements Gathering & Analysis

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview
NailssentialsQC is a full-service beauty salon offering nail, hair, waxing, and lash services. Currently operating with entirely manual processes, the salon requires a digital system to streamline operations, improve customer experience, and automate staff management.

### 1.2 Current State
- **Operating Hours:** 12:00 PM - 10:00 PM (regular and seasonal days)
- **Staff:** 5 technicians (2 generalists, 2 nail-specialized, 1 manager)
- **Booking:** Walk-in priority, some via Facebook/Instagram messaging
- **Payment:** Cash and GCash only
- **Inventory:** Manual pen-and-paper tracking, monthly restocking *(excluded from system scope)*
- **Staff Scheduling:** Group chat messaging
- **Commission Calculation:** Manager computes manually
- **Internet:** Available but no devices or software in use
- **Online Presence:** None (no website)

### 1.3 Research Methodology
- **Stakeholder Interviews:** 3-day interview sessions with management and staff
- **Total Respondents:** 133 (20 managers, 67 staff, 46 customers)
- **Data Collection:** Structured interviews covering operations, pain points, and requirements

---

## 2. STAKEHOLDER ANALYSIS

### 2.1 Primary Stakeholders

| Stakeholder | Count | % | Key Interests |
|-------------|-------|---|---------------|
| Staff/Technicians | 67 | 50.38% | Payroll accuracy, commission transparency, scheduling, performance tracking |
| Customers | 46 | 34.58% | Easy booking, service visibility, payment options, reduced wait times |
| Management | 20 | 15.04% | Operations oversight, reporting, marketing |

### 2.2 Stakeholder Needs

**Customers:**
- Online appointment booking (browse, book, reschedule, cancel)
- Service catalog with pricing, duration, and technician selection
- Multiple payment methods with automatic receipts
- User profiles with booking history and preferences
- Notifications (confirmations, reminders, updates)
- Reviews and feedback system
- Mobile-friendly interface

**Staff/Technicians:**
- Clear booking management (approve, reschedule, cancel)
- Customer information access (history, preferences, allergies)
- Service management capabilities (pricing, availability)
- Communication tools with customers
- Payment verification
- Automated payroll and commission calculation
- Performance tracking against goals

**Management:**
- ~~Inventory tracking and alerts~~ *(removed from scope)*
- Staff scheduling and attendance
- Commission and payroll automation
- Sales reporting and analytics
- Customer database and CRM
- Marketing tools and online presence

---

## 3. PROBLEM ANALYSIS

### 3.1 Identified Problems (Prioritized by Impact)

| Priority | Problem | Affected Stakeholders | Impact Level |
|----------|---------|----------------------|--------------|
| P1 | Long queues and overcrowding | Customers, Staff | Critical (95.65% of respondents) |
| P2 | No online appointment system | Customers, Staff | Critical |
| P3 | Unknown online presence limiting customers | Management, Customers | High |
| P4 | ~~Manual inventory tracking causing stock shortages~~ *(excluded from scope)* | Management, Staff | N/A |
| P5 | Manual commission computation | Management, Staff | High |
| P6 | No customer database/CRM | Staff, Customers | Medium |
| P7 | Cash/GCash-only payment recording | Customers, Management | Medium |
| P8 | No digital receipts (except GCash) | Customers | Medium |
| P9 | Manual staff scheduling via group chat | Management, Staff | Medium |
| P10 | No marketing or promotions system | Management | Low-Medium |

### 3.2 Problem Details

**P1: Long Queues and Overcrowding**
- **Root Cause:** Walk-in priority system with no advance booking
- **Impact:** Customer dissatisfaction, time waste, potential revenue loss
- **Frequency:** 44 out of 46 customer respondents (95.65%)

**P2: No Online Appointment System**
- **Root Cause:** Reliance on Facebook/Instagram messaging and walk-ins
- **Impact:** Inefficient scheduling, customer frustration, staff idle time
- **Current State:** Bookings handled via social media messages or in-person

**P3: Unknown Online Presence**
- **Root Cause:** No website or digital marketing
- **Impact:** Limited customer reach, no online visibility
- **Current State:** Customers find salon through word-of-mouth or physical location

**P4: ~~Manual Inventory Tracking~~** *(Excluded from scope - future enhancement)*
- ~~Root Cause:~~ Pen-and-paper system with monthly checks
- ~~Impact:~~ Stock shortages, service delays, wasted supplies
- ~~Current State:~~ Monthly inventory checks, restocking only once per month
- **Note:** Not included in current system version

**P5: Manual Commission Computation**
- **Root Cause:** Manager calculates daily rates and commissions manually
- **Impact:** Time-consuming, potential errors, lack of transparency
- **Complexity:** Multiple commission tiers and performance triggers

---

## 4. BUSINESS RULES ANALYSIS

### 4.1 Commission Structure

**Hair Services (Performance-Trigger):**
- If total hair service amount ≥ ₱6,000: **20% commission**
- If total hair service amount < ₱6,000: **10% commission**

**Nails, Lashes, Waxing:**
- Flat **10% commission** of original service price (regardless of total)

**Weekly Tiered Commission:**
- Commission rate increases as shop's total weekly sales grow
- Tier breakdown to be confirmed with management

**Daily Team Goal:**
- **₱8,000 break-even target** (covers rent, electricity, water, supplies)

### 4.2 Attendance & Deductions

**Tardiness Policy:**
- 15-minute grace period
- Beyond grace period: **₱1 per minute deduction**
- Early outs (leaving before shift end): Subject to deductions

**Payroll Schedule:**
- Computed monthly for accuracy
- Distributed weekly for cash flow
- Consolidated deductions applied in last week of month

**Cash Advance:**
- Not guaranteed
- Dependent on attendance record
- Poor punctuality/frequent absences may result in denial

**Other Deductions:**
- Loan payments
- Uniform fees
- Regulated by management for fairness

### 4.3 Service Assignment Rules

**Technician Specialization:**
- 2 generalists: Handle all service types (nails, hair, waxing, lashes)
- 2 specialized: Handle nail services only
- Assignment based on service type chosen by customer

**Priority System:**
- Pre-booked appointments given priority over walk-ins
- Walk-ins accommodated based on availability

### 4.4 Payment Rules

**Accepted Methods:**
- Cash
- GCash (digital wallet)

**Receipt Policy:**
- Digital receipts automatically issued for GCash transactions
- Other receipts provided based on customer preference

**Pricing:**
- Consistent pricing (no weekend/holiday changes)
- Package deals and combos available

---

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 Customer-Facing Features

**FR1: Online Appointment Booking**
- Browse available services with pricing and duration
- Select preferred technician (based on availability and specialization)
- Book, reschedule, or cancel appointments
- View appointment history and upcoming bookings
- QR code integration for in-store service viewing

**FR2: Service Catalog**
- Display all services (nails, hair, waxing, lashes)
- Show pricing, duration, and descriptions
- Highlight popular services
- Display package deals and combos
- Technician availability calendar

**FR3: User Account Management**
- Customer registration and login
- Profile management (contact info, preferences, allergies)
- Booking history
- Preference storage (favorite services, technicians, nail colors)
- Loyalty program (future enhancement - previously existed but inactive)

**FR4: Payment Processing**
- Payment method selection (cash, GCash)
- Secure transaction recording
- Automatic digital receipt generation
- Payment confirmation

**FR5: Notifications**
- Appointment confirmations
- Reminder notifications (24 hours before)
- Status updates (rescheduled, cancelled)
- Promotional messages (future)

**FR6: Reviews & Feedback**
- Rate services (star rating)
- Write reviews for completed services
- Submit complaints or feedback
- View aggregate ratings

### 5.2 Staff-Facing Features

**FR7: Booking Management**
- View daily/weekly appointment schedule
- Approve, reschedule, or cancel appointments
- Manage availability calendar
- View customer details before appointments

**FR8: Customer Information Management**
- Access customer profiles
- View booking history
- See preferences and allergies
- Communication history

**FR9: Service Management**
- Update service offerings
- Modify pricing and duration
- Set availability and working hours
- Manage specialization tags

**FR10: Payment Verification**
- Confirm payment receipt
- View transaction status
- Access digital receipts

**FR11: Feedback Management**
- View customer reviews
- Respond to feedback
- Track complaint resolution

### 5.3 Management-Facing Features

**FR12: ~~Inventory Management~~** *(Removed from scope)*
- ~~Track product and supply levels~~
- ~~Monitor usage per service~~
- ~~Set low-stock alerts~~
- ~~Track expiration dates~~
- ~~Generate inventory reports~~
- ~~Restocking schedule management~~

**FR13: Staff & Payroll Management**
- Automated commission calculation (based on business rules)
- Attendance tracking (check-in/check-out)
- Tardiness monitoring and deduction calculation
- Daily rate computation
- Weekly tiered commission tracking
- Performance goal tracking (₱6,000 individual, ₱8,000 team)
- Cash advance eligibility checking
- Payroll generation and distribution scheduling

**FR14: Sales & Reporting Dashboard**
- Daily sales tracking
- Revenue reports
- Staff performance analytics
- Customer visit analytics
- Service popularity metrics
- Inventory usage reports
- Commission summary reports

**FR15: Customer Relationship Management (CRM)**
- Customer database
- Visit history tracking
- Preference management
- Feedback and complaint tracking
- Customer segmentation
- Retention analytics

**FR16: Marketing Tools**
- Online service visibility
- Promotional campaign management
- Package deal creation
- Social media integration (future)

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Usability
- **NFR1:** Simple, intuitive interface requiring minimal training
- **NFR2:** Mobile-responsive design (works on phones, tablets, desktops)
- **NFR3:** Fast loading times (< 3 seconds)
- **NFR4:** Accessible to users with varying technical literacy

### 6.2 Performance
- **NFR5:** Support concurrent users (minimum 50 simultaneous users)
- **NFR6:** Handle peak booking periods without degradation
- **NFR7:** Real-time availability updates
- **NFR8:** Quick search and filter operations

### 6.3 Reliability
- **NFR9:** 99% uptime during operating hours (12 PM - 10 PM)
- **NFR10:** Automatic data backup
- **NFR11:** Graceful error handling with user-friendly messages
- **NFR12:** Transaction integrity (no lost bookings or payments)

### 6.4 Security
- **NFR13:** Secure user authentication
- **NFR14:** Data encryption for sensitive information
- **NFR15:** Role-based access control (customer, staff, admin)
- **NFR16:** Payment data protection
- **NFR17:** GDPR/Privacy compliance for customer data

### 6.5 Scalability
- **NFR18:** Support future multi-branch expansion
- **NFR19:** Handle increasing customer base without performance loss
- **NFR20:** Modular architecture for feature additions

### 6.6 Technical Constraints
- **NFR21:** Web-based system (no native mobile app)
- **NFR22:** Leverage existing shop internet connection
- **NFR23:** No dedicated devices currently available (staff use personal devices)
- **NFR24:** Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## 7. USE CASE ANALYSIS

### 7.1 Primary Use Cases

| Use Case | Actor | Description | Priority |
|----------|-------|-------------|----------|
| Book Appointment | Customer | Browse services, select technician, book slot | High |
| Manage Appointment | Customer/Staff | Reschedule or cancel booking | High |
| Process Payment | Customer/Staff | Record payment, generate receipt | High |
| Calculate Commission | System/Manager | Auto-compute based on rules | High |
| ~~Track Inventory~~ | ~~Manager/Staff~~ | ~~Monitor stock levels, receive alerts~~ | ~~High~~ *(removed)* |
| View Schedule | Staff/Manager | Check daily/weekly appointments | High |
| Submit Feedback | Customer | Rate and review services | Medium |
| Generate Reports | Manager | Sales, performance reports | Medium |
| Manage Services | Manager | Update offerings, pricing, availability | Medium |
| Track Attendance | Staff/Manager | Check-in/out, monitor tardiness | Medium |

### 7.2 Use Case Flow: Book Appointment

1. Customer logs in to system
2. Browses service catalog
3. Selects desired service(s)
4. Views available technicians (filtered by specialization)
5. Selects preferred date and time slot
6. Confirms booking details
7. Receives confirmation notification
8. Appointment added to staff schedule

### 7.3 Use Case Flow: Calculate Commission

1. System records completed service and payment
2. Identifies service type (hair vs. nails/lashes/waxing)
3. Retrieves technician's daily/weekly totals
4. Applies commission rules:
   - Hair: Check if ≥ ₱6,000 → 20%, else 10%
   - Others: Flat 10%
5. Applies weekly tiered adjustments
6. Records commission in payroll
7. Displays on technician dashboard

---

## 8. DATA REQUIREMENTS

### 8.1 Core Entities

**Customer:**
- Customer ID, Name, Contact (phone, email), Registration date
- Preferences (favorite services, technicians, colors)
- Allergies/Notes
- Booking history
- Feedback history

**Service:**
- Service ID, Name, Category (nails/hair/waxing/lashes)
- Description, Duration, Price
- Specialization required
- Popularity rating
- Package membership (yes/no)

**Appointment:**
- Appointment ID, Customer ID, Technician ID(s)
- Service(s) booked
- Date, Time, Duration
- Status (pending/confirmed/completed/cancelled)
- Payment status
- Walk-in vs. Pre-booked flag

**Technician/Staff:**
- Staff ID, Name, Contact
- Specialization(s)
- Schedule/Availability
- Attendance records
- Performance metrics
- Commission records

**~~Inventory Item:~~** *(removed from scope)*
- ~~Item ID, Name, Category~~
- ~~Current stock level~~
- ~~Minimum stock threshold~~
- ~~Expiration date~~
- ~~Usage rate per service~~
- ~~Supplier information~~

**Transaction/Payment:**
- Transaction ID, Appointment ID
- Amount, Payment method (cash/GCash)
- Date/Time
- Receipt number
- Status

**Commission Record:**
- Commission ID, Staff ID, Period
- Base amount, Commission rate, Total commission
- Deductions (tardiness, loans, etc.)
- Net pay
- Distribution schedule

### 8.2 Data Volume Estimates

- **Customers:** Growing from 0, expect 500-1000 in first year
- **Services:** ~50-100 service types
- **Appointments:** ~20-40 per day (7,000-14,000 per year)
- ~~**Inventory Items:** ~100-200 SKUs~~ *(removed)*
- **Transactions:** Equal to appointments (1:1 ratio)

---

## 9. INTEGRATION REQUIREMENTS

### 9.1 Current Integrations
- **QR Code System:** Already in use for service menu display
- **GCash:** Payment recording (manual, no API integration)

### 9.2 Future Integration Opportunities
- **Payment Gateway:** Online payment processing (deferred)
- **SMS Gateway:** Automated SMS notifications
- **Email Service:** Email confirmations and marketing
- **Social Media:** Facebook/Instagram integration for bookings
- **Loyalty Program:** Re-activate previous loyalty card system

---

## 10. CONSTRAINTS & ASSUMPTIONS

### 10.1 Constraints

1. **No dedicated devices** in shop - staff will use personal devices
2. **Existing internet connection** must be leveraged
3. **Semester timeline** limits development scope
4. **No historical digital data** - manual records may be incomplete
5. **Staff training required** for digital transition
6. **Single salon only** - no multi-branch support initially
7. **No online payment processing** - manual recording only

### 10.2 Assumptions

1. Staff have access to personal smartphones/tablets
2. Internet connection is stable during operating hours
3. Management will provide pricing and service catalog data
4. Staff will cooperate with system adoption
5. QR codes can be updated/printed for in-store use
6. Commission rules will remain stable during development
7. Peak booking times are predictable (weekends, holidays)

---

## 11. RISK ANALYSIS

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Internet instability | Medium | High | Offline mode for critical operations |
| Staff device incompatibility | Low | Medium | Mobile-responsive web design |
| Data loss | Low | Critical | Automated backups, cloud storage |
| Performance degradation | Low | Medium | Load testing, optimization |

### 11.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Staff resistance to adoption | Medium | High | Training program, user-friendly design |
| Incomplete manual data migration | Medium | Medium | Phased data entry, validation |
| Changing business rules | Medium | Medium | Flexible configuration, admin controls |
| Scope creep | High | Medium | Clear scope definition, change management |

---

## 12. RECOMMENDATIONS

### 12.1 Phase 1 Priorities (MVP)

1. **Online Appointment Booking System** - Addresses P1, P2
2. **Service Catalog with Pricing** - Addresses P3
3. **User Account Management** - Foundation for all features
4. **Automated Commission Computation** - Addresses P5
5. ~~**Basic Inventory Tracking**~~ - ~~Addresses P4~~ *(removed from MVP)*

### 12.2 Phase 2 Priorities

1. **Payment Recording & Receipt Generation** - Addresses P7, P8
2. **Notifications System** - Enhances booking experience
3. **Reviews & Feedback** - Quality improvement
4. **Reporting Dashboard** - Management visibility

### 12.3 Phase 3 Priorities (Future)

1. **CRM Features** - Customer insights
2. **Marketing Tools** - Promotions, campaigns
3. **Loyalty Program** - Customer retention
4. **Advanced Analytics** - Predictive insights

---

## 13. GLOSSARY

| Term | Definition |
|------|-----------|
| Walk-in | Customer without appointment |
| Pre-booked | Customer with scheduled appointment |
| Commission | Percentage of service price paid to technician |
| Performance-Trigger | Commission rate increases upon reaching sales target |
| Tiered Commission | Progressive commission rates based on weekly totals |
| Grace Period | 15-minute window before tardiness deductions apply |
| Break-Even Target | Daily revenue goal (₱8,000) to cover operational costs |
| QR Code | Quick Response code for in-store service menu access |

---

## 14. APPENDICES

### Appendix A: Interview Data Sources
- Day 1 Interview: Operations, services, payments
- Day 2 Interview: Customer management, inventory, HR
- Day 3 Interview: Commission structure, policies, deductions

### Appendix B: Survey Statistics
- Total Respondents: 133
- Managers: 20 (15.04%)
- Staff: 67 (50.38%)
- Customers: 46 (34.58%)

### Appendix C: Service Categories
1. **Nails:** Manicure, pedicure, gel nails, nail art, extensions
2. **Hair:** Hair services (specific types TBD)
3. **Waxing:** Body waxing services
4. **Lashes:** Eyelash services

---

**Document Status:** Draft  
**Next Phase:** Phase 2 - Planning (System Design & Architecture)  
**Approval Required:** Stakeholder review and sign-off

---

*Prepared by: SFIT-2B Group 4*  
*Date: April 13, 2026*
