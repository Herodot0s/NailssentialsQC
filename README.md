# NailssentialsQC Salon Management System

A comprehensive management system for NailssentialsQC, featuring online booking, staff attendance tracking, commission management, and detailed analytics for managers.

## 🚀 Tech Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS v4, Shadcn UI (Base UI).
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: PostgreSQL (Neon).
- **Icons**: Lucide React.
- **Charts**: Recharts.
- **PDF**: jspdf + html2canvas.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (or use the provided Neon instance)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd NailssentialsQC_System
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided credentials
   # Run migrations/push schema
   npx prisma db push
   # Seed the database
   npm run seed
   # Start dev server
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Start dev server
   npm run dev
   ```

## 👥 Test Accounts

| Role | Username | Password |
| :--- | :--- | :--- |
| **Manager** | `test_manager` | `password123` |
| **Staff** | `test_staff` | `password123` |
| **Customer** | `test_customer` | `password123` |

## 🌟 Key Features

- **Customers**: Browse services, book appointments, view history, and download digital receipts.
- **Staff**: Check-in/out, view assigned bookings, and track personal commissions.
- **Managers**: Performance analytics, payroll generation, attendance oversight, and service catalog management.
- **Notifications**: Real-time in-app alerts for staff and email confirmations for customers.

## 📄 Deployment

The system is ready for deployment on platforms like Vercel (Frontend) and Render/Railway (Backend).

- **Build Frontend**: `cd frontend && npm run build`
- **Build Backend**: `cd backend && npm run build`
