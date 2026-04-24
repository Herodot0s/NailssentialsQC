# System Architecture Document - NailssentialsQC System

**Project:** NailssentialsQC Salon Management System  
**Version:** 1.0  
**Date:** April 14, 2026  
**Team:** SFIT-2B Group 4

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Architectural Style

**Three-Tier Client-Server Architecture**

```
┌─────────────────────────────────────────┐
│         Presentation Tier               │
│      (Client-Side / Frontend)           │
│                                         │
│   Web Browser (Mobile/Desktop)          │
│   - React.js Single Page Application    │
│   - Responsive UI (Tailwind CSS)        │
│   - Client-side Routing                 │
│   - State Management (React Context)    │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS (REST API)
               ▼
┌─────────────────────────────────────────┐
│         Application Tier                │
│       (Server-Side / Backend)           │
│                                         │
│   Node.js + Express.js Server           │
│   - RESTful API Endpoints               │
│   - Authentication & Authorization      │
│   - Business Logic Layer                │
│   - Commission Calculation Engine       │
│   - Input Validation                    │
│   - Error Handling                      │
└──────────────┬──────────────────────────┘
               │
               │ TCP/IP (SQL Queries)
               ▼
┌─────────────────────────────────────────┐
│         Data Tier                       │
│         (Database)                      │
│                                         │
│   MySQL Relational Database             │
│   - User Data                           │
│   - Appointments                        │
│   - Services                            │
│   - Transactions                        │
│   - Commission Records                  │
│   - System Logs                         │
└─────────────────────────────────────────┘
```

### 1.2 Design Principles

**Separation of Concerns:**
- Frontend handles UI/UX and client-side validation
- Backend handles business logic, security, and data integrity
- Database handles data storage and retrieval

**Statelessness:**
- API is stateless (JWT-based authentication)
- Each request contains all necessary authentication information
- Server does not store client session state

**Scalability:**
- Horizontal scaling possible at API layer
- Database connection pooling
- Stateless API servers can be load-balanced

**Security:**
- Defense in depth (multiple security layers)
- Principle of least privilege (role-based access)
- Input validation at all layers

---

## 2. TECHNOLOGY STACK

### 2.1 Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React.js | 18.x | UI component library |
| Routing | React Router | 6.x | Client-side navigation |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework |
| State Management | React Context + useReducer | Built-in | Global state management |
| HTTP Client | Axios | 1.x | API communication |
| Form Handling | React Hook Form | 7.x | Form validation |
| Date Handling | date-fns | 2.x | Date manipulation |
| Charts | Chart.js + react-chartjs-2 | 4.x | Data visualization |
| Icons | Heroicons / Lucide | Latest | Icon library |
| Build Tool | Vite | 4.x | Fast development and building |

**Rationale:**
- React.js: Industry-standard, large community, component reusability
- Tailwind CSS: Rapid UI development, consistent design system
- Vite: Fast hot-module replacement, better DX than Create React App
- All free and open-source

### 2.2 Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18.x LTS | JavaScript runtime |
| Framework | Express.js | 4.x | Web application framework |
| Authentication | jsonwebtoken (JWT) | 9.x | Token-based auth |
| Password Hashing | bcrypt | 5.x | Secure password storage |
| Validation | express-validator | 7.x | Input validation |
| CORS | cors | 2.x | Cross-origin resource sharing |
| Environment | dotenv | 16.x | Environment variable management |
| Logging | winston | 3.x | Application logging |
| Error Handling | express-async-errors | 3.x | Async error handling |

**Rationale:**
- Node.js + Express: Lightweight, fast, JavaScript full-stack
- JWT: Stateless authentication, mobile-friendly
- bcrypt: Industry-standard password hashing
- All free and well-documented

### 2.3 Database

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Database | PostgreSQL | 17.x | Relational database |
| ORM | Prisma | 5.x | Type-safe database queries |
| Migration | Prisma Migrate | 5.x | Schema version control |
| Connection Pooling | Built-in (Prisma) | N/A | Connection management |

**Rationale:**
- PostgreSQL: ACID-compliant, highly reliable, advanced features
- Neon: Serverless Postgres, generous free tier, fast branching
- Prisma: Type-safe queries, auto-generated types, excellent DX

### 2.4 Development Tools

| Tool | Purpose |
|------|---------|
| VS Code | Code editor |
| Git + GitHub | Version control, collaboration |
| Postman | API testing and documentation |
| MySQL Workbench | Database design and management |
| Prisma Studio | Database GUI (development) |
| ESLint + Prettier | Code linting and formatting |
| Jest | Unit testing |
| Supertest | API integration testing |
| GitHub Actions | CI/CD pipeline (optional) |

### 2.5 Hosting

| Component | Platform | Tier | Cost |
|-----------|----------|------|------|
| Frontend | Vercel | Free | $0 (100GB bandwidth) |
| Backend | Vercel Serverless | Free | $0 (Included with Vercel) |
| Database | Neon PostgreSQL | Free | $0 (500MB storage) |
| Alternative | School Server | N/A | Provided by university |

---

## 3. SYSTEM ARCHITECTURE DIAGRAM

### 3.1 Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT DEVICES                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Customer │  │  Staff   │  │ Manager  │  │  Admin  │  │
│  │ Browser  │  │ Browser  │  │ Browser  │  │ Browser │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │
│       │              │             │               │       │
└───────┼──────────────┼─────────────┼───────────────┼───────┘
        │              │             │               │
        └──────────────┴─────────────┴───────────────┘
                           │
                    HTTPS (TLS 1.2+)
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Presentation Layer                   │   │
│  │                                                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │   │
│  │  │Customer │ │  Staff  │ │ Manager │ │ Public │ │   │
│  │  │  Pages  │ │ Pages   │ │  Pages  │ │ Pages  │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Component Library                    │   │
│  │                                                    │   │
│  │  Buttons, Forms, Cards, Modals, Tables, Charts   │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │              State Management                     │   │
│  │                                                    │   │
│  │  Auth Context, Booking State, User Data, Cache   │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Client (Axios)                   │   │
│  │                                                    │   │
│  │  Interceptors, Error Handling, Retry Logic       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────┘
                         │
                  REST API Calls
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Middleware Layer                     │   │
│  │                                                    │   │
│  │  CORS → Auth → Validation → Rate Limit → Logger  │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Route Handlers                       │   │
│  │                                                    │   │
│  │  /api/auth          - Authentication             │   │
│  │  /api/users         - User Management            │   │
│  │  /api/services      - Service Catalog            │   │
│  │  /api/appointments  - Booking Management         │   │
│  │  /api/payments      - Payment Processing         │   │
│  │  /api/commissions   - Commission Engine          │   │
│  │  /api/staff         - Staff Management           │   │
│  │  /api/reports       - Analytics & Reports        │   │
│  │  /api/attendance    - Attendance Tracking        │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Business Logic Layer                    │   │
│  │                                                    │   │
│  │  ┌──────────────┐  ┌─────────────────────┐       │   │
│  │  │Commission     │  │Appointment          │       │   │
│  │  │Engine         │  │Scheduler            │       │   │
│  │  │              │  │                     │       │   │
│  │  │- Rate calc    │  │- Availability       │       │   │
│  │  │- Tier logic   │  │- Conflict check     │       │   │
│  │  │- Deductions   │  │- Buffer time        │       │   │
│  │  └──────────────┘  └─────────────────────┘       │   │
│  │                                                    │   │
│  │  ┌──────────────┐  ┌─────────────────────┐       │   │
│  │  │Payment        │  │Notification         │       │   │
│  │  │Processor      │  │Service              │       │   │
│  │  │              │  │                     │       │   │
│  │  │- Recording    │  │- Email (future)     │       │   │
│  │  │- Receipt gen  │  │- In-app alerts      │       │   │
│  │  └──────────────┘  └─────────────────────┘       │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Data Access Layer (Prisma)              │   │
│  │                                                    │   │
│  │  Type-safe queries, Migrations, Transactions     │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────┘
                         │
                   SQL Queries
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  DATABASE (MySQL)                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Database: nailssentials_qc           │   │
│  │                                                    │   │
│  │  Tables:                                          │   │
│  │  - users                                          │   │
│  │  - customer_profiles                              │   │
│  │  - staff_profiles                                 │   │
│  │  - service_categories                             │   │
│  │  - services                                       │   │
│  │  - appointments                                   │   │
│  │  - appointment_services                           │   │
│  │  - transactions                                   │   │
│  │  - receipts                                       │   │
│  │  - commissions                                    │   │
│  │  - attendance                                     │   │
│  │  - notifications                                  │   │
│  │  - system_logs                                    │   │
│  │  - refresh_tokens                                 │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 4. DATABASE SCHEMA

### 4.1 Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │ service_categories│
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ email           │         │ name             │
│ phone           │         │ description      │
│ password_hash   │         │ is_active        │
│ role (ENUM)     │         │ created_at       │
│ is_active       │         │ updated_at       │
│ created_at      │         └────────┬─────────┘
│ updated_at      │                  │
└────────┬────────┘                  │
         │                          │
         ├──────────────┬───────────┘
         │              │
         ▼              ▼
┌─────────────────┐   ┌──────────────────┐
│customer_profiles│   │    services      │
├─────────────────┤   ├──────────────────┤
│ id (PK)         │   │ id (PK)          │
│ user_id (FK)    │   │ category_id (FK) │
│ full_name       │   │ name             │
│ preferences     │   │ description      │
│ allergies       │   │ duration_minutes │
│ notes           │   │ price            │
│ created_at      │   │ is_active        │
│ updated_at      │   │ is_popular       │
└────────┬────────┘   │ created_at       │
         │            │ updated_at       │
         │            └────────┬─────────┘
         │                     │
         │                     │
         ▼                     ▼
┌──────────────────────────────────────────┐
│            appointments                   │
├──────────────────────────────────────────┤
│ id (PK)                                  │
│ customer_id (FK)                         │
│ technician_id (FK)                       │
│ status (ENUM)                            │
│ appointment_date                         │
│ start_time                               │
│ end_time                                 │
│ is_walk_in                               │
│ notes                                    │
│ created_at                               │
│ updated_at                               │
│ deleted_at (soft delete)                 │
└────────────────────┬─────────────────────┘
                     │
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐   ┌──────────────────────┐
│appointment_services│  │    transactions      │
├──────────────────┤   ├──────────────────────┤
│ id (PK)          │   │ id (PK)              │
│ appointment_id   │   │ appointment_id (FK)  │
│ service_id (FK)  │   │ amount               │
│ quantity         │   │ payment_method (ENUM)│
│ price_at_booking │   │ status (ENUM)        │
└──────────────────┘   │ transaction_date     │
                       │ receipt_number       │
                       │ created_at           │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────┐
                       │   commissions    │
                       ├──────────────────┤
                       │ id (PK)          │
                       │ transaction_id   │
                       │ staff_id (FK)    │
                       │ service_id (FK)  │
                       │ base_amount      │
                       │ commission_rate  │
                       │ commission_amount│
                       │ commission_date  │
                       │ period_week      │
                       │ period_month     │
                       │ is_paid          │
                       │ created_at       │
                       └──────────────────┘

┌──────────────────┐
│    attendance    │
├──────────────────┤
│ id (PK)          │
│ staff_id (FK)    │
│ date             │
│ check_in         │
│ check_out        │
│ scheduled_start  │
│ scheduled_end    │
│ tardiness_minutes│
│ deduction_amount │
│ notes            │
│ created_at       │
└──────────────────┘
```

### 4.2 Table Definitions

#### Table: users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'staff', 'manager') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role (role)
);
```

**Description:** Core user authentication table for all system users

**Constraints:**
- Either email OR phone required (at least one)
- Password hashed with bcrypt (cost factor 12)
- Role determines access level

---

#### Table: customer_profiles

```sql
CREATE TABLE customer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    preferences JSON,
    allergies TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (full_name)
);
```

**Description:** Extended customer information and preferences

**JSON Structure (preferences):**
```json
{
  "favorite_services": [1, 3, 5],
  "favorite_technicians": [2, 4],
  "preferred_colors": ["nude pink", "classic red"],
  "communication_preference": "email"
}
```

---

#### Table: staff_profiles

```sql
CREATE TABLE staff_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    specializations JSON NOT NULL,
    daily_target DECIMAL(10,2) DEFAULT 6000.00,
    scheduled_start TIME DEFAULT '12:00:00',
    scheduled_end TIME DEFAULT '22:00:00',
    is_available BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (full_name)
);
```

**Description:** Staff-specific information and specialization

**JSON Structure (specializations):**
```json
["nails", "hair", "waxing", "lashes"]
```

---

#### Table: service_categories

```sql
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Description:** Service category taxonomy (Nails, Hair, Waxing, Lashes)

---

#### Table: services

```sql
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES service_categories(id),
    INDEX idx_category (category_id),
    INDEX idx_active_price (is_active, price),
    CHECK (duration_minutes >= 15 AND duration_minutes <= 480),
    CHECK (price >= 0)
);
```

**Description:** Individual service offerings with pricing and duration

---

#### Table: appointments

```sql
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    technician_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_walk_in BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id),
    FOREIGN KEY (technician_id) REFERENCES staff_profiles(id),
    INDEX idx_customer (customer_id),
    INDEX idx_technician_date (technician_id, appointment_date),
    INDEX idx_status_date (status, appointment_date),
    INDEX idx_date (appointment_date)
);
```

**Description:** Appointment bookings with status tracking

---

#### Table: appointment_services

```sql
CREATE TABLE appointment_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price_at_booking DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id),
    INDEX idx_appointment (appointment_id),
    CHECK (quantity > 0)
);
```

**Description:** Services booked within an appointment (supports multiple services per appointment)

---

#### Table: transactions

```sql
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'gcash') NOT NULL,
    status ENUM('pending', 'completed', 'voided') DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_appointment (appointment_id),
    INDEX idx_date (transaction_date),
    INDEX idx_receipt (receipt_number),
    CHECK (amount >= 0)
);
```

**Description:** Payment transactions with receipt generation

**Receipt Number Format:** `YYYYMMDD-NNN` (e.g., `20260414-001`)

---

#### Table: commissions

```sql
CREATE TABLE commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    staff_id INT NOT NULL,
    service_id INT NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_date DATE NOT NULL,
    period_week INT NOT NULL,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    INDEX idx_staff_period (staff_id, period_year, period_week),
    INDEX idx_date (commission_date),
    CHECK (commission_rate >= 0 AND commission_rate <= 100),
    CHECK (commission_amount >= 0)
);
```

**Description:** Commission records with rate tracking and pay periods

---

#### Table: attendance

```sql
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIMESTAMP NULL,
    check_out TIMESTAMP NULL,
    scheduled_start TIME,
    scheduled_end TIME,
    tardiness_minutes INT DEFAULT 0,
    deduction_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id),
    INDEX idx_staff_date (staff_id, date),
    UNIQUE KEY uk_staff_date (staff_id, date),
    CHECK (tardiness_minutes >= 0)
);
```

**Description:** Staff attendance and tardiness tracking

---

#### Table: notifications

```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
);
```

**Description:** In-app notification system

---

#### Table: system_logs

```sql
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created (created_at)
);
```

**Description:** Audit trail for security and debugging

---

#### Table: refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token(100)),
    INDEX idx_expires (expires_at)
);
```

**Description:** JWT refresh tokens for session management

---

## 5. API ARCHITECTURE

### 5.1 API Design Principles

**RESTful Conventions:**
- Resource-based URLs (`/api/services`, `/api/appointments`)
- HTTP methods match CRUD operations (GET, POST, PUT, DELETE)
- Status codes indicate result (200, 201, 400, 401, 403, 404, 500)
- Request/response bodies in JSON format

**Versioning:**
- API version in URL (`/api/v1/...`)
- Backward compatibility maintained within version

**Pagination:**
- List endpoints support pagination
- Query parameters: `?page=1&limit=20`
- Response includes: `total`, `page`, `limit`, `pages`

**Error Handling:**
- Consistent error response format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 5.2 API Endpoints

#### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Authenticate user | Public |
| POST | `/logout` | Logout user | Required |
| POST | `/refresh` | Refresh access token | Refresh Token |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password` | Reset password with token | Public |

#### Users (`/api/v1/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | Required |
| PUT | `/me` | Update current user profile | Required |
| PUT | `/me/password` | Change password | Required |

#### Services (`/api/v1/services`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all active services | Public |
| GET | `/:id` | Get service details | Public |
| GET | `/categories` | List service categories | Public |
| POST | `/` | Create new service | Manager |
| PUT | `/:id` | Update service | Manager |
| DELETE | `/:id` | Disable service | Manager |

#### Appointments (`/api/v1/appointments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my` | List user's appointments | Customer |
| GET | `/my/:id` | Get appointment details | Customer |
| POST | `/` | Create new appointment | Customer |
| PUT | `/my/:id` | Update/reschedule appointment | Customer |
| DELETE | `/my/:id` | Cancel appointment | Customer |
| GET | `/staff/today` | Get today's schedule | Staff |
| GET | `/staff/:id` | Get appointment details | Staff |
| PUT | `/staff/:id/status` | Update appointment status | Staff |
| GET | `/all` | List all appointments | Manager |
| POST | `/walk-in` | Create walk-in appointment | Staff/Manager |
| GET | `/availability` | Check available time slots | Public |

#### Payments (`/api/v1/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Record payment | Staff |
| GET | `/:id` | Get transaction details | Staff/Manager |
| GET | `/:id/receipt` | Get receipt | Staff/Customer |
| POST | `/:id/void` | Void transaction | Manager |

#### Commissions (`/api/v1/commissions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my/today` | Get today's commission | Staff |
| GET | `/my/weekly` | Get weekly commission | Staff |
| GET | `/my/history` | Get commission history | Staff |
| GET | `/staff/:id` | Get staff commissions | Manager |
| POST | `/calculate` | Trigger commission calculation | System |
| GET | `/payroll/generate` | Generate payroll report | Manager |

#### Attendance (`/api/v1/attendance`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/check-in` | Check-in for shift | Staff |
| POST | `/check-out` | Check-out from shift | Staff |
| GET | `/my/history` | Get attendance history | Staff |
| GET | `/staff/:id` | Get staff attendance | Manager |
| GET | `/report/monthly` | Get monthly attendance report | Manager |

#### Reports (`/api/v1/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/sales/daily` | Get daily sales summary | Manager |
| GET | `/sales/weekly` | Get weekly sales summary | Manager |
| GET | `/sales/monthly` | Get monthly sales summary | Manager |
| GET | `/services/analytics` | Get service analytics | Manager |
| GET | `/staff/performance` | Get staff performance | Manager |
| GET | `/customers/insights` | Get customer insights | Manager |

#### Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List user notifications | Required |
| PUT | `/:id/read` | Mark as read | Required |
| PUT | `/read-all` | Mark all as read | Required |

### 5.3 API Request/Response Examples

#### Example: Create Appointment

**Request:**
```http
POST /api/v1/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "services": [
    { "serviceId": 1, "quantity": 1 }
  ],
  "technicianId": 2,
  "date": "2026-04-16",
  "time": "14:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "customerId": 45,
    "technicianId": 2,
    "status": "pending",
    "appointmentDate": "2026-04-16",
    "startTime": "14:00",
    "endTime": "15:00",
    "services": [
      {
        "serviceId": 1,
        "serviceName": "Gel Manicure",
        "quantity": 1,
        "priceAtBooking": 500.00
      }
    ],
    "totalAmount": 500.00,
    "createdAt": "2026-04-14T10:30:00Z"
  }
}
```

**Response (409 Conflict - Time Slot Unavailable):**
```json
{
  "success": false,
  "error": {
    "code": "TIME_SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available",
    "details": "Technician has a conflicting appointment"
  }
}
```

---

## 6. SECURITY ARCHITECTURE

### 6.1 Authentication Flow

```
┌─────────┐           ┌─────────┐           ┌─────────┐
│ Client  │           │ Server  │           │  DB     │
└────┬────┘           └────┬────┘           └────┬────┘
     │                     │                     │
     │  POST /login        │                     │
     │  {email, password}  │                     │
     │────────────────────>│                     │
     │                     │  Query user by email│
     │                     │────────────────────>│
     │                     │                     │
     │                     │  Return user record │
     │                     │<────────────────────│
     │                     │                     │
     │                     │ Verify password     │
     │                     │ (bcrypt.compare)    │
     │                     │                     │
     │                     │ Generate JWT        │
     │                     │ (access + refresh)  │
     │                     │                     │
     │  Return tokens      │                     │
     │<────────────────────│                     │
     │                     │                     │
     │ Store tokens        │                     │
     │ (localStorage)      │                     │
     │                     │                     │
     │  Subsequent requests│                     │
     │  Authorization: Bearer <token>            │
     │────────────────────>│                     │
     │                     │ Verify JWT          │
     │                     │                     │
     │  Return data        │                     │
     │<────────────────────│                     │
```

### 6.2 JWT Structure

**Access Token (2-hour expiry):**
```json
{
  "sub": 123,
  "email": "customer@email.com",
  "role": "customer",
  "iat": 1681473600,
  "exp": 1681480800
}
```

**Refresh Token (30-day expiry):**
- Stored in database (`refresh_tokens` table)
- Longer-lived, used to obtain new access tokens
- Revoked on logout

### 6.3 Security Measures

**Input Validation:**
- All user inputs validated and sanitized
- express-validator middleware
- Whitelist allowed fields
- Reject unexpected fields

**SQL Injection Prevention:**
- Prisma ORM (parameterized queries)
- No raw SQL queries
- Input type checking

**XSS Prevention:**
- Output encoding on frontend
- Content-Security-Policy headers
- HTTP-only cookies (if used)

**CSRF Protection:**
- Not required for JWT-based auth (stateless API)
- CORS configured for specific origins

**Rate Limiting:**
- Login: 5 attempts per 15 minutes per IP
- API: 100 requests per 15 minutes per user
- Express rate limiter middleware

**CORS Configuration:**
```javascript
{
  origin: ['https://nailssentials.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
```

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Production Architecture

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   CDN (Vercel)  │
              │                 │
              │  Static Assets  │
              │  (React App)    │
              └────────┬────────┘
                       │
                       │ API Calls
                       ▼
              ┌─────────────────┐
              │  Railway Server │
              │                 │
              │  Node.js API    │
              │  Express.js     │
              │                 │
              └────────┬────────┘
                       │
                       │ SQL
                       ▼
              ┌─────────────────┐
              │  Railway MySQL  │
              │                 │
              │  Database       │
              │                 │
              └─────────────────┘
```

### 7.2 Environment Configuration

**Development:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://root:password@localhost:3306/nailssentials_qc
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://localhost:5173
```

**Staging:**
```env
NODE_ENV=staging
PORT=5000
DATABASE_URL=mysql://user:pass@staging-db:3306/nailssentials_qc
JWT_SECRET=<staging-secret>
JWT_EXPIRES_IN=2h
CORS_ORIGIN=https://staging.nailssentials.vercel.app
```

**Production:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://user:pass@prod-db:3306/nailssentials_qc
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=2h
CORS_ORIGIN=https://nailssentials.vercel.app
```

### 7.3 CI/CD Pipeline (Optional)

```
Developer pushes to GitHub
         │
         ▼
   GitHub Actions
         │
         ├── Run ESLint
         │
         ├── Run Tests (Jest)
         │
         ├── Build Frontend (Vite)
         │
         ├── If all pass:
         │
         ├── Deploy Frontend to Vercel
         │
         └── Deploy Backend to Railway
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Frontend Optimization

**Code Splitting:**
- Route-based code splitting (React.lazy)
- Load components on-demand
- Reduce initial bundle size

**Caching:**
- React Query or SWR for API response caching
- LocalStorage for user preferences
- Service Worker for offline capability (future)

**Lazy Loading:**
- Images lazy-loaded
- Routes loaded on navigation
- Heavy components (charts) loaded when visible

**Bundle Optimization:**
- Tree shaking (remove unused code)
- Minification (production build)
- Gzip compression (Vercel auto)

### 8.2 Backend Optimization

**Database Indexing:**
- All frequently queried columns indexed
- Composite indexes for common queries
- Query performance monitoring

**Connection Pooling:**
- Prisma connection pool (default)
- Max connections: 10 (free tier)
- Connection timeout: 10 seconds

**Response Caching:**
- Redis (future, if needed)
- In-memory cache for static data (service catalog)
- Cache-Control headers

**Query Optimization:**
- Select only needed fields
- Avoid N+1 queries (Prisma includes)
- Pagination for large datasets

### 8.3 Network Optimization

**Compression:**
- Gzip compression enabled
- Response compression middleware

**HTTP/2:**
- Vercel supports HTTP/2
- Multiplexed requests

**CDN:**
- Vercel CDN for static assets
- Edge caching for faster delivery

---

## 9. MONITORING & LOGGING

### 9.1 Application Logging

**Log Levels:**
- ERROR: System errors, exceptions
- WARN: Warnings, degraded performance
- INFO: Important events (login, booking, payment)
- DEBUG: Detailed debugging information

**Log Format:**
```json
{
  "timestamp": "2026-04-14T10:30:00Z",
  "level": "info",
  "message": "Appointment booked successfully",
  "userId": 123,
  "appointmentId": 456,
  "ip": "192.168.1.1"
}
```

**Log Storage:**
- Development: Console output
- Production: File logging + external service (future)
- Retention: 90 days

### 9.2 Error Monitoring

**Client-Side:**
- React Error Boundary
- Error reporting to backend
- User-friendly error messages

**Server-Side:**
- Express error handling middleware
- Structured error responses
- Stack traces in development only

### 9.3 Performance Monitoring

**Metrics to Track:**
- API response times
- Database query times
- Error rates
- Concurrent users
- Memory usage
- CPU usage

**Tools (Free Tier):**
- Vercel Analytics (frontend)
- Railway Metrics (backend + DB)
- Custom logging dashboard

---

## 10. SCALABILITY CONSIDERATIONS

### 10.1 Current Architecture (Single Instance)

- Single frontend instance (Vercel)
- Single backend instance (Railway)
- Single database instance (Railway MySQL)
- Suitable for: 50-100 concurrent users

### 10.2 Future Scaling Options

**Horizontal Scaling (API Layer):**
- Add load balancer
- Multiple API server instances
- Stateless design enables easy scaling

**Database Scaling:**
- Read replicas for query offloading
- Connection pooling (PgBouncer for PostgreSQL)
- Database sharding (if multi-branch)

**Caching Layer:**
- Redis for session storage
- Redis for API response caching
- CDN for static assets

**Microservices (Future):**
- Split monolith into services:
  - Authentication Service
  - Booking Service
  - Commission Service
  - Notification Service
- Event-driven architecture (message queue)

---

## 11. TESTING STRATEGY

### 11.1 Unit Testing

**Frontend (Jest + React Testing Library):**
- Component rendering
- User interactions
- State management
- Utility functions

**Backend (Jest):**
- Business logic (commission engine)
- Utility functions
- Validation logic
- Service layer

**Target:** > 70% code coverage

### 11.2 Integration Testing

**API Testing (Supertest):**
- All endpoints tested
- Authentication flows
- CRUD operations
- Error scenarios

**Database Testing:**
- Prisma queries
- Migrations
- Data integrity

### 11.3 End-to-End Testing

**Critical Flows (Playwright/Cypress):**
- Customer registration
- Appointment booking
- Payment recording
- Commission calculation

**Target:** All P0 features covered

### 11.4 Performance Testing

**Load Testing (Artillery/k6):**
- 50 concurrent users
- Booking flow under load
- API response times

**Stress Testing:**
- Identify breaking points
- Database connection limits

---

## 12. MAINTENANCE & OPERATIONS

### 12.1 Database Maintenance

**Daily:**
- Automated backups
- Backup verification

**Weekly:**
- Index optimization
- Query performance review
- Log rotation

**Monthly:**
- Data archival (old records)
- Storage cleanup
- Performance audit

### 12.2 Deployment Process

1. Code reviewed and approved
2. Merged to main branch
3. CI/CD pipeline triggered
4. Tests executed
5. Deploy to staging
6. Manual testing on staging
7. Deploy to production
8. Smoke tests on production

### 12.3 Rollback Plan

**If deployment fails:**
1. Revert to previous commit
2. Redeploy previous version
3. Database migration rollback (if applicable)
4. Verify system stability

---

**Document Status:** Complete  
**Next Step:** Phase 3 - Solutioning (Epics & Stories)  
**Prepared by:** SFIT-2B Group 4
