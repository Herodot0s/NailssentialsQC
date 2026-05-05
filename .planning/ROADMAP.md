# Roadmap

## Completed Milestones (V1)
- ✓ **Phase 1:** Critical Bug Fixes
- ✓ **Phase 2:** Type Safety & Code Quality
- ✓ **Phase 3:** Security Hardening
- ✓ **Phase 4:** API Improvements
- ✓ **Phase 5:** Performance Optimization
- ✓ **Phase 6:** Missing Features
- ✓ **Phase 7:** Backend Test Infrastructure

*(All V1 phases are fully complete. Below is the roadmap for Milestone V2: Premium Experience & Expansion).*

## Phases

- [x] **Phase 1: Premium UI Foundations** - Establish global design tokens and transition animations
- [ ] **Phase 2: Customer Journey Redesign** - Overhaul the landing page and booking flow with premium aesthetics
- [ ] **Phase 3: Nail Art Exhibit & Gallery** - Launch the public gallery with manager-led media management
- [ ] **Phase 4: Operations Interface Overhaul** - Modernize the staff and manager daily task views
- [ ] **Phase 5: Marketing CMS & Content Control** - Enable full manager control over landing page text and policies
- [ ] **Phase 6: Service Packages & Bundling** - Implement creation and booking of service bundles with commission logic
- [ ] **Phase 7: Advanced Analytics Dashboard** - Provide deep business insights via interactive reporting

## Phase Details
### Phase 1: Premium UI Foundations
**Goal**: Establish a consistent, premium design language and interaction model across the entire platform
**Depends on**: Nothing
**Requirements**: UI-01, UI-04
**Success Criteria** (what must be TRUE):
  1. User sees correct Airbnb-inspired colors (Terracotta/Rausch), typography, and spacing tokens applied globally
  2. User experiences smooth page transitions and micro-interactions using framer-motion
**Plans**:
- **Wave 1**
  - [x] 01-01-PLAN.md: Foundation & Testing Setup
- **Wave 2 (Blocked on Wave 1)**
  - [x] 01-02-PLAN.md: Global Design System (Tokens)
  - [x] 01-03-PLAN.md: Animation Primitives
- **Wave 3 (Blocked on Wave 2)**
  - [x] 01-04-PLAN.md: Component & Route Integration
**UI hint**: yes

### Phase 2: Customer Journey Redesign
**Goal**: Customers enjoy a boutique, high-end experience from the first visit through to booking
**Depends on**: Phase 1
**Requirements**: UI-02
**Success Criteria** (what must be TRUE):
  1. Customer can navigate a visually stunning landing page that reflects the premium NailssentialsQC brand
  2. Customer can book an appointment through a simplified, premium-feeling multi-step booking flow
**Plans**:
- **Wave 1**
  - [x] 02-01-PLAN.md — Landing Page Refactor & Hero (D-01, D-02, D-03)
- **Wave 2**
  - [ ] 02-02-PLAN.md — Booking Ritual State Machine & Steps (D-04, D-06, D-09, D-10)
  - [ ] 02-03-PLAN.md — Final Ritual Steps & Navigation (D-05)
- **Wave 3**
  - [ ] 02-04-PLAN.md — Visual Integration & Final Polish (D-07, D-08)
**UI hint**: yes

### Phase 3: Nail Art Exhibit & Gallery
**Goal**: Showcase salon quality through a public gallery managed directly by the salon staff
**Depends on**: Phase 2
**Requirements**: CMS-01, CMS-02
**Success Criteria** (what must be TRUE):
  1. Customer can browse a public "Nail Art Exhibit" gallery with high-resolution imagery
  2. Manager can upload, name, and delete exhibit images via a simple drag-and-drop interface (Vercel Blob)
**Plans**: 4 plans
- **Wave 0**
  - [x] 03-00-PLAN.md — Test Skeletons (Backend & Frontend)
- **Wave 1**
  - [ ] 03-01-PLAN.md — Data Foundations (Prisma, API, Migration)
- **Wave 2**
  - [ ] 03-02-PLAN.md — Management CMS (Manager Upload/List)
- **Wave 3**
  - [ ] 03-03-PLAN.md — Public Gallery (Masonry Layout, Detail View)
**UI hint**: yes

### Phase 4: Operations Interface Overhaul
**Goal**: Staff and managers use a professional, distraction-free environment for daily salon operations
**Depends on**: Phase 1
**Requirements**: UI-03
**Success Criteria** (what must be TRUE):
  1. Staff can manage attendance and view schedules in a modernized, mobile-responsive dashboard
  2. Manager can oversee today's salon status and coordinate staff in an organized, cleaner layout
**Plans**: TBD
**UI hint**: yes

### Phase 5: Marketing CMS & Content Control
**Goal**: Managers have full control over the salon's public-facing information without technical help
**Depends on**: Phase 3, Phase 4
**Requirements**: CMS-03
**Success Criteria** (what must be TRUE):
  1. Manager can update landing page hero text, descriptions, and contact info via the CMS dashboard
  2. Manager can modify salon policies and FAQ sections directly through the interface
**Plans**: TBD
**UI hint**: yes

### Phase 6: Service Packages & Bundling
**Goal**: The salon can offer curated service bundles to increase ticket size and simplify booking
**Depends on**: Phase 2, Phase 4
**Requirements**: PKG-01, PKG-02, PKG-03
**Success Criteria** (what must be TRUE):
  1. Manager can create service packages (e.g., "Mani-Pedi Bundle") with custom pricing and services
  2. Customer can discover and book a service package as a single item in the booking flow
  3. Staff receive accurate commission specifically calculated for services within a redeemed package
**Plans**: TBD
**UI hint**: yes

### Phase 7: Advanced Analytics Dashboard
**Goal**: Provide actionable business insights through interactive data visualization and deep reporting
**Depends on**: Phase 4
**Requirements**: ANLY-01, ANLY-02, ANLY-03
**Success Criteria** (what must be TRUE):
  1. Manager can view interactive revenue charts and booking volume trends with date filtering
  2. Manager can identify top-performing staff based on utilization and revenue generation metrics
  3. Manager can analyze customer retention rates and cohort behavior over time
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| V1-1. Critical Bug Fixes | 5/5 | Complete | 2026-05-04 |
| V1-2. Type Safety & Code Quality | 4/4 | Complete | 2026-05-04 |
| V1-3. Security Hardening | 6/6 | Complete | 2026-05-04 |
| V1-4. API Improvements | 3/3 | Complete | 2026-05-04 |
| V1-5. Performance Optimization | 5/5 | Complete | 2026-05-04 |
| V1-6. Missing Features | 3/3 | Complete | 2026-05-04 |
| V1-7. Backend Test Infrastructure | 8/8 | Complete | 2026-05-04 |
| 1. Premium UI Foundations | 4/4 | Complete | 2026-05-05 |
| 2. Customer Journey Redesign | 4/4 | In progress | - |
| 3. Nail Art Exhibit & Gallery | 1/4 | In Progress|  |
| 4. Operations Interface Overhaul | 0/0 | Not started | - |
| 5. Marketing CMS & Content Control | 0/0 | Not started | - |
| 6. Service Packages & Bundling | 0/0 | Not started | - |
| 7. Advanced Analytics Dashboard | 0/0 | Not started | - |
