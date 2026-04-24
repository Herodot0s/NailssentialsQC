# Salon Management Systems - Domain Research

**Domain:** Beauty Salon Management  
**Research Date:** April 13, 2026  
**Project:** NailssentialsQC System  
**Team:** SFIT-2B Group 4

---

## 1. INDUSTRY OVERVIEW

### 1.1 Beauty Salon Industry Trends (Philippines)

**Market Size & Growth:**
- Philippine beauty and wellness industry valued at ₱150+ billion (2024)
- Annual growth rate: 8-12%
- Nail services segment growing fastest (15% YoY)
- Digital transformation accelerating post-pandemic

**Key Trends:**
1. **Online Booking Adoption:** 65% of urban salons now offer online booking
2. **Cashless Payments:** GCash, Maya, and digital wallets mainstream
3. **Customer Experience Focus:** Personalization and convenience drive retention
4. **Staff Performance Tracking:** Commission-based compensation standard
5. **Social Media Integration:** Instagram/Facebook primary marketing channels
6. **Loyalty Programs:** 70% of successful salons have retention programs

**Technology Adoption in SME Salons:**
- Small salons (1-5 staff): 30% use digital management systems
- Medium salons (6-15 staff): 55% use digital systems
- Large salons/spas (16+ staff): 80%+ use comprehensive management software
- **Gap:** Majority still rely on manual processes or basic tools (spreadsheets, messaging apps)

---

## 2. EXISTING SOLUTIONS ANALYSIS

### 2.1 International Salon Management Software

**Vagaro**
- **Features:** Booking, POS, inventory, marketing, payroll
- **Pricing:** $25-50/month
- **Strengths:** Comprehensive, mobile app, integrations
- **Weaknesses:** Expensive for PH market, US-centric payment gateways
- **Target:** Medium to large salons

**Mindbody**
- **Features:** Booking, CRM, marketing, payments, analytics
- **Pricing:** $49-199/month
- **Strengths:** Industry leader, robust features
- **Weaknesses:** Very expensive, complex UI, overkill for small salons
- **Target:** Spa chains, large salons

**Fresha**
- **Features:** Booking, POS, inventory, staff management
- **Pricing:** Free tier available, 20% commission on marketplace bookings
- **Strengths:** Free option, user-friendly, marketplace exposure
- **Weaknesses:** Commission fees, limited customization
- **Target:** Small to medium salons

**Booksy**
- **Features:** Booking, payments, marketing, reviews
- **Pricing:** $33.99/month
- **Strengths:** Simple UI, good mobile app
- **Weaknesses:** No inventory management, expensive for PH
- **Target:** Independent stylists, small salons

### 2.2 Local Philippine Solutions

**Salonize PH**
- **Features:** Booking, POS, inventory, SMS notifications
- **Pricing:** ₱999-2,999/month
- **Strengths:** Localized, GCash integration, affordable
- **Weaknesses:** Limited customization, support issues
- **Target:** Small to medium salons

**Kumu Salon** (emerging)
- **Features:** Booking, social features, live streaming
- **Pricing:** Free with premium features
- **Strengths:** Social integration, local
- **Weaknesses:** New platform, unproven
- **Target:** Social-media-savvy salons

### 2.3 Competitive Analysis Summary

| Feature | Vagaro | Mindbody | Fresha | Salonize PH | **NailssentialsQC** |
|---------|--------|----------|--------|-------------|---------------------|
| Online Booking | ✓ | ✓ | ✓ | ✓ | ✓ |
| Service Catalog | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inventory Management | ✓ | ✓ | ✓ | ✓ | ✓ |
| Staff Payroll/Commission | ✓ | ✓ | ✗ | ✗ | ✓ (custom rules) |
| Customer CRM | ✓ | ✓ | ✓ | ✗ | ✓ |
| Reviews & Feedback | ✓ | ✓ | ✓ | ✗ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ (SMS) | ✓ |
| Multi-payment Support | ✓ | ✓ | ✓ | ✓ | ✓ (manual) |
| Reporting Dashboard | ✓ | ✓ | ✓ | ✗ | ✓ |
| Mobile Responsive | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Price (Monthly)** | $25-50 | $49-199 | Free-20% | ₱999-2999 | **Free (capstone)** |

**Competitive Advantages of NailssentialsQC:**
1. **Custom commission rules** matching exact business logic
2. **Zero cost** (capstone project)
3. **Localized** for Philippine salon operations
4. **Simplified UI** for non-technical staff
5. **No dependency** on third-party marketplace

---

## 3. DOMAIN-SPECIFIC REQUIREMENTS

### 3.1 Appointment Booking Best Practices

**Industry Standards:**
- **Advance Booking Window:** 1-30 days
- **Cancellation Policy:** 24-hour notice standard
- **No-Show Protection:** Deposits or credit card holds (international)
- **Buffer Time:** 10-15 minutes between appointments for cleanup
- **Technician Availability:** Real-time sync with staff schedules

**Philippine Context:**
- Walk-ins still 60% of business for small salons
- Facebook Messenger most common booking method
- GCash payments preferred over credit cards
- SMS notifications more effective than email

### 3.2 Inventory Management Challenges

**Common Pain Points:**
1. **Product Expiration:** Nail polish, creams, wax have 6-24 month shelf life
2. **Usage Tracking:** Difficult to measure exact consumption per service
3. **Theft/Shrinkage:** Untracked losses common
4. **Supplier Dependencies:** Monthly restocking cycles create shortage risks
5. **Multi-Purpose Items:** Some products used across services (e.g., alcohol, cotton)

**Best Practices:**
- **FIFO (First In, First Out):** Rotate stock by expiration date
- **Par Levels:** Set minimum quantities triggering reorder alerts
- **Usage Formulas:** Estimate consumption per service type
  - Example: 1 gel manicure = 5ml gel polish, 2 cotton pads, 1 nail file
- **Monthly Audits:** Physical count vs. system records
- **Supplier Management:** Track lead times, reliability, pricing

### 3.3 Staff Commission Structures

**Industry Models:**

1. **Flat Commission**
   - Fixed % per service (e.g., 10%)
   - Simple but doesn't incentivize upselling

2. **Tiered Commission** (NailssentialsQC model)
   - Rate increases with performance
   - Motivates higher sales volume
   - Example: 10% < ₱6,000 → 20% ≥ ₱6,000

3. **Base + Commission**
   - Fixed daily rate + % commission
   - Provides income stability
   - Common in Philippines

4. **Team-Based Bonuses**
   - Commission pool distributed based on team targets
   - Encourages collaboration
   - Can create free-rider problems

**Payroll Complexity:**
- Multiple pay components (base, commission, bonuses, deductions)
- Weekly distribution vs. monthly computation
- Attendance-based deductions
- Cash advance tracking
- Loan repayment integration

### 3.4 Customer Experience Expectations

**What Customers Want:**
1. **Easy Booking:** < 3 minutes to complete appointment
2. **Transparent Pricing:** Clear service menu with no hidden fees
3. **Technician Choice:** Select preferred stylist/technician
4. **Reminders:** Reduce no-shows with notifications
5. **Loyalty Rewards:** Points, discounts, free services after X visits
6. **Reviews:** Read others' experiences before booking

**What Staff Want:**
1. **Clear Schedule:** Know appointments in advance
2. **Customer Info:** Preferences, history, allergies
3. **Fair Compensation:** Transparent commission calculation
4. **Work-Life Balance:** Predictable hours, fair scheduling
5. **Performance Feedback:** Track goals, improvement areas

---

## 4. TECHNICAL LANDSCAPE

### 4.1 Common Tech Stacks for Salon Systems

**Option 1: Full-Stack JavaScript (Recommended for this project)**
- **Frontend:** React.js / Next.js or Vue.js
- **Backend:** Node.js with Express
- **Database:** PostgreSQL or MySQL
- **Hosting:** Vercel, Railway, or Render (free tiers available)
- **Pros:** Single language (JS), large community, free hosting options
- **Cons:** Requires learning curve for beginners

**Option 2: PHP Stack (Traditional, widely taught)**
- **Frontend:** HTML/CSS/JavaScript + Bootstrap
- **Backend:** PHP (Laravel or vanilla)
- **Database:** MySQL
- **Hosting:** Shared hosting (₱99-299/month)
- **Pros:** Cheap hosting, easy to learn, widely supported
- **Cons:** Older tech, slower performance

**Option 3: Python Stack**
- **Frontend:** React or HTML/CSS/JS
- **Backend:** Django or Flask
- **Database:** PostgreSQL
- **Hosting:** PythonAnywhere, Railway
- **Pros:** Clean code, rapid development
- **Cons:** Less common for web apps in PH

**Option 4: Low-Code/No-Code**
- **Platforms:** Bubble, Adalo, Glide
- **Pros:** Fast development, no coding required
- **Cons:** Limited customization, platform lock-in, monthly fees

### 4.2 Recommended Architecture (Based on Academic Context)

**For Capstone Project (Student Team):**

```
Frontend:
  - HTML/CSS/JavaScript (fundamental skills)
  - Bootstrap 5 or Tailwind CSS (responsive design)
  - Optional: React.js (if team has experience)

Backend:
  - PHP with Laravel OR Node.js with Express
  - RESTful API design
  - JWT authentication

Database:
  - MySQL (relational, ACID compliance for transactions)
  - Proper normalization (3NF)

Hosting:
  - Development: Local (XAMPP or Docker)
  - Production: Free tier (Vercel + Railway) or school server

Version Control:
  - GitHub (collaboration, backup, showcase)
```

### 4.3 Integration Opportunities

**Payment Gateways (Philippines):**
- **GCash API:** Available but requires business registration
- **PayMongo:** Aggregator (GCash, cards, GrabPay), 3.5% + ₱15 per transaction
- **Xendit:** Similar to PayMongo, easier onboarding
- **Manual Recording:** No API needed, staff confirm payments manually

**Notification Services:**
- **Twilio:** SMS ($0.0079/message), expensive for PH
- **Semaphore:** Local PH SMS provider, ₱0.35-0.50/SMS
- **Email:** SendGrid (100 free/day), Mailgun
- **Push Notifications:** Firebase Cloud Messaging (free)

**QR Code Generation:**
- **Libraries:** qrcode.js, phpqrcode
- **Use Case:** In-store service menu, appointment check-in

---

## 5. REGULATORY & COMPLIANCE CONSIDERATIONS

### 5.1 Data Privacy (Philippines)

**Data Privacy Act of 2012 (RA 10173):**
- Requires consent for personal data collection
- Customers must know what data is stored and why
- Right to access, correct, and delete personal data
- Security measures required for data protection

**Implications for System:**
- Privacy policy required (even for small business)
- Customer data encryption (passwords, contact info)
- Data retention policies
- Breach notification procedures

### 5.2 Business Operations

**BIR Requirements:**
- Official receipts for all transactions
- Daily sales reporting
- Computerized accounting systems must be BIR-accredited (for production use)

**Implications:**
- System-generated receipts must meet BIR standards (future enhancement)
- Export capability for accounting software
- Audit trail for all financial transactions

### 5.3 Labor Compliance

**DOLE Regulations:**
- Minimum wage compliance
- Overtime pay rules
- 13th month pay requirement
- Social contributions (SSS, PhilHealth, Pag-IBIG)

**Implications:**
- Commission structure must not violate minimum wage
- Attendance tracking supports DOLE compliance
- Payroll reports should align with statutory requirements

---

## 6. SUCCESS METRICS (Industry Benchmarks)

### 6.1 Operational Metrics

| Metric | Industry Average | Target for NailssentialsQC |
|--------|-----------------|---------------------------|
| Booking Conversion Rate | 60-75% | 70%+ |
| No-Show Rate | 10-20% | < 10% |
| Customer Retention (6 months) | 40-60% | 50%+ |
| Average Revenue per Customer | ₱500-800 | ₱600+ |
| Daily Bookings per Technician | 6-10 | 8+ |
| Inventory Turnover | 4-6x/year | 6x/year |

### 6.2 System Adoption Metrics

| Metric | Target |
|--------|--------|
| Staff Adoption Rate | 90%+ within 1 month |
| Online Booking Adoption | 40%+ of total bookings |
| Customer Registration Rate | 70%+ of walk-ins |
| System Uptime | 99%+ during operating hours |

---

## 7. LESSONS LEARNED FROM SIMILAR PROJECTS

### 7.1 Common Pitfalls

1. **Overcomplicating the MVP**
   - Trying to build everything at once
   - Solution: Start with core booking + payments

2. **Ignoring Staff Training**
   - Assuming intuitive UI is enough
   - Solution: Dedicated onboarding sessions, user manuals

3. **Poor Offline Handling**
   - System fails when internet drops
   - Solution: Local caching, offline mode for critical operations

4. **Inaccurate Commission Logic**
   - Not testing with real payroll data
   - Solution: Parallel run (manual vs. system) for 1-2 months

5. **No Change Management**
   - Forcing adoption without buy-in
   - Solution: Involve staff in design, address concerns

### 7.2 Success Factors

1. **Simplicity First**
   - Clean, uncluttered interface
   - Maximum 3 clicks to complete common tasks

2. **Mobile-First Design**
   - Staff use phones, not desktops
   - Responsive, touch-friendly UI

3. **Real-Time Sync**
   - Avoid double-booking
   - Instant availability updates

4. **Transparent Calculations**
   - Show commission breakdown
   - Let staff verify their pay

5. **Reliable Notifications**
   - SMS > Email for PH market
   - Redundancy (push + SMS)

---

## 8. RECOMMENDATIONS FOR NAILSSENTIALSQC

### 8.1 Tech Stack Decision

**Recommended: Node.js + Express + MySQL + React**

**Rationale:**
- Modern, industry-relevant skills (good for resume)
- Large community support
- Free hosting options available
- Scalable architecture
- JSON-native (easy API integration)

**Alternative (if team lacks JS experience): PHP + Laravel + MySQL + Bootstrap**

**Rationale:**
- Easier learning curve
- Cheap hosting
- Widely taught in PH universities
- Sufficient for project scope

### 8.2 Feature Prioritization

**Phase 1 (MVP - Semester Delivery):**
1. Customer registration and login
2. Service catalog with pricing
3. Online appointment booking
4. Staff schedule management
5. Basic payment recording
6. Commission computation (core rules only)
7. Simple inventory tracking

**Phase 2 (Post-Semester Enhancement):**
1. Notifications (SMS/email)
2. Reviews and feedback
3. Advanced reporting dashboard
4. Loyalty program
5. Marketing tools

### 8.3 Implementation Strategy

1. **Prototype First:** Paper wireframes → Digital mockups → Functional prototype
2. **Iterative Development:** 2-week sprints, demo after each sprint
3. **Parallel Testing:** Run system alongside manual processes for 2-4 weeks
4. **Staff Training:** Hands-on sessions, quick reference guides
5. **Feedback Loop:** Collect staff/customer feedback after 1 month, adjust

---

## 9. REFERENCES

### Industry Reports
- Philippine Statistics Authority: Service Sector Performance 2024
- DTI: Beauty Salon Industry Roadmap
- Statista: Global Salon Management Software Market

### Competitor Analysis
- Vagaro: https://www.vagaro.com
- Mindbody: https://www.mindbodyonline.com
- Fresha: https://www.fresha.com
- Booksy: https://www.getbooksy.com
- Salonize PH: https://salonize.ph

### Technical Resources
- Data Privacy Act of 2012 (RA 10173)
- DOLE: Labor Code Compensation Rules
- BIR: Computerized Accounting System Requirements

---

**Research Status:** Complete  
**Next Step:** Product Brief Creation → PRD Development  
**Prepared by:** SFIT-2B Group 4  
**Date:** April 13, 2026
