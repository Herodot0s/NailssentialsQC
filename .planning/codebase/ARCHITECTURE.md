# Architecture

**Analysis Date:** 2026-05-01

## System Overview

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           Frontend (React 19 + Vite)                        │
 │   Pages: Login.tsx, Booking.tsx, StaffDashboard.tsx, ManagerDashboard.tsx   │
 │   Features: Authentication, Appointments, Payroll, Reports                  │
 └─────────────────────────────────┬───────────────────────────────────────────┘
                                   │ HTTP/API
                                   ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                     Backend (Express.js + TypeScript)                       │
 │   Entry Point: backend/src/index.ts                                         │
 │   API Version: /api/v1/*                                                   │
 └─────────────────────────────────┬───────────────────────────────────────────┘
                                   │ Prisma ORM
                                   ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                          PostgreSQL Database                                │
 │   Schema: backend/prisma/schema.prisma                                     │
 └─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Backend Entry | Route registration, middleware, server startup | `backend/src/index.ts` |
| Auth Controller | Register, login, logout, refresh tokens, getMe | `backend/src/controllers/authController.ts` |
| Appointment Controller | CRUD appointments, availability, completion | `backend/src/controllers/appointmentController.ts` |
| Payroll Controller | Generate payroll, manage deductions, periods | `backend/src/controllers/payrollController.ts` |
| Staff Controller | Staff management, schedules | `backend/src/controllers/staffController.ts` |
| Auth Middleware | JWT validation, role authorization | `backend/src/middleware/authMiddleware.ts` |
| JWT Utils | Token generation/verification | `backend/src/utils/jwt.ts` |
| Email Utils | Nodemailer email sending | `backend/src/utils/email.ts` |
| Prisma Singleton | Database connection management | `backend/src/utils/prisma.ts` |

## Pattern Overview

**Overall:** Express.js Controller-Router with Prisma ORM

**Key Characteristics:**
- Controller-based request handling with async/await patterns
- Role-based access control via `authorizeRoles()` middleware
- JWT authentication with access/refresh token rotation
- Prisma transactions for multi-table operations
- Async notifications (email, in-app) after critical operations

## Layers

**API Layer (Routes):**
- Purpose: HTTP method routing and validation
- Location: `backend/src/routes/`
- Contains: Route definitions with express-validator middleware
- Depends on: Controllers
- Pattern: `router.METHOD('/path', [middleware], controllerFunction)`

**Business Logic Layer (Controllers):**
- Purpose: Request processing, business rules, database operations
- Location: `backend/src/controllers/`
- Contains: Controller functions for each route
- Depends on: Prisma, middleware, utilities
- Pattern: `async (req, res) => { try { ... } catch { ... } }`

**Data Access Layer (Prisma):**
- Purpose: Database queries and schema management
- Location: `backend/prisma/`
- Contains: `schema.prisma`, `seed.ts`, migrations
- Depends on: PostgreSQL

**Middleware Layer:**
- Purpose: Cross-cutting concerns (auth, validation)
- Location: `backend/src/middleware/`
- Contains: `authMiddleware.ts`
- Pattern: Higher-order functions returning middleware

**Utility Layer:**
- Purpose: Shared helpers (JWT, email, Prisma client)
- Location: `backend/src/utils/`
- Contains: Reusable functions and singletons

## Data Flow

### Authentication Flow

1. **Register** (`/api/v1/auth/register`) (`backend/src/routes/authRoutes.ts:66`)
   - Validate input with express-validator
   - Check email/phone uniqueness
   - Hash password with bcrypt (12 rounds)
   - Create User + CustomerProfile in transaction
   - Generate access + refresh tokens
   - Store refresh token in DB with 30-day expiry

2. **Login** (`/api/v1/auth/login`) (`backend/src/routes/authRoutes.ts:67`)
   - Find user by username/email/phone
   - Check lockout status (5 attempts = 15-min lock)
   - Compare bcrypt password
   - Update failed attempts / lockout on failure
   - Reset on success, store refresh token

3. **Refresh** (`/api/v1/auth/refresh`) (`backend/src/routes/authRoutes.ts:68`)
   - Verify JWT signature
   - Check token in DB (not expired)
   - Rotate tokens (delete old, create new)
   - Return new pair

### Appointment Booking Flow

1. **Check Availability** (`/api/v1/appointments/availability`) - No auth required
   - Calculate slot grid (12 PM - 10 PM, hourly)
   - Query active appointment items for date
   - Filter conflicts using interval overlap check

2. **Create Appointment** (`/api/v1/appointments`) - Auth required
   - Validate items array with date
   - Staff can create walk-ins without customer ID
   - Customer creates own appointment
   - Prisma transaction: create appointment + items
   - Async: send email, create notifications

3. **Complete Appointment** (`/api/v1/appointments/:id/complete`) - Staff/Manager only
   - Calculate tiered commission rate (5%/8%/10% based on salon sales)
   - Check staff specialty quota for elevated rate
   - Prisma transaction: update status, create transaction + commissions
   - Async: send receipt email

### Payroll Flow

1. **Generate Payroll** (`/api/v1/payroll/generate`) - Manager only
   - Create payroll period
   - Calculate commissions for each staff (prev month / 4)
   - Include base pay (weeks * rate), deductions, tardiness
   - Mark previous commissions as paid
   - Link deductions to period

2. **Lock Period** (`/api/v1/payroll/periods/:id/lock`) - Manager only
   - Prevents further modifications

## Key Abstractions

**Prisma Singleton:**
- Purpose: Single database connection across requests
- Examples: `backend/src/utils/prisma.ts`
- Pattern: Global variable + conditional assignment for dev/prod

**Auth Request Interface:**
- Purpose: Extend Express Request with user context
- Examples: `backend/src/middleware/authMiddleware.ts:4-10`
- Pattern: TypeScript interface extension

**Role-Based Authorization:**
- Purpose: Restrict endpoints by user role
- Examples: `authorizeRoles('staff', 'manager')`
- Pattern: Higher-order function returning middleware

**Response Format:**
- Purpose: Standardized API responses
- Pattern: `{ success: boolean, data?: any, error?: { code, message } }`

## Entry Points

**Backend Server:**
- Location: `backend/src/index.ts`
- Triggers: `npm run dev` or `npm start`
- Responsibilities: CORS setup, JSON parsing, route registration, port listening

**API Module (Vercel/Serverless):**
- Location: `api/index.ts`
- Triggers: Deploy to Vercel
- Responsibilities: Re-export backend app for serverless deployment

**Database Seed:**
- Location: `backend/prisma/seed.ts`
- Triggers: `npm run db:seed`
- Responsibilities: Populate initial data for development

## Architectural Constraints

- **Threading:** Node.js event loop (single-threaded for I/O, not CPU-bound work)
- **Global state:** Prisma singleton (`global.prisma`) in `backend/src/utils/prisma.ts`
- **Circular imports:** None detected - clear layer separation
- **Auth persistence:** JWT-based (stateless), refresh tokens stored in DB

## Anti-Patterns

### Async Notifications Without Error Tracked

**What happens:** Email sending uses fire-and-forget `async IIFE` after controller response
**Why it's wrong:** Errors silently caught and logged, no retry mechanism, no user feedback on failure
**Do this instead:** Use a proper job queue (Bull, Agenda) or return notification status to client

### Implicit Role Checks in Controllers

**What happens:** Role checks inline in controller functions (e.g., `if (role === 'customer')`)
**Why it's wrong:** Mixing route-level and runtime authorization leads to gaps
**Do this instead:** Rely on `authorizeRoles()` at route level and use `req.user.sub` to fetch user context without inline role checks

## Error Handling

**Strategy:** Try-catch blocks with consistent error response structure

**Patterns:**
- Success: `res.status(200).json({ success: true, data: ... })`
- Created: `res.status(201).json({ success: true, data: ... })`
- Client errors: `res.status(400/401/403/404).json({ success: false, error: { code, message } })`
- Server errors: `res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR' } })`

## Cross-Cutting Concerns

**Logging:** `console.error()` for errors in catch blocks
**Validation:** `express-validator` on routes before controllers
**Authentication:** JWT verification via `authenticateToken` middleware
**Authorization:** Role-based via `authorizeRoles()` wrapper

---

*Architecture analysis: 2026-05-01*