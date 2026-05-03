<!-- GSD:project-start source:PROJECT.md -->
## Project

**NailssentialsQC**

NailssentialsQC is a nail salon management system built with React 19, Express.js, and PostgreSQL (via Prisma ORM). It serves three user types — customers (booking, profiles), staff (clock in/out, commissions), and managers (payroll, reports, staff management) — with a full-featured web application. The system is operational but requires comprehensive bug fixes, tech debt cleanup, security hardening, and full test coverage to be production-ready.

**Core Value:** A reliable, bug-free salon management system that customers, staff, and managers can trust for daily operations — with verified correctness through full test coverage.

### Constraints

- **Timeline**: 1-2 weeks for all fixes and test coverage
- **Tech stack**: Must maintain existing stack (React 19, Express.js, Prisma, PostgreSQL)
- **Compatibility**: All fixes must not break existing functionality for any user type
- **Coverage targets**: Backend 80%, frontend 70%, critical paths (auth, payroll) 90%
- **Deployment**: Vercel (frontend + serverless backend), Docker Compose for local dev
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 6.0.3 - Both frontend and backend
- JavaScript - Legacy/compiled output and config files
## Runtime
- Node.js 20 (Alpine) - Backend runtime
- Node.js 20 - Frontend build tooling (Vite)
- npm - Package management for both frontend and backend
- Lockfiles: `package-lock.json` (root), `backend/package-lock.json`, `frontend/package-lock.json`
## Frameworks
- Express.js 5.2.1 - HTTP server framework
- Prisma 6.4.1 - ORM and database management
- React 19.2.5 - UI framework
- Vite 8.0.9 - Build tool and dev server
- Radix UI (@radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-avatar, @radix-ui/react-slot) - Headless UI primitives
- Base UI (@base-ui/react) - Component library
- shadcn (component library) - Component collection
- Tailwind CSS 3.4.19 - Utility-first CSS framework
- PostCSS 8.5.10 - CSS transformation tool
- Autoprefixer 10.5.0 - Vendor prefixer
## Key Dependencies
- bcrypt 6.0.0 - Password hashing (12 salt rounds default)
- jsonwebtoken 9.0.3 - JWT token generation and verification
- cors 2.8.6 - Cross-Origin Resource Sharing
- express-validator 7.3.2 - Request validation middleware
- @vercel/blob 2.3.3 - File uploads via Vercel Blob storage
- nodemailer 8.0.5 - SMTP email sending
- axios 1.15.2 - HTTP client (both frontend and backend)
- date-fns 4.1.0 - Date manipulation utilities
- react-hook-form 7.73.1 - Form state management
- recharts 3.8.1 - Charting library for dashboards
- jspdf 4.2.1 - PDF document generation
- html2canvas 1.4.1 - HTML-to-canvas for PDF screenshots
- lucide-react 1.8.0 - Icon set
- clsx 3.5.1 - Conditional classNames
- tailwind-merge 3.5.0 - Tailwind class merging
- class-variance-authority 0.7.1 - Component variant utility
- tailwind-animate 0.2.10 - Tailwind animation utilities
- tw-animate-css 1.4.0 - CSS animation utilities
## Testing
- None currently configured - Tests not implemented ("Error: no test specified")
## Build & Development Tools
- `backend/tsconfig.json` - ES2020 target, CommonJS modules, strict mode
- `frontend/tsconfig.json` - Path aliases (@/*), project references
- ESLint 9.39.4 (frontend), ESLint 10.2.1 (backend)
- eslint-config-prettier 10.1.8 - Conflict resolution with Prettier
- eslint-plugin-prettier 5.5.5 - Prettier integration
- eslint-plugin-react-hooks 7.1.1 - React hooks rules
- eslint-plugin-react-refresh 0.5.2 - Vite HMR compatibility
- typescript-eslint 8.x - TypeScript ESLint support
- Prettier 3.8.3 - Code formatter
- `.prettierrc` - Prettier configuration
- @types/express 5.0.6
- @types/node 25.6.0 / @types/node 24.12.2
- @types/cors 2.8.19
- @types/bcrypt 6.0.0
- @types/jsonwebtoken 9.0.10
- @types/nodemailer 8.0.0
- @types/react 19.2.14
- @types/react-dom 19.2.3
- ts-node-dev 2.0.0 - Development TypeScript execution with hot reload
- prisma 6.4.1 - Database schema management and client generation
## Configuration
- dotenv 17.4.2 - Environment variable management
- `.env` files used in development (NOT checked into version control per `.gitignore`)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Access token signing secret
- `REFRESH_TOKEN_SECRET` - Refresh token signing secret
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds (default: 12)
- `PORT` - Server port (default: 3000)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Email configuration
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
## Platform Requirements
- Node.js 20+
- npm 10+
- PostgreSQL 17+ (local or Docker)
- Node.js 20 Alpine base image
- PostgreSQL 17 Alpine
- Nginx Alpine (frontend static serving)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
### Files
- **Controllers:** `PascalCase.ts` - e.g., `authController.ts`, `payrollController.ts`
- **Routes:** `PascalCase.ts` - e.g., `authRoutes.ts`, `appointmentRoutes.ts`
- **Middleware:** `PascalCase.ts` - e.g., `authMiddleware.ts`
- **Utils:** `PascalCase.ts` - e.g., `jwt.ts`, `prisma.ts`, `email.ts`
- **Pages:** `PascalCase.tsx` - e.g., `Login.tsx`, `ManagerDashboard.tsx`
- **Components:** `PascalCase.tsx` - e.g., `Navbar.tsx`, `ProtectedRoute.tsx`
- **UI Components:** `lowercase.tsx` in `components/ui/` - e.g., `button.tsx`, `input.tsx`
- **Context:** `PascalCase.tsx` - e.g., `AuthContext.tsx`, `CartContext.tsx`
- **API Client:** `camelCase.ts` - e.g., `apiClient.ts`
- **Utilities:** `camelCase.ts` - e.g., `utils.ts`
### Functions and Variables
- **Backend:** `camelCase` for functions and variables
- **Frontend:** `camelCase` for functions, variables, and state
- **React Components:** `PascalCase` for component names
- **Custom Hooks:** `camelCase` starting with `use` - e.g., `useAuth`, `useCart`
- **Interface/Type names:** `PascalCase` with optional `Type` suffix - e.g., `User`, `AuthContextType`
### Database Fields (Prisma)
- **Schema fields:** `snake_case` - e.g., `user_id`, `full_name`, `password_hash`
- **Schema file:** `backend/prisma/schema.prisma`
### CSS/Tailwind Classes
- Tailwind classes are used directly with `camelCase` when needed
- Component variants use `cva` (class-variance-authority) pattern in `frontend/src/components/ui/`
## Code Style
### Formatting
- `npm run format` - Format all files (root)
- `npm run format:frontend` - Format frontend only
- `npm run format:backend` - Format backend only
### Linting
- `npm run lint` - Lint all files
- `npm run lint:frontend` - Lint frontend only
- `npm run lint:backend` - Lint backend only
## Import Organization
### Backend Import Order
### Frontend Import Order
### Path Aliases
## Error Handling
### Backend Response Format
### Error Codes Used
- `VALIDATION_ERROR` - Input validation failures
- `EMAIL_ALREADY_EXISTS` - Duplicate email registration
- `PHONE_ALREADY_EXISTS` - Duplicate phone registration
- `INVALID_CREDENTIALS` - Authentication failures
- `ACCOUNT_LOCKED` - Account temporarily locked
- `ACCESS_DENIED` / `UNAUTHORIZED` - Insufficient permissions
- `INVALID_TOKEN` - JWT verification failures
- `TOKEN_REQUIRED` - Missing token
- `INTERNAL_SERVER_ERROR` - Unhandled exceptions
### Error Boundaries
## Logging
- Use `console.error` for caught errors with context prefix
- Avoid logging sensitive data (tokens, passwords)
- Optional descriptive prefix strings: `[server]:`
## Comments
- JSDoc for exported functions/controllers
- Complex business logic explanations
- TODO/FIXME markers for technical debt
## Function Design
### Controller Functions (Backend)
- Named exports preferred
- Async handlers with try/catch
- Request validation via `express-validator` middleware
- Return appropriate HTTP status codes
- Descriptive operation prefixes
### React Components (Frontend)
- Functional components with `React.FC` type
- Hook form for form handling
- Clear separation of state management
- Loading/error states handling
## Module Design
### Backend (Express)
- `controllers/` - Business logic
- `routes/` - Route definitions and validation middleware
- `middleware/` - Auth and shared middleware
- `utils/` - Prisma singleton, JWT utilities, email
### Frontend (React)
- `context/` - React context providers
- `components/` - Reusable UI components
- `pages/` - Route-level page components
- `api/` - Axios client with interceptors
- `lib/` - Utility functions (e.g., `cn` for Tailwind)
## API Response Patterns
### Status Code Usage
| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, or action |
| 201 | Resource created |
| 400 | Validation errors |
| 401 | Authentication required |
| 403 | Forbidden / Insufficient permissions |
| 404 | Resource not found |
| 500 | Server errors |
### Pagination
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```
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
- Controller-based request handling with async/await patterns
- Role-based access control via `authorizeRoles()` middleware
- JWT authentication with access/refresh token rotation
- Prisma transactions for multi-table operations
- Async notifications (email, in-app) after critical operations
## Layers
- Purpose: HTTP method routing and validation
- Location: `backend/src/routes/`
- Contains: Route definitions with express-validator middleware
- Depends on: Controllers
- Pattern: `router.METHOD('/path', [middleware], controllerFunction)`
- Purpose: Request processing, business rules, database operations
- Location: `backend/src/controllers/`
- Contains: Controller functions for each route
- Depends on: Prisma, middleware, utilities
- Pattern: `async (req, res) => { try { ... } catch { ... } }`
- Purpose: Database queries and schema management
- Location: `backend/prisma/`
- Contains: `schema.prisma`, `seed.ts`, migrations
- Depends on: PostgreSQL
- Purpose: Cross-cutting concerns (auth, validation)
- Location: `backend/src/middleware/`
- Contains: `authMiddleware.ts`
- Pattern: Higher-order functions returning middleware
- Purpose: Shared helpers (JWT, email, Prisma client)
- Location: `backend/src/utils/`
- Contains: Reusable functions and singletons
## Data Flow
### Authentication Flow
### Appointment Booking Flow
### Payroll Flow
## Key Abstractions
- Purpose: Single database connection across requests
- Examples: `backend/src/utils/prisma.ts`
- Pattern: Global variable + conditional assignment for dev/prod
- Purpose: Extend Express Request with user context
- Examples: `backend/src/middleware/authMiddleware.ts:4-10`
- Pattern: TypeScript interface extension
- Purpose: Restrict endpoints by user role
- Examples: `authorizeRoles('staff', 'manager')`
- Pattern: Higher-order function returning middleware
- Purpose: Standardized API responses
- Pattern: `{ success: boolean, data?: any, error?: { code, message } }`
## Entry Points
- Location: `backend/src/index.ts`
- Triggers: `npm run dev` or `npm start`
- Responsibilities: CORS setup, JSON parsing, route registration, port listening
- Location: `api/index.ts`
- Triggers: Deploy to Vercel
- Responsibilities: Re-export backend app for serverless deployment
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
### Implicit Role Checks in Controllers
## Error Handling
- Success: `res.status(200).json({ success: true, data: ... })`
- Created: `res.status(201).json({ success: true, data: ... })`
- Client errors: `res.status(400/401/403/404).json({ success: false, error: { code, message } })`
- Server errors: `res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR' } })`
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
