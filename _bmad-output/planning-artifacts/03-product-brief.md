# NailssentialsQC System - Product Brief

**Product Name:** NailssentialsQC Salon Management System  
**Version:** 1.0  
**Date:** April 13, 2026  
**Status:** Draft - For Approval  
**Team:** SFIT-2B Group 4, Quezon City University

---

## 1. PRODUCT VISION

### 1.1 Vision Statement

To transform NailssentialsQC from a manual-operation salon into a digitally-enabled beauty service provider, delivering seamless booking experiences, transparent staff compensation, and efficient operations management through an intuitive, web-based system.

### 1.2 Elevator Pitch

**For** NailssentialsQC salon, staff, and customers  
**Who** struggle with long queues, manual processes, and inefficient operations  
**The NailssentialsQC System** is a web-based salon management platform  
**That** enables online appointment booking, automated commission calculation, ~~inventory tracking,~~ and customer relationship management  
**Unlike** existing salon software that is expensive and complex  
**Our Product** is customized for Philippine small-salon operations with zero cost, localized features, and simplified user experience

### 1.3 Success Criteria

**Business Success:**
- Reduce customer wait times by 50% through online booking
- Eliminate stock shortages with proactive inventory alerts *(future enhancement)*
- Reduce manager's payroll computation time from hours to minutes
- Increase customer retention by 30% through better experience

**Technical Success:**
- 99% uptime during operating hours (12 PM - 10 PM)
- < 3 second page load times
- Support 50+ concurrent users
- Zero data loss incidents

**User Adoption:**
- 90%+ staff adoption within 1 month
- 40%+ of bookings made online within 3 months
- 70%+ customer registration rate
- < 10% no-show rate (down from current ~20%)

---

## 2. PROBLEM STATEMENT

### 2.1 Current Situation

NailssentialsQC is a beauty salon in Quezon City offering nail, hair, waxing, and lash services with 5 staff members. The salon operates entirely on manual processes:

- **Booking:** Walk-ins prioritized, some via Facebook/Instagram messaging
- **Payments:** Cash and GCash recorded manually
- **Inventory:** Pen-and-paper tracking with monthly checks *(excluded from scope)*
- **Staff Management:** Group chat scheduling, manual commission calculation
- **Customer Data:** No database; staff rely on memory for regular customers

### 2.2 Pain Points

**From 133 survey respondents (20 managers, 67 staff, 46 customers):**

| Pain Point | Affected | Impact |
|------------|----------|--------|
| Long queues and overcrowding | 95.65% of customers | Lost revenue, poor experience |
| No online booking system | All customers | Inconvenience, inefficiency |
| Unknown online presence | Management | Limited growth |
| ~~Manual inventory causes stock shortages~~ *(excluded from scope)* | Staff, Management | N/A |
| Manual commission computation | Staff, Management | Errors, time waste |
| No customer database | Staff | Impersonal service |

### 2.3 Impact

**Business Impact:**
- Lost revenue from customers deterred by long waits
- Staff idle time due to poor scheduling
- Stock shortages preventing service delivery
- Manager time wasted on manual calculations
- Inability to retain customer data for personalized service

**Customer Impact:**
- 1-2 hour waits during peak times
- No way to book in advance
- No service visibility before visiting
- No receipt for cash payments
- Inconsistent experience (depends on staff memory)

**Staff Impact:**
- Unclear schedules (group chat coordination)
- Delayed commission payments
- Lack of customer context (preferences, allergies)
- No performance visibility

---

## 3. TARGET USERS

### 3.1 User Personas

**Persona 1: Customer - "Maria"**
- **Demographics:** Female, 18-35, student or young professional
- **Goals:** Quick booking, transparent pricing, reliable service
- **Frustrations:** Long waits, uncertainty about services/prices, no online info
- **Tech Savviness:** High (uses smartphone daily, GCash, social media)
- **Behavior:** Books via FB Messenger, pays with GCash, follows salon on Instagram

**Persona 2: Technician - "Anna"**
- **Demographics:** Female, 22-30, specialized in nail services
- **Goals:** Clear schedule, fair pay, happy customers
- **Frustrations:** Unclear appointments, manual commission tracking, no customer info
- **Tech Savviness:** Medium (uses smartphone, social media, unfamiliar with business software)
- **Behavior:** Checks group chat for schedule, computes commissions manually

**Persona 3: Manager - "Sir Robert"**
- **Demographics:** Male, 30-40, salon owner/manager
- **Goals:** Efficient operations, accurate payroll, business growth
- **Frustrations:** Manual processes, time-consuming computations, scheduling challenges
- **Tech Savviness:** Low-Medium (uses smartphone, basic Excel, no specialized software)
- **Behavior:** Computes payroll manually, manages via group chat

### 3.2 User Needs Prioritization

| Need | User | Priority |
|------|------|----------|
| Book appointments online | Customer | Critical |
| View services and prices | Customer | Critical |
| Receive booking confirmations | Customer | High |
| Manage schedule efficiently | Staff | Critical |
| Access customer preferences | Staff | High |
| Transparent commission calculation | Staff | Critical |
| ~~Track inventory automatically~~ | ~~Manager~~ | ~~High~~ *(removed from scope)* |
| Automate payroll computation | Manager | Critical |
| View sales reports | Manager | Medium |
| Manage service offerings | Manager | Medium |

---

## 4. PRODUCT SCOPE

### 4.1 In Scope (What We WILL Build)

**Customer Features:**
- User registration and login
- Service catalog with pricing, duration, descriptions
- Online appointment booking (browse, book, reschedule, cancel)
- Technician selection (based on specialization and availability)
- Appointment history and upcoming bookings view
- Payment method selection (cash, GCash)
- Digital receipt viewing
- Notifications (confirmations, reminders)
- Reviews and ratings for completed services
- Profile management (preferences, contact info, allergies)

**Staff Features:**
- Daily/weekly schedule view
- Appointment management (approve, reschedule, cancel)
- Customer information access (profile, history, preferences)
- Payment verification
- Availability calendar management
- Performance dashboard (daily goal progress, commission estimate)
- Attendance check-in/check-out

**Manager Features:**
- All staff features plus:
- Staff management (add, edit, assign specializations)
- Service management (add, edit, price, duration)
- ~~Inventory tracking (stock levels, alerts, usage)~~ *(removed from scope)*
- Automated commission computation (custom rules)
- Attendance and tardiness tracking
- Payroll generation
- Sales and analytics dashboard
- Customer database and CRM
- Reporting (sales, staff performance, customer analytics)

### 4.2 Out of Scope (What We WON'T Build - Yet)

**Deferred to Future Versions:**
- Online payment gateway integration (manual recording only for now)
- SMS notifications (email/push only initially)
- Loyalty/rewards program (previously existed, can be reactivated)
- Multi-branch support (single salon only)
- E-commerce/retail product sales online
- Marketing campaign management
- Social media integration (Facebook/Instagram booking sync)
- Advanced analytics and predictive insights
- Mobile native app (web-based only)
- BIR-accredited receipt generation

### 4.3 Constraints

**Technical:**
- No dedicated devices in shop (staff use personal devices)
- Must work with existing internet connection
- Web-based system only (no native mobile apps)
- Browser compatibility required (Chrome, Firefox, Safari, Edge)

**Business:**
- Single salon location
- Semester development timeline (~4 months)
- No historical digital data for migration
- Staff training required for digital transition

**Resource:**
- Student development team (intermediate skill level)
- Zero budget for paid services/APIs
- Free hosting tiers only

---

## 5. KEY FEATURES (MVP)

### 5.1 Feature Prioritization Matrix

| Feature | User Value | Effort | Priority |
|---------|-----------|--------|----------|
| Online Appointment Booking | Very High | Medium | **P0 - Must Have** |
| Service Catalog | Very High | Low | **P0 - Must Have** |
| User Authentication | High | Low | **P0 - Must Have** |
| Staff Schedule Management | High | Medium | **P0 - Must Have** |
| Commission Computation | Very High | High | **P0 - Must Have** |
| Payment Recording | High | Low | **P1 - Should Have** |
| ~~Inventory Tracking~~ | ~~High~~ | ~~Medium~~ | ~~**P1 - Should Have**~~ *(removed)* |
| Customer Profiles | Medium | Low | **P1 - Should Have** |
| Notifications | High | Medium | **P1 - Should Have** |
| Reviews & Feedback | Medium | Low | **P2 - Nice to Have** |
| Reporting Dashboard | High | High | **P2 - Nice to Have** |
| Attendance Tracking | Medium | Low | **P2 - Nice to Have** |

### 5.2 MVP Feature Set (Minimum Viable Product)

**Core User Journey (Must Work End-to-End):**

1. Customer registers/logs in
2. Browses service catalog
3. Books appointment (selects service, technician, date/time)
4. Receives confirmation
5. Staff sees appointment in schedule
6. Customer arrives, receives service
7. Staff records payment
8. System computes commission for technician
9. Manager views daily sales summary

**MVP Success = This entire flow works without errors**

### 5.3 Feature Details

**Feature 1: Online Appointment Booking**

**User Story:**  
_As a customer, I want to book an appointment online so I don't have to wait in long queues._

**Acceptance Criteria:**
- Customer can view available time slots for next 14 days
- Time slots respect technician availability and service duration
- Customer receives confirmation email/notification upon booking
- Customer can reschedule or cancel up to 24 hours before appointment
- Staff sees new bookings in their schedule immediately
- Walk-ins can be added to schedule by staff

**Business Rules:**
- Booking window: 1 day to 14 days in advance
- Cancellation deadline: 24 hours before appointment
- Buffer time: 10 minutes between appointments
- Operating hours: 12:00 PM - 10:00 PM
- Pre-booked appointments have priority over walk-ins

---

**Feature 2: Service Catalog**

**User Story:**  
_As a customer, I want to see all available services with prices so I know what to expect._

**Acceptance Criteria:**
- Services organized by category (Nails, Hair, Waxing, Lashes)
- Each service shows: name, description, duration, price
- Popular services highlighted
- Package deals/combos clearly marked
- Prices match salon's official pricing

**Business Rules:**
- Only manager can add/edit services
- Services can be enabled/disabled (temporarily unavailable)
- Duration used for scheduling calculations

---

**Feature 3: Automated Commission Computation**

**User Story:**  
_As a staff member, I want my commissions calculated automatically so I can focus on serving customers._

**Acceptance Criteria:**
- System applies correct commission rates based on service type and performance
- Hair services: 20% if ≥ ₱6,000 total, otherwise 10%
- Nails/Lashes/Waxing: Flat 10%
- Weekly tiered commission rates applied correctly
- Staff can view estimated commissions in real-time
- Manager can export payroll reports

**Business Rules:**
- Commission computed per service completion
- Daily individual target: ₱6,000
- Team break-even target: ₱8,000
- Computation done monthly, distributed weekly
- Deductions applied in last week of month:
  - Tardiness: ₱1/minute after 15-minute grace period
  - Early outs: Pro-rated deduction
  - Loans/uniform fees: As recorded

---

**~~Feature 4: Inventory Tracking~~** *(Removed from scope - future enhancement)*

~~**User Story:**~~
~~_As a manager, I want to track inventory levels so we never run out of supplies._~~

~~**Acceptance Criteria:**~~
- ~~All inventory items listed with current stock levels~~
- ~~Low-stock alerts sent when item reaches minimum threshold~~
- ~~Usage automatically deducted per service completed~~
- ~~Monthly inventory report generated~~
- ~~Expiration date tracking~~

~~**Business Rules:**~~
- ~~Each service has associated product usage:~~
  - ~~Example: Gel manicure = 5ml gel polish, 2 cotton pads~~
- ~~Alert threshold: Configurable per item~~
- ~~Monthly audit: Physical count vs. system record~~
- ~~FIFO rotation for expiration management~~

---

**Feature 5: Customer Profiles & CRM** *(renumbered from Feature 5)*

**User Story:**  
_As a staff member, I want to see customer preferences so I can provide personalized service._

**Acceptance Criteria:**
- Customer profile shows: name, contact, preferences, allergies
- Booking history visible
- Favorite services and technicians highlighted
- Staff can add notes after service (e.g., "preferred shade: nude pink")
- Regular customers easily identifiable

**Business Rules:**
- Profile created on first registration or manual staff entry
- Customer can update own profile
- Staff can view but not delete customer data
- Privacy compliance (data visible only to authorized staff)

---

## 6. USER EXPERIENCE PRINCIPLES

### 6.1 Design Guidelines

**Simplicity:**
- Maximum 3 clicks to complete common tasks
- Clean, uncluttered interface
- Clear navigation (no hidden features)
- Consistent layout across all pages

**Mobile-First:**
- Designed for smartphone screens first
- Touch-friendly buttons and inputs
- Responsive layout for tablets and desktops
- Minimal typing (dropdowns, selections over text input)

**Accessibility:**
- Large, readable fonts (minimum 14px)
- High contrast colors
- Clear labels on all form fields
- Error messages explain what went wrong and how to fix

**Consistency:**
- Same navigation pattern throughout
- Standard color scheme:
  - Primary: Salon brand colors (to be confirmed)
  - Success: Green (#4CAF50)
  - Warning: Orange (#FF9800)
  - Error: Red (#F44336)
- Consistent button styles and placements

### 6.2 Key Screens (MVP)

**Customer-Facing:**
1. Login/Register
2. Home/Dashboard (upcoming appointments, quick actions)
3. Service Catalog (browse, filter, search)
4. Booking Flow (select service → technician → date/time → confirm)
5. My Appointments (list view, upcoming + history)
6. Profile/Settings
7. Review/Rating (post-service)

**Staff-Facing:**
1. Login
2. Daily Schedule (timeline view)
3. Appointment Details (customer info, service, notes)
4. Customer Profile (view history, preferences)
5. Performance Dashboard (goals, commissions)
6. Availability Calendar

**Manager-Facing:**
1. Login
2. Dashboard (today's summary, alerts)
3. Staff Management (list, add, edit)
4. Service Management (list, add, edit, price)
5. ~~Inventory (stock levels, alerts, usage)~~ *(removed)*
6. Payroll/Commissions (reports, breakdowns)
7. Sales Reports (daily, weekly, monthly)
8. Customer Database (list, search, view)

---

## 7. TECHNICAL ARCHITECTURE (High-Level)

### 7.1 Recommended Stack

**Frontend:**
- React.js or Next.js (component-based, industry-standard)
- Tailwind CSS or Bootstrap 5 (responsive design)
- React Hook Form (form validation)
- Axios (API calls)

**Backend:**
- Node.js with Express.js
- RESTful API design
- JWT authentication
- Express Validator (input validation)

**Database:**
- MySQL (relational, ACID compliance)
- Sequelize ORM or Prisma

**Hosting:**
- Frontend: Vercel (free tier)
- Backend + Database: Railway or Render (free tier)
- Alternative: School server if available

**Development Tools:**
- GitHub (version control, collaboration)
- Postman (API testing)
- MySQL Workbench (database design)

### 7.2 System Architecture Diagram

```
┌─────────────────────────────────────────┐
│          Customer Devices               │
│    (Phones, Tablets, Desktops)          │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│          Frontend (React)               │
│      Hosted on Vercel/Netlify           │
│                                         │
│  - Customer Portal                      │
│  - Staff Dashboard                      │
│  - Manager Admin Panel                  │
└──────────────┬──────────────────────────┘
               │
               │ API Calls (JSON)
               ▼
┌─────────────────────────────────────────┐
│       Backend API (Node.js/Express)     │
│      Hosted on Railway/Render           │
│                                         │
│  - Authentication                       │
│  - Booking Management                   │
│  - Commission Engine                    │
│  - ~~Inventory Tracker~~                    │
│  - Reporting                            │
└──────────────┬──────────────────────────┘
               │
               │ SQL Queries
               ▼
┌─────────────────────────────────────────┐
│          Database (MySQL)               │
│      Hosted on Railway/PlanetScale      │
│                                         │
│  - Customers                            │
│  - Appointments                         │
│  - Services                             │
│  - Staff                                │
│  - ~~Inventory~~                            │
│  - Transactions                         │
│  - Commissions                          │
└─────────────────────────────────────────┘
```

---

## 8. METRICS & ANALYTICS

### 8.1 Product Metrics

**Acquisition:**
- New customer registrations per week
- Registration source (online vs. staff-created)

**Activation:**
- % of registered customers who book within 7 days
- Time from registration to first booking

**Engagement:**
- Bookings per customer per month
- Repeat booking rate
- Average time between bookings

**Revenue:**
- Daily sales total
- Average transaction value
- Revenue by service category
- Revenue by technician

**Retention:**
- Customer return rate (30-day, 90-day)
- Churn rate (customers not returning after 90 days)

### 8.2 Operational Metrics

**Booking Efficiency:**
- Online vs. walk-in ratio
- Average time to complete booking (< 3 minutes target)
- Cancellation rate
- No-show rate

**Staff Performance:**
- Daily individual vs. ₱6,000 target
- Team daily vs. ₱8,000 break-even
- Commission earned per technician
- Services completed per day

~~**Inventory Health:**~~
- ~~Stock-out incidents~~
- ~~Inventory turnover rate~~
- ~~Usage variance (expected vs. actual)~~
*(removed from scope)*

---

## 9. RISKS & MITIGATION

### 9.1 Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Staff resistance to adoption | High | Medium | Involve staff in design, provide training, run parallel systems initially |
| Internet instability | High | Medium | Offline mode for critical operations, local caching |
| Inaccurate commission logic | Critical | Low | Parallel testing (manual vs. system) for 1-2 months |
| Poor user experience | High | Low | Usability testing, iterative design, feedback loops |
| Scope creep | Medium | High | Strict MVP definition, defer nice-to-haves |
| Data loss | Critical | Low | Automated backups, cloud storage, transaction logs |
| Incomplete manual data migration | Medium | Medium | Phased entry, validation checks |

### 9.2 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Free hosting limitations | Medium | Low | Monitor usage, have paid plan as fallback |
| Database performance | Low | Low | Proper indexing, query optimization |
| Security vulnerabilities | High | Low | Input validation, parameterized queries, authentication |
| Browser compatibility | Medium | Medium | Cross-browser testing, polyfills |

---

## 10. SUCCESS CRITERIA

### 10.1 Launch Criteria (MVP Ready When:)

- [ ] All P0 features implemented and tested
- [ ] End-to-end booking flow works without errors
- [ ] Commission computation matches manual calculations (within ±₱1)
- [ ] System handles 50 concurrent users without degradation
- [ ] All user roles can complete their primary tasks
- [ ] Mobile-responsive design verified on common devices
- [ ] Security basics implemented (authentication, authorization, input validation)
- [ ] Staff trained and comfortable with system

### 10.2 Post-Launch Success (30 Days After)

- [ ] 90%+ staff adoption rate
- [ ] 40%+ of bookings made online
- [ ] < 10% no-show rate
- [ ] Zero commission calculation errors reported
- [ ] ~~Zero stock-out incidents (due to inventory alerts)~~ *(removed)*
- [ ] 70%+ customer satisfaction rating

### 10.3 Long-Term Success (6 Months After)

- [ ] 50%+ customer retention rate
- [ ] 30% reduction in customer wait times
- [ ] Manager payroll computation time reduced by 80%
- [ ] ~~Inventory turnover improved to 6x/year~~ *(removed)*
- [ ] System uptime 99%+ during operating hours

---

## 11. ROADMAP

### 11.1 Phase 1: MVP (Current Semester)

**Timeline:** January - May 2026  
**Focus:** Core functionality

**Deliverables:**
- Customer booking system
- Service catalog
- Staff schedule management
- Commission computation
- ~~Basic inventory tracking~~ *(removed)*
- Customer profiles
- Payment recording

### 11.2 Phase 2: Enhancement (Post-Semester)

**Timeline:** June - August 2026  
**Focus:** User experience and automation

**Planned Features:**
- Notifications (SMS + email)
- Reviews and feedback system
- Advanced reporting dashboard
- Attendance tracking
- Loyalty program reactivation
- Marketing tools (promotions, package deals)

### 11.3 Phase 3: Optimization (Future)

**Timeline:** September - December 2026  
**Focus:** Growth and intelligence

**Planned Features:**
- Online payment gateway integration
- Advanced analytics and insights
- Social media integration
- Multi-branch support (if expanding)
- Mobile native app (optional)
- BIR-accredited receipt generation

---

## 12. OPEN QUESTIONS

### 12.1 To Be Confirmed with Stakeholders

1. **Service Catalog Details:**
   - Complete list of services with exact pricing?
   - Duration for each service?
   - Package deals and combo pricing?

2. **Weekly Tiered Commission:**
   - Exact tier thresholds and rates?
   - Team vs. individual commission interaction?

3. ~~**Inventory Usage Formulas:**~~
   - ~~Expected product consumption per service?~~
   - ~~Current inventory item list?~~
   - ~~Supplier information and lead times?~~
   *(removed from current scope)*

4. **Branding:**
   - Official salon logo and brand colors?
   - Preferred terminology and tone?

5. **Reporting Requirements:**
   - Specific report formats needed?
   - Export format preferences (PDF, Excel)?
   - BIR compliance requirements?

---

## 13. APPROVAL

### 13.1 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 13, 2026 | SFIT-2B Group 4 | Initial draft |

### 13.2 Stakeholder Sign-Off

**Prepared By:**
- SFIT-2B Group 4

**Recommended By:**
- Mr. Richard Morris Santos (Course Instructor)

**Approved By:**
- [ ] NailssentialsQC Manager/Owner
- [ ] IT Department Head, Quezon City University
- [ ] Panel Members (if assigned)

---

## 14. APPENDICES

### Appendix A: Interview Data Summary
- Day 1: Operations, services, payments, customer flow
- Day 2: Customer management, ~~inventory~~ HR, staff management
- Day 3: Commission structure, attendance policies, deductions

### Appendix B: Related Documents
- Context.md: Project background
- Goals.md: Customer and staff goals
- Interview.md: Full interview transcripts
- Proposal_Guide.md: Project proposal guidance

### Appendix C: Glossary
- **Walk-in:** Customer without appointment
- **Pre-booked:** Customer with scheduled appointment
- **MVP:** Minimum Viable Product
- **CRM:** Customer Relationship Management
- **GCash:** Digital wallet payment method (Philippines)

---

**Next Steps:**
1. ✅ Requirements Analysis (Complete)
2. ✅ Domain Research (Complete)
3. ✅ Product Brief (Complete - This Document)
4. ⏭️ Phase 2: Planning (PRD, UX Design, Architecture)
5. ⏭️ Phase 3: Solutioning (Epics, Stories, Implementation Readiness)
6. ⏭️ Phase 4: Implementation (Sprint Planning, Development)

---

**Document Status:** Draft - For Review  
**Review Date:** April 20, 2026  
**Prepared by:** SFIT-2B Group 4  
**Contact:** [Group Representative]
