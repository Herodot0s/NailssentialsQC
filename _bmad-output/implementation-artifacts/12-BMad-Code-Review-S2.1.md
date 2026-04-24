# BMad Code Review Report: S2.1 Service Catalog Implementation

## 1. Blind Hunter (Immediate Technical Faults)

*   **[No Critical Faults Found]**
    *   The basic routes, database connections, and frontend component structures are wired up correctly. `serviceRoutes.ts` is registered in `index.ts`, and routing priority (`/categories` before `/`) is appropriately handled to prevent route shadowing.

## 2. Edge Case Hunter (Logic Flaws)

*   **[HIGH] Unhandled `NaN` on Category Filtering:**
    In `backend/src/controllers/serviceController.ts` (`getServices`), the parameter `categoryId` is parsed via `parseInt(categoryId as string)`. If a user passes an invalid query string like `?categoryId=abc`, `parseInt` returns `NaN`. Prisma cannot query `category_id: NaN` and will throw a validation error, resulting in a 500 Internal Server Error instead of a proper 400 Bad Request.

*   **[MEDIUM] Seed Script Data Duplication:**
    In `backend/prisma/seed.ts`, the categories are seeded using `upsert` (which is idempotent), but the services are seeded using a simple `.create()` loop without checking for existing records. If a developer runs `npx prisma db seed` multiple times, the `Service` table will populate with duplicate entries.

## 3. Acceptance Auditor (Security & Standards)

*   **[MEDIUM] Sequential Network Requests (Waterfall):**
    In `frontend/src/pages/Services.tsx`, the data fetching logic inside `useEffect` makes sequential API calls:
    ```typescript
    const catRes = await getCategories();
    setCategories(catRes.data.data);

    const svcRes = await getServices();
    setServices(svcRes.data.data);
    ```
    This creates an unnecessary network waterfall that doubles the perceived loading time. These independent queries should be executed concurrently using `Promise.all()`.

*   **[LOW] Endpoint Authorization:**
    The story specifies that the catalog is public, so leaving these endpoints unauthenticated in `serviceRoutes.ts` is correct and complies with the PRD.
