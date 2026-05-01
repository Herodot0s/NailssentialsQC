# Technology Stack

**Analysis Date:** 2026-05-01

## Languages

**Primary:**
- TypeScript 6.0.3 - Both frontend and backend

**Secondary:**
- JavaScript - Legacy/compiled output and config files

## Runtime

**Environment:**
- Node.js 20 (Alpine) - Backend runtime
- Node.js 20 - Frontend build tooling (Vite)

**Package Manager:**
- npm - Package management for both frontend and backend
- Lockfiles: `package-lock.json` (root), `backend/package-lock.json`, `frontend/package-lock.json`

## Frameworks

**Core Backend:**
- Express.js 5.2.1 - HTTP server framework
- Prisma 6.4.1 - ORM and database management

**Core Frontend:**
- React 19.2.5 - UI framework
- Vite 8.0.9 - Build tool and dev server

**UI Component Libraries:**
- Radix UI (@radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-avatar, @radix-ui/react-slot) - Headless UI primitives
- Base UI (@base-ui/react) - Component library
- shadcn (component library) - Component collection

**Styling:**
- Tailwind CSS 3.4.19 - Utility-first CSS framework
- PostCSS 8.5.10 - CSS transformation tool
- Autoprefixer 10.5.0 - Vendor prefixer

## Key Dependencies

**Authentication & Security:**
- bcrypt 6.0.0 - Password hashing (12 salt rounds default)
- jsonwebtoken 9.0.3 - JWT token generation and verification
- cors 2.8.6 - Cross-Origin Resource Sharing

**Data Validation:**
- express-validator 7.3.2 - Request validation middleware

**File Storage:**
- @vercel/blob 2.3.3 - File uploads via Vercel Blob storage

**Email:**
- nodemailer 8.0.5 - SMTP email sending

**API Clients:**
- axios 1.15.2 - HTTP client (both frontend and backend)

**Date/Time:**
- date-fns 4.1.0 - Date manipulation utilities

**Form Handling:**
- react-hook-form 7.73.1 - Form state management

**Charts:**
- recharts 3.8.1 - Charting library for dashboards

**PDF Generation:**
- jspdf 4.2.1 - PDF document generation
- html2canvas 1.4.1 - HTML-to-canvas for PDF screenshots

**Icons:**
- lucide-react 1.8.0 - Icon set

**Utilities:**
- clsx 3.5.1 - Conditional classNames
- tailwind-merge 3.5.0 - Tailwind class merging
- class-variance-authority 0.7.1 - Component variant utility

**Animations:**
- tailwind-animate 0.2.10 - Tailwind animation utilities
- tw-animate-css 1.4.0 - CSS animation utilities

## Testing

**Test Framework:**
- None currently configured - Tests not implemented ("Error: no test specified")

## Build & Development Tools

**TypeScript Configuration:**
- `backend/tsconfig.json` - ES2020 target, CommonJS modules, strict mode
- `frontend/tsconfig.json` - Path aliases (@/*), project references

**Linting:**
- ESLint 9.39.4 (frontend), ESLint 10.2.1 (backend)
- eslint-config-prettier 10.1.8 - Conflict resolution with Prettier
- eslint-plugin-prettier 5.5.5 - Prettier integration
- eslint-plugin-react-hooks 7.1.1 - React hooks rules
- eslint-plugin-react-refresh 0.5.2 - Vite HMR compatibility
- typescript-eslint 8.x - TypeScript ESLint support

**Formatting:**
- Prettier 3.8.3 - Code formatter
- `.prettierrc` - Prettier configuration

**Type Definitions:**
- @types/express 5.0.6
- @types/node 25.6.0 / @types/node 24.12.2
- @types/cors 2.8.19
- @types/bcrypt 6.0.0
- @types/jsonwebtoken 9.0.10
- @types/nodemailer 8.0.0
- @types/react 19.2.14
- @types/react-dom 19.2.3

**Build Tools:**
- ts-node-dev 2.0.0 - Development TypeScript execution with hot reload
- prisma 6.4.1 - Database schema management and client generation

## Configuration

**Environment Configuration:**
- dotenv 17.4.2 - Environment variable management
- `.env` files used in development (NOT checked into version control per `.gitignore`)

**Key Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Access token signing secret
- `REFRESH_TOKEN_SECRET` - Refresh token signing secret
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds (default: 12)
- `PORT` - Server port (default: 3000)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Email configuration
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

## Platform Requirements

**Development:**
- Node.js 20+
- npm 10+
- PostgreSQL 17+ (local or Docker)

**Production (Docker):**
- Node.js 20 Alpine base image
- PostgreSQL 17 Alpine
- Nginx Alpine (frontend static serving)

**Deployment Options:**
1. Docker Compose (development/staging)
2. Vercel (with serverless functions)
3. Traditional hosting with Node.js + PostgreSQL

---

*Stack analysis: 2026-05-01*