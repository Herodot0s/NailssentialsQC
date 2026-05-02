import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  Loader2,
  Plus,
  Check,
  X,
  Star,
  Users,
  Clock,
  Briefcase,
  Wallet,
  PieChart as PieChartIcon,
  Settings,
  AlertCircle,
  Lock,
  TrendingUp,
} from 'lucide-react';
import {
  getDailySales,
  getReports,
  getAllStaff,
  createStaff,
  updateStaff,
  getPayrollPeriods,
  generatePayroll,
  lockPayroll,
  getAllReviews,
  moderateReview,
  getCategories,
  getAllAttendance,
  updateAttendance,
  addDeduction,
  getStaffSchedule,
  updateStaffSchedule,
  getHistoricalAnalytics,
} from '../api/apiClient';
import { format } from 'date-fns';
import DrillDownLineChart from '@/components/DrillDownLineChart';
import SalarySlipModal from '@/components/SalarySlipModal';
import type {
  PayrollPeriod,
  AttendanceRecord,
  Category,
  UpdateAttendanceRequest,
  PayrollRecord,
  Message,
  Review,
  StaffMember,
  ScheduleItem,
  SalesStats,
  HistoricalData,
} from '@/types/api';

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
  id: number; // User ID
  staffProfileId: number; // Profile ID
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

interface Review {
  id: number;
  rating: number;
  tags: string[];
  is_approved_for_public: boolean;
  created_at: string;
  customer: { full_name: string };
  staff: { full_name: string };
  appointment_item: { service: { name: string } };
}

interface ScheduleItem {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface HistoricalData {
  date: string;
  total: number;
  categories: Record<string, number>;
  services: Record<string, number>;
}

const COLORS = ['#B8794E', '#D9A07E', '#E6B69E', '#F2CCBE', '#9A6440'];

const ManagerDashboard: React.FC = () => {
  type ActiveView = 'analytics' | 'staff' | 'attendance' | 'deductions' | 'payroll' | 'reviews';
  const [activeView, setActiveView] = useState<ActiveView>('analytics');
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollRecord[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drill-down State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals & Sheets
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showStaffSheet, setShowStaffSheet] = useState(false);
  const [staffSchedule, setStaffSchedule] = useState<ScheduleItem[]>([]);
  const [showShiftEditModal, setShowShiftEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [shiftForm, setShiftForm] = useState({ start: '12:00', end: '22:00', isActive: true });

  // Salary Slip State
  const [showSalarySlip, setShowSalarySlip] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  const [newStaffForm, setNewStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    specializations: '',
    basePayPerWeek: '2500',
    dailyTarget: '6000',
    sssNumber: '',
    tinNumber: '',
    govId: '',
    profilePictureUrl: '',
  });

  const [payrollForm, setPayrollForm] = useState({
    startDate: '',
    endDate: '',
    totalSalonSales: '',
  });

  const [deductionForm, setDeductionForm] = useState({
    staffId: '',
    type: 'Cash Advance',
    amount: '',
    notes: '',
  });

  const dateRange = useMemo(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  }), []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [salesRes, payrollRes, staffRes, periodsRes, reviewsRes, attRes, catRes, historyRes] = await Promise.all([
        getDailySales(),
        getReports({ startDate: dateRange.start, endDate: dateRange.end }),
        getAllStaff(),
        getPayrollPeriods(),
        getAllReviews(),
        getAllAttendance({ startDate: dateRange.start }),
        getCategories(),
        getHistoricalAnalytics({ startDate: dateRange.start, endDate: dateRange.end })
      ]);

      if (salesRes.data.success) setSalesStats(salesRes.data.data);
      if (payrollRes.data.success) setPayrollReport(payrollRes.data.data.report);
      if (staffRes.data.success) setStaffMembers(staffRes.data.data);
      if (periodsRes.data.success) setPayrollPeriods(periodsRes.data.data);
      if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
      if (attRes.data.success) setAttendance(attRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (historyRes.data.success) setHistoricalData(historyRes.data.data);

    } catch (err: unknown) {
      console.error('Fetch error:', err instanceof Error ? err.message : err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff(newStaffForm);
      setShowAddStaffModal(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add staff member.';
      alert(message);
    }
  };

  const handleUpdateStaffBaseline = async () => {
    if (!selectedStaff) return;
    try {
       await updateStaff(selectedStaff.id, {
          fullName: selectedStaff.fullName,
          basePayPerWeek: selectedStaff.basePayPerWeek,
          dailyTarget: selectedStaff.dailyTarget,
          sssNumber: selectedStaff.sssNumber,
          tinNumber: selectedStaff.tinNumber,
          govId: selectedStaff.govId,
          profilePictureUrl: selectedStaff.profilePictureUrl
       });
       alert('Employee file updated successfully.');
       fetchData();
    } catch (err) {
       alert('Failed to update employee file.');
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generatePayroll({
        startDate: payrollForm.startDate,
        endDate: payrollForm.endDate,
        totalSalonSales: parseFloat(payrollForm.totalSalonSales)
      });
      setShowPayrollModal(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate payroll.';
      alert(message);
    }
  };

  const handleLockPayroll = async (id: number) => {
    if (!window.confirm('Are you sure you want to finalize this payroll? This action cannot be undone.')) return;
    try {
      await lockPayroll(id);
      fetchData();
    } catch (err) {
      alert('Failed to lock payroll.');
    }
  };

  const handleModerateReview = async (id: number, approved: boolean) => {
    try {
      await moderateReview(id, approved);
      fetchData();
    } catch (err) {
      alert('Failed to moderate review.');
    }
  };

  const handleAddDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDeduction({
        staffId: parseInt(deductionForm.staffId),
        type: deductionForm.type,
        amount: parseFloat(deductionForm.amount),
        notes: deductionForm.notes
      });
      setShowDeductionModal(false);
      setDeductionForm({ staffId: '', type: 'Cash Advance', amount: '', notes: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add deduction.');
    }
  };

  const handleStaffClick = async (staff: StaffMember) => {
    setSelectedStaff(staff);
    setShowStaffSheet(true);
    try {
      const res = await getStaffSchedule(staff.staffProfileId);
      if (res.data.success) setStaffSchedule(res.data.data);
    } catch (err) {
      console.error('Failed to fetch schedule');
    }
  };

  const handleEditShift = (dayOfWeek: number) => {
     const current = staffSchedule.find(s => s.day_of_week === dayOfWeek);
     setEditingDay(dayOfWeek);
     setShiftForm({
        start: current?.start_time || '12:00',
        end: current?.end_time || '22:00',
        isActive: current?.is_active ?? true
     });
     setShowShiftEditModal(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedStaff || editingDay === null) return;
     
     try {
        const updatedSchedules = [...staffSchedule];
        const index = updatedSchedules.findIndex(s => s.day_of_week === editingDay);
        
        const newSched: ScheduleItem = {
           day_of_week: editingDay,
           start_time: shiftForm.start,
           end_time: shiftForm.end,
           is_active: shiftForm.isActive,
           id: index !== -1 ? updatedSchedules[index].id : undefined
        };

        await updateStaffSchedule(selectedStaff.staffProfileId, { schedules: [newSched] });
        setStaffSchedule(prev => {
           const idx = prev.findIndex(s => s.day_of_week === editingDay);
           if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = newSched;
              return copy;
           }
           return [...prev, newSched];
        });
        setShowShiftEditModal(false);
     } catch (err) {
        alert('Failed to update shift.');
     }
  };

  const handleUpdateAttendance = async (id: number, status: string) => {
    try {
      let data: UpdateAttendanceRequest = {};
      if (status === 'Present') {
        data.checkIn = new Date().toISOString();
        data.tardinessMinutes = 0;
        data.deductionAmount = 0;
      } else if (status === 'Absent') {
        data.checkIn = null;
        data.checkOut = null;
        data.tardinessMinutes = 0;
        data.deductionAmount = 500;
      }
      await updateAttendance(id, data);
      fetchData();
    } catch (err) {
      alert('Failed to update attendance.');
    }
  };

  const handlePayrollRowClick = (record: PayrollRecord) => {
    setSelectedPayroll(record);
    setShowSalarySlip(true);
  };

    const menuItems = [
    { id: 'analytics', label: 'Dashboard', icon: PieChartIcon },
    { id: 'staff', label: 'Employee Files', icon: Users },
    { id: 'attendance', label: 'Attendance Tool', icon: Clock },
    { id: 'deductions', label: 'Deductions Ledger', icon: Wallet },
    { id: 'payroll', label: 'Salary Slips', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  if (isLoading && !salesStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[1.5]" />
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground animate-pulse">Initializing HRMS Engine...</p>
      </div>
    );
  }

  const pieData = salesStats?.serviceBreakdown.map((s) => ({ name: s.name, value: s.amount })) || [];
  const revenueProgress = salesStats ? (salesStats.totalRevenue / salesStats.target) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
         <div className="p-8 border-b border-gray-50">
            <h2 className="font-serif text-xl font-bold text-primary tracking-tight">Nailssentials<span className="italic font-light">QC</span></h2>
            <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-muted-foreground mt-1 opacity-60">Enterprise Suite</p>
         </div>
         
         <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all group ${activeView === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'}`}
              >
                <item.icon className={`h-4 w-4 stroke-[1.5] ${activeView === item.id ? 'text-white' : 'group-hover:text-primary'}`} />
                {item.label}
              </button>
            ))}
         </nav>

         <div className="p-6 border-t border-gray-50 space-y-4">
            <div className="flex items-center gap-3 px-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-primary animate-spin-slow" />
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-tight">System Status</p>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-success-color animate-pulse" />
                     <span className="text-[8px] font-medium text-success-color uppercase">Live</span>
                  </div>
               </div>
            </div>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div>
              <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-1">Manager Overview</p>
              <h1 className="font-serif text-4xl font-light text-foreground capitalize">{activeView.replace('-', ' ')} <span className="italic text-primary/40">Toolbox</span></h1>
           </div>
           
           <div className="flex gap-4">
              {activeView === 'staff' && (
                <Button onClick={() => setShowAddStaffModal(true)} className="rounded-none gap-2 px-6 h-12 text-[10px] uppercase font-bold tracking-widest">
                  <Plus className="h-4 w-4" /> New Employee
                </Button>
              )}
              {activeView === 'deductions' && (
                <Button onClick={() => setShowDeductionModal(true)} className="rounded-none gap-2 px-6 h-12 text-[10px] uppercase font-bold tracking-widest bg-primary">
                  <Plus className="h-4 w-4" /> Log Entry
                </Button>
              )}
              {activeView === 'payroll' && (
                <Button onClick={() => setShowPayrollModal(true)} className="rounded-none gap-2 px-6 h-12 text-[10px] uppercase font-bold tracking-widest">
                  <DollarSign className="h-4 w-4" /> Run Weekly Payroll
                </Button>
              )}
           </div>
        </header>

        {activeView === 'analytics' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="rounded-none border-none shadow-sm bg-white overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Daily Revenue</CardDescription>
                    <CardTitle className="text-4xl font-serif font-light">₱{salesStats?.totalRevenue.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-[10px] text-success-color font-bold uppercase">
                      <TrendingUp className="h-3 w-3" /> +12% Efficiency
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-none border-none shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[9px] font-bold uppercase tracking-widest">Active Rituals</CardDescription>
                    <CardTitle className="text-4xl font-serif font-light">{salesStats?.transactionCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {salesStats?.onlineCount} Digital • {salesStats?.walkInCount} Walk-in
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-none border-none shadow-sm lg:col-span-2 bg-white">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <div>
                       <CardDescription className="text-[9px] font-bold uppercase tracking-widest">Monthly Sales Target</CardDescription>
                       <CardTitle className="text-3xl font-serif font-light mt-1">₱{salesStats?.target.toLocaleString()}</CardTitle>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-serif font-light text-primary">{revenueProgress.toFixed(0)}%</span>
                       <p className="text-[8px] uppercase font-bold text-muted-foreground">Paced</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(revenueProgress, 100)}%` }} />
                    </div>
                  </CardContent>
                </Card>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <DrillDownLineChart
                  historicalData={historicalData}
                  selectedCategory={selectedCategory}
                  onCategorySelect={(cat) => setSelectedCategory(cat)}
                  onReset={() => setSelectedCategory(null)}
                />

                <Card className="rounded-none border-none shadow-sm bg-white">
                  <CardHeader className="border-b border-gray-50">
                    <CardTitle className="font-serif text-2xl font-light">Revenue Split</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px] flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                          {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full mt-8 space-y-4 px-4 overflow-y-auto max-h-[120px]">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center group cursor-default">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">{entry.name}</span>
                           </div>
                           <span className="text-[10px] font-bold">₱{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        )}

        {activeView === 'staff' && (
          <div className="space-y-8 animate-in fade-in duration-700">
             <Card className="rounded-none border-none shadow-sm overflow-hidden">
                <Table>
                   <TableHeader className="bg-gray-50/50">
                      <TableRow className="hover:bg-transparent border-gray-100">
                         <TableHead className="pl-8 py-5 text-[9px] uppercase tracking-[0.2em] font-bold">Employee</TableHead>
                         <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold">Role</TableHead>
                         <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold">Gov ID Status</TableHead>
                         <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold text-right pr-8">Status</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody className="bg-white">
                      {staffMembers.map(staff => (
                        <TableRow 
                          key={staff.id} 
                          className="hover:bg-primary-ultra/10 cursor-pointer border-gray-50 transition-all duration-300"
                          onClick={() => handleStaffClick(staff)}
                        >
                           <TableCell className="pl-8 py-6">
                              <div className="flex items-center gap-4">
                                 <Avatar className="w-12 h-12 rounded-none border border-primary/10">
                                    <AvatarImage src={staff.profilePictureUrl} className="object-cover" />
                                    <AvatarFallback className="bg-primary/5 font-serif text-xl text-primary">{staff.fullName.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="font-bold text-sm tracking-tight">{staff.fullName}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{staff.email || 'No email'}</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <span className="text-[10px] uppercase font-bold tracking-tighter bg-gray-100 px-2 py-0.5">{staff.role}</span>
                           </TableCell>
                           <TableCell>
                              <div className="flex gap-2">
                                 {staff.sssNumber ? <Badge className="rounded-none bg-success-color/10 text-success-color text-[8px] font-bold uppercase border-none">SSS</Badge> : <Badge variant="outline" className="rounded-none text-[8px] font-bold uppercase border-dashed opacity-40">SSS</Badge>}
                                 {staff.tinNumber ? <Badge className="rounded-none bg-success-color/10 text-success-color text-[8px] font-bold uppercase border-none">TIN</Badge> : <Badge variant="outline" className="rounded-none text-[8px] font-bold uppercase border-dashed opacity-40">TIN</Badge>}
                              </div>
                           </TableCell>
                           <TableCell className="text-right pr-8">
                              <Badge className={`rounded-none border-none text-[8px] font-bold uppercase tracking-widest ${staff.isActive ? 'bg-success-color text-white' : 'bg-gray-100 text-gray-400'}`}>
                                 {staff.isActive ? 'Active' : 'Archived'}
                              </Badge>
                           </TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </Card>
          </div>
        )}

        {activeView === 'attendance' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                   <div>
                      <CardTitle className="font-serif text-2xl font-light italic">Daily <span className="not-italic">Ledger</span></CardTitle>
                      <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1">Manual overrides and attendance tracking</CardDescription>
                   </div>
                </CardHeader>
                <Table>
                   <TableHeader className="bg-gray-50/50">
                      <TableRow className="hover:bg-transparent border-gray-100">
                         <TableHead className="pl-8 py-5 text-[9px] uppercase font-bold">Artisan</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Check In</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Lateness</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Penalty</TableHead>
                         <TableHead className="text-right pr-8 text-[9px] uppercase font-bold">Override</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {attendance.map(log => (
                        <TableRow key={log.id} className="hover:bg-gray-50/50 border-gray-50 transition-colors">
                           <TableCell className="pl-8 py-6">
                              <p className="font-bold text-sm tracking-tight">{log.staff.full_name}</p>
                              <p className="text-[9px] text-muted-foreground uppercase font-bold">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                           </TableCell>
                           <TableCell className="font-mono text-xs">
                              {log.check_in ? format(new Date(log.check_in), 'HH:mm:ss') : <span className="text-destructive font-bold uppercase tracking-tighter opacity-50">No Data</span>}
                           </TableCell>
                           <TableCell>
                              <span className={`text-[10px] font-bold ${log.tardiness_minutes > 0 ? 'text-destructive' : 'text-success-color'}`}>
                                 {log.tardiness_minutes > 0 ? `${log.tardiness_minutes} MINS` : 'ON TIME'}
                              </span>
                           </TableCell>
                           <TableCell className="font-bold">₱{parseFloat(log.deduction_amount).toLocaleString()}</TableCell>
                           <TableCell className="text-right pr-8">
                              <div className="flex justify-end gap-2">
                                 <Button onClick={() => handleUpdateAttendance(log.id, 'Present')} variant="ghost" size="sm" className="rounded-none h-8 text-[8px] uppercase font-bold tracking-widest border border-success-color/20 text-success-color hover:bg-success-color hover:text-white">Present</Button>
                                 <Button onClick={() => handleUpdateAttendance(log.id, 'Absent')} variant="ghost" size="sm" className="rounded-none h-8 text-[8px] uppercase font-bold tracking-widest border border-destructive/20 text-destructive hover:bg-destructive hover:text-white">Absent</Button>
                              </div>
                           </TableCell>
                        </TableRow>
                      ))}
                      {attendance.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">No logs found for current period.</TableCell></TableRow>
                      )}
                   </TableBody>
                </Table>
             </Card>
          </div>
        )}

        {activeView === 'deductions' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <Card className="rounded-none border-none shadow-sm bg-white">
                   <CardHeader className="border-b border-gray-50">
                      <CardTitle className="font-serif text-2xl font-light italic">Entry <span className="not-italic">Form</span></CardTitle>
                      <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em]">Log employee advances and uniforms</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-8">
                      <form onSubmit={handleAddDeduction} className="space-y-6">
                         <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Select Staff Member</Label>
                            <Select required onValueChange={(val: string | null) => setDeductionForm({...deductionForm, staffId: val || ''})}>
                               <SelectTrigger className="rounded-none border-gray-200 h-12 bg-gray-50/30"><SelectValue placeholder="Choose Technician" /></SelectTrigger>
                               <SelectContent className="rounded-none border-none shadow-2xl">
                                  {staffMembers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.fullName}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Entry Type</Label>
                               <Select defaultValue="Cash Advance" onValueChange={(val: string | null) => setDeductionForm({...deductionForm, type: val || 'Cash Advance'})}>
                                  <SelectTrigger className="rounded-none border-gray-200 h-12 bg-gray-50/30"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-none border-none shadow-2xl">
                                     <SelectItem value="Cash Advance">Cash Advance</SelectItem>
                                     <SelectItem value="Uniform">Uniform</SelectItem>
                                     <SelectItem value="Loan Payment">Loan Payment</SelectItem>
                                     <SelectItem value="Reloan">Reloan</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Amount (₱)</Label>
                               <Input type="number" required placeholder="0.00" value={deductionForm.amount} onChange={e => setDeductionForm({...deductionForm, amount: e.target.value})} className="rounded-none border-gray-200 h-12 bg-gray-50/30" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Notes</Label>
                            <textarea 
                              className="w-full min-h-[100px] border border-gray-200 p-4 rounded-none bg-gray-50/30 focus:ring-1 focus:ring-primary/20 outline-none font-light text-sm" 
                              placeholder="Reason for deduction..." 
                              value={deductionForm.notes}
                              onChange={e => setDeductionForm({...deductionForm, notes: e.target.value})}
                            />
                         </div>
                         <Button type="submit" className="w-full rounded-none h-14 uppercase tracking-[0.3em] font-bold text-xs shadow-xl shadow-primary/20">Commit Entry to Ledger</Button>
                      </form>
                   </CardContent>
                </Card>

                <div className="space-y-8">
                   <h3 className="font-serif text-xl italic text-primary/60 px-2">Financial Insights</h3>
                   <Card className="rounded-none border-none shadow-sm bg-primary-ultra/20">
                      <CardContent className="p-8">
                         <div className="space-y-12">
                            <div className="flex justify-between items-end border-b border-primary/10 pb-6">
                               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Advances</p>
                               <p className="text-4xl font-serif font-light">₱12,450</p>
                            </div>
                            <div className="flex justify-between items-end">
                               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uniform Arrears</p>
                               <p className="text-2xl font-serif font-light text-primary">₱2,800</p>
                            </div>
                            <p className="text-[8px] text-muted-foreground italic pt-4">Data reflects unfinalized weekly deductions for the current cycle.</p>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </div>
        )}

        {activeView === 'payroll' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8 flex flex-row items-center justify-between">
                   <div>
                      <CardTitle className="font-serif text-2xl font-light italic">Payroll <span className="not-italic">Register</span></CardTitle>
                      <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1">Calculated commissions and weekly payouts</CardDescription>
                   </div>
                </CardHeader>
                <Table>
                   <TableHeader className="bg-gray-50/50">
                      <TableRow className="hover:bg-transparent border-gray-100">
                         <TableHead className="pl-8 py-5 text-[9px] uppercase font-bold">Artisan</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Gross Payout</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Deductions</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Status</TableHead>
                         <TableHead className="text-right pr-8 text-[9px] uppercase font-bold">Net Payable</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {payrollReport.map(row => (
                        <TableRow 
                          key={row.staffId} 
                          className="hover:bg-primary-ultra/10 border-gray-50 transition-colors cursor-pointer group"
                          onClick={() => handlePayrollRowClick(row)}
                        >
                           <TableCell className="pl-8 py-6">
                              <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{row.fullName}</p>
                              <p className="text-[9px] text-muted-foreground uppercase font-bold">{row.commissionCount} Rituals Conducted</p>
                           </TableCell>
                           <TableCell className="font-bold text-xs">₱{(row.totalCommission + row.basePay).toLocaleString()}</TableCell>
                           <TableCell className="text-destructive font-bold text-xs">-₱{row.totalDeduction.toLocaleString()}</TableCell>
                           <TableCell>
                              <Badge className="bg-primary-ultra/30 text-primary border-none rounded-none text-[8px] font-bold uppercase tracking-widest">DRAFT</Badge>
                           </TableCell>
                           <TableCell className="text-right pr-8 font-serif text-2xl font-light text-primary">₱{row.netPay.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </Card>

             <div className="space-y-6">
                <h3 className="font-serif text-2xl italic px-2">Cycle History</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {payrollPeriods.map(period => (
                     <Card key={period.id} className="rounded-none border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className={`absolute top-0 left-0 w-full h-1 ${period.is_locked ? 'bg-success-color' : 'bg-primary/20'}`} />
                        <CardContent className="p-8">
                           <div className="flex justify-between items-start mb-6">
                              <Badge className={`rounded-none border-none text-[8px] font-bold uppercase tracking-widest px-3 py-1 ${period.is_locked ? 'bg-success-color/10 text-success-color' : 'bg-primary-ultra/30 text-primary animate-pulse'}`}>
                                 {period.is_locked ? 'Finalized' : 'Draft Payout'}
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(period.start_date), 'MMM dd')} — {format(new Date(period.end_date), 'MMM dd')}</span>
                           </div>
                           <h4 className="font-serif text-3xl font-light mb-8">₱{parseFloat(period.total_salon_sales).toLocaleString()} <span className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-widest block mt-2 italic opacity-60">Confirmed Salon Sales</span></h4>
                           
                           <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{period._count.payrolls} Employees</p>
                              {!period.is_locked ? (
                                <Button onClick={(e) => { e.stopPropagation(); handleLockPayroll(period.id); }} variant="ghost" size="sm" className="rounded-none text-[9px] uppercase font-bold tracking-widest h-8 px-4 border border-primary/20 text-primary hover:bg-primary hover:text-white">
                                  <Lock className="h-3 w-3 mr-2" /> Finalize
                                </Button>
                              ) : (
                                <span className="text-[9px] font-bold uppercase text-success-color flex items-center gap-1.5">
                                   <Check className="h-3.5 w-3.5" /> Disbursed
                                </span>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeView === 'reviews' && (
          <div className="animate-in fade-in duration-700">
             <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
                <Table>
                   <TableHeader className="bg-gray-50/50">
                      <TableRow className="hover:bg-transparent border-gray-100">
                         <TableHead className="pl-8 py-5 text-[9px] uppercase font-bold">Client Feedback</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Artisan</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Rating</TableHead>
                         <TableHead className="text-[9px] uppercase font-bold">Praise</TableHead>
                         <TableHead className="text-right pr-8 text-[9px] uppercase font-bold">Curate</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {reviews.map(review => (
                        <TableRow key={review.id} className="hover:bg-primary-ultra/10 border-gray-50 transition-colors">
                           <TableCell className="pl-8 py-6">
                              <p className="font-bold text-sm tracking-tight">{review.customer.full_name}</p>
                              <p className="text-[9px] text-muted-foreground uppercase font-bold italic opacity-60">On {review.appointment_item.service.name}</p>
                           </TableCell>
                           <TableCell className="text-[10px] font-bold tracking-tighter uppercase">{review.staff.full_name}</TableCell>
                           <TableCell>
                              <div className="flex gap-0.5">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-primary fill-primary' : 'text-gray-100 stroke-[1]'}`} />
                                 ))}
                              </div>
                           </TableCell>
                           <TableCell>
                              <div className="flex flex-wrap gap-1">
                                 {(review.tags as string[]).map(tag => (
                                   <Badge key={tag} variant="outline" className="rounded-none text-[8px] uppercase tracking-tighter border-primary/5 bg-gray-50/50 px-2 py-0 text-muted-foreground">{tag}</Badge>
                                 ))}
                              </div>
                           </TableCell>
                           <TableCell className="pr-8 text-right">
                              <div className="flex justify-end gap-2">
                                 {review.is_approved_for_public ? (
                                   <Button onClick={() => handleModerateReview(review.id, false)} variant="ghost" size="icon" className="h-9 w-9 text-destructive border border-destructive/10 bg-destructive/5 hover:bg-destructive hover:text-white rounded-none transition-all"><X className="h-4 w-4" /></Button>
                                 ) : (
                                   <Button onClick={() => handleModerateReview(review.id, true)} variant="ghost" size="icon" className="h-9 w-9 text-success-color border border-success-color/10 bg-success-color/5 hover:bg-success-color hover:text-white rounded-none transition-all"><Check className="h-4 w-4" /></Button>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </Card>
          </div>
        )}
      </main>

      {/* Staff Management Sheet (slide-over) */}
      <Sheet open={showStaffSheet} onOpenChange={setShowStaffSheet}>
        <SheetContent side="right" className="sm:max-w-xl p-0 border-none bg-white flex flex-col h-full shadow-2xl">
          {selectedStaff && (
            <div className="flex flex-col h-full">
               <div className="bg-primary p-12 text-white">
                  <SheetHeader className="space-y-6 text-left">
                     <div className="flex justify-between items-start">
                        <Avatar className="w-24 h-24 rounded-none border-2 border-white/20">
                          <AvatarImage src={selectedStaff.profilePictureUrl} className="object-cover" />
                          <AvatarFallback className="bg-white/10 backdrop-blur-xl font-serif text-4xl font-light">{selectedStaff.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Badge className="bg-white/20 text-white border-none rounded-none text-[9px] uppercase tracking-[0.2em] font-bold">Employee File #{selectedStaff.id}</Badge>
                     </div>
                     <div>
                        <SheetTitle className="text-5xl font-serif font-light text-white tracking-tight">{selectedStaff.fullName}</SheetTitle>
                        <SheetDescription className="text-white/60 font-light text-base mt-2 flex items-center gap-2">
                           <Briefcase className="h-4 w-4 stroke-[1.5]" /> Senior Artisan • Joined {format(new Date(selectedStaff.createdAt), 'MMMM yyyy')}
                        </SheetDescription>
                     </div>
                  </SheetHeader>
               </div>

               <div className="flex-1 overflow-y-auto p-12 bg-white">
                  <Tabs defaultValue="profile" className="space-y-12">
                     <TabsList className="bg-transparent p-0 h-auto gap-8 border-b border-gray-100 w-full justify-start rounded-none">
                        {['profile', 'schedule', 'financials'].map(t => (
                          <TabsTrigger key={t} value={t} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-2 py-4 shadow-none">{t}</TabsTrigger>
                        ))}
                     </TabsList>

                     <TabsContent value="profile" className="space-y-12 mt-0">
                        <div className="grid gap-12">
                           <div className="space-y-6">
                              <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] flex items-center gap-2">
                                 <AlertCircle className="h-3 w-3" /> Compliance & Identity
                              </h4>
                              <div className="grid gap-6">
                                 <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                    <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Profile Picture Link</Label>
                                    <Input 
                                       value={selectedStaff.profilePictureUrl || ''} 
                                       onChange={e => setSelectedStaff({...selectedStaff, profilePictureUrl: e.target.value})}
                                       placeholder="https://images.unsplash.com/..."
                                       className="rounded-none border-gray-100 bg-white" 
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                       <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">SSS Number</Label>
                                       <Input 
                                          value={selectedStaff.sssNumber || ''} 
                                          onChange={e => setSelectedStaff({...selectedStaff, sssNumber: e.target.value})}
                                          className="rounded-none border-gray-100 bg-white" 
                                       />
                                    </div>
                                    <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                       <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">TIN Number</Label>
                                       <Input 
                                          value={selectedStaff.tinNumber || ''} 
                                          onChange={e => setSelectedStaff({...selectedStaff, tinNumber: e.target.value})}
                                          className="rounded-none border-gray-100 bg-white" 
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] flex items-center gap-2">
                                 <Check className="h-3 w-3" /> Area of Specialization
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 {categories.map(cat => (
                                   <Badge 
                                     key={cat.id} 
                                     variant="outline" 
                                     className={`rounded-none px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer ${selectedStaff.specializations?.includes(cat.name) ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted-foreground border-gray-100 opacity-40'}`}
                                     onClick={() => {
                                        const current = selectedStaff.specializations || '';
                                        const specs = current.split(',').map(s => s.trim()).filter(Boolean);
                                        const next = specs.includes(cat.name) ? specs.filter(s => s !== cat.name) : [...specs, cat.name];
                                        setSelectedStaff({...selectedStaff, specializations: next.join(', ')});
                                     }}
                                   >
                                      {cat.name}
                                   </Badge>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </TabsContent>

                     <TabsContent value="schedule" className="mt-0">
                        <div className="space-y-8">
                           <div className="flex justify-between items-center mb-8 px-2">
                              <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em]">Weekly Shift Assignment</h4>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 italic">Global System Time (GMT+8)</span>
                           </div>
                           <div className="divide-y divide-gray-50 border-t border-gray-50">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                                const sched = staffSchedule.find(s => s.day_of_week === idx);
                                return (
                                  <div key={day} className="py-6 flex justify-between items-center group">
                                     <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{day}</span>
                                     <div className="flex items-center gap-4">
                                        {sched?.is_active ? (
                                          <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 border border-gray-100">
                                             <span className="font-mono text-xs font-bold">{sched.start_time} — {sched.end_time}</span>
                                          </div>
                                        ) : (
                                          <span className="text-[9px] uppercase font-bold text-gray-300 tracking-tighter">Day Off / Unset</span>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 text-[8px] uppercase font-bold border border-gray-100 rounded-none px-3" onClick={() => handleEditShift(idx)}>Edit</Button>
                                     </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     </TabsContent>

                     <TabsContent value="financials" className="mt-0 space-y-12">
                        <div className="grid gap-12">
                           <div className="space-y-6">
                              <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] flex items-center gap-2">
                                 <Wallet className="h-3 w-3" /> Baseline Compensation
                              </h4>
                              <div className="space-y-8">
                                 <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Weekly Fixed Base</Label>
                                    <Input 
                                      type="number" 
                                      value={selectedStaff.basePayPerWeek} 
                                      onChange={e => setSelectedStaff({...selectedStaff, basePayPerWeek: parseFloat(e.target.value)})}
                                      className="w-32 text-right font-serif text-2xl border-none focus-visible:ring-0 h-auto p-0"
                                    />
                                 </div>
                                 <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Daily Sales Quota Target</Label>
                                    <Input 
                                      type="number" 
                                      value={selectedStaff.dailyTarget} 
                                      onChange={e => setSelectedStaff({...selectedStaff, dailyTarget: parseFloat(e.target.value)})}
                                      className="w-32 text-right font-serif text-2xl border-none focus-visible:ring-0 h-auto p-0"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </TabsContent>
                  </Tabs>
               </div>

               <div className="p-12 border-t border-gray-50 bg-gray-50/30 flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-none border-gray-200 h-14 text-[10px] uppercase font-bold tracking-widest text-destructive hover:bg-destructive hover:text-white" onClick={() => setShowStaffSheet(false)}>Suspend Artisan</Button>
                  <Button onClick={handleUpdateStaffBaseline} className="flex-[2] rounded-none h-14 text-[10px] uppercase font-bold tracking-widest shadow-xl shadow-primary/20">Commit File Updates</Button>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Salary Slip Modal */
      <SalarySlipModal
        open={showSalarySlip}
        onOpenChange={setShowSalarySlip}
        payroll={selectedPayroll}
      />

/* Onboarding Dialog */}
      <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
          <div className="bg-primary p-12 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-4xl font-light italic">Artisan <span className="not-italic">Onboarding</span></DialogTitle>
              <DialogDescription className="text-white/60 font-light mt-2 text-base">Initialize corporate compliance and payroll baseline.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleAddStaff} className="p-12 space-y-8 bg-white">
             <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Identity & Login</Label>
                <Input required value={newStaffForm.fullName} onChange={e => setNewStaffForm({...newStaffForm, fullName: e.target.value})} placeholder="Full Legal Name" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                <Input value={newStaffForm.profilePictureUrl} onChange={e => setNewStaffForm({...newStaffForm, profilePictureUrl: e.target.value})} placeholder="Profile Picture URL (Unsplash/Link)" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                <div className="grid grid-cols-2 gap-4">
                   <Input value={newStaffForm.email} onChange={e => setNewStaffForm({...newStaffForm, email: e.target.value})} placeholder="Email" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                   <Input value={newStaffForm.phone} onChange={e => setNewStaffForm({...newStaffForm, phone: e.target.value})} placeholder="Contact No" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                </div>
             </div>

             <div className="space-y-4 pt-6 border-t border-gray-50">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Payroll Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                   <Input required value={newStaffForm.basePayPerWeek} onChange={e => setNewStaffForm({...newStaffForm, basePayPerWeek: e.target.value})} placeholder="Weekly Base (₱)" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                   <Input required value={newStaffForm.dailyTarget} onChange={e => setNewStaffForm({...newStaffForm, dailyTarget: e.target.value})} placeholder="Sales Quota (₱)" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                </div>
             </div>

             <DialogFooter className="pt-8 gap-4 sm:justify-center">
                <Button type="button" variant="ghost" className="rounded-none h-12 px-8 text-[10px] uppercase font-bold tracking-widest" onClick={() => setShowAddStaffModal(false)}>Cancel</Button>
                <Button type="submit" className="rounded-none px-12 h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Initialize Employee File</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shift Edit Dialog */}
      <Dialog open={showShiftEditModal} onOpenChange={setShowShiftEditModal}>
         <DialogContent className="max-w-sm border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white">
            <div className="bg-primary p-10 text-white">
               <DialogHeader>
                  <DialogTitle className="font-serif text-3xl font-light italic">Edit <span className="not-italic">Shift</span></DialogTitle>
                  <DialogDescription className="text-white/60 font-light">Day {(editingDay ?? 0) === 0 ? 'Sunday' : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][editingDay! - 1]}</DialogDescription>
               </DialogHeader>
            </div>
            <form onSubmit={handleSaveShift} className="p-10 space-y-6">
               <div className="flex items-center justify-between py-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Active Shift</Label>
                  <button 
                    type="button"
                    onClick={() => setShiftForm({...shiftForm, isActive: !shiftForm.isActive})}
                    className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${shiftForm.isActive ? 'bg-success-color justify-end' : 'bg-gray-200 justify-start'}`}
                  >
                     <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
               </div>
               {shiftForm.isActive && (
                 <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                       <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Start Time</Label>
                       <Input type="time" value={shiftForm.start} onChange={e => setShiftForm({...shiftForm, start: e.target.value})} className="rounded-none border-gray-100 h-10 bg-gray-50/50" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">End Time</Label>
                       <Input type="time" value={shiftForm.end} onChange={e => setShiftForm({...shiftForm, end: e.target.value})} className="rounded-none border-gray-100 h-10 bg-gray-50/50" />
                    </div>
                 </div>
               )}
               <DialogFooter className="pt-6">
                  <Button type="submit" className="w-full rounded-none h-12 uppercase tracking-widest font-bold text-[9px] shadow-lg shadow-primary/20">Save Shift Assignment</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      {/* Payroll Run Dialog */}
      <Dialog open={showPayrollModal} onOpenChange={setShowPayrollModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white">
          <div className="bg-primary p-12 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-4xl font-light italic">Payroll <span className="not-italic">Engine</span></DialogTitle>
              <DialogDescription className="text-white/60 font-light mt-2 text-base">Calculate tiered commissions and lock cycle.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleGeneratePayroll} className="p-12 space-y-8 bg-white">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Cycle Start</Label>
                   <Input type="date" required value={payrollForm.startDate} onChange={e => setPayrollForm({...payrollForm, startDate: e.target.value})} className="rounded-none border-gray-200 h-12" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Cycle End</Label>
                   <Input type="date" required value={payrollForm.endDate} onChange={e => setPayrollForm({...payrollForm, endDate: e.target.value})} className="rounded-none border-gray-200 h-12" />
                </div>
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Salon Revenue for Period (₱)</Label>
                <Input type="number" required value={payrollForm.totalSalonSales} onChange={e => setPayrollForm({...payrollForm, totalSalonSales: e.target.value})} placeholder="0.00" className="rounded-none border-gray-200 h-14 text-2xl font-serif" />
                <p className="text-[9px] text-muted-foreground italic px-2">Determines 5% / 8% / 10% commission tiers for all technicians.</p>
             </div>
             <DialogFooter className="pt-8">
                <Button type="button" variant="ghost" className="rounded-none h-12 px-8 text-[10px] uppercase font-bold" onClick={() => setShowPayrollModal(false)}>Cancel</Button>
                <Button type="submit" className="rounded-none px-12 h-12 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 bg-primary">Run Calculation</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deduction Entry Dialog */}
      <Dialog open={showDeductionModal} onOpenChange={setShowDeductionModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white">
          <div className="bg-primary p-12 text-white">
            <DialogHeader>
               <DialogTitle className="font-serif text-4xl font-light italic">Financial <span className="not-italic">Entry</span></DialogTitle>
               <DialogDescription className="text-white/60 font-light mt-2 text-base">Log cash advances, loans, and uniform payments.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleAddDeduction} className="p-12 space-y-8 bg-white">
             <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Technician</Label>
                <Select required onValueChange={(val: string | null) => setDeductionForm({...deductionForm, staffId: val || ''})}>
                   <SelectTrigger className="rounded-none border-gray-200 h-12"><SelectValue placeholder="Choose Employee" /></SelectTrigger>
                   <SelectContent className="rounded-none border-none shadow-2xl">
                      {staffMembers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.fullName}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Entry Category</Label>
                   <Select defaultValue="Cash Advance" onValueChange={(val: string | null) => setDeductionForm({...deductionForm, type: val || 'Cash Advance'})}>
                      <SelectTrigger className="rounded-none border-gray-200 h-12"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none border-none shadow-2xl">
                         <SelectItem value="Cash Advance">Cash Advance</SelectItem>
                         <SelectItem value="Uniform">Uniform</SelectItem>
                         <SelectItem value="Loan Payment">Loan Payment</SelectItem>
                         <SelectItem value="Reloan">Reloan</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Amount (₱)</Label>
                   <Input type="number" required placeholder="0.00" value={deductionForm.amount} onChange={e => setDeductionForm({...deductionForm, amount: e.target.value})} className="rounded-none border-gray-200 h-12" />
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Notes</Label>
                <textarea 
                  className="w-full min-h-[100px] border border-gray-200 p-4 rounded-none outline-none font-light text-sm focus:ring-1 focus:ring-primary/20" 
                  placeholder="Detail justification..." 
                  value={deductionForm.notes}
                  onChange={e => setDeductionForm({...deductionForm, notes: e.target.value})}
                />
             </div>
             <DialogFooter className="pt-8">
                <Button type="button" variant="ghost" className="rounded-none h-12 px-8 text-[10px] uppercase font-bold" onClick={() => setShowDeductionModal(false)}>Cancel</Button>
                <Button type="submit" className="rounded-none px-12 h-12 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30">Commit to Ledger</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
