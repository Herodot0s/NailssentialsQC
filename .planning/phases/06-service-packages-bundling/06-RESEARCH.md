# Phase 6: Service Packages & Bundling — Research

**Researched:** 2026-05-05
**Researcher:** gsd-phase-researcher (orchestrator-inline)
**Phase Requirements:** PKG-01, PKG-02, PKG-03

---

## 1. Existing Architecture Analysis

### 1.1 Database Layer (Prisma)

**Current schema patterns (schema.prisma):**
- All models use `@id @default(autoincrement())` integer PKs
- Timestamps: `created_at @default(now())`, `updated_at @updatedAt`
- Decimal fields: `@db.Decimal(10, 2)` for currency
- Boolean toggles: `is_active @default(true)`
- Relations use `onDelete: Cascade` for child records
- Indexes on foreign keys and frequently-queried columns
- `@@map("snake_case_table_name")` convention

**Key models for Phase 6:**
- `Service` — Has `id`, `category_id`, `name`, `price` (Decimal), `duration_minutes`, `is_active`
- `ServiceCategory` — Groups services by type (Nail Care, Spa, Waxing, etc.)
- `AppointmentItem` — Links appointments to services+staff. Has `price_at_booking` (Decimal) — stores the price at time of booking
- `Commission` — Per-service commission record with `base_amount`, `commission_rate`, `commission_amount`, `period_week/month/year`
- `Transaction` — `amount` (Decimal) stores actual paid total. Linked to commissions
- `Exhibit` — Simple model with `image_url`, `is_active` — reference for package model design

**New models needed:**
1. `ServicePackage` — Main package entity
2. `ServicePackageItem` — Join table (many-to-many: ServicePackage ↔ Service)

### 1.2 Commission Logic (appointmentCompletion.ts)

**Current flow:**
1. `completeAppointment()` calculates `totalAmount` from `appointment.items.reduce(price_at_booking)`
2. Creates `Transaction` with `amount: totalAmount`
3. Gets `baseRate` from `getTieredCommissionRate()` — queries last month's completed transactions
4. Iterates each `AppointmentItem`, calls `checkSpecialtyQuota()` for hair bonus
5. Creates `Commission` record per item with `base_amount: price_at_booking`

**Critical findings for packages:**
- `totalAmount` is calculated from `items.reduce()` — for packages, this will sum full individual prices, NOT the package price. **This needs modification** to use the actual paid amount when a package is involved
- `Transaction.amount` must store the package price (D-07)
- `Commission.base_amount` must use full individual service prices (D-05)
- `checkSpecialtyQuota()` checks monthly (line 41: `startOfCurrMonth`) but D-09 says it should be **weekly**. This is a pre-existing bug, not a Phase 6 concern — but package services should still count toward quota thresholds

**Impact assessment:**
- The `completeAppointment` function needs a conditional path: if appointment contains package items, `Transaction.amount` = package price, but individual `Commission.base_amount` = full catalog price per service
- `AppointmentItem.price_at_booking` should store the **full catalog price** (not discounted package price) so commission logic works unchanged
- New field needed on `AppointmentItem` or `Appointment`: `package_id` reference to identify which items belong to a package

### 1.3 Backend API Patterns

**CRUD controller pattern (exhibitController.ts):**
- Direct Prisma client usage (`prisma.exhibit.findMany/create/delete`)
- `try/catch` with `console.error` + JSON error response
- Response shape: `{ success: boolean, data?: T, message?: string }`
- Auth via `AuthRequest` type from middleware
- Manager guard: `authenticateToken, authorizeRoles('manager')` middleware chain

**Route registration (exhibitRoutes.ts → index.ts):**
- Router factory: `Router()`, export default
- Public endpoints: no middleware
- Manager-only: `authenticateToken, authorizeRoles('manager')`
- Registration: `app.use('/api/v1/{resource}', resourceRoutes)`

**CMS controller pattern (Phase 5):**
- More sophisticated: typed responses, separate settings/content endpoints
- Uses `SiteSettingsData`, `SiteContent` TypeScript types
- CRUD operations: GET (list), POST (create), PUT (update), DELETE

### 1.4 Frontend Architecture

**Cart system (CartContext.tsx + CartItem.ts):**
- `CartItem` interface: `{ serviceId, serviceName, price, duration, staffId?, staffName?, startTime? }`
- Cart stored in localStorage as JSON
- `addToCart()` deduplicates by `serviceId`
- `removeFromCart()` filters by `serviceId`
- `updateCartItem()` merges partial updates by `serviceId`
- `totalPrice` = `cart.reduce(sum + item.price)`
- `totalDuration` = `cart.reduce(sum + item.duration)`

**Key extension needed:** CartItem needs a `type` discriminator ('service' | 'package') and packages need a `childServices` array. The `serviceId` uniqueness check needs to work with `packageId` for packages.

**Booking page (Booking.tsx):**
- Maps cart items to `Card` components with staff/time `Select` dropdowns
- Each cart item rendered independently with remove button
- Submission: `createAppointment({ items: cart.map(item => ({ serviceId, staffId, startTime })), date, notes })`
- Summary sidebar shows per-item price and total

**Extension needed:** Package cart items render as parent container with child service rows, each getting their own staff/time selection.

**Services page (Services.tsx):**
- Fetches categories + services via `getCategories()` + `getServices()`
- Tab-based filtering by category
- Sheet slide-out for service details with "Add to Cart" / "View in Cart" CTAs
- Structure: header → tabs → service list → footer sparkle

**Extension needed:** Package discovery section inserted BEFORE the main service list (per UI-SPEC).

**Manager Dashboard (ManagerDashboard.tsx):**
- Sidebar-based layout with `activeView` state
- `ActiveView` union type: `'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews' | 'exhibits' | 'content'`
- Each view conditionally rendered based on `activeView`
- Header dynamically shows view-specific CTAs (e.g., "New Employee" for staff view)
- View components imported and rendered inline

**Extension needed:** Add `'packages'` to `ActiveView` type, add sidebar entry, conditionally render `PackagesView`.

**Manager Sidebar (ManagerSidebar.tsx):**
- `menuItems` array with `{ id: ActiveView, label: string, icon: React.ElementType }`
- Currently 8 items: analytics, staff, attendance, deductions, payroll, reviews, exhibits, content
- Active state: `bg-primary text-white shadow-lg shadow-primary/20`
- Icons from lucide-react

**Extension needed:** Add `{ id: 'packages', label: 'Packages', icon: Package }` after 'content'.

### 1.5 API Client (apiClient.ts)

- All API calls exported as named functions
- Pattern: `export const getResource = () => apiClient.get('/resource')`
- POST/PUT/DELETE follow same pattern with typed request bodies
- CMS methods use generic type parameters: `apiClient.get<{ success: boolean; data: T }>()`

**New functions needed:**
- `getPackages()` — GET `/packages`
- `getPackage(id)` — GET `/packages/:id`
- `createPackage(data)` — POST `/packages`
- `updatePackage(id, data)` — PUT `/packages/:id`
- `togglePackage(id, isActive)` — PATCH `/packages/:id/toggle`
- `deletePackage(id)` — DELETE `/packages/:id`
- `getActivePackages()` — GET `/packages/active` (public, for customer-facing)

### 1.6 TypeScript Types (types/api.ts)

- All API response types defined in `frontend/src/types/api.ts`
- Follows pattern: interface per entity with camelCase properties
- Import into apiClient.ts and components

## 2. Schema Design

### 2.1 ServicePackage Model

```prisma
model ServicePackage {
  id               Int      @id @default(autoincrement())
  name             String
  description      String?  @db.Text
  price            Decimal  @db.Decimal(10, 2)
  image_url        String?
  display_order    Int      @default(0)
  valid_from       DateTime? @db.Date
  valid_until      DateTime? @db.Date
  max_redemptions  Int?
  is_active        Boolean  @default(true)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  items            ServicePackageItem[]
  appointment_items AppointmentItem[]

  @@index([is_active, display_order])
  @@map("service_packages")
}
```

### 2.2 ServicePackageItem Join Table

```prisma
model ServicePackageItem {
  id         Int @id @default(autoincrement())
  package_id Int
  service_id Int

  package ServicePackage @relation(fields: [package_id], references: [id], onDelete: Cascade)
  service Service        @relation(fields: [service_id], references: [id])

  @@unique([package_id, service_id])
  @@index([package_id])
  @@map("service_package_items")
}
```

### 2.3 AppointmentItem Extension

Add optional `package_id` to link appointment items to their source package:

```prisma
model AppointmentItem {
  // ... existing fields ...
  package_id  Int?

  // ... existing relations ...
  package     ServicePackage? @relation(fields: [package_id], references: [id])
}
```

### 2.4 Service Model Extension

Add reverse relation to ServicePackageItem:

```prisma
model Service {
  // ... existing fields and relations ...
  package_items ServicePackageItem[]
}
```

## 3. API Design

### 3.1 Package Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/packages` | Manager | List all packages (with service count, booking count) |
| GET | `/api/v1/packages/active` | Public | List active packages for customer discovery |
| GET | `/api/v1/packages/:id` | Public | Get single package with services |
| POST | `/api/v1/packages` | Manager | Create package |
| PUT | `/api/v1/packages/:id` | Manager | Update package |
| PATCH | `/api/v1/packages/:id/toggle` | Manager | Toggle active status |
| DELETE | `/api/v1/packages/:id` | Manager | Delete package (only if 0 bookings) |

### 3.2 Appointment Flow Integration

The existing `createAppointment` endpoint needs extension:
- Accept `packageId` in the items array
- Store `package_id` on `AppointmentItem` records
- The `completeAppointment` function needs modification for package price vs. commission price handling

### 3.3 Response Shapes

**Package list response:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "name": "Mani-Pedi Bundle",
    "description": "...",
    "price": "1500.00",
    "image_url": "https://...",
    "display_order": 1,
    "valid_from": null,
    "valid_until": null,
    "max_redemptions": null,
    "is_active": true,
    "services": [
      { "id": 1, "name": "Classic Manicure", "price": "350.00", "duration_minutes": 30, "category": { "name": "Nail Care" } }
    ],
    "bookings_count": 12,
    "services_total": "1650.00"
  }]
}
```

## 4. Commission Integration Strategy

### 4.1 No Changes to Commission Formula

Per D-05 and D-06, the commission calculation itself is unchanged:
- Each package service becomes a standard `AppointmentItem` with `price_at_booking = full catalog price`
- `getTieredCommissionRate()` works as-is
- `checkSpecialtyQuota()` works as-is (package service prices count toward quota)
- Commission records are created per service, per staff — identical to non-package bookings

### 4.2 Transaction Amount Adjustment

The ONLY change in `completeAppointment()`:
- When an appointment has package items, the `Transaction.amount` should reflect the **actual paid amount** (package price), not the sum of individual prices
- This requires checking if any `AppointmentItem` has a `package_id` and using the package price instead

**Implementation approach:**
- Add `package_price` field to `CreateAppointmentRequest` items, or calculate from package at completion time
- In `completeAppointment()`, group items by `package_id`, sum: package_price for package groups + individual prices for non-package items

## 5. Cart Extension Strategy

### 5.1 CartItem Type Extension

```typescript
export interface CartItem {
  serviceId: number;
  serviceName: string;
  price: number;
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
  // New for packages
  type?: 'service' | 'package';
  packageId?: number;
  packageName?: string;
  packagePrice?: number;
  childServices?: CartChildService[];
}

export interface CartChildService {
  serviceId: number;
  serviceName: string;
  price: number;        // Full catalog price
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
}
```

### 5.2 CartContext Extension

- `addToCart()` for packages: add single item with `type: 'package'` and populated `childServices`
- `removeFromCart()` for packages: remove by `packageId` (not `serviceId`)
- `updateCartItem()` for child services: target by `packageId` + child `serviceId`
- `totalPrice`: for package items use `packagePrice`, not sum of child prices

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cart localStorage schema change breaks existing carts | Medium | Version the cart schema, migrate on load |
| Package price not reflected in Transaction.amount | High (revenue reports wrong) | Integration test: verify Transaction.amount = package price |
| Commission calculated on discounted price | High (staff underpaid) | Integration test: verify Commission.base_amount = full catalog price |
| Package with expired validity still bookable | Medium | Validate `valid_from/valid_until` server-side on booking |
| Max redemptions exceeded | Medium | Check booking count server-side before confirming |
| Orphaned package items if service deleted | Medium | Prisma relation prevents service deletion if in a package |

## 7. Validation Architecture

### 7.1 Server-Side Validations

| Validation | When | Logic |
|------------|------|-------|
| Min 2 services per package | Create/Update | Check `items.length >= 2` |
| Package price is positive | Create/Update | `price > 0` |
| Services exist and are active | Create/Update | Query services by IDs, filter active |
| Package is active for booking | Customer booking | Check `is_active = true` |
| Package is within validity dates | Customer booking | `valid_from <= now <= valid_until` (null = no limit) |
| Max redemptions not exceeded | Customer booking | Count existing bookings with `package_id`, compare to `max_redemptions` |
| Package has no bookings for delete | Manager delete | Count `AppointmentItem` with `package_id`, reject if > 0 |

### 7.2 Client-Side Validations

| Validation | Component | Logic |
|------------|-----------|-------|
| Min 2 services selected | PackageBuilderDialog | Disable submit if `selectedServices.length < 2` |
| Package name required | PackageBuilderDialog | HTML `required` attribute |
| Price is positive number | PackageBuilderDialog | Input `type="number" min="1"` |
| Staff + time for all child services | Booking.tsx | Check all child services have `staffId` and `startTime` |

---

## RESEARCH COMPLETE

**Key findings:**
1. Schema extension is clean — 2 new models + 1 field addition to AppointmentItem
2. Commission logic needs NO formula changes — only Transaction.amount calculation changes
3. Cart system needs type discriminator and child services support
4. Manager dashboard sidebar addition is straightforward (add to ActiveView union + menuItems)
5. Package builder follows established Dialog + form patterns from Phase 5 CMS and Phase 3 Exhibits
6. Customer-facing discovery reuses service card patterns from Services.tsx
