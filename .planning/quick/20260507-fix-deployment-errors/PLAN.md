---
title: Fix Deployment Errors
slug: fix-deployment-errors
status: in-progress
date: 2026-05-07
---

# Plan: Fix Deployment Errors

Resolve all TypeScript compiler errors identified in the build log to allow successful deployment.

## Issues to Fix

### 1. Unused Variables and Imports
- [ ] `src/components/Navbar.tsx`: Remove `Settings`, `ImageIcon`
- [ ] `src/components/dashboard/ManagerSidebar.tsx`: Remove `PieChartIcon`
- [ ] `src/components/dashboard/staff/AttendanceLedger.tsx`: Remove `isSameMonth`, `parseISO`, `Clock`, `Activity`, and unused import block
- [ ] `src/components/home/Hero.tsx`: Remove `bgImageUrl`
- [ ] `src/components/packages/PackageCard.tsx`: Remove `AnimatePresence`, `index`
- [ ] `src/components/packages/PackageDiscoverySection.tsx`: Remove `React`, `useScroll`, `useTransform`
- [ ] `src/components/packages/PackagesView.tsx`: Remove `React`, `cn`
- [ ] `src/components/packages/ServiceChipSelector.tsx`: Remove `React`
- [ ] `src/pages/ManageServices.tsx`: Remove `DialogDescription`, `DialogFooter`, `DialogHeader`, `Settings`, `DollarSign`, `Filter`, `Upload`
- [ ] `src/pages/ManagerDashboard.tsx`: Remove `OverviewView`, `historicalData`, `appointments`, `selectedCategory`, `setSelectedCategory`

### 2. Missing Imports/Namespaces
- [ ] `src/components/dashboard/staff/StaffTable.tsx`: Import `Briefcase` from `lucide-react`
- [ ] `src/components/packages/PackageDiscoverySection.tsx`: Fix `NodeJS` namespace issue (use `window.setTimeout` or similar)

### 3. Type Mismatches
- [ ] `src/components/dashboard/analytics/RetentionTab.tsx`: Fix Recharts Tooltip `formatter` type
- [ ] `src/components/packages/CartPackageItem.tsx`: Fix `SelectItem` props (change `textvalue` to `textValue`)
- [ ] `src/pages/Booking.tsx`: Fix `SelectItem` props (change `textvalue` to `textValue`)
- [ ] `src/pages/ManageServices.tsx`: Fix `UpdateServiceRequest` and `CreateServiceRequest` mismatches

### 4. Framer Motion Ease/Transition Types
- [ ] `src/components/home/TrendingTreatments.tsx`: Fix `ease: [0.22, 1, 0.36, 1]` type
- [ ] `src/components/packages/PackageBuilderDialog.tsx`: Fix `ease` and `transition` types
- [ ] `src/components/packages/PackagesView.tsx`: Fix `ease` type
- [ ] `src/pages/Profile.tsx`: Fix `Variants` type (transition ease)
- [ ] `src/pages/Services.tsx`: Fix multiple `ease` and `transition` type issues

## Verification
- [ ] Run `npm run build` in the `frontend` directory and ensure it passes.
