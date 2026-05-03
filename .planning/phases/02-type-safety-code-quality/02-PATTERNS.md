# Phase 02: Type Safety & Code Quality - Pattern Map

**Mapped:** 2026-05-02
**Files analyzed:** 20 (12 new, 8 modified)
**Analogs found:** 17 / 20

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/src/controllers/appointmentController.ts` (modified) | controller | CRUD | `backend/src/controllers/authController.ts` | exact |
| `backend/src/controllers/appointmentAvailability.ts` (new) | controller | request-response | `backend/src/controllers/authController.ts` | role-match |
| `backend/src/controllers/appointmentCompletion.ts` (new) | controller | CRUD | `backend/src/controllers/payrollController.ts` | role-match |
| `backend/src/types/appointmentTypes.ts` (new) | type | N/A | Prisma generated types in `@prisma/client` | partial |
| `backend/src/middleware/authMiddleware.ts` (modified) | middleware | request-response | Itself (lines 1-47) | exact |
| `backend/src/utils/jwt.ts` (modified) | utility | transform | Itself (lines 1-23) | exact |
| `frontend/src/pages/ManagerDashboard.tsx` (modified) | page | request-response | Itself (lines 1-1000) | exact |
| `frontend/src/components/dashboard/StaffTable.tsx` (new) | component | props drilling | `frontend/src/components/SalarySlipModal.tsx` | role-match |
| `frontend/src/components/dashboard/PayrollTable.tsx` (new) | component | props drilling | `frontend/src/components/SalarySlipModal.tsx` | role-match |
| `frontend/src/components/dashboard/AttendanceLedger.tsx` (new) | component | props drilling | `frontend/src/components/SalarySlipModal.tsx` | role-match |
| `frontend/src/components/dashboard/ReviewModeration.tsx` (new) | component | props drilling | `frontend/src/components/SalarySlipModal.tsx` | role-match |
| `frontend/src/components/dashboard/types.ts` (new) | type | N/A | Inline types in `ManagerDashboard.tsx` (lines 86-149) | partial |
| `frontend/src/types/User.ts` (new) | type | N/A | `frontend/src/context/AuthContext.tsx` (lines 4-10) | exact |
| `frontend/src/types/CartItem.ts` (new) | type | N/A | `frontend/src/context/CartContext.tsx` (lines 3-11) | exact |
| `frontend/src/types/api.ts` (new) | type | N/A | Inline types in `apiClient.ts` + `ManagerDashboard.tsx` | partial |
| `frontend/src/api/apiClient.ts` (modified) | api client | request-response | Itself (lines 1-141) | exact |
| `frontend/src/context/AuthContext.tsx` (modified) | context | state management | Itself (lines 1-101) | exact |
| `frontend/src/context/CartContext.tsx` (modified) | context | state management | Itself (lines 1-81) | exact |
| `frontend/src/pages/Login.tsx` (modified) | page | request-response | Itself (lines 1-166) | exact |
| `frontend/src/pages/Booking.tsx` (modified) | page | request-response | Itself (lines 1-150) | exact |

## Pattern Assignments

### `backend/src/controllers/appointmentController.ts` (controller, CRUD) - Modified

**Analog:** `backend/src/controllers/authController.ts`

**Imports pattern** (authController.ts lines 1-4):
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
```

**AuthRequest import pattern** (authController.ts line 3, appointmentController.ts line 3):
```typescript
import { AuthRequest } from '../middleware/authMiddleware';
```

**Core CRUD pattern with try/catch** (authController.ts lines 6-119):
```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, password } = req.body;
    // ... validation and logic ...
    return res.status(201).json({
      success: true,
      data: { /* ... */ },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong during registration',
      },
    });
  }
};
```

**Updated error handling pattern (unknown + narrowing)** - Apply to all catch blocks:
```typescript
} catch (error: unknown) {
  console.error('Operation error:', error);
  const message = error instanceof Error ? error.message : 'Failed to complete operation';
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message }
  });
}
```

**Prisma WhereInput type pattern** (appointmentController.ts line 139 - to be fixed):
```typescript
// BEFORE:
let where: any = {};

// AFTER:
const where: Prisma.AppointmentWhereInput = {};
```

**Prisma enum cast pattern** (appointmentController.ts line 237 - to be fixed):
```typescript
// BEFORE:
payment_method: paymentMethod as any,

// AFTER:
import { PaymentMethod } from '@prisma/client';
payment_method: paymentMethod as PaymentMethod,
```

**parseInt without unnecessary cast** (appointmentController.ts lines 185, 222, 235):
```typescript
// BEFORE:
where: { id: parseInt(id as string) },

// AFTER:
where: { id: parseInt(id) },
```

---

### `backend/src/controllers/appointmentAvailability.ts` (controller, request-response) - New

**Analog:** `backend/src/controllers/authController.ts`

**Imports pattern** (copy from authController.ts lines 1-4, customize):
```typescript
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getFullDate, addMinutes, areIntervalsOverlapping } from 'date-fns';
import { AppointmentWithDetails } from '../types/appointmentTypes';
```

**Controller function pattern** (copy from appointmentController.ts lines 309-384, adapt):
```typescript
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    // ... implementation ...
    return res.status(200).json({ success: true, data: slotsWithAvailability });
  } catch (error: unknown) {
    console.error('Get available slots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch availability';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message }
    });
  }
};
```

**Commission functions pattern** (copy from appointmentController.ts lines 60-132):
```typescript
export const getCommissionSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    // ... implementation ...
  } catch (error: unknown) {
    console.error('Get commission summary error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch commission summary';
    return res.status(500).json({ success: false, message });
  }
};
```

---

### `backend/src/controllers/appointmentCompletion.ts` (controller, CRUD) - New

**Analog:** `backend/src/controllers/payrollController.ts`

**Imports pattern** (copy from payrollController.ts lines 1-4):
```typescript
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { format, getISOWeek, getMonth, getYear } from 'date-fns';
import { sendAppointmentCompletion } from '../utils/email';
import { createNotification } from './notificationController';
import { AppointmentWithDetails } from '../types/appointmentTypes';
```

**Prisma transaction pattern** (copy from payrollController.ts lines 86-158, appointmentController.ts lines 219-272):
```typescript
export const completeAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { service: true } } },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ... transaction logic ...
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Appointment completed and commissions calculated!',
    });
  } catch (error: unknown) {
    console.error('Complete appointment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete appointment';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message }
    });
  }
};
```

**Helper functions pattern** (copy from appointmentController.ts lines 21-58):
```typescript
const getTieredCommissionRate = async () => {
  const lastMonth = subMonths(new Date(), 1);
  // ... implementation ...
};

const checkSpecialtyQuota = async (staffId: number) => {
  // ... implementation ...
};
```

---

### `backend/src/types/appointmentTypes.ts` (type) - New

**Analog:** Prisma generated types from `@prisma/client`

**Type definitions pattern** (based on RESEARCH.md Pattern 2 and Prisma docs):
```typescript
import { Appointment, AppointmentItem, Service, Prisma } from '@prisma/client';

export interface CreateAppointmentInput {
  customer_id: number;
  appointment_date: Date;
  status: string;
  is_walk_in: boolean;
  notes: string;
  items: {
    service_id: number;
    staff_id: number;
    start_time: string;
    end_time: string;
    price_at_booking: Prisma.Decimal;
  }[];
}

export interface AppointmentWithDetails extends Appointment {
  customer: any; // Replace with Customer type when available
  items: (AppointmentItem & { service: Service; staff: any })[];
  transactions: any[];
}

export interface GetAvailableSlotsQuery {
  date: string;
}

export interface CompleteAppointmentInput {
  paymentMethod: 'cash' | 'gcash';
}
```

---

### `backend/src/middleware/authMiddleware.ts` (middleware, request-response) - Modified

**Analog:** Itself

**AuthRequest interface pattern** (lines 4-12):
```typescript
export interface AuthRequest extends Request {
  user?: {
    sub: number;
    email: string;
    role: string;
  };
  validatedParams?: Record<string, any>;
  validatedBody?: Record<string, any>;
}
```

**Fix verifyAccessToken call** (line 26 - remove `as any`):
```typescript
// BEFORE:
const decoded = verifyAccessToken(token) as any;

// AFTER (after typing jwt.ts verify functions):
const decoded = verifyAccessToken(token);
```

**Role authorization pattern** (lines 37-47):
```typescript
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You do not have permission' },
      });
    }
    next();
  };
};
```

---

### `backend/src/utils/jwt.ts` (utility, transform) - Modified

**Analog:** Itself

**Current pattern** (lines 1-23):
```typescript
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret_fallback';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_fallback';

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
```

**Typed return pattern** (to be applied):
```typescript
import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};
```

---

### `frontend/src/pages/ManagerDashboard.tsx` (page, request-response) - Modified

**Analog:** Itself

**Interface definitions pattern** (lines 86-149):
```typescript
interface SalesStats {
  totalRevenue: number;
  transactionCount: number;
  onlineCount: number;
  walkInCount: number;
  serviceBreakdown: { name: string; amount: number; count: number }[];
  target: number;
}

interface PayrollRecord {
  staffId: number;
  fullName: string;
  commissionCount: number;
  totalCommission: number;
  attendanceCount: number;
  totalDeduction: number;
  basePay: number;
  netPay: number;
}

interface StaffMember {
  id: number;
  staffProfileId: number;
  username: string;
  email: string | null;
  // ... more fields ...
}
```

**State management pattern** (lines 153-183):
```typescript
const [activeView, setActiveView] = useState<ActiveView>('analytics');
const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
// ... more state ...
```

**Data fetching pattern with typed error** (lines 217-249):
```typescript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const [salesRes, payrollRes, staffRes] = await Promise.all([
      getDailySales(), getReports({...}), getAllStaff(),
    ]);
    if (salesRes.data.success) setSalesStats(salesRes.data.data);
    // ... more assignments ...
  } catch (err: any) {  // Fix: change to `err: unknown`
    console.error('Fetch error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

**After slim-down:** ManagerDashboard.tsx keeps Analytics view, Deductions form, state management, and view switching. Extracted components go to `components/dashboard/`.

---

### `frontend/src/components/dashboard/StaffTable.tsx` (component, props drilling) - New

**Analog:** `frontend/src/components/SalarySlipModal.tsx`

**Imports pattern** (SalarySlipModal.tsx lines 1-12):
```typescript
import React from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { StaffTableProps } from './types';
```

**Component pattern with props interface** (SalarySlipModal.tsx lines 25-31):
```typescript
export const StaffTable: React.FC<StaffTableProps> = ({
  staffMembers,
  onStaffClick,
}) => {
  return (
    <Card className="rounded-none border-none shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="pl-8 py-5 text-[9px] uppercase tracking-[0.2em] font-bold">
              Employee
            </TableHead>
            {/* ... more headers ... */}
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {staffMembers.map(staff => (
            <TableRow
              key={staff.id}
              className="hover:bg-primary-ultra/10 cursor-pointer border-gray-50"
              onClick={() => onStaffClick(staff)}
            >
              {/* ... table cells ... */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
```

---

### `frontend/src/components/dashboard/PayrollTable.tsx` (component, props drilling) - New

**Analog:** `frontend/src/components/SalarySlipModal.tsx`

**Props interface** (from types.ts):
```typescript
export interface PayrollTableProps {
  payrollReport: PayrollRecord[];
  onPayrollRowClick: (record: PayrollRecord) => void;
}
```

**Component pattern** (same structure as StaffTable.tsx, using Table components from `@/components/ui/table`):
```typescript
export const PayrollTable: React.FC<PayrollTableProps> = ({
  payrollReport,
  onPayrollRowClick,
}) => {
  return (
    <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
      <Table>
        {/* ... table header and body mapping payrollReport ... */}
      </Table>
    </Card>
  );
};
```

---

### `frontend/src/components/dashboard/AttendanceLedger.tsx` (component, props drilling) - New

**Analog:** `frontend/src/components/SalarySlipModal.tsx`

**Props interface** (from types.ts):
```typescript
export interface AttendanceLedgerProps {
  attendance: AttendanceRecord[];
  onUpdateAttendance: (id: number, status: string) => void;
}
```

**Component pattern** (using Table, Button components):
```typescript
export const AttendanceLedger: React.FC<AttendanceLedgerProps> = ({
  attendance,
  onUpdateAttendance,
}) => {
  return (
    <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
      <Table>
        {/* ... map attendance records ... */}
      </Table>
    </Card>
  );
};
```

---

### `frontend/src/components/dashboard/ReviewModeration.tsx` (component, props drilling) - New

**Analog:** `frontend/src/components/SalarySlipModal.tsx`

**Props interface** (from types.ts):
```typescript
export interface ReviewModerationProps {
  reviews: Review[];
  onModerateReview: (id: number, approved: boolean) => void;
}
```

**Component pattern** (using Table, Button, Star icon from lucide-react):
```typescript
export const ReviewModeration: React.FC<ReviewModerationProps> = ({
  reviews,
  onModerateReview,
}) => {
  return (
    <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
      <Table>
        {/* ... map reviews with rating stars and moderation buttons ... */}
      </Table>
    </Card>
  );
};
```

---

### `frontend/src/components/dashboard/types.ts` (type) - New

**Analog:** Inline types in `ManagerDashboard.tsx` (lines 86-149) and `SalarySlipModal.tsx` (lines 14-23)

```typescript
import { StaffMember, PayrollRecord, Review, AttendanceRecord } from '@/types';

export interface StaffTableProps {
  staffMembers: StaffMember[];
  onStaffClick: (staff: StaffMember) => void;
}

export interface PayrollTableProps {
  payrollReport: PayrollRecord[];
  onPayrollRowClick: (record: PayrollRecord) => void;
}

export interface AttendanceLedgerProps {
  attendance: AttendanceRecord[];
  onUpdateAttendance: (id: number, status: string) => void;
}

export interface ReviewModerationProps {
  reviews: Review[];
  onModerateReview: (id: number, approved: boolean) => void;
}
```

---

### `frontend/src/types/User.ts` (type) - New

**Analog:** `frontend/src/context/AuthContext.tsx` (lines 4-10)

```typescript
export interface User {
  id: number;
  email: string | null;
  phone: string | null;
  role: string;
  fullName: string;
}
```

---

### `frontend/src/types/CartItem.ts` (type) - New

**Analog:** `frontend/src/context/CartContext.tsx` (lines 3-11)

```typescript
export interface CartItem {
  serviceId: number;
  serviceName: string;
  price: number;
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
}
```

---

### `frontend/src/types/api.ts` (type) - New

**Analog:** Inline types in `apiClient.ts` and `ManagerDashboard.tsx`

```typescript
// Auth API types
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  password: string;
  email?: string | null;
  phone?: string | null;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string | null;
    phone: string | null;
    role: string;
    fullName: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Appointment API types
export interface CreateAppointmentRequest {
  items: {
    serviceId: number;
    staffId: number;
    startTime: string;
  }[];
  date: string;
  notes?: string;
  customerId?: number;
  isWalkIn?: boolean;
}

export interface CompleteAppointmentRequest {
  paymentMethod: 'cash' | 'gcash';
}

// Staff API types
export interface CreateStaffRequest {
  fullName: string;
  email?: string;
  phone?: string;
  username: string;
  password: string;
  specializations?: string;
  basePayPerWeek: number;
  dailyTarget: number;
  sssNumber?: string;
  tinNumber?: string;
  govId?: string;
  profilePictureUrl?: string;
}

// Attendance API types
export interface UpdateAttendanceRequest {
  checkIn?: string | null;
  checkOut?: string | null;
  tardinessMinutes?: number;
  deductionAmount?: number;
}

// Review API types
export interface SubmitReviewRequest {
  appointmentItemId: number;
  rating: number;
  tags: string[];
  comment?: string;
}
```

---

### `frontend/src/api/apiClient.ts` (api client, request-response) - Modified

**Analog:** Itself

**Current pattern with `any`** (lines 71-78):
```typescript
export const createService = (data: any) => apiClient.post('/services', data);
export const updateService = (id: number, data: any) => apiClient.put(`/services/${id}`, data);
export const createStaff = (data: any) => apiClient.post('/staff', data);
export const updateStaff = (id: number, data: any) => apiClient.put(`/staff/${id}`, data);
export const createAppointment = (bookingData: any) => apiClient.post('/appointments', bookingData);
export const submitReview = (data: any) => apiClient.post('/reviews', data);
export const updateCustomerProfile = (data: any) => apiClient.put('/customers/profile', data);
export const updateAttendance = (id: number, data: any) => apiClient.put(`/attendance/${id}`, data);
```

**Updated pattern with proper types** (apply imports from `frontend/src/types/api.ts`):
```typescript
import type { CreateStaffRequest, UpdateAttendanceRequest, SubmitReviewRequest } from '@/types/api';

export const createStaff = (data: CreateStaffRequest) => apiClient.post('/staff', data);
export const updateStaff = (id: number, data: Partial<CreateStaffRequest>) => apiClient.put(`/staff/${id}`, data);
export const createAppointment = (bookingData: CreateAppointmentRequest) => apiClient.post('/appointments', bookingData);
export const submitReview = (data: SubmitReviewRequest) => apiClient.post('/reviews', data);
export const updateAttendance = (id: number, data: UpdateAttendanceRequest) => apiClient.put(`/attendance/${id}`, data);
```

**Error handling pattern** (lines 29-53 - response interceptor):
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ... refresh token logic ...
    }
    return Promise.reject(error);
  },
);
```

---

### `frontend/src/context/AuthContext.tsx` (context, state management) - Modified

**Analog:** Itself

**User interface pattern** (lines 4-10):
```typescript
interface User {
  id: number;
  email: string | null;
  phone: string | null;
  role: string;
  fullName: string;
}
```

**Typed error handling** (lines 41-43 - to be fixed):
```typescript
// BEFORE:
} catch (error) {

// AFTER:
} catch (error: unknown) {
  console.error('Session verification failed:', error);
  if (error instanceof Error) {
    console.error('Error details:', error.message);
  }
}
```

**AuthContextType interface** (lines 12-19):
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}
```

---

### `frontend/src/context/CartContext.tsx` (context, state management) - Modified

**Analog:** Itself

**CartItem interface pattern** (lines 3-11):
```typescript
interface CartItem {
  serviceId: number;
  serviceName: string;
  price: number;
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
}
```

**CartContextType interface** (lines 13-21):
```typescript
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (serviceId: number) => void;
  updateCartItem: (serviceId: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  totalPrice: number;
  totalDuration: number;
}
```

---

### `frontend/src/pages/Login.tsx` (page, request-response) - Modified

**Analog:** Itself

**Typed form submission** (lines 32, 51-54 - to be fixed):
```typescript
// BEFORE:
const onSubmit = async (data: any) => {
// ...
} catch (error: any) {

// AFTER:
import type { LoginRequest } from '@/types/api';

const onSubmit = async (data: LoginRequest) => {
// ...
} catch (error: unknown) {
  const message = error instanceof Error
    ? error.message
    : 'Login failed. Please check your credentials.';
  setServerError(message);
}
```

**React.FC pattern** (line 20):
```typescript
const Login: React.FC = () => {
  // ... component logic ...
};
```

---

### `frontend/src/pages/Booking.tsx` (page, request-response) - Modified

**Analog:** Itself

**Staff and Slot interfaces** (lines 34-44):
```typescript
interface Staff {
  id: number;
  fullName: string;
  specializations: string;
  role: string;
}

interface Slot {
  time: string;
  available: boolean;
}
```

**Typed error handling** (lines 75, 111 - to be fixed):
```typescript
// BEFORE:
} catch (err) {
// ...
} catch (err: any) {

// AFTER:
} catch (err: unknown) {
  console.error('Booking error:', err);
  const message = err instanceof Error ? err.message : 'Failed to book appointment.';
}
```

**Staff mapping with typed parameter** (line 73 - to be fixed):
```typescript
// BEFORE:
setStaffList(staffRes.data.data.filter((s: any) => s.role === 'staff' || s.role === 'manager'));

// AFTER:
import type { Staff } from './types'; // Or define locally
setStaffList(staffRes.data.data.filter((s: Staff) => s.role === 'staff' || s.role === 'manager'));
```

---

## Shared Patterns

### Backend Controller Pattern
**Source:** `backend/src/controllers/authController.ts`, `backend/src/controllers/payrollController.ts`
**Apply to:** All backend controllers (appointmentController.ts, appointmentAvailability.ts, appointmentCompletion.ts)
```typescript
// Standard controller structure:
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

export const functionName = async (req: AuthRequest, res: Response) => {
  try {
    // ... logic ...
    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Operation error:', error);
    const message = error instanceof Error ? error.message : 'Operation failed';
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message }
    });
  }
};
```

### Error Type Narrowing Pattern
**Source:** RESEARCH.md Pattern 1, authController.ts lines 109, 245, 331, 357, 402
**Apply to:** All catch blocks in backend and frontend
```typescript
// Replace all `catch (error: any)` with:
} catch (error: unknown) {
  console.error('Operation error:', error);
  const message = error instanceof Error ? error.message : 'Failed to complete operation';
  // ... handle error ...
}
```

### Frontend Component with Props Interface Pattern
**Source:** `frontend/src/components/SalarySlipModal.tsx` lines 14-31
**Apply to:** All new dashboard components (StaffTable, PayrollTable, AttendanceLedger, ReviewModeration)
```typescript
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ComponentProps {
  data: DataType[];
  onAction: (item: DataType) => void;
}

export const Component: React.FC<ComponentProps> = ({ data, onAction }) => {
  return (
    <Card className="rounded-none border-none shadow-sm">
      {/* ... component JSX ... */}
    </Card>
  );
};
```

### Prisma Type Safety Pattern
**Source:** RESEARCH.md Pattern 2, appointmentController.ts
**Apply to:** All Prisma queries in backend controllers
```typescript
import { Prisma } from '@prisma/client';

// Typed where clauses
const where: Prisma.AppointmentWhereInput = {};
const include: Prisma.AppointmentInclude = { /* ... */ };

// Typed enum usage
import { PaymentMethod } from '@prisma/client';
const paymentMethod: PaymentMethod = data.paymentMethod as PaymentMethod;
```

### React Hook Form with TypeScript Pattern
**Source:** `frontend/src/pages/Login.tsx` lines 20-58
**Apply to:** All forms in Login.tsx, Booking.tsx
```typescript
import { useForm } from 'react-hook-form';
import type { LoginRequest } from '@/types/api';

const { register, handleSubmit } = useForm<LoginRequest>();

const onSubmit = (data: LoginRequest) => {
  // data is now typed
};
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `backend/src/types/appointmentTypes.ts` | type | N/A | No existing `backend/src/types/` directory; first type-only file in backend |
| `frontend/src/types/User.ts` | type | N/A | Type exists inline in AuthContext.tsx but no dedicated types directory yet |
| `frontend/src/types/CartItem.ts` | type | N/A | Type exists inline in CartContext.tsx but no dedicated types directory yet |
| `frontend/src/types/api.ts` | type | N/A | API request/response types exist inline across apiClient.ts and pages, no centralized type file |
| `frontend/src/components/dashboard/` (all) | component | props drilling | First extracted dashboard components; no prior component extraction in codebase (per CONTEXT.md line 89) |

## Metadata

**Analog search scope:** `backend/src/controllers/`, `backend/src/middleware/`, `backend/src/utils/`, `frontend/src/components/`, `frontend/src/context/`, `frontend/src/pages/`
**Files scanned:** 20
**Pattern extraction date:** 2026-05-02
**Key insight:** The codebase has consistent patterns for controllers (try/catch with console.error), components (React.FC with props interfaces), and contexts (createContext/useContext). The phase primarily requires systematic application of type safety improvements to these existing patterns rather than introducing new architectural patterns.
