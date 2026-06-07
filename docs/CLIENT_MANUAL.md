# NailssentialsQC - Client Operations Manual & Technical Handover

Welcome to the operations manual for the **NailssentialsQC Salon Management System**. This document details how to operate the system for business use and provides the technical details of your hosting, database setup, and support warranty.

---

## 1. System Overview & Access

NailssentialsQC is a custom-built, modern management platform designed specifically for your nail salon. The system integrates online customer booking, technician scheduling, attendance tracking, payroll processing, and financial dashboards into a single application.

### Accessing the System
*   **Customer Booking Portal**: Accessible by visiting your website domain. Customers can book appointments directly from the landing page.
*   **Staff & Manager Portal**: Staff and managers access their respective dashboards by clicking **Login** in the navigation bar.
*   **Authentication Service**: Secured via Clerk. Access is partitioned using Role-Based Access Control (RBAC) to ensure that staff and customers cannot access manager tools.

### 1.1 Mandatory Pilot Testing
*   **Prerequisite**: Before fully implementing and launching the system for live business use, **it is a must to run a pilot test**.
*   **Protocol**: Run the system in a simulated environment (e.g., with staff logging test hours, mock customer appointments, and trial payroll calculations) for at least 1 to 2 weeks.
*   **Purpose**: Pilot testing ensures that your staff is fully trained on how to use the dashboards and prevents live data errors or configuration issues during active business operations.
*   **Feedback & Adjustments**: During the testing period, open communication with our development team is essential so we can perform necessary adjustments, configurations, and fixes before the final business launch.

---

## 2. Manager Operations (Salon Management Guide)

The **Manager Dashboard** (`/manager`) is the control center for your salon's daily business operations.

### 2.1 Workforce & Staff Management
To manage your salon staff:
1. Navigate to the **Staff Management** tab on the Manager Dashboard.
2. **Add a Staff Member**: Click the "Add Staff" button, input their full name, role, email, phone number, and basic hourly pay rate.
3. **Set Schedules**: Assign default working hours and shift days for each technician. The booking engine uses these schedules to show technician availability.
4. **Suspending Staff**: If a technician is on leave or no longer with the salon, they can be suspended to temporarily block them from receiving new bookings.

### 2.2 Catalog Management (Services & Packages)
To manage what services are offered to customers:
1. Go to the **Manage Services** page (`/manage-services`).
2. **Add a Service**: Click "New Service". Enter the service name, duration (in minutes), price (in Philippine Peso ₱), commission rate (percentage paid to the technician), and category (e.g., Manicure, Pedicure, Nail Art).
3. **Packages & Bundles**: Group multiple services into a single promotional package (e.g., "Mani-Pedi Classic Combo") with custom combo pricing.
4. **Visibility Toggle**: You can hide services from the online booking catalog by toggling the "Visible" switch. Hidden services are kept in the database but cannot be booked by the public.

### 2.3 CMS & Salon Policies
To update website content and rules:
1. **Gallery Management**: Use the **Manage Exhibits** page (`/manage-exhibits`) to upload photos of nail art to the public showcase.
2. **Policies**: Set scheduling policies (e.g., minimum notice required for cancellation, booking guidelines) which appear on the customer page (`/policies`).

### 2.4 Payroll & Financial Automation
NailssentialsQC automates salary calculations based on your salon's operational formulas:
1. Go to the **Payroll** tab on the Manager Dashboard.
2. **Select Period**: Choose the start and end dates for the payroll cycle (e.g., bi-monthly or monthly).
3. **Run Payroll**: Click "Generate Payroll". The system will calculate:
    *   **Base Earnings**: Calculated from clocked attendance hours and basic hourly pay rates.
    *   **Commissions**: Automatically compiled from completed appointments. For each service performed, the technician is credited their custom commission rate (e.g., 20% of the service price).
    *   **Deductions**: Standard tax, late clock-ins, or custom deductions manually inputted.
4. **Export Slips**: Managers can download individual itemized salary slips and the overall spreadsheet for business accounting.

### 2.5 Business Analytics
*   **Revenue Dashboard**: View charts tracking weekly, monthly, and yearly revenue growth.
*   **Performance Metrics**: Inspect which services are most popular and view a ranking of top-performing technicians by booking volume and commissions earned.

---

## 3. Staff Operations (Technician Guide)

Technicians access the **Staff Portal** (`/dashboard`) on their mobile phones or tablets on the salon floor.

### 3.1 Attendance System (Clocking In/Out)
Technicians must log their shifts for payroll accuracy:
1. Upon arriving at the salon, log into the portal and click the large green **Clock In** button.
2. At the end of the shift, click the red **Clock Out** button.
3. The system automatically logs shift start, shift end, and total hours to calculate basic wages.

### 3.2 Technician Calendar & Workload
*   **Daily Agenda**: Technicians can view their scheduled appointments in real-time, including the service requested, customer name, and booking notes.
*   **Status Updates**: Technicians mark appointments as **Completed** once the service is finished. Marking an appointment completed triggers the commission calculation and sends an email receipt to the customer.

### 3.3 Commission Tracker
*   Technicians can monitor their cumulative commission earnings for the current pay period directly on their dashboard, ensuring complete transparency.

---

## 4. Customer Experience & Online Booking

Customers can book services on any device without staff intervention.

### 4.1 Real-Time Scheduling
1. The customer visits the booking page (`/booking`).
2. They select a category (e.g., Manicure) and choose their desired service(s).
3. They select a preferred technician (or choose "Any Available").
4. The scheduling engine displays available time slots based on the chosen technician's schedule and existing appointments.
5. The customer inputs their contact information and clicks "Confirm Booking".

### 4.2 Automated Receipts & Notifications
*   **Booking Email**: An automated confirmation email is sent containing the date, time, and service details.
*   **Receipt Email**: On service completion, the system automatically sends a receipt email with the transaction number and total amount paid.
*   **Customer Portal**: Registered customers can view their active bookings, booking history, and cancel appointments via the `/appointments` page.

---

## 5. Technical Handover & Service Level Agreement (SLA)

As part of the system transition, we have documented your infrastructure limits and operational capacity to ensure a smooth business handover.

### 5.1 Domain Information
*   **Domain Expiration**: Your custom domain is registered and set to expire in **May 2027**. 
*   **Renewal**: To prevent service interruption, the domain must be renewed before this date.

### 5.2 Hosting Platform (Vercel Free Tier)
The frontend application and serverless backend routes are hosted on Vercel's Free Tier.
*   **Bandwidth Limit**: 100 GB per month.
*   **Serverless Invocations Limit**: 100 GB-hours of execution time per month.
*   **Capacity Estimation**: 
    *   The compiled system is highly optimized. An average user session consumes approximately **500 KB** of bandwidth.
    *   Under these conditions, your 100 GB monthly bandwidth allowance can support up to **200,000 page views per month**.
    *   For a single salon location, this capacity is extremely generous and is highly unlikely to be exhausted.

### 5.3 Relational Database (Neon Free Tier)
Your system's PostgreSQL database is hosted on the Neon Free Tier.
*   **Storage Limit**: 500 MB (0.5 GiB).
    *   *Capacity Estimate*: In PostgreSQL, text-based relational records (like appointments, staff list, and attendance logs) are small. A single appointment record consumes about **1 to 2 KB** of space.
    *   *Lifespan*: 500 MB of storage can hold approximately **250,000 individual appointments** or attendance logs. This capacity will easily last your salon multiple years. Note: Image files are uploaded to Vercel Blob storage, keeping database storage consumption minimal.
*   **Compute Limit**: 190 hours of active database CPU compute per month.
    *   *Auto-Suspend Feature*: Neon conserves compute by putting the database to sleep after **5 minutes of inactivity**.
    *   *Cold Start Warning*: The first request sent to the site after a period of inactivity will trigger a "cold start" database wakeup. This causes a minor loading delay of **3 to 5 seconds** for the first user, after which it operates at full speed.
    *   *Compute Hours Lifetime*: The 190 hours compute budget translates to 6.3 hours of *continuous* database activity per day. Because the database auto-suspends during quiet hours, this budget is ample for your business. Avoid configuring external automated monitoring services (like uptime bots) to ping the site every minute, as this will prevent auto-suspend and exhaust the compute hours.

### 5.4 Identity Management (Clerk Free Tier)
*   **Monthly Active Users (MAU) Limit**: 10,000 users.
*   **Capacity Estimate**: Your system can support up to 10,000 unique customer, staff, and manager logins per month. If your customer database grows beyond this active threshold, you can upgrade Clerk's plan.

---

## 6. Technical Warranty & Maintenance Agreement

To support the transition of NailssentialsQC into your daily operations, we provide the following technical support terms:

### 6.1 Three-Month Technical Warranty
*   **Included Duration**: 3 months from the date of final system handover.
*   **Coverage**: 
    *   Fixing software bugs or unexpected errors in the original code.
    *   Addressing server deployment issues on Vercel or database connectivity errors on Neon.
    *   Ensuring email delivery (Nodemailer) and authentication (Clerk) services operate as intended.
*   **Exclusions**: This warranty does not cover new feature requests, styling modifications, or issues caused by third-party services changing their platform policies (e.g., changes to Clerk's free tier).

### 6.2 Post-Warranty Maintenance
*   **Paid Support**: After the 3-month warranty period expires, any technical assistance, updates, or troubleshooting will be billed as active work.
*   **Pricing**: Post-warranty support will be billed on an **hourly rate**, subject to mutual negotiation.
*   **On-Demand Services**: You may request small fixes, feature expansions, or maintenance as needed.
