# Codebase Structure

**Analysis Date:** 2026-05-01

## Directory Layout

```
nailssentialsqc-system/
├── api/                      # Serverless re-export for Vercel
│   └── index.ts              # Re-exports backend/src/index.ts
│
├── backend/                  # Express.js backend (TypeScript)
│   ├── prisma/               # Database schema and migrations
│   │   ├── schema.prisma     # Database schema definition
│   │   ├── seed.ts           # Database seeding script
│   │   └── migrations/       # Prisma migration files
│   │
│   └── src/                  # Source code
│       ├── index.ts          # Entry point (app setup, routes)
│       ├── controllers/      # Business logic
│       ├── routes/           # API route definitions
│       ├── middleware/        # Auth middleware
│       └── utils/            # Utilities (JWT, email, Prisma)
│
├── frontend/                 # React frontend (Vite)
│   └── src/
│       ├── pages/            # Page components
│       ├── components/       # UI components (including ui/ for shadcn)
│       ├── context/          # React context providers
│       ├── lib/             # Utility libraries
│       ├── api/             # API client utilities
│       └── main.tsx         # Frontend entry point
│
├── .claude/                 # GSD agent config (skills, workflows)
├── .planning/               # Planning artifacts (this directory)
├── _bmad/                   # BMAD methodology config
└── _bmad-output/            # Generated BMAD artifacts
```

## Directory Purposes

**backend/src/**
- Purpose: Backend application source code
- Contains: All backend business logic, routing, middleware

**backend/prisma/**
- Purpose: Database schema and migrations
- Contains: `schema.prisma` (source of truth), `seed.ts`, migration history

**backend/src/controllers/**
- Purpose: Controller functions handling HTTP requests
- Contains: 13 controller files (appointment, attendance, auth, customer, message, notification, payroll, report, review, service, staff, upload)

**backend/src/routes/**
- Purpose: Express router definitions
- Contains: 13 route files mapping to controllers, includes middleware wiring

**backend/src/middleware/**
- Purpose: Cross-cutting middleware
- Contains: `authMiddleware.ts` (JWT + role authorization)

**backend/src/utils/**
- Purpose: Shared utilities and singletons
- Contains: `prisma.ts`, `jwt.ts`, `email.ts`

**frontend/src/pages/**
- Purpose: Top-level page components
- Contains: Login, Register, Booking, Services, Profile, CustomerAppointments, StaffDashboard, ManagerDashboard, ManageServices

**frontend/src/components/**
- Purpose: Reusable UI components
- Contains: `ui/` for shadcn components, page-specific components

**frontend/src/context/**
- Purpose: React context providers
- Contains: Auth context and other state management

## Key File Locations

**Entry Points:**
- `backend/src/index.ts`: Backend server entry (Express app setup)
- `api/index.ts`: Serverless re-export wrapper
- `frontend/src/main.tsx`: React application bootstrap

**Configuration:**
- `backend/tsconfig.json`: TypeScript config
- `backend/package.json`: Backend dependencies and scripts
- `frontend/package.json`: Frontend dependencies and scripts
- `backend/.gitignore`: Backend gitignore (node_modules, dist, .env)
- `.prettierrc`: Prettier formatting config

**Core Logic:**
- `backend/src/controllers/`: All business logic (13 files)
- `backend/prisma/schema.prisma`: Database schema with 18 models
- `backend/src/middleware/authMiddleware.ts`: JWT auth + role guard

**Testing:**
- `backend/test-logic.ts`: Manual test script
- `backend/e2e-test.js`: End-to-end test script

## Naming Conventions

**Files:**
- TypeScript files: `kebab-case.ts` (e.g., `appointmentController.ts`)
- Route files: `kebab-case.ts` (e.g., `authRoutes.ts`)
- Frontend pages: PascalCase (e.g., `ManagerDashboard.tsx`)
- Frontend components: PascalCase with descriptive names

**Directories:**
- Backend src subdirs: `lowercase` (controllers, routes, middleware, utils)
- Frontend subdirs: `lowercase` (components, pages, context, lib)
- Special: `ui/` for base components

**Database Models (Prisma):**
- Models: PascalCase singular (`CustomerProfile`, `StaffPayroll`)
- Fields: snake_case (`full_name`, `is_active`, `password_hash`)
- Enums: PascalCase (`AppointmentStatus`, `PaymentMethod`)
- Tables: Auto-generated plural snake_case via `@@map`

**API Responses:**
- Success field: `success: boolean`
- Data field: `data: any`
- Error structure: `error: { code: string, message: string }`

## Where to Add New Code

**New Backend Feature:**

1. Controllers: `backend/src/controllers/<feature>Controller.ts`
   - Add async functions with `try/catch`
   - Follow response pattern: `{ success: boolean, data/error: ... }`
   - Use Prisma instance from `import prisma from '../utils/prisma'`

2. Routes: `backend/src/routes/<feature>Routes.ts`
   - Import controller functions
   - Apply `authenticateToken` and `authorizeRoles()` as needed
   - Register in `backend/src/index.ts`: `app.use('/api/v1/<resource>', routes)`

3. Middleware (if needed): `backend/src/middleware/`

**New Frontend Page:**

1. Pages: `frontend/src/pages/<FeatureName>.tsx`
   - Use React Router patterns from existing pages
   - Import API utilities from `frontend/src/api/`

2. Components: `frontend/src/components/<feature>/`
   - Create subdirectory for feature-specific components
   - Use existing UI components from `frontend/src/components/ui/`

**New Database Model:**

1. Edit `backend/prisma/schema.prisma`
   - Add model with correct naming (PascalCase)
   - Use snake_case for fields
   - Run `npx prisma migrate dev`

2. Prisma auto-generates types - import from `@prisma/client`

**New Utility:**

- Prisma client wrapper: `backend/src/utils/prisma.ts` (singleton pattern)
- JWT operations: `backend/src/utils/jwt.ts`
- Email functions: `backend/src/utils/email.ts`
- New utility files: `backend/src/utils/<name>.ts`

## Special Directories

**backend/prisma/migrations/**
- Purpose: Database migration history
- Generated: Yes (by Prisma)
- Committed: Yes

**backend/node_modules/**
- Purpose: Backend dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**frontend/node_modules/**
- Purpose: Frontend dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**_bmad/**
- Purpose: BMAD methodology configuration
- Generated: No
- Committed: Yes

**_bmad-output/**
- Purpose: Generated planning and implementation artifacts
- Generated: Yes (by BMAD scripts)
- Committed: Yes

---

*Structure analysis: 2026-05-01*