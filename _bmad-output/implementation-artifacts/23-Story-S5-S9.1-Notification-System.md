# Story 9.1: Notification System (Email & In-app)

**Role:** System  
**Objective:** Provide real-time updates to customers (email) and staff/managers (in-app) regarding bookings and system events.

---

## 1. Requirements

### 1.1 Email Notifications (Customers)
- **Booking Confirmation**: Send email when an appointment is successfully booked.
- **Booking Reminder**: (Optional/Bonus) Send email 24 hours before.
- **Completion/Receipt**: Send email when appointment is completed (with receipt details).

### 1.2 In-app Notifications (Staff/Manager)
- **New Booking**: Alert staff when a new appointment is assigned to them.
- **Check-in Alert**: Notify manager of staff check-in/out (optional).

---

## 2. Technical Design

### 2.1 Backend (Email)
- **Service**: Use `nodemailer` with a generic SMTP or SendGrid provider.
- **Triggers**: Call the email service from `appointmentController.ts`.

### 2.2 Backend (In-app)
- **Schema**: Add a `Notification` model to Prisma.
- **API**: Endpoints to fetch and mark notifications as read.

### 2.3 Frontend
- **Notification Bell**: A small bell icon in the Navbar for staff/managers.
- **Toast Notifications**: Use `sonner` or `react-hot-toast` for immediate feedback.

---

## 3. Implementation Plan

### Step 1: Backend Setup
- [ ] Add `Notification` model to `schema.prisma`.
- [ ] Install `nodemailer`.
- [ ] Create `backend/src/utils/email.ts`.
- [ ] Create `backend/src/controllers/notificationController.ts` and routes.

### Step 2: Integration
- [ ] Trigger email on `createAppointment`.
- [ ] Trigger email on `completeAppointment`.
- [ ] Create in-app notification on `createAppointment` for technicians.

### Step 3: Frontend UI
- [ ] Install `lucide-react` bell icon (if not already there).
- [ ] Build `NotificationPopOver` component.
- [ ] Integrate with backend API.
