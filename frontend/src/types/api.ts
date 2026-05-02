import type { User } from './User';

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
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Staff API types
export interface CreateStaffRequest {
  fullName: string;
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

export interface StaffMember {
  id: number;
  staffProfileId: number;
  username: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  fullName: string;
  specializations: string | null;
  role: string;
  basePayPerWeek: number;
  dailyTarget: number;
  sssNumber?: string;
  tinNumber?: string;
  govId?: string;
  profilePictureUrl?: string;
  createdAt: string;
}

// Schedule API types
export interface ScheduleItem {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
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

export interface AppointmentItem {
  id: number;
  service: { name: string; price: number };
  staff: { full_name: string };
  start_time: string;
  end_time: string;
  status: string;
  review?: SubmitReviewRequest | null;
}

export interface Appointment {
  id: number;
  customer: { id: number; full_name: string };
  status: string;
  appointment_date: string;
  is_walk_in: boolean;
  items: AppointmentItem[];
  transactions?: {
    id: number;
    amount: number;
    payment_method: string;
    receipt_number: string;
    transaction_date: string;
  }[];
}

// Attendance API types
export interface UpdateAttendanceRequest {
  checkIn?: string | null;
  checkOut?: string | null;
  tardinessMinutes?: number;
  deductionAmount?: number;
}

export interface AttendanceRecord {
  id: number;
  staff_id: number;
  check_in: string | null;
  check_out: string | null;
  status: string;
  date: string;
  tardiness_minutes: number;
  deduction_amount: number;
  staff: { full_name: string };
}

// Review API types
export interface SubmitReviewRequest {
  appointmentItemId: number;
  rating: number;
  tags: string[];
  comment?: string;
}

export interface Review {
  id: number;
  rating: number;
  tags: string[];
  is_approved_for_public: boolean;
  created_at: string;
  customer: { full_name: string };
  staff: { full_name: string };
  appointment_item: { service: { name: string } };
}

// Payroll API types
export interface PayrollPeriod {
  id: number;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  total_salon_sales: number;
  _count: {
    payrolls: number;
  };
}

export interface PayrollRecord {
  staffId: number;
  fullName: string;
  commissionCount: number;
  totalCommission: number;
  attendanceCount: number;
  totalDeduction: number;
  basePay: number;
  netPay: number;
  commissions: number;
  deductions: number;
  net_pay: number;
  base_pay: number;
}

// Sales/Reports API types
export interface SalesStats {
  totalRevenue: number;
  transactionCount: number;
  onlineCount: number;
  walkInCount: number;
  serviceBreakdown: { name: string; amount: number; count: number }[];
  target: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Staff {
  id: number;
  fullName: string;
  specializations: string;
  role: string;
}

// Service API types
export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  category_id: number;
  is_active: boolean;
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  duration: number;
  category_id: number;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: number;
  duration?: number;
  category_id?: number;
  is_active?: boolean;
}

// Message API types
export interface Message {
  id: number;
  sender: {
    username: string;
    role: string;
  };
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// Receipt/Transaction types
export interface Transaction {
  id: number;
  amount: number;
  payment_method: string;
  receipt_number: string;
  transaction_date: string;
}

export interface AppointmentWithServices {
  id: number;
  customer?: { full_name: string };
  technician?: { full_name: string };
  services: {
    service: { name: string };
    price_at_booking?: number;
  }[];
  transactions: Transaction[];
}
