import { Appointment, AppointmentItem, Service, Prisma, PaymentMethod } from '@prisma/client';

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
  customer: {
    id: number;
    full_name: string;
    user: { email: string | null; phone: string | null };
  } | null;
  items: (AppointmentItem & {
    service: Service;
    staff: {
      id: number;
      full_name: string;
    };
  })[];
  transactions: {
    id: number;
    amount: Prisma.Decimal;
    payment_method: PaymentMethod;
    receipt_number: string | null;
    status: string;
  }[];
}

export interface GetAvailableSlotsQuery {
  date: string;
}

export interface CompleteAppointmentInput {
  paymentMethod: PaymentMethod;
}

export interface StaffMemberForDashboard {
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
