# Manager Dashboard & Global Settings Research

**Domain:** Salon Management System
**Researched:** 2024
**Confidence:** HIGH

## Executive Summary
An advanced Manager Dashboard for a salon business must synthesize two primary functions: **Business Health Monitoring (Analytics)** and **Website/Operations Management (Global Settings CRUD)**. The goal is to provide a comprehensive, zero-technical-friction interface for managers to configure public-facing content while keeping real-time performance KPIs instantly accessible.

## 1. Key Business Metrics (The Analytics Dashboard)
To assess business health at a glance, the dashboard should present these critical KPIs:

### Financial Metrics
*   **Total Revenue:** Tracked daily, weekly, and monthly with year-over-year or month-over-month comparisons.
*   **Average Ticket Size:** Average spend per customer visit.
*   **Service vs. Retail Breakdown:** Proportion of income from appointments vs. product sales.

### Staff Performance & Utilization
*   **Staff Utilization Rate:** Percentage of available hours that are booked. (Target is typically 75-85%).
*   **Revenue per Employee:** Identifies top performers and coaching opportunities.
*   **Client Retention per Staff:** Measures how often clients return to the same stylist/technician.

### Client & Operational Metrics
*   **Appointment Volume:** Total bookings, categorized by status (Completed, Upcoming, Cancelled).
*   **No-Show / Cancellation Rate:** Identifies problematic booking trends requiring deposit enforcements.
*   **Rebooking Rate:** Percentage of clients who schedule their next visit before leaving the salon.

### Service Metrics
*   **Most Popular Services:** By volume of bookings.
*   **Highest Grossing Services:** By total revenue generated.

---

## 2. Global CRUD Entities (Website Management)
To leave technicalities out of the manager's way, the system needs intuitive CRUD interfaces for the following global entities:

### Content & Exhibit Images (Portfolio/Gallery)
*   **Hero/Banner Images:** Manage homepage sliders/banners.
*   **Gallery Images:** Upload, tag (e.g., by service or staff member), and delete images of salon work.
*   **Testimonials/Reviews:** Approve, feature, or manually add customer reviews.

### Global Settings (Configuration)
*   **Business Profile:** Name, contact details (phone, email, WhatsApp), physical address, and social media links.
*   **Operating Hours:** Standard weekly hours, holiday closures, and special exceptions.
*   **Booking Policies:** Cancellation windows, deposit requirements, grace periods for late arrivals.

### Service Catalog
*   **Categories:** Grouping services (e.g., Manicure, Hair Care, Spa).
*   **Services:** Manage name, description, duration, price, and thumbnail images.

### Staff Profiles
*   **Employee Directory:** Manage public-facing profiles (Name, Bio, Avatar/Photo, Specialties).
*   **Schedules:** Manage working days, breaks, and time-off requests.

### Marketing & Promotions
*   **Announcements:** Sitewide banners (e.g., "Holiday Special: 20% Off").
*   **Promotions:** Discount codes or temporary price overrides.

## UI/UX Considerations
*   **Visual Dashboards:** Use charts (bar/line for revenue, donut for service breakdown) rather than raw data tables.
*   **WYSIWYG Editors:** For all text-based content to avoid HTML/Markdown complexity.
*   **Drag-and-Drop:** For reordering gallery images, services, and staff profiles.
