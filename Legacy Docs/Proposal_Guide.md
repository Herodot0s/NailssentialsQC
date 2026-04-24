# NAILSESSENTIALS QC SYSTEM - PROJECT PROPOSAL GUIDANCE

## Quick Reference Guide for Filling Each Section

---

## 1. PROJECT CONTEXT

### What to Include:
This section sets the background and introduces Nailssentials QC and the problems you discovered.

**Structure:**
```markdown
1.1 Company Background
   - Nailssentials QC is a nail, hair, and waxing salon service
   - Operating hours: 12:00 PM - 10:00 PM (regular and seasonal days)
   - Staff: 5 technicians (2 generalists, 2 specialized in nails)
   - Current operations: Manual processes, no digital system

1.2 Current Operations (How things work now)
   - Customer arrival: QR code scan to view services, manual name writing
   - Booking: Walk-in priority, some via Facebook/Instagram
   - Payment: Cash and GCash only
   - Inventory: Manual pen-and-paper tracking, monthly checks
   - Staff scheduling: Group chat messaging
   - Commission calculation: Manager computes manually

1.3 Identified Problems (From Interview Data)
   Reference your interview findings:
   - Long queues causing overcrowding and time consumption
   - Unknown online presence limiting customer visits
   - Cash/GCash-only payments (no card/digital options)
   - No online appointment system
   - No digital receipts (except GCash)
   - No inventory tracking system
   - No customer database/CRM
   - Manual commission computation
   - Stock shortages due to monthly restocking cycle
```

**Tips for Writing:**
- Use the **exact problems** from your interview (from the whiteboard image you shared)
- Mention the **133 total respondents** (20 managers, 67 staff, 46 customers)
- Reference specific quotes from the interview transcripts

---

## 2. RATIONALE

### What to Include:
Explain WHY this project is necessary. Connect the problems to the need for a solution.

**Structure:**
```markdown
2.1 Problem Statement
   "Based on the interview conducted on [dates], the following problems were identified:"
   
   List problems with frequency data (from your Table N):
   - PE 1: Long queues and overcrowding - 44 respondents (95.65%)
   - PE 2: [Other problem] - 30 respondents (65.22%)
   - PE 3: [Other problem] - 38 respondents
   - PE 4: [Other problem] - 46 respondents
   
   Note: Multiple responses allowed

2.2 Impact on Business
   - Operational inefficiency: Manual processes waste time
   - Customer experience: Long waits, no online booking
   - Staff management: Manual commission computation errors
   - Marketing: No website, no promotions, unknown online presence
   - Inventory: Monthly restocking leads to stock shortages

2.3 Why a System is Needed
   Explain how an automated system would solve these problems:
   - Online booking → reduces queues and overcrowding
   - Digital inventory tracking → prevents stock shortages
   - Automated commission computation → reduces manager workload
   - Customer database → better service personalization
   - Website/online presence → increased customer reach
```

**Tips for Writing:**
- Use the frequency and percentage data from your whiteboard photos
- Emphasize the **business impact** (not just technical problems)
- Connect each problem to a proposed solution feature

---

## 3. OBJECTIVES OF THE STUDY

### What to Include:
State what your system aims to achieve. Write from **General to Specific**.

**Structure:**
```markdown
3.1 General Objective
"To design and develop a Quality Control System for Nailssentials QC that automates and streamlines salon operations, customer management, inventory tracking, and staff performance monitoring."

3.2 Specific Objectives
1. To develop an online appointment booking system that allows customers to schedule services in advance, reducing wait times and overcrowding.

2. To implement a digital inventory management system that tracks product usage, monitors stock levels, and sends alerts for low inventory to prevent stock shortages.

3. To create an automated staff commission computation module that calculates daily rates and commissions based on performance targets and weekly sales tiers.

4. To design a customer relationship management (CRM) feature that stores customer preferences, visit history, and feedback for personalized service delivery.

5. To develop a reporting and analytics dashboard for managers to monitor daily sales, staff performance, and operational metrics.
```

**Tips for Writing:**
- General objective = **one sentence** summarizing the whole system
- Specific objectives = **3-5 items**, each addressing a specific problem
- Start each specific objective with "To [verb]..." (develop, implement, create, design, etc.)
- Make objectives **measurable** (you can test if they were achieved)

---

## 4. SCOPE AND DELIMITATION / LIMITATIONS

### What to Include:
Define what your system **WILL** do (scope) and what it **WON'T** do (delimitation/limitations).

**Structure:**
```markdown
4.1 Scope (What the system includes)

   The Nailssentials QC System will include:
   
   a. Customer Management
      - Online appointment booking
      - Customer profile management (preferences, visit history)
      - Digital receipt generation
      - Feedback collection and complaint tracking
   
   b. Service Management
      - Service catalog with pricing (nails, hair, waxing)
      - Package deals and combo promotions
      - Technician assignment based on specialization
      - Walk-in and pre-booked appointment handling
   
   c. Inventory Management
      - Product and supply tracking
      - Usage monitoring per service
      - Stock level alerts
      - Monthly inventory reports
   
   d. Staff and Payroll Management
      - Staff scheduling and attendance tracking
      - Automated commission computation (based on existing rules)
      - Performance tracking (daily ₱6,000 goal, weekly tiered commission)
      - Tardiness and deduction tracking
   
   e. Sales and Reporting
      - Daily sales tracking
      - Revenue reports
      - Staff performance analytics
      - Customer visit analytics

4.2 Delimitation (What the system excludes)

   The system will NOT include:
   - Payment gateway integration (still accepts cash/GCash, manual recording)
   - Online payment processing
   - Marketing/advertising features (social media integration)
   - Multi-branch support (single salon only)
   - Mobile application (web-based system only)
   - E-commerce/retail product sales online
   - Loyalty card or rewards program (can be future enhancement)

4.3 Limitations (Constraints and challenges)

   The project is limited by:
   - Time constraint: Development within the semester timeline
   - Technical: Relies on existing shop internet connection; no dedicated devices currently available
   - Data availability: Historical sales data may be incomplete due to manual record-keeping
   - User adoption: Staff may need training to transition from manual to digital processes
   - Scope: Focuses on core operations only; advanced features deferred to future phases
```

**Tips for Writing:**
- **Scope** = what you WILL build
- **Delimitation** = what you CHOOSE not to include (your decision)
- **Limitation** = what you CANNOT include (external constraints)
- Be specific but don't overpromise

---

## 5. GANTT CHART

### What to Include:
Show your project timeline. Based on your whiteboard image, you're using **Agile methodology**.

**Structure:**
```markdown
5.1 Development Methodology

   The project will follow the **Agile Development Methodology** with the following phases:

   **Phase 1: Requirements Gathering and Analysis** (January, Weeks 1-4)
   - Conduct stakeholder interviews
   - Document functional and non-functional requirements
   - Analyze current manual processes
   - Define system specifications

   **Phase 2: System Design** (February, Weeks 1-4)
   - Database design
   - UI/UX wireframes
   - System architecture planning
   - Prototype development

   **Phase 3: Development (Sprint 1 - Core Features)** (March, Weeks 1-2)
   - Customer booking module
   - Service catalog
   - Basic user authentication

   **Phase 4: Development (Sprint 2 - Advanced Features)** (March, Weeks 3-4)
   - Inventory management
   - Staff commission module
   - Reporting dashboard

   **Phase 5: Testing and Refinement** (April, Weeks 1-4)
   - Unit testing
   - User acceptance testing (UAT)
   - Bug fixing and optimization
   - Staff training preparation

   **Phase 6: Deployment and Documentation** (May, Weeks 1-2)
   - System deployment
   - Final documentation
   - User manual creation
   - Project presentation

5.2 Gantt Chart

   [Insert a table or chart like this:]

   | Phase | Jan W1-4 | Feb W1-4 | Mar W1-2 | Mar W3-4 | Apr W1-4 | May W1-2 |
   |-------|----------|----------|----------|----------|----------|----------|
   | 1. Requirements | ████████ |          |          |          |          |          |
   | 2. Design       |          | ████████ |          |          |          |          |
   | 3. Sprint 1     |          |          | ████     |          |          |          |
   | 4. Sprint 2     |          |          |          | ████     |          |          |
   | 5. Testing      |          |          |          |          | ████████ |          |
   | 6. Deployment   |          |          |          |          |          | ████     |

5.3 Agile Workflow Justification

   Agile was chosen because:
   - Allows iterative development with regular feedback from Nailssentials QC staff
   - Enables quick adjustments based on testing results
   - Breaks development into manageable sprints
   - Facilitates continuous improvement throughout the project lifecycle
```

**Tips for Creating the Actual Chart:**
- Use **Excel, Google Sheets, or tools like GanttPRO, Lucidchart**
- Color-code different phases
- Show dependencies (e.g., testing starts after development)
- Keep it simple and readable
- Your whiteboard example shows the format expected

---

## 6. APPROVAL AREA

### What to Include:
This section identifies who needs to approve the project and their roles.

**Structure:**
```markdown
6.1 Project Approval Authority

   This project proposal requires approval from:

   **Academic Approval:**
   - **Mr. Richard Morris Santos** - Course Instructor, SE101: Software Engineering
     - Oversees project scope and academic requirements
     - Ensures alignment with IT curriculum standards
   
   - **Information Technology Department Head** - Quezon City University
     - Final authority on capstone/project approval
     - Validates project feasibility and resource allocation

   **Industry Partner Approval:**
   - **Nailssentials QC Manager/Owner**
     - Authorizes access to business processes and data
     - Validates system requirements from business perspective
     - Commits to providing feedback during development

   **Panel Members** (if applicable):
   - [Names of panel members if already assigned]
     - Evaluate project technical merit
     - Provide feedback during defense presentations

6.2 Approval Criteria

   The project will be evaluated based on:
   - Technical feasibility and complexity
   - Alignment with course learning outcomes
   - Real-world applicability and industry relevance
   - Completeness of documentation
   - Innovation and solution quality

6.3 Sign-off Section

   [Create signature lines for actual document:]

   Prepared by:
   _____________________________
   [Group Representative Name]
   SFIT-2B: Group 4

   Recommended by:
   _____________________________
   Mr. Richard Morris Santos
   Course Instructor

   Approved by:
   _____________________________
   [Department Head Name]
   IT Department Head
```

**Tips for Writing:**
- Confirm actual names with your group
- Some schools require a formal approval form
- Include dates if required by your department

---

## ADDITIONAL RECOMMENDATIONS

### From Your Interview Data:

**Use These Statistics:**
- 133 total survey respondents
- Target beneficiaries breakdown:
  - Managers: 20 (15.0%)
  - Staff: 67 (50.38%)
  - Customers: 46 (34.58%)

**Reference These Problems (from whiteboard):**
1. Long queues causing overcrowding and time waste
2. Unknown online presence limiting customer visits
3. Cash and GCash-only payments
4. No online appointment system
5. Manual processes across operations

**Commission Structure Details (for system logic):**
- Hair services: 20% if ≥₱6,000, otherwise 10%
- Nails/Lashes/Waxing: Flat 10%
- Daily team goal: ₱8,000 (break-even)
- Weekly tiered commission increases with total sales
- Tardiness: 15-min grace, then ₱1/min deduction

### Formatting Tips:

1. **Use formal academic language** (no casual phrases)
2. **Cite your sources**: "(Group 4 Interview, Day 1-3, 2026)"
3. **Include tables** for data (like your Table 1.0 and Table N)
4. **Use consistent formatting** (font, spacing, headings)
5. **Add a title page** with your university header
6. **Include page numbers**

### Common Mistakes to Avoid:

❌ Vague objectives ("To improve the system")
✅ Specific objectives ("To reduce customer wait time by 50% through online booking")

❌ Overpromising ("The system will solve all business problems")
✅ Realistic scope ("The system addresses core operational workflows")

❌ No data to support claims
✅ Evidence-based ("Based on interviews with 133 respondents, 95.65% identified long queues as the primary issue")

---

## QUICK START CHECKLIST

Before submitting:

- [ ] Project Context includes company background + identified problems
- [ ] Rationale connects problems to the need for your system
- [ ] Objectives are specific, measurable, and realistic
- [ ] Scope clearly defines what you WILL and WON'T build
- [ ] Gantt Chart shows realistic timeline with Agile phases
- [ ] Approval Area lists correct names and titles
- [ ] All data from interviews is properly cited
- [ ] Tables and charts are properly formatted
- [ ] Document follows your department's formatting guidelines
- [ ] Proofread for grammar and spelling errors

---

**Good luck with your proposal, Group 4! 🎯**
