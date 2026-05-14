# 3.1 Technical Feasibility

The following subsections present the technical feasibility assessment of the NailssentialsQC Salon Management System. Each area was evaluated against the functional requirements established in the system design, the operational constraints of a single-location nail salon in Quezon City, and the development resources available to the research team.

---

## 3.1.1 Hardware Requirements

### 3.1.1.1 Development Environment

The system was developed on commodity hardware with the following minimum specifications:

| Component | Minimum Specification |
|-----------|----------------------|
| Processor | Intel Core i5 (8th Gen) or equivalent |
| Memory | 8 GB RAM |
| Storage | 256 GB SSD |
| Display | 1920 × 1080 resolution |
| Network | Broadband internet (≥ 10 Mbps) |

The development environment runs Docker Desktop (Docker Compose v3.8) to host a local PostgreSQL 17 instance alongside the application services, requiring no specialized hardware beyond a standard laptop or desktop workstation.

### 3.1.1.2 Production Server

The system is deployed on Vercel's serverless infrastructure, which eliminates the need for dedicated server hardware. The cloud platform dynamically provisions compute resources based on demand, offering:

- **Automatic scaling** from zero to thousands of concurrent users
- **Global edge network** with CDN-backed static asset delivery
- **Managed SSL/TLS** certificates for HTTPS enforcement
- **Zero server maintenance** for the development team

### 3.1.1.3 End-User Devices

The web-based interface is accessible from any device with a modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). No specialized client hardware or native application installation is required. Touch-target compliance with WCAG AA standards (≥ 40 × 40 px) ensures usability on tablets and smartphones for on-the-floor salon operations.

---

## 3.1.2 Software Requirements

### 3.1.2.1 Technology Stack Overview

The system adopts a full-stack JavaScript/TypeScript architecture, selected for its unified language ecosystem, mature tooling, and proven suitability for web-based line-of-business applications.

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 19.2 | Component-based UI rendering with concurrent features |
| **Build Tool** | Vite | 8.0 | Fast development server with hot module replacement |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS framework for responsive design |
| **UI Primitives** | Radix UI / Base UI / shadcn | Latest | Accessible, unstyled component primitives |
| **Animation** | Framer Motion | 12.38 | Declarative motion for page transitions and micro-interactions |
| **Data Visualization** | Recharts | 3.8 | React-based charting for analytics dashboards |
| **State Management** | TanStack React Query | 5.x | Server-state caching with configurable stale times |
| **Backend Runtime** | Node.js / Express.js | 5.2 | RESTful API server with middleware architecture |
| **Language** | TypeScript | 6.0 | Static type safety across frontend and backend |
| **ORM** | Prisma | 7.8 | Type-safe database access with schema-first migrations |
| **Database** | PostgreSQL | 17 (Alpine) | ACID-compliant relational database |
| **Authentication** | Clerk | 5.x (frontend) / 2.x (backend) | Managed identity with email verification and MFA |
| **File Storage** | Vercel Blob | 2.3 | Cloud object storage for profile pictures and exhibits |
| **Excel Generation** | ExcelJS | 4.4 | Server-side XLSX workbook creation for payroll exports |
| **PDF Generation** | jsPDF + html2canvas | 4.2 / 1.4 | Client-side PDF rendering for staff payslips |
| **Email** | Nodemailer | 8.0 | Transactional email for appointment notifications |
| **Validation** | Zod | 4.4 / express-validator 7.3 | Schema-based request validation |

### 3.1.2.2 Development Tooling

| Tool | Purpose |
|------|---------|
| Docker Compose | Local PostgreSQL and service orchestration |
| ESLint + Prettier | Code linting and formatting enforcement |
| Jest + Supertest | Backend unit and integration testing |
| Vitest + React Testing Library | Frontend component testing |
| Prisma Migrate | Database schema versioning and migrations |
| Git | Version control and collaboration |

---

## 3.1.3 System Architecture

### 3.1.3.1 Architectural Pattern

The system follows a **three-tier client–server architecture** consisting of:

1. **Presentation Tier** — A React 19 single-page application (SPA) served as static assets via Vercel's CDN. Client-side routing is managed by React Router DOM (v7.14), enabling seamless navigation between customer, staff, and manager views without full-page reloads.

2. **Application Tier** — An Express.js RESTful API server deployed as Vercel Serverless Functions. The server exposes a versioned API (`/api/v1/`) with 16 route modules covering authentication, appointments, payroll, analytics, CMS, and more. Clerk middleware intercepts every request for session validation before application-level authorization.

3. **Data Tier** — A PostgreSQL 17 relational database accessed exclusively through Prisma ORM. The schema defines 20 models with enforced referential integrity, composite indexes for query performance, and explicit table mappings via `@@map` annotations.

### 3.1.3.2 API Design

All endpoints follow RESTful conventions with a consistent JSON response envelope:

```json
{
  "success": true | false,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

The API is organized into 16 route modules:

| Module | Endpoint Prefix | Key Operations |
|--------|----------------|----------------|
| Auth | `/api/v1/auth` | Clerk-delegated authentication |
| Staff | `/api/v1/staff` | Profile management, schedule CRUD |
| Services | `/api/v1/services` | Service catalog with categories |
| Appointments | `/api/v1/appointments` | Booking, completion, status transitions |
| Attendance | `/api/v1/attendance` | Clock in/out, tardiness tracking |
| Payroll | `/api/v1/payroll` | Period generation, calculation, Excel export |
| Reports | `/api/v1/reports` | Revenue and performance reporting |
| Analytics | `/api/v1/reports` | KPI summaries, staff performance, retention |
| CMS | `/api/v1/cms` | Landing page content management |
| Exhibits | `/api/v1/exhibits` | Nail art gallery CRUD with Vercel Blob |
| Packages | `/api/v1/packages` | Service bundle management |
| Reviews | `/api/v1/reviews` | Customer service reviews |
| Notifications | `/api/v1/notifications` | In-app notification delivery |
| Messages | `/api/v1/messages` | Internal messaging system |
| Customers | `/api/v1/customers` | Customer profile management |
| Upload | `/api/upload` | File upload handling (Vercel Blob) |

### 3.1.3.3 Deployment Architecture

The production deployment leverages Vercel's platform capabilities:

- **Frontend**: Vite-built static assets served globally via Vercel's edge CDN
- **Backend**: Express.js application deployed as a single Vercel Serverless Function, with API routes proxied through `vercel.json` rewrites (`/api/*` → `/api/index.ts`)
- **Database**: External PostgreSQL instance connected via the `@prisma/adapter-pg` driver adapter
- **Timezone**: The server process is explicitly set to `Asia/Manila` (`process.env.TZ = 'Asia/Manila'`) to ensure all date calculations align with Philippine Standard Time

For local development, Docker Compose orchestrates three services: `db` (PostgreSQL 17 Alpine), `backend` (Express.js on port 3000), and `frontend` (Vite dev server on port 80).

---

## 3.1.4 Database Design

### 3.1.4.1 Schema Overview

The PostgreSQL schema comprises 20 interconnected models designed around the domain entities of a nail salon operation:

| Domain | Models | Purpose |
|--------|--------|---------|
| **Identity** | `User`, `CustomerProfile`, `StaffProfile`, `RefreshToken` | Multi-role user management with profile separation |
| **Scheduling** | `Appointment`, `AppointmentItem`, `StaffSchedule`, `Attendance` | Booking lifecycle and workforce scheduling |
| **Services** | `Service`, `ServiceCategory` | Hierarchical service catalog |
| **Financial** | `Transaction`, `Commission` | Payment recording and commission tracking |
| **Payroll** | `PayrollPeriod`, `StaffPayroll`, `StaffPayrollItem`, `DeductionLog`, `SalaryComponent`, `SalaryStructure`, `SalaryStructureComponent`, `SalaryStructureAssignment` | Comprehensive payroll calculation and tracking |
| **Communication** | `Notification`, `Message`, `Review` | In-app notifications, messaging, and customer reviews |
| **Audit** | `SystemLog` | Action-level audit trail with IP and user-agent tracking |

### 3.1.4.2 Key Design Decisions

1. **Enum-Based Status Management**: PostgreSQL enums (`AppointmentStatus`, `PaymentMethod`, `TransactionStatus`, `Role`, `SalaryComponentType`) enforce domain-valid state transitions at the database level, preventing invalid data from entering the system.

2. **Composite Indexes for Query Performance**: Strategic multi-column indexes (e.g., `[staff_id, period_year, period_week]` on commissions, `[status, appointment_date]` on appointments, `[user_id, is_read]` on notifications) optimize the most frequent query patterns.

3. **Soft Deletion**: Appointments support soft deletion via a nullable `deleted_at` timestamp, preserving historical data for audit and analytics purposes.

4. **Decimal Precision**: All monetary values use `Decimal(10,2)` precision, and commission rates use `Decimal(5,2)`, preventing floating-point arithmetic errors in financial calculations.

5. **Cascading Referential Integrity**: Foreign key relationships enforce cascade deletions where appropriate (e.g., `AppointmentItem` → `Appointment`, `RefreshToken` → `User`) while using `SetNull` for audit log preservation.

---

## 3.1.5 Security Architecture

### 3.1.5.1 Authentication

The system delegates authentication to **Clerk**, a managed identity platform that provides:

- **Session token validation** via `clerkMiddleware()` applied globally to all Express.js routes
- **Email verification** with automatic `is_active` synchronization (15-minute cache TTL reduces Clerk API calls)
- **Account linking** for users who register through different providers but share the same email
- **Automatic user provisioning** with role extraction from Clerk's `publicMetadata`

### 3.1.5.2 Role-Based Access Control (RBAC)

The system enforces three-tier RBAC through the `authorizeRoles()` middleware:

| Role | Access Level |
|------|-------------|
| **Customer** | Booking, profile management, appointment history, reviews |
| **Staff** | Own schedule, attendance clock in/out, personal commission/payroll view |
| **Manager** | Full system access: staff management, payroll, analytics, CMS, reports |

Role assignment is derived from Clerk's `publicMetadata.role` property, with `customer` as the default fallback. The authorization middleware returns HTTP 403 with structured error codes for unauthorized access attempts.

### 3.1.5.3 Input Validation

Request validation employs a dual-layer strategy:

1. **Zod schemas** via the `validateZod()` middleware for structured body validation with detailed error reporting
2. **express-validator** for route parameter and query string validation in legacy endpoints

Validation errors return HTTP 400 with flattened error details, enabling precise client-side error rendering.

### 3.1.5.4 Rate Limiting

The backend includes `express-rate-limit` for protecting against brute-force attacks on authentication endpoints and preventing API abuse.

---

## 3.1.6 Payroll Calculation Engine

### 3.1.6.1 Commission Calculation Model

The system implements a **tiered commission model** derived from field observations of the salon's existing spreadsheet-based payroll workflow:

| Tier | Condition | Commission Rate |
|------|-----------|----------------|
| Standard | Previous month's total salon sales < ₱51,000 | 5% |
| Mid-Tier | Previous month's total salon sales ≥ ₱51,000 and < ₱55,000 | 8% |
| High-Tier | Previous month's total salon sales ≥ ₱55,000 | 10% |
| Specialty Bonus | Staff member exceeds ₱6,000 in personal sales within current month | 20% |

Commission calculations are executed atomically within Prisma `$transaction` blocks during appointment completion, ensuring data consistency between transaction records, commission entries, and notification delivery.

### 3.1.6.2 Payroll Generation Workflow

The payroll engine follows a **wipe-and-regenerate** strategy that preserves manual deductions while recalculating derived values:

1. **Period Identification**: Create a new `PayrollPeriod` or validate an existing unlocked period, with overlap detection to prevent duplicate coverage.

2. **Parallel Data Fetching**: Transactions, staff profiles, and commission records are fetched concurrently using `Promise.all()` to minimize database round trips.

3. **Wipe-and-Regenerate**: For recalculations, the engine deletes existing `StaffPayroll` records (with cascading item deletion), detaches manual deductions from the period (preserving them for reattachment), and removes auto-calculated tardiness deductions.

4. **Daily Breakdown Aggregation**: Commission data is aggregated into per-staff, per-day maps that populate the `daily_breakdown` JSON field for granular performance tracking.

5. **Net Pay Calculation**: `Net Pay = (Base Pay × Weeks) + (Total Sales × Commission Rate) − Tardiness Deductions − Manual Deductions`

6. **Deduction Categories**: The system supports six deduction types — Cash Advance, Loan, Uniform, Reloan, Lates/Early Out, and Other — each tracked individually in `DeductionLog` and summarized in `StaffPayrollItem` records.

### 3.1.6.3 Excel Export

The payroll export generates an XLSX workbook using ExcelJS with the following structure:

- **Title row** with period date range and draft/finalized status indicator
- **Dynamic date columns** generated via `eachDayOfInterval()` for daily sales tracking
- **Per-staff rows** containing daily performance, total sales, commission pay, basic pay, gross pay, categorized deductions, total deductions, and net pay
- **Styled headers** with bold formatting and gray background fill
- **Auto-fitted column widths** (25px for names, 12px for numeric columns)

The export respects the period's lock status, prefixing draft exports with `[DRAFT]_` in the filename.

---

## 3.1.7 Frontend Architecture

### 3.1.7.1 Component Architecture

The frontend employs a **page-centric component hierarchy** organized by user role:

```
src/
├── pages/           # Route-level views (12 pages)
│   ├── Home.tsx           # Public landing page
│   ├── Booking.tsx        # Customer appointment booking
│   ├── Services.tsx       # Service catalog with filtering
│   ├── Gallery.tsx        # Nail art exhibit gallery
│   ├── ManagerDashboard.tsx  # Manager operations hub
│   └── StaffDashboard.tsx    # Staff daily operations
├── components/
│   ├── dashboard/         # Role-specific dashboard modules
│   │   ├── analytics/     # Revenue, Staff, Retention tabs
│   │   ├── payroll/       # PayrollListView, DetailView, DeductionSheet
│   │   ├── cms/           # Content management components
│   │   └── staff/         # Staff management views
│   ├── motion/            # Framer Motion animation wrappers
│   ├── ui/                # Reusable primitive components
│   └── home/              # Landing page sections
├── api/
│   └── apiClient.ts       # Centralized Axios HTTP client
├── context/               # React Context providers (Auth, Theme)
└── types/                 # Shared TypeScript type definitions
```

### 3.1.7.2 State Management Strategy

- **Server State**: TanStack React Query manages all API data with configurable stale times (10-minute staleness for CMS content, shorter intervals for real-time data like attendance)
- **Client State**: React's built-in `useState` and `useContext` for UI-local state (form inputs, modal visibility, sidebar navigation)
- **Form State**: React Hook Form (v7.73) for complex multi-step forms (booking flow, staff profile editing)

### 3.1.7.3 Analytics Dashboard

The manager analytics module provides three visualization tabs:

1. **Revenue Tab** — Stacked bar charts and line charts (Recharts) showing daily/weekly/monthly revenue trends with service category breakdowns
2. **Staff Performance Tab** — Leaderboard rankings with per-staff revenue, commission earned, service count, and category distribution
3. **Retention Tab** — Customer cohort analysis with new-vs-returning segmentation, monthly retention rate trends, and a top-customer list ranked by visit frequency

---

## 3.1.8 Scalability and Performance

### 3.1.8.1 Current Capacity Assessment

For the target deployment (a single nail salon with 5–10 staff members and ~50–100 daily appointments), the system architecture provides substantial headroom:

| Metric | Current Design Capacity |
|--------|------------------------|
| Concurrent users | 100+ (Vercel auto-scaling) |
| Database rows (annual) | ~50,000 transactions, ~200,000 commission entries |
| Payroll processing | < 2 seconds for 10 staff members |
| API response time | < 200ms for indexed queries |
| Static asset delivery | < 50ms via global CDN |

### 3.1.8.2 Performance Optimizations

1. **Cursor-based pagination** on high-volume endpoints (payroll periods) prevents offset-scanning degradation
2. **Parallel data fetching** with `Promise.all()` in the payroll controller reduces sequential database round trips
3. **In-memory verification caching** (15-minute TTL) in the auth middleware eliminates redundant Clerk API calls
4. **Asynchronous email delivery** — post-completion notifications execute outside the request–response cycle to avoid blocking

### 3.1.8.3 Known Limitations

- The system is designed for **single-tenant, single-location** deployment. Multi-tenant or multi-location support is explicitly out of scope.
- The payroll calculation engine processes staff members **sequentially** within a single request. For salons exceeding 50 staff members, batch processing or background job queues would be recommended.
- Excel export is generated **on-demand** per request. Pre-computed report caching is not implemented but would be straightforward to add if export latency becomes problematic.

---

## 3.1.9 Development and Testing Infrastructure

### 3.1.9.1 Testing Framework

| Layer | Framework | Scope |
|-------|-----------|-------|
| Backend Unit/Integration | Jest 30 + Supertest 7.2 | Controller logic, middleware, API endpoints |
| Frontend Component | Vitest 4.1 + React Testing Library | Component rendering, user interaction simulation |
| End-to-End | Manual + scripted (`e2e-test.js`) | Full-flow validation of booking and payroll workflows |

### 3.1.9.2 Code Quality

- **TypeScript strict mode** enabled across both frontend and backend (`"strict": true`)
- **ESLint** with Prettier integration enforces consistent code style
- **Prisma type generation** provides compile-time safety for all database operations

---

## 3.1.10 Feasibility Assessment Summary

| Criterion | Assessment | Justification |
|-----------|-----------|---------------|
| **Hardware** | ✅ Feasible | Cloud deployment eliminates server hardware; any modern browser suffices for end users |
| **Software** | ✅ Feasible | All technologies are open-source or free-tier, with mature community support |
| **Architecture** | ✅ Feasible | Three-tier SPA + REST API + RDBMS is a proven pattern for business applications |
| **Database** | ✅ Feasible | PostgreSQL handles the data volume with significant headroom; schema integrity is enforced |
| **Security** | ✅ Feasible | Managed authentication (Clerk), RBAC, input validation, and rate limiting meet requirements |
| **Payroll Engine** | ✅ Feasible | Commission tiers and deduction categories are fully implemented and verified against spreadsheet behavior |
| **Scalability** | ✅ Feasible | Serverless deployment auto-scales; indexed queries perform within acceptable latency |
| **Maintainability** | ✅ Feasible | TypeScript type safety, ORM-managed migrations, and modular architecture support ongoing development |

The technical feasibility analysis confirms that the chosen technology stack, architectural decisions, and implementation strategies are well-suited to the functional and non-functional requirements of the NailssentialsQC Salon Management System. All core subsystems — authentication, appointment booking, payroll calculation, analytics, and content management — have been implemented and validated against real-world salon operational workflows.
