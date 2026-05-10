# Reset Service Menu — Keep Only: Nails + Addons, Hand Spa, Foot Spa, Waxing & Threading

## Goal
Reset the service menu so only the following categories remain:
1. **Nails** (rename existing "Nail Art"/"Manicure" categories into one)
2. **Addons** (sub-category under Nails OR standalone category — put on Nails tab)
3. **Hand Spa** (new standalone)
4. **Foot Spa** (new standalone)
5. **Waxing & Threading** (new standalone)

All Hair categories/services and any other categories must be **deleted from DB**.

All existing **ServicePackages** (bundles/packages) must be deleted.

## Changes

### 1. Prisma Schema — No changes needed
Categories and services are data-driven via `ServiceCategory` and `Service` tables.

### 2. Database Seed — `backend/seed-services.ts`
Rewrite to create ONLY these categories and no services (user will add 1-by-1 via manager account):
- Upsert category: **Nails** (name: "Nails", description: "Nail services and addons")
- Upsert category: **Hand Spa** (name: "Hand Spa", description: "Luxurious hand treatments and spa services")
- Upsert category: **Foot Spa** (name: "Foot Spa", description: "Relaxing foot treatments and spa services")
- Upsert category: **Waxing & Threading** (name: "Waxing & Threading", description: "Hair removal services")
- No services created (user adds via manager UI)

### 3. Delete All Existing ServicePackages
Add code to delete all rows from `ServicePackage` and `ServicePackageItem` tables before seeding.

### 4. Frontend — `Services.tsx`
The `categoryConfigs` at line 37 already has config for:
- `'Nails'` — keep
- `'Waxing & Threading'` — keep
- `'Spa'` — map Hand Spa + Foot Spa to Spa config (both use the same Spa visual config)

No UI changes needed for the configs — just ensure the dynamic categories pull from DB.

### 5. Frontend — `backend/src/routes/serviceRoutes.ts`
Check `getServices` and `getCategories` endpoints — ensure they return only active categories/services.

### 6. Run seed
Execute the rewritten `seed-services.ts` to:
- Delete all ServicePackages
- Delete all existing ServiceCategory rows (cascade deletes services via Prisma relations)
- Insert the 4 new categories: Nails, Hand Spa, Foot Spa, Waxing & Threading
- No services created

## Verification
- `Services.tsx` page shows only 4 category tabs: All, Nails, Hand Spa, Foot Spa, Waxing & Threading
- No services visible (empty state)
- No packages shown on the page