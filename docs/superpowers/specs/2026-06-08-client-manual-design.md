# Design Spec: NailssentialsQC Client Operations Manual & Technical Handover

## 1. Overview & Purpose
This document specifies the structure, content, and generation pipeline for the NailssentialsQC Client Operations Manual. The manual serves as a business operations guide and technical handover document for the client as the system transitions to production. 

The output will consist of two files:
1. `docs/CLIENT_MANUAL.md` - The raw Markdown source of the operations manual.
2. `docs/CLIENT_MANUAL.html` - A self-contained, beautiful, printable HTML version styled with the NailssentialsQC visual brand (cream canvas, IBM Plex Sans typography, rounded buttons, and structured callout boxes).

---

## 2. Content Architecture

### Section 1: System Overview & Access
*   **System Purpose**: Explain what NailssentialsQC does.
*   **Architecture Outline**: Mention React 19, Express, PostgreSQL, Clerk, Vercel, and Neon.
*   **Access Credentials**: Guidelines on signing in using Clerk (for Managers and Staff) and customer login flow.

### Section 2: Manager Operations (Salon Management Portal)
*   **Workforce Management**: Adding staff members, managing technician accounts, and setting schedules.
*   **Catalog & Catalog Management**: Adding services, categorizing services, bundling services into packages, and controlling public visibility.
*   **CMS & Marketing**: Managing policies, updating the home page content, and updating the "Nail Art Exhibit" gallery.
*   **Payroll System**: Step-by-step instructions on generating payroll. Breakdown of payroll parameters:
    *   Basic Salary
    *   Commissions (automatically derived from service catalog commission rates and completed appointments)
    *   Deductions
*   **Analytics Dashboard**: Navigating the manager dashboard to view revenue trends and technician performance charts.

### Section 3: Staff Operations (Technician Portal)
*   **Attendance Logging**: How staff clock in and clock out daily.
*   **Technician Calendar**: Viewing daily appointments.
*   **Commission Tracking**: Viewing personal commission tallies and completed appointments.

### Section 4: Customer Experience (Online Booking Portal)
*   **Self-Service Booking**: Choosing services, selecting preferred technician, picking slots, and entering contact details.
*   **Customer Dashboard**: Accessing the customer portal to view upcoming appointments and cancellation options.

### Section 5: Technical Handover & Service Level Agreement (SLA)
*   **Domain Registration**: Expiring in May 2027.
*   **Hosting Platform (Vercel Free Tier)**:
    *   *Bandwidth*: 100 GB/month.
    *   *Serverless Compute*: 100 GB-hours/month.
    *   *Capacity Estimate*: Under normal usage (~500 KB per visit session), Vercel's free tier can support ~200,000 page views per month. For a single salon, this is virtually impossible to exhaust.
*   **Database Engine (Neon Free Tier)**:
    *   *Storage*: 500 MB (0.5 GiB). Relational records of appointments/attendance consume ~1-2 KB per row. This is sufficient for hundreds of thousands of transactions.
    *   *Compute*: 190 hours of compute/month. Neon automatically suspends the database after 5 minutes of inactivity to conserve compute.
    *   *Cold Start warning*: The first database query after inactivity takes 3-5 seconds to wake up.
    *   *Exhaustion Estimate*: If the database is kept active 24/7 or experiences high traffic that prevents suspension, the compute hours could be exhausted. However, for standard salon hours with auto-suspend active, the 190 hours are ample.
*   **Warranty & Maintenance**:
    *   *Technical Warranty*: 3-month full technical warranty for bugs and deployment issues.
    *   *Post-Warranty Support*: Billed on an hourly rate, subject to mutual negotiation.

---

## 3. Visual Styling for `CLIENT_MANUAL.html`
The HTML manual will be formatted to look like a premium ebook and print-ready document. It will inject CSS styled according to the brand guidelines in `Design.md`:
- **Canvas Background**: Warm cream (`#eeefe9`).
- **Typography**: IBM Plex Sans via Google Fonts, using weights 400 (body), 600 (bold), 800 (headings).
- **Cards**: Flat white cards (`#ffffff`) with 1px border (`#bfc1b7`) and 6px border-radius (`rounded.md`).
- **Accent Color**: Saturated yellow-orange (`#B8794E`) for highlights, sections, and titles.
- **Callout Banners**:
    - Tip/Info: Soft blue background (`#dceaf6`) with emoji (💡).
    - Warning/SLA: Soft red/orange background (`#f7d6d3`) with emoji (⚠️).
- **Print Optimization**: `@media print` CSS rules to hide scrollbars, adjust background colors to white for ink preservation, and insert `page-break-after: always` rules between major sections.

---

## 4. Generation Pipeline
We will write a Node script `backend/generate-manual.ts` (or run a direct task) that:
1. Reads `docs/CLIENT_MANUAL.md`.
2. Converts the Markdown to styled HTML, embedding the layout template and styles.
3. Outputs the HTML file to `docs/CLIENT_MANUAL.html`.
4. Tests that it renders correctly in a browser.
