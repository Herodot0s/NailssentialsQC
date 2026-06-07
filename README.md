# 🌸 NailssentialsQC

### *An Artisan-Driven Sanctuary of Self-Care & Salon Management*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-39827B?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

NailssentialsQC is a comprehensive, premium management system tailored for boutique nail salons. By combining a serene user interface with a robust, enterprise-grade architecture, the platform streamlines customer booking, automates staff commissions and attendance, and equips managers with real-time performance analytics.

---

## 🏛️ System Architecture

The application is structured as a decoupled monorepo featuring a TypeScript-based client, a secure API gateway, and an ORM-driven relational data model:

```mermaid
graph TD
    %% Styling Customization
    classDef client fill:#f5f4ef,stroke:#B8794E,stroke-width:2px;
    classDef gateway fill:#6C47FF,stroke:#5533FF,stroke-width:1px,color:#fff;
    classDef app fill:#eef9f5,stroke:#2c8c66,stroke-width:2px;
    classDef db fill:#ebf3fa,stroke:#316192,stroke-width:2px;

    %% Nodes
    subgraph Client Layer (Vite + React)
        A[Customer App]:::client
        B[Staff Portal]:::client
        C[Manager Dashboard]:::client
    end

    subgraph Auth & Security
        D[Clerk Identity Proxy]:::gateway
    end

    subgraph API Core (Express + Node.js)
        E[REST API Middleware]:::app
        F[Prisma Client ORM]:::app
    end

    subgraph Database Storage
        G[(Neon Serverless PostgreSQL)]:::db
    end

    %% Relations
    A & B & C -->|OAuth 2.0 / JWT| D
    D -->|Request Authorization| E
    E -->|Database Queries| F
    F -->|SSL Handshake| G
```

---

## 👥 Roles & Feature Matrix

The platform is designed around three distinct user roles, ensuring secure and clean isolation of duties:

| Feature Section | 👤 Customer Client | 💅 Salon Staff / Artisan | 👑 Manager Control Panel |
| :--- | :---: | :---: | :---: |
| **Booking Engine** | Book, modify & cancel | View assigned slots | Overlook calendar |
| **Loyalty & Notes** | View history | Track customer notes | Manage customer database |
| **Time & Attendance** | — | Clock in/out & view schedule | Attendance verification logs |
| **Commissions & Pay** | — | Real-time commission tracker | Generate weekly payroll periods |
| **Catalog Control** | Browse price list | — | Create/edit services & structures |
| **Business Analytics** | — | — | Revenue charts & staff rankings |

---

## 👥 Sandbox Accounts

Use the pre-configured database records to test each dashboard flow:

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Manager** | `test_manager` | `password123` | Payroll execution, service catalog controls, analytics |
| **Staff** | `test_staff` | `password123` | Timeclock logging, schedule management, commissions |
| **Customer** | `test_customer` | `password123` | Appointment booking, transaction histories |

---

## 🛠️ Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- Local PostgreSQL instance or a serverless cloud instance (e.g. Neon)

### 1. Repository Installation
Clone the repository and enter the directory:
```bash
git clone <repo-url>
cd nailssentialsqc-system
```

### 2. Backend Bootstrapping
1. Navigate to the backend folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file using the config variables provided by the server configuration:
   ```env
   PORT=5000
   DATABASE_URL="your-postgresql-url"
   CLERK_PUBLISHABLE_KEY="your-clerk-pub-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   ```
3. Push database schemas and seed default entries:
   ```bash
   npx prisma db push
   npm run seed
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Bootstrapping
1. Open a new terminal window, navigate to the frontend folder, and install packages:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite bundler:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## 📄 Deployment Configuration

The application is pre-configured for instant zero-config deployments:
- **Frontend**: Fully compatible with Vercel or Netlify via `vite build`.
- **Backend**: Containerizable and deployable to Render/Railway via `npm run build`.
