# External Integrations

**Analysis Date:** 2026-05-01

## APIs & External Services

**File Storage:**
- Vercel Blob Storage - Profile picture uploads
  - SDK/Client: `@vercel/blob` (2.3.3)
  - Auth: `BLOB_READ_WRITE_TOKEN` environment variable
  - Implementation: Base64-encoded image upload via `backend/src/controllers/uploadController.ts`
  - Route: `POST /api/upload` for upload, `DELETE /api/upload` for deletion

**Email:**
- SMTP Email (Ethreal for development/testing)
  - SDK/Client: `nodemailer` (8.0.5)
  - Auth: SMTP credentials via `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` env vars
  - Implementation: `backend/src/utils/email.ts`
  - Templates:
    - `sendBookingConfirmation()` - Appointment booking confirmation
    - `sendAppointmentCompletion()` - Service completion receipt notification

**No External APIs Detected:**
- No Stripe, PayPal, or payment gateway integration
- No external SMS notification service
- No analytics/monitoring services (custom logging via console/Prisma SystemLog model)

## Data Storage

**Database:**
- PostgreSQL 17
  - Connection: `postgresql://user:password@db:5432/nailssentials_qc` (Docker Compose)
  - Client: `@prisma/client` (6.4.1)
  - ORM: Prisma with code-first schema (`backend/prisma/schema.prisma`)
  - Database name: `nailssentials_qc`

**Database Models (Prisma Schema):**
| Model | Purpose |
|-------|---------|
| User | Authentication and authorization |
| CustomerProfile | Customer accounts |
| StaffProfile | Employee management with payroll |
| Service / ServiceCategory | Services catalog |
| Appointment / AppointmentItem | Booking management |
| Transaction | Payment recording |
| Commission | Staff commission tracking |
| PayrollPeriod / StaffPayroll | Payroll processing |
| DeductionLog | Salary deductions |
| Attendance | Clock in/out tracking |
| Notification | User notifications |
| Message | Internal messaging |
| Review | Customer reviews |
| SystemLog | Audit logging |
| RefreshToken | JWT refresh token storage |

**File Storage:**
- Vercel Blob (production)
- No local filesystem storage for user uploads

**Caching:**
- None detected - All data queried directly from PostgreSQL

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Access Token: Short-lived, stored in localStorage
  - Refresh Token: Long-lived (30 days), stored in localStorage and database
  - Password Hashing: bcrypt with configurable salt rounds (default 12)

**Implementation:**
- `backend/src/controllers/authController.ts` handles:
  - `register()` - New user signup with profile creation
  - `login()` - Credential verification with account lockout (5 attempts, 15-minute lockout)
  - `refresh()` - Token refresh with rotation
  - `logout()` - Token invalidation
  - `getMe()` - Current user profile

**User Roles:**
- `customer` - Book appointments, complete payments
- `staff` - Clock in/out, commission tracking, payroll
- `manager` - Full system access, payroll generation, reports

**Security Features:**
- Failed login tracking with account lockout
- JWT token refresh rotation on each refresh
- Prisma `RefreshToken` model for token invalidation

**Frontend Auth Flow:**
- `frontend/src/api/apiClient.ts` - Axios interceptors for:
  - Automatic JWT attachment to requests
  - 401 handling with automatic token refresh
  - Redirect to `/login` on refresh failure

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, LogRocket, or similar services
- Logs go to console (console.log/console.error)

**Logs:**
- `console.log` / `console.error` for application logs
- Prisma `SystemLog` model for audit trail (user actions, entity changes)
- No external logging service integration

## CI/CD & Deployment

**Containerization (Docker):**
- Docker Compose (`docker-compose.yml`) for local development
  - PostgreSQL 17 Alpine
  - Backend (Node 20 Alpine)
  - Frontend (Nginx Alpine)

**Backend Dockerfile:**
- `backend/Dockerfile`
  - Node.js 20 Alpine base
  - Prisma client generation
  - TypeScript compilation
  - Port 3000 exposed

**Frontend Dockerfile:**
- `frontend/Dockerfile`
  - Multi-stage: Node build -> Nginx serve
  - Nginx Alpine static file serving
  - Port 80 exposed

**Deployment Platforms:**
- Vercel - Primary deployment target
  - `vercel.json` configuration
  - Frontend: `frontend/dist`
  - Backend: Serverless function (`/api/index.ts`)
  - Rewrites: `/api/*` -> backend, `/*` -> frontend

**Build Pipeline:**
- Vercel build command: `cd frontend && npm install && npm run build`
- Root `package.json` scripts orchestrate both workspaces

## Environment Configuration

**Required Environment Variables:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/db` |
| `JWT_SECRET` | Access token signing key | `your_access_token_secret_here` |
| `REFRESH_TOKEN_SECRET` | Refresh token signing key | `your_refresh_token_secret_here` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` |
| `PORT` | Server port | `3000` |
| `SMTP_HOST` | SMTP server hostname | `smtp.ethereal.email` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `user@email.com` |
| `SMTP_PASS` | SMTP password | `password` |
| `SMTP_FROM` | Email From address | `noreply@nailssentialsqc.com` |
| `SMTP_SECURE` | Use TLS | `true`/`false` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob API token | `vercel_blob_token` |

**Secrets Location:**
- `.env` files (not committed to git per `.gitignore`)
- Vercel environment variables (for production)
- Docker environment block (for Docker Compose)

## Webhooks & Callbacks

**Incoming Webhooks:**
- None detected

**Outgoing Webhooks:**
- None detected

---

*Integration audit: 2026-05-01*