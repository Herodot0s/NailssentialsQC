import type { User } from './User';

// Auth API types
export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  password: string;
  confirmPassword?: string;
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
  email?: string;
  phone?: string;
  username: string;
  password?: string;
  specializations?: string;
  basePayPerWeek: number;
  dailyTarget: number;
  sssNumber?: string;
  pagIbigNumber?: string;
  profilePictureUrl?: string;
  isActive?: boolean;
  role?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
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
  pagIbigNumber?: string;
  profilePictureUrl?: string;
  password?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
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
  addons?: { addonId: number; quantity: number }[];
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
  scheduled_start: string | null;
  scheduled_end: string | null;
  tardiness_minutes: number;
  deduction_amount: number;
  notes: string | null;
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
  id?: number;
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
  period?: {
    start_date: string;
    end_date: string;
  };
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
  duration_minutes: number;
  category_id: number;
  is_active: boolean;
  image_url?: string | null;
  experience_description?: string | null;
  what_to_expect?: string | null;
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  duration_minutes: number;
  category_id: number;
  image_url?: string | null;
  experience_description?: string | null;
  what_to_expect?: string | null;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: number;
  duration_minutes?: number;
  category_id?: number;
  is_active?: boolean;
  is_popular?: boolean;
  image_url?: string | null;
  experience_description?: string | null;
  what_to_expect?: string | null;
}

// Customer API types
export interface UpdateCustomerProfileRequest {
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  profilePictureUrl?: string;
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
    service: { name: string; price: number };
    price_at_booking?: number;
  }[];
  transactions: Transaction[];
}

// Exhibit API types
export interface Exhibit {
  id: number;
  title: string;
  image_url: string;
  staff_id: number;
  service_id: number | null;
  is_active: boolean;
  created_at: string;
  artist?: {
    id: number;
    full_name: string;
  };
  service?: {
    id: number;
    name: string;
  };
}

// CMS Types

export interface SiteSettingsData {
  hero?: {
    tagline?: string;
    headline?: string;
    subheadline?: string;
    bg_image_url?: string;
    button_label?: string;
  };
  signature?: {
    label?: string;
    headline?: string;
    body?: string;
    link_label?: string;
    bg_image_url?: string;
  };
  footer?: {
    headline?: string;
    button_label?: string;
  };
  contact?: {
    phone?: string;
    address?: string;
    hours?: string;
    email?: string;
    maps_link?: string;
    facebook?: string;
    instagram?: string;
  };
}

export type SiteContentType = 'faq' | 'policy';

export interface SiteContent {
  id: number;
  type: SiteContentType;
  title: string;
  body: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveSettingsRequest {
  settings: Array<{ section: string; key: string; value: string }>;
}

export interface ServicePackageService {
  id: number;
  name: string;
  price: string;
  duration_minutes: number;
  category: { name: string };
}

export interface ServicePackage {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  display_order: number;
  valid_from: string | null;
  valid_until: string | null;
  max_redemptions: number | null;
  is_active: boolean;
  services: ServicePackageService[];
  bookings_count: number;
  services_total: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePackagePayload {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  display_order?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  max_redemptions?: number | null;
  is_active?: boolean;
  service_ids: number[];
}

export interface UpdatePackagePayload extends Partial<CreatePackagePayload> {}

// Analytics Types

export interface StaffPerformanceStat {
  staffId: number;
  fullName: string;
  revenue: number;
  commission: number;
  serviceCount: number;
  categoryBreakdown: Record<string, number>;
}

export interface RetentionTrendPoint {
  month: string;
  rate: number;
}

export interface TopCustomer {
  name: string;
  visitCount: number;
  lastVisit: string;
}

export interface RetentionData {
  retentionRate: number;
  totalCustomers: number;
  returningCustomers: number;
  newCustomers: number;
  trend: RetentionTrendPoint[];
  topCustomers: TopCustomer[];
}

export interface KpiSummaryData {
  todayRevenue: number;
  monthRevenue: number;
  activeStaff: number;
  monthAppointments: number;
  todayRevenueTrend: number | null;
  monthRevenueTrend: number | null;
  monthAppointmentsTrend: number | null;
}
