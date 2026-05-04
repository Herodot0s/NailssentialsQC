# Domain Requirements: Full-Service Salon Expansion & Nail Art Exhibit

**Domain:** Full-Service Salon (Nails, Hair, Spa, Waxing, Threading)
**Date:** Current
**Overall Confidence:** HIGH

## Executive Summary
Expanding from a nail-focused business to a full-service salon introduces complexity in service pricing, staff routing, and appointment scheduling. Hair services require length-based pricing, waxing/threading requires medical consent handling, and cross-category bookings require a cart-based scheduling flow. Additionally, the requested "Nail Art Exhibit" offers a high-conversion opportunity if integrated directly with the booking system ("Book this Look").

## 1. Service Categorization Strategy
The current schema supports sub-categories via `parent_id` in `ServiceCategory`. We need to establish clear top-level domains:

*   **Nails:** Manicures, Pedicures, Gel Polish, Acrylic/Gel Extensions, Nail Art
*   **Foot & Hand Spa:** Signature Spa, Scrub, Paraffin Treatment, Callus Removal
*   **Hair:** Cuts, Color/Highlights, Chemical Treatments (Rebonding, Perm), Styling, Wash & Blowdry
*   **Waxing:** Facial Waxing, Body Waxing, Bikini/Brazilian
*   **Threading:** Eyebrows, Upper Lip, Full Face

## 2. Required Schema Changes

To support the expansion and the gallery, the following Prisma schema updates are recommended:

### A. Nail Art Exhibit (Gallery System)
A dedicated model to store portfolio images, link them to the staff who created them, and tag them for filtering.
```prisma
model PortfolioItem {
  id          Int      @id @default(autoincrement())
  image_url   String
  title       String
  description String?
  staff_id    Int?     // Who performed this work
  service_id  Int?     // Link to the primary service required for this look
  tags        Json?    // e.g., ["minimalist", "3D", "bridal", "gel"]
  is_featured Boolean  @default(false)
  created_at  DateTime @default(now())

  staff   StaffProfile? @relation(fields: [staff_id], references: [id])
  service Service?      @relation(fields: [service_id], references: [id])

  @@map("portfolio_items")
}
```

### B. Hair Service Pricing Variations
Unlike a standard manicure, hair services (like coloring) vary in price based on hair length (Short, Medium, Long). The current `Service` model only has a fixed `price`.
*   **Recommendation:** Add a `price_type` enum (fixed, starting_at, variable) to the `Service` model.
*   **Recommendation:** Introduce a `ServiceVariation` model linked to `Service` to define specific tiers (e.g., "Hair Color - Short", "Hair Color - Long") with their respective prices and duration overrides.

### C. Strict Staff Specializations
Currently, `StaffProfile.specializations` is a nullable string. With diverse services, routing appointments correctly is critical. A nail technician cannot perform a hair rebond.
*   **Recommendation:** Create a `StaffServiceMapping` junction table mapping `staff_id` to `category_id` or `service_id` to strictly filter which staff members appear as available for specific bookings.

### D. Client Consent & Medical History
Waxing and chemical hair treatments carry risks (allergies, skin lifting).
*   **Recommendation:** Add a `MedicalConsent` model linked to `CustomerProfile` to track agreement to terms and contraindications before risky services.

## 3. Booking UX Implications

### A. "Book This Look" (Nail Art Exhibit)
*   **The Experience:** The exhibit should be a visually driven Pinterest-style masonry grid. It should not be passive.
*   **The Flow:** When a user clicks a nail art photo, display a prominent "Book This Look" CTA. Clicking this should parse the associated `service_id` from the `PortfolioItem` and automatically push the required base service + add-ons into the booking cart.

### B. Multi-Disciplinary Booking Cart
*   **The Experience:** Customers will book cross-category (e.g., Hair Color + Manicure + Threading).
*   **The Flow:** The booking wizard must support a "Shopping Cart" style experience. Users select multiple services before selecting a date and time.
*   **Complexity:** The scheduling algorithm must handle sequential scheduling or parallel scheduling (e.g., getting a manicure while hair color is processing) by finding overlapping staff availability for different specialties.

### C. Add-on & Upsell Prompts
*   **The Experience:** Hair and Nail services heavily rely on add-ons (e.g., "Add Olaplex to Hair Color", "Add French Tip to Manicure").
*   **The Flow:** After selecting a base service, intercept the user with a modal or inline accordion suggesting related add-ons to increase Average Order Value (AOV) before moving to time selection.

### D. Time Commitment Warnings
*   **The Experience:** Hair coloring or complex nail art can take 3-4+ hours.
*   **The Flow:** Display prominent duration badges. For services exceeding 2 hours, show a confirmation prompt to ensure the user is aware of the time commitment so they don't cancel last minute.
