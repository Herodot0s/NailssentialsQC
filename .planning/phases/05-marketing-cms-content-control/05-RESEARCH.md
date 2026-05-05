# Phase 5: Marketing CMS & Content Control — Research

**Researched:** 2026-05-05
**Status:** RESEARCH COMPLETE

---

## 1. Existing Patterns

### 1.1 Controller Pattern (`exhibitController.ts`)

The canonical pattern for all new controllers:

```typescript
import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Public route handler
export const getHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await prisma.model.findMany({ ... });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Operation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to ...' });
  }
};

// Manager-only write handler
export const createHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { field1, field2 } = req.body;
    if (!field1) {
      return res.status(400).json({ success: false, message: 'field1 is required' });
    }
    const record = await prisma.model.create({ data: { field1, field2 } });
    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create' });
  }
};

// Delete handler
export const deleteHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.model.findUnique({ where: { id: Number(id) } });
    if (!record) return res.status(404).json({ success: false, message: 'Not found' });
    await prisma.model.delete({ where: { id: Number(id) } });
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete' });
  }
};
```

**Response shape:** Always `{ success: boolean, data?: any, message?: string }`.  
**Status codes:** 200 (GET/DELETE), 201 (POST create), 400 (bad input), 404 (not found), 500 (server error).

### 1.2 Route Registration Pattern (`exhibitRoutes.ts`)

```typescript
import { Router } from 'express';
import { getHandler, createHandler, deleteHandler } from '../controllers/cmsController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public route — no middleware
router.get('/settings', getSettingsHandler);
router.get('/content', getContentHandler);

// Manager-only routes — authenticateToken + authorizeRoles('manager')
router.put('/settings', authenticateToken, authorizeRoles('manager'), saveSettingsHandler);
router.post('/content', authenticateToken, authorizeRoles('manager'), createContentHandler);
router.put('/content/:id', authenticateToken, authorizeRoles('manager'), updateContentHandler);
router.delete('/content/:id', authenticateToken, authorizeRoles('manager'), deleteContentHandler);

export default router;
```

Route file is then registered in `backend/src/index.ts` (or equivalent router file) as:
`app.use('/api/v1/cms', cmsRoutes);`

### 1.3 API Client Pattern (`apiClient.ts`)

Base URL is `/api/v1`. All exports are named functions:

```typescript
// CMS methods to add at the bottom of apiClient.ts

// Settings (landing page copy)
export const getCmsSettings = () => apiClient.get('/cms/settings');
export const saveCmsSettings = (data: { settings: Array<{ section: string; key: string; value: string }> }) =>
  apiClient.put('/cms/settings', data);

// Content (FAQ + policies)
export const getCmsContent = (params?: { type?: 'faq' | 'policy'; limit?: number }) =>
  apiClient.get('/cms/content', { params });
export const createCmsContent = (data: { type: 'faq' | 'policy'; title: string; body: string; sort_order?: number; is_active?: boolean }) =>
  apiClient.post('/cms/content', data);
export const updateCmsContent = (id: number, data: Partial<{ title: string; body: string; sort_order: number; is_active: boolean }>) =>
  apiClient.put(`/cms/content/${id}`, data);
export const deleteCmsContent = (id: number) => apiClient.delete(`/cms/content/${id}`);
```

### 1.4 Manager Dashboard Sidebar Pattern (`ManagerDashboard.tsx`)

**State management:**
```typescript
const [activeView, setActiveView] = useState<ActiveView>('analytics');
```

**ActiveView type** is defined in `frontend/src/components/dashboard/types.ts`. To add 'content':
```typescript
// In @/components/dashboard/types.ts — add 'content' to the ActiveView union
export type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews' | 'exhibits' | 'content';
```

**Sidebar component:** `ManagerSidebar` takes `activeView` + `onViewChange={setActiveView}` props. The "Content" nav item must be added to `ManagerSidebar`'s internal nav array after "Exhibit Gallery":
```typescript
{ id: 'content', label: 'Content', icon: FileText }
```

**View rendering pattern in ManagerDashboard.tsx:**
```typescript
{activeView === 'content' && (
  <div className="animate-in fade-in duration-700">
    <ContentView />
  </div>
)}
```

Add this block after the `exhibits` block (line ~471-475).

### 1.5 React Query Pattern

**Important:** `ManagerDashboard.tsx` uses direct `apiClient` calls with `useState`, NOT React Query. The existing codebase does NOT use React Query in the dashboard layer.

For Phase 5, the CONTEXT.md decision D-08 specifies React Query with `staleTime: 10min` for landing page content fetching. **Two options:**

**Option A (Recommended for landing page):** Use React Query only for public-facing landing page fetches (where stale caching matters for performance). Install if not already present:
```bash
npm install @tanstack/react-query
```
Then wrap `App.tsx` with `QueryClientProvider`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
// Wrap <App /> with <QueryClientProvider client={queryClient}>
```

**Option B (Simpler, consistent with codebase):** Use `useState` + `useEffect` pattern matching the dashboard pattern, with a manual cache variable (module-level). This avoids adding a new dependency.

**Recommendation:** The planner should choose Option A for the landing page (React Query with staleTime) and Option B (direct apiClient + useState) for the CMS editor in the manager dashboard. This matches the CONTEXT.md intent without over-engineering the admin side.

---

## 2. New Prisma Models

### 2.1 `SiteSettings` Model

```prisma
model SiteSettings {
  id         Int      @id @default(autoincrement())
  section    String
  key        String
  value      String   @db.Text
  updated_at DateTime @updatedAt

  @@unique([section, key], name: "section_key_unique")
  @@index([section])
  @@map("site_settings")
}
```

No `created_at` needed — these are config rows, not append-only records.

### 2.2 `SiteContentType` Enum + `SiteContent` Model

```prisma
enum SiteContentType {
  faq
  policy

  @@map("site_content_type")
}

model SiteContent {
  id         Int             @id @default(autoincrement())
  type       SiteContentType
  title      String
  body       String          @db.Text
  sort_order Int             @default(0)
  is_active  Boolean         @default(true)
  created_at DateTime        @default(now())
  updated_at DateTime        @updatedAt

  @@index([type, is_active, sort_order])
  @@map("site_content")
}
```

**Conflict check:** The existing `SystemSettings` model maps to `system_settings` — no conflict with `site_settings`. Both models are distinct.

### 2.3 Schema Push Command

```bash
npx prisma db push
```

This is a `[BLOCKING]` task — must run AFTER schema file edits and BEFORE any API or frontend work.

---

## 3. Seed Data (SiteSettings)

Extracted from `Home.tsx` and `Hero.tsx` — these are the exact hardcoded strings that become DB defaults:

| section | key | value |
|---------|-----|-------|
| hero | tagline | Experience Pure Tranquility |
| hero | headline | Elevate Your Natural Beauty |
| hero | subheadline | Discover a haven of serenity where expert craftsmanship meets premium self-care. Welcome to the NailssentialsQC sanctuary. |
| hero | bg_image_url | https://images.unsplash.com/photo-1600334129128-685c4582f98c?auto=format&fit=crop&q=80&w=2070 |
| hero | button_label | Book Your Sanctuary |
| signature | label | Signature Experience |
| signature | headline | The Nailssentials Ritual |
| signature | body | Step into a world where time slows down. Our signature ritual combines aromatherapy, precision technique, and an atmosphere of absolute luxury to revitalize your spirit. |
| signature | link_label | Discover the Menu |
| signature | bg_image_url | https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=2070 |
| footer | headline | Prepare for your visit. |
| footer | button_label | JOIN THE PRIVILEGE CLUB |
| contact | phone | (empty string) |
| contact | address | (empty string) |
| contact | hours | (empty string) |
| contact | email | (empty string) |
| contact | maps_link | (empty string) |

**Seed mechanism:** Use `prisma.siteSettings.upsert({ where: { section_key_unique: { section, key } }, update: {}, create: { section, key, value } })` — so re-running seed is idempotent and doesn't overwrite manager's changes.

Seed file location: `backend/prisma/seed.ts` (create if doesn't exist) or append to existing seed.

---

## 4. API Design

All routes under `/api/v1/cms`:

| Method | Path | Auth | Request Body | Response |
|--------|------|------|--------------|----------|
| GET | `/cms/settings` | Public | — | `{ success: true, data: { hero: { tagline: "...", ... }, contact: { phone: "...", ... }, ... } }` (grouped by section) |
| PUT | `/cms/settings` | Manager | `{ settings: [{ section, key, value }] }` | `{ success: true, data: { updated: N } }` |
| GET | `/cms/content` | Public | Query: `?type=faq\|policy&limit=5&activeOnly=true` | `{ success: true, data: SiteContent[] }` |
| POST | `/cms/content` | Manager | `{ type, title, body, sort_order?, is_active? }` | `{ success: true, data: SiteContent }` (201) |
| PUT | `/cms/content/:id` | Manager | `{ title?, body?, sort_order?, is_active? }` | `{ success: true, data: SiteContent }` |
| DELETE | `/cms/content/:id` | Manager | — | `{ success: true, message: "Deleted successfully" }` |

**Settings response structure:** Return a nested object grouped by section for easy consumption:
```typescript
// GET /cms/settings response.data shape
{
  hero: { tagline: "...", headline: "...", subheadline: "...", bg_image_url: "...", button_label: "..." },
  signature: { label: "...", headline: "...", body: "...", link_label: "...", bg_image_url: "..." },
  footer: { headline: "...", button_label: "..." },
  contact: { phone: "", address: "", hours: "", email: "", maps_link: "" }
}
```

**Save settings:** Accept array of `{section, key, value}` tuples and use `prisma.siteSettings.upsert` in a transaction.

---

## 5. Frontend Integration

### 5.1 `/policies` Route in `App.tsx`

Add as a public route (no `ProtectedRoute` wrapper), positioned with other public routes:

```typescript
import PoliciesPage from './pages/PoliciesPage';

// In <Routes> with other public routes:
<Route path="/policies" element={<PageTransition><PoliciesPage /></PageTransition>} />
```

### 5.2 Manager Dashboard Sidebar Registration

Three files need updates:
1. **`frontend/src/components/dashboard/types.ts`** — Add `'content'` to `ActiveView` union type
2. **`frontend/src/components/dashboard/ManagerSidebar.tsx`** — Add `{ id: 'content', label: 'Content', icon: FileText }` nav item after exhibits
3. **`frontend/src/pages/ManagerDashboard.tsx`** — Import `ContentView` and add view block

### 5.3 React Query Setup

If `@tanstack/react-query` is not in `package.json`:
```bash
cd frontend && npm install @tanstack/react-query
```

Wrap `App.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
// In App(): wrap with <QueryClientProvider client={queryClient}>...</QueryClientProvider>
```

Landing page hooks:
```typescript
// useQuery for settings
const { data: settings } = useQuery({
  queryKey: ['cms-settings'],
  queryFn: () => getCmsSettings().then(r => r.data.data),
  staleTime: 10 * 60 * 1000,
});

// Fallback pattern
const heroTagline = settings?.hero?.tagline ?? 'Experience Pure Tranquility';
```

### 5.4 Shadcn Accordion Install

```bash
cd frontend && npx shadcn@latest add accordion
```

This is needed for the FAQ accordion on the landing page and `/policies` page.

### 5.5 Hero Component Refactor

`Hero.tsx` currently renders hardcoded JSX. It must accept props (or fetch from parent):

```typescript
interface HeroProps {
  tagline?: string;
  headline?: string;
  subheadline?: string;
  bgImageUrl?: string;
  buttonLabel?: string;
}

const Hero: React.FC<HeroProps> = ({
  tagline = 'Experience Pure Tranquility',
  headline = 'Elevate Your Natural Beauty',
  subheadline = 'Discover a haven of serenity...',
  bgImageUrl = 'https://images.unsplash.com/...',
  buttonLabel = 'Book Your Sanctuary',
}) => { ... };
```

`Home.tsx` fetches settings and passes them down as props to `<Hero>`, `ContactInfoSection`, `FaqAccordionSection`, etc.

---

## 6. Component Map

```
frontend/src/
├── pages/
│   ├── Home.tsx                    [MODIFY] — fetch CMS settings, pass to sub-components
│   └── PoliciesPage.tsx            [CREATE] — new public /policies page
├── components/
│   ├── home/
│   │   ├── Hero.tsx                [MODIFY] — accept props, add fallback defaults
│   │   ├── ContactInfoSection.tsx  [CREATE] — new contact info section
│   │   └── FaqAccordionSection.tsx [CREATE] — top-5 FAQ accordion for landing page
│   └── dashboard/
│       ├── types.ts                [MODIFY] — add 'content' to ActiveView
│       ├── ManagerSidebar.tsx      [MODIFY] — add 'Content' nav item with FileText icon
│       └── cms/
│           ├── ContentView.tsx     [CREATE] — CMS editor container (Tabs wrapper)
│           ├── LandingPageEditor.tsx [CREATE] — Landing Page tab (4 section cards)
│           ├── FaqEditor.tsx       [CREATE] — FAQ tab (CRUD list)
│           └── PolicyEditor.tsx    [CREATE] — Policies tab (CRUD list)
└── api/
    └── apiClient.ts                [MODIFY] — add 6 CMS methods

backend/src/
├── controllers/
│   └── cmsController.ts            [CREATE] — 6 handler functions
├── routes/
│   └── cmsRoutes.ts                [CREATE] — 6 routes with RBAC
└── index.ts                        [MODIFY] — register cmsRoutes at /api/v1/cms

backend/prisma/
├── schema.prisma                   [MODIFY] — add SiteContentType enum, SiteSettings, SiteContent
└── seed.ts                         [CREATE/MODIFY] — upsert 17 SiteSettings rows
```

---

## 7. Backend Route Registration

Check `backend/src/index.ts` for how existing routes are registered. Pattern from exhibitRoutes:
```typescript
import exhibitRoutes from './routes/exhibitRoutes';
app.use('/api/v1/exhibits', exhibitRoutes);
```

Add:
```typescript
import cmsRoutes from './routes/cmsRoutes';
app.use('/api/v1/cms', cmsRoutes);
```

---

## 8. Validation Architecture

### Backend Validation
- `npx prisma db push` exits 0 — schema push succeeded
- `GET /api/v1/cms/settings` returns 200 with grouped settings object
- `PUT /api/v1/cms/settings` without auth token returns 401
- `PUT /api/v1/cms/settings` with staff token returns 403
- `PUT /api/v1/cms/settings` with manager token returns 200
- `POST /api/v1/cms/content` without `type` field returns 400
- `DELETE /api/v1/cms/content/999` returns 404

### Frontend Validation
- `Home.tsx` loads without errors — no hardcoded text remaining in Hero, Signature, Footer CTA sections
- When DB is empty (fresh seed not run): landing page renders with fallback hardcoded strings, no undefined errors
- When DB is populated: landing page renders DB values, not fallback strings
- Contact Info section: hidden if all 5 fields are empty strings
- FAQ accordion: hidden if no active FAQs
- `/policies` route is publicly accessible (no auth redirect)
- Manager Dashboard shows "Content" in sidebar — clicking it renders the CMS editor
- CMS "Save Changes" succeeds for hero section and landing page updates within 1 second of reload

---

## 9. Risks & Landmines

| Risk | Impact | Mitigation |
|------|--------|------------|
| `SiteContentType` enum migration may fail if DB already has conflicting types | Blocker | Use `npx prisma db push --accept-data-loss` only if needed; prefer `prisma migrate dev` for safety |
| `@tanstack/react-query` may not be installed | Frontend build error | Check `package.json` before assuming it's available; add install step to plan |
| `ManagerSidebar.tsx` has its own internal nav array — adding 'content' may conflict with TypeScript type guards | Type error | Update `ActiveView` type FIRST before modifying ManagerSidebar |
| `Home.tsx` mounts `<Hero />` as a self-contained component — if Hero fetches its own data, it may conflict with parent fetching | Double fetch / race condition | Pass settings as props from `Home.tsx` top-level fetch; Hero should NOT fetch independently |
| Prisma upsert in `seed.ts` requires the unique constraint `section_key_unique` to exist — schema push must run first | Seed fails | Plan ordering: schema push → seed → backend → frontend |
| `npx prisma db push` is interactive by default (prompts on destructive changes) — CI/automation may hang | Blocked pipeline | Use `npx prisma db push --accept-data-loss` flag or ensure `prisma migrate dev` is used in dev |
| Contact info section visibility: if `settings` is undefined (loading state), section may flash then hide | UX glitch | Default to null/empty check only after loading completes; use `isLoading` guard |
| Accordion component not installed — will cause build error | Build blocker | Add `npx shadcn@latest add accordion` as explicit task in Wave 1 plan |
| `/policies` page has no Navbar awareness — may render without nav | Layout issue | Import and render `<Navbar />` is already handled by `App.tsx` wrapper; no extra work needed |

---

## RESEARCH COMPLETE
