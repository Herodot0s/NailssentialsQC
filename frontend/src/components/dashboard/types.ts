import type { StaffMember, PayrollRecord, Review, AttendanceRecord, PayrollPeriod } from '@/types/api';

export interface StaffTableProps {
  staffMembers: StaffMember[];
  onStaffClick: (staff: StaffMember) => void;
}

export interface PayrollTableProps {
  payrollReport: PayrollRecord[];
  onPayrollRowClick: (record: PayrollRecord) => void;
  payrollPeriods: PayrollPeriod[];
  onLockPayroll: (id: number) => void;
}

export interface AttendanceLedgerProps {
  attendance: AttendanceRecord[];
  onUpdateAttendance: (id: number, status: string) => void;
}

export interface ReviewModerationProps {
  reviews: Review[];
  onModerateReview: (id: number, approved: boolean) => void;
}
