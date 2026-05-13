import type {
  SalesStats,
  StaffMember,
  PayrollRecord,
  PayrollPeriod,
  AttendanceRecord,
  Category,
  Review,
  ScheduleItem,
} from '@/types/api';

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
  staffMembers: StaffMember[];
  onUpdateAttendance: (id: number, status: string) => void;
}

export interface ReviewModerationProps {
  reviews: Review[];
  onModerateReview: (id: number, approved: boolean) => void;
}

export interface HistoricalData {
  date: string;
  total: number;
  categories: Record<string, number>;
  services: Record<string, number>;
}

export type ActiveView =
  | 'staff'
  | 'attendance'
  | 'deductions'
  | 'payroll'
  | 'payroll-setup'
  | 'reviews'
  | 'exhibits'
  | 'content'
  | 'packages'
  | 'advanced-analytics'
  | 'services'
  | 'messages'
  | 'customer-care'
  | 'performance'
  | 'service-history';

export interface ManagerSidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export interface OverviewViewProps {
  salesStats: SalesStats | null;
  historicalData: HistoricalData[];
  selectedCategory: string | null;
  onCategorySelect: (cat: string | null) => void;
  onCategoryReset: () => void;
  activeStaffCount: number;
  pendingReviewCount: number;
  appointments: any[];
  staffMembers: StaffMember[];
}

export interface DeductionsViewProps {
  staffMembers: StaffMember[];
  deductionForm: { staffId: string; type: string; amount: string; notes: string };
  onFormChange: (form: DeductionsViewProps['deductionForm']) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface StaffDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
  onStaffChange: (staff: StaffMember) => void;
  schedule: ScheduleItem[];
  categories: Category[];
  onEditShift: (dayOfWeek: number) => void;
  onUpdateBaseline: () => void;
}

export interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  form: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    specializations: string;
    basePayPerWeek: string;
    dailyTarget: string;
    sssNumber: string;
    pagIbigNumber: string;
    profilePictureUrl: string;
  };
  onFormChange: (form: AddStaffDialogProps['form']) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface ShiftEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDay: number | null;
  form: { start: string; end: string; isActive: boolean };
  onFormChange: (form: ShiftEditDialogProps['form']) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface PayrollRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: { startDate: string; endDate: string; totalSalonSales: string };
  onFormChange: (form: PayrollRunDialogProps['form']) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface DeductionEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMembers: StaffMember[];
  form: { staffId: string; type: string; amount: string; notes: string };
  onFormChange: (form: DeductionEntryDialogProps['form']) => void;
  onSubmit: (e: React.FormEvent) => void;
}
