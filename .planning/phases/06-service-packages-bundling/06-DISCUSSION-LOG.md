# Phase 6: Service Packages & Bundling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 06-service-packages-bundling
**Areas discussed:** Package Pricing Model, Booking Experience, Commission Calculation, Management Interface

---

## Package Pricing Model

### Q1: How should package pricing work?

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed bundle price | Manager sets one price for the whole package. Simple, flexible — full control over discount. | ✓ |
| Percentage discount off sum | Auto-calculates price as sum × (1 - discount%). Price updates with catalog changes. | |
| You decide | Agent picks best fit for data model. | |

**User's choice:** Fixed bundle price
**Notes:** None

### Q2: Should the package display savings to the customer?

| Option | Description | Selected |
|--------|-------------|----------|
| Show savings prominently | Display original total + package price with "Save ₱X" badge. | |
| Show package price only | Just display the bundle price. Cleaner, more premium. | |
| You decide | Agent picks based on premium aesthetic. | ✓ |

**User's choice:** You decide
**Notes:** None

### Q3: Can a package contain services from different categories?

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-category allowed | Mix any services regardless of category. Matches requirement text. | ✓ |
| Same-category only | Packages limited to services within one category. Simpler but restrictive. | |

**User's choice:** Cross-category allowed
**Notes:** None

### Q4: Minimum/maximum number of services?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimum 2, no maximum | Must have at least 2 services, no upper limit. | ✓ |
| Minimum 2, maximum 5 | Cap at 5 to keep booking manageable. | |
| You decide | Agent picks reasonable limits. | |

**User's choice:** Minimum 2, no maximum
**Notes:** None

---

## Booking Experience

### Q1: How does a package enter the booking flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Single cart item that expands | One "Bundle" in cart, expands to component services for staff/time selection. | ✓ |
| Adds all services individually | Clicking "Book Package" adds separate cart items at pro-rata prices. | |
| Truly single item | One staff, one time slot, total duration = sum. Forces one technician. | |

**User's choice:** Single cart item that expands
**Notes:** None

### Q2: Where do customers discover packages?

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated section on Services page | Highlighted section at top of /services before individual services. | |
| Separate /packages page | Standalone page linked from navbar. More visibility. | |
| You decide | Agent picks based on premium aesthetic. | ✓ |

**User's choice:** You decide
**Notes:** None

### Q3: Can a customer book a package alongside individual services?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, mix freely | Cart can contain packages and individual services together. | |
| One package per appointment only | Booking a package locks the cart to that package. | |
| You decide | | ✓ |

**User's choice:** You decide
**Notes:** None

### Q4: How should the package appear in appointment history and receipts?

| Option | Description | Selected |
|--------|-------------|----------|
| Grouped under package name | Parent "Bundle" label with individual services listed underneath. | |
| Individual services only | Show each service separately, no package branding. | |
| You decide | | ✓ |

**User's choice:** You decide
**Notes:** None

---

## Commission Calculation

### Q1: How should commission be calculated on discounted package price?

| Option | Description | Selected |
|--------|-------------|----------|
| Commission on pro-rata package price | Each service price scaled proportionally to package price. | |
| Commission on full individual prices | Each service at original catalog price. Salon absorbs discount. | ✓ |
| You decide | Agent picks best for salon economics. | |

**User's choice:** Commission on full individual prices
**Notes:** Staff earnings completely unaffected by package discounts. Salon absorbs the entire discount burden.

### Q2: Should specialty quota count package services at full price?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, full price counts | Consistent with commission decision. Staff not penalized. | ✓ |
| No, use pro-rata for quota | Prevents packages from "inflating" quota faster. | |

**User's choice:** Yes, full price counts
**Notes:** User provided critical clarification about the commission system:
- 20% commission is ONLY for hair stylists (not all staff)
- It's a WEEKLY threshold (not monthly as currently coded): ≥₱6k weekly hair sales → 20%, <₱6k → 10%
- The ₱6,000 quota is fixed (not configurable)
- This is an ADDITIONAL bonus on top of the regular tiered commission

### Q3: Transaction record for different staff within same package?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate commission per staff per service | Each staff gets own Commission row at full individual price. | ✓ |
| Single commission split evenly | Package commission divided equally among all participating staff. | |

**User's choice:** Separate commission per staff per service
**Notes:** Identical to existing multi-item appointment behavior. No new commission logic needed.

### Q4: Should Transaction.amount store package price or sum of individual prices?

| Option | Description | Selected |
|--------|-------------|----------|
| Actual amount paid (package price) | Revenue reports reflect real income. Commission base_amount separate. | ✓ |
| Sum of individual prices | Matches commission calculations but inflates reported revenue. | |

**User's choice:** Actual amount paid (package price)
**Notes:** None

### User-provided commission system clarification (freeform)

The user provided a real payroll table from their salon (February week) showing the exact commission calculation for 5 staff members (Mila, Shantal, Anne, Riza, Jo). Key findings:
- Tiered commission (5/8/10%) applies to ALL staff on all services
- Hair bonus (10/20%) is additional, only for hair stylists (Shantal in the example)
- Weekly payout structure: ₱500/day base + tiered commission + hair bonus - deductions
- Verified: Shantal's 8% on ₱11,917 = ₱953.36, plus 20% on ₱6,000 hair = ₱1,200

---

## Management Interface

### Q1: Where should package CRUD live in the Manager Dashboard?

| Option | Description | Selected |
|--------|-------------|----------|
| New "Packages" sidebar item | Dedicated section like all other management views. | |
| Tab within "Services" section | New parent section grouping catalog + packages. | |
| You decide | | ✓ |

**User's choice:** You decide
**Notes:** None

### Q2: What fields for creating a package?

| Option | Description | Selected |
|--------|-------------|----------|
| Essential fields only | Name, description, services select, price, active toggle. | |
| Rich package builder | Above plus: featured image, display order, validity dates, max redemptions. | ✓ |
| You decide | | |

**User's choice:** Rich package builder
**Notes:** None

### Q3: Deactivate vs. delete for packages?

| Option | Description | Selected |
|--------|-------------|----------|
| Soft deactivate only | Toggle is_active, preserve historical references. | |
| Both deactivate and delete | Either option available, delete may orphan references. | |
| You decide | | ✓ |

**User's choice:** You decide
**Notes:** None

### Q4: Package performance stats in management view?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, inline stats | Booking count and revenue per package. | |
| No, pure CRUD | Stats belong in Phase 7 Analytics. | |
| You decide | | ✓ |

**User's choice:** You decide
**Notes:** None

---

## Agent's Discretion

- Savings display (prominent badge vs. package price only)
- Package discovery placement (services page section vs. /packages route)
- Mixing packages with individual services in cart
- Appointment history/receipt display format
- Sidebar placement for package management
- Soft deactivate vs. hard delete behavior
- Inline performance stats in management view

## Deferred Ideas

- **Multi-staff package booking optimization** — Smart auto-assignment of staff based on availability
- **Package templates/cloning** — Duplicate existing packages for variations
- **Customer-facing package reviews** — Package-level ratings (new concept)
- **Package analytics** — Detailed performance metrics (belongs in Phase 7)
