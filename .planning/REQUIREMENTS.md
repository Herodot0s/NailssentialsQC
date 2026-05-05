# Requirements: NailssentialsQC

**Defined:** 2026-05-04
**Core Value:** A reliable, bug-free salon management system that customers, staff, and managers can trust for daily operations — with verified correctness through full test coverage.

## v1 Requirements

*(All v1 requirements from the v1.0 milestone, including bug fixes, tech debt, security, performance, missing features, and test coverage from phases 1-7, have been completed and are isolated from v2.0.)*

## v2 Requirements

Requirements for the v2.0 Premium Experience & Expansion milestone. Each maps to roadmap phases.

### Premium UI/UX

- [ ] **UI-01**: Implement Design Tokens (Airbnb radii, spacing, Terracotta palette)
- [ ] **UI-02**: Redesign Customer Landing Page & Booking Flow
- [ ] **UI-03**: Redesign Manager & Staff Dashboards
- [ ] **UI-04**: Add smooth transitions using framer-motion

### Manager CMS & Gallery

- [ ] **CMS-01**: Public gallery page for Nail Art Exhibits
- [ ] **CMS-02**: Manager CRUD for uploading exhibit images (Vercel Blob integration)
- [ ] **CMS-03**: Manager CRUD for landing page content/policies

### Advanced Analytics

- [ ] **ANLY-01**: Revenue Dash (Standard charts for revenue/bookings)
- [ ] **ANLY-02**: Staff Analytics (Utilization and performance metrics)
- [ ] **ANLY-03**: Retention Analytics (Customer cohort analysis)

### Service Packages

- [ ] **PKG-01**: Managers can create fixed bundles of existing services
- [ ] **PKG-02**: Customers can book a service package
- [ ] **PKG-03**: Commission logic properly handles package redemption

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment gateway integration (Stripe, PayPal) | Not required for v1/v2, salon handles payments offline |
| Multi-Staff Packages | Extreme scheduling and overlap complexity; deferred for v2+ |
| Real-time chat | Not core to salon operations |
| Multi-tenant / multi-location support | Single salon deployment only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 1 | Pending |
| CMS-01 | Phase 3 | Pending |
| CMS-02 | Phase 3 | Pending |
| CMS-03 | Phase 5 | Pending |
| ANLY-01 | Phase 7 | Pending |
| ANLY-02 | Phase 7 | Pending |
| ANLY-03 | Phase 7 | Pending |
| PKG-01 | Phase 6 | Pending |
| PKG-02 | Phase 6 | Pending |
| PKG-03 | Phase 6 | Pending |

**Coverage:**
- v2 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-04*
*Last updated: 2026-05-04 after initial definition*
