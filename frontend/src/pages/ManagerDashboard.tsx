import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, DollarSign, Menu } from 'lucide-react';
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
  getAppointments,
} from '../api/apiClient';

import SalarySlipModal from '@/components/SalarySlipModal';
import { StaffTable } from '@/components/dashboard/StaffTable';
import { PayrollTable } from '@/components/dashboard/PayrollTable';
import { AttendanceLedger } from '@/components/dashboard/AttendanceLedger';
import { ReviewModeration } from '@/components/dashboard/ReviewModeration';
import ManageExhibits from './ManageExhibits';
import { ContentView } from '@/components/dashboard/cms/ContentView';
import PackagesView from '@/components/packages/PackagesView';
import { AnalyticsDashboard } from '@/components/dashboard/analytics/AnalyticsDashboard';

import { ManagerSidebar } from '@/components/dashboard/ManagerSidebar';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { DeductionsView } from '@/components/dashboard/DeductionsView';
import { StaffDetailSheet } from '@/components/dashboard/StaffDetailSheet';
import { AddStaffDialog } from '@/components/dashboard/AddStaffDialog';
import { ShiftEditDialog } from '@/components/dashboard/ShiftEditDialog';
import { PayrollRunDialog } from '@/components/dashboard/PayrollRunDialog';
import { DeductionEntryDialog } from '@/components/dashboard/DeductionEntryDialog';
import type { ActiveView } from '@/components/dashboard/types';

import type {
  PayrollPeriod,
  AttendanceRecord,
  Category,
  UpdateAttendanceRequest,
  PayrollRecord,
  Review,
  StaffMember,
  ScheduleItem,
  SalesStats,
} from '@/types/api';

const ManagerDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('analytics');
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollRecord[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      const [salesRes, payrollRes, staffRes, periodsRes, reviewsRes, attRes, catRes, historyRes, appointmentsRes] = await Promise.all([
        getDailySales(),
        getReports({ startDate: dateRange.start, endDate: dateRange.end }),
        getAllStaff(),
        getPayrollPeriods(),
        getAllReviews(),
        getAllAttendance({ startDate: dateRange.start }),
        getCategories(),
        getHistoricalAnalytics({ startDate: dateRange.start, endDate: dateRange.end }),
        getAppointments()
      ]);

      if (salesRes.data.success) setSalesStats(salesRes.data.data);
      if (payrollRes.data.success) setPayrollReport(payrollRes.data.data.report);
      
      if (staffRes.data.success) {
        const staffData = staffRes.data.data;
        setStaffMembers(Array.isArray(staffData) ? staffData : (staffData?.items || []));
      }
      
      if (periodsRes.data.success) {
        const periodsData = periodsRes.data.data;
        setPayrollPeriods(Array.isArray(periodsData) ? periodsData : (periodsData?.items || []));
      }
      
      if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
      if (attRes.data.success) setAttendance(attRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (historyRes.data.success) setHistoricalData(historyRes.data.data);
      if (appointmentsRes.data.success) {
        const aptData = appointmentsRes.data.data;
        setAppointments(Array.isArray(aptData) ? aptData : (aptData?.items || []));
      }

    } catch (err: unknown) {
      console.error('Fetch error:', err instanceof Error ? err.message : err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff({
        ...newStaffForm,
        basePayPerWeek: parseFloat(newStaffForm.basePayPerWeek),
        dailyTarget: parseFloat(newStaffForm.dailyTarget),
      });
      setShowAddStaffModal(false);
      setNewStaffForm({
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

  if (isLoading && !salesStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[1.5]" />
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground animate-pulse">Initializing HRMS Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <ManagerSidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-4">
              <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden">
                <Menu className="h-6 w-6" />
              </button>
              <div>
              <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-1">Manager Overview</p>
              <h1 className="font-serif text-4xl font-light text-foreground capitalize">{activeView.replace('-', ' ')} <span className="italic text-primary/40">Toolbox</span></h1>
           </div>
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
          <OverviewView 
            salesStats={salesStats} 
            historicalData={historicalData} 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onCategoryReset={() => setSelectedCategory(null)}
            activeStaffCount={attendance.filter(a => new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'Present').length}
            pendingReviewCount={reviews.filter(r => r.is_approved_for_public === null || r.is_approved_for_public === false).length}
            appointments={appointments}
            staffMembers={staffMembers}
          />
        )}

        {activeView === 'staff' && (
          <div className="animate-in fade-in duration-700">
            <StaffTable
              staffMembers={staffMembers}
              onStaffClick={handleStaffClick}
            />
          </div>
        )}

        {activeView === 'attendance' && (
          <div className="animate-in fade-in duration-700">
            <AttendanceLedger
              attendance={attendance}
              onUpdateAttendance={handleUpdateAttendance}
            />
          </div>
        )}

        {activeView === 'deductions' && (
          <div className="animate-in fade-in duration-700">
            <DeductionsView 
              staffMembers={staffMembers} 
              deductionForm={deductionForm} 
              onFormChange={setDeductionForm} 
              onSubmit={handleAddDeduction} 
            />
          </div>
        )}

        {activeView === 'payroll' && (
          <div className="animate-in fade-in duration-700">
            <PayrollTable
              payrollReport={payrollReport}
              onPayrollRowClick={handlePayrollRowClick}
              payrollPeriods={payrollPeriods}
              onLockPayroll={handleLockPayroll}
            />
          </div>
        )}

        {activeView === 'reviews' && (
          <div className="animate-in fade-in duration-700">
            <ReviewModeration
              reviews={reviews}
              onModerateReview={handleModerateReview}
            />
          </div>
        )}
        
        {activeView === 'exhibits' && (
          <div className="animate-in fade-in duration-700">
             <ManageExhibits />
          </div>
        )}

        {activeView === 'content' && (
          <div className="animate-in fade-in duration-700">
            <ContentView />
          </div>
        )}

        {activeView === 'packages' && (
          <div className="animate-in fade-in duration-700">
            <PackagesView />
          </div>
        )}

        {activeView === 'advanced-analytics' && (
          <div className="animate-in fade-in duration-700">
            <AnalyticsDashboard />
          </div>
        )}
      </main>

      <StaffDetailSheet 
        open={showStaffSheet} 
        onOpenChange={setShowStaffSheet} 
        staff={selectedStaff} 
        onStaffChange={(staff) => setSelectedStaff(staff)} 
        schedule={staffSchedule} 
        categories={categories} 
        onEditShift={handleEditShift} 
        onUpdateBaseline={handleUpdateStaffBaseline} 
      />

      <SalarySlipModal
        open={showSalarySlip}
        onOpenChange={setShowSalarySlip}
        payroll={selectedPayroll}
      />

      <AddStaffDialog 
        open={showAddStaffModal} 
        onOpenChange={setShowAddStaffModal} 
        form={newStaffForm} 
        onFormChange={setNewStaffForm} 
        onSubmit={handleAddStaff} 
      />

      <ShiftEditDialog 
        open={showShiftEditModal} 
        onOpenChange={setShowShiftEditModal} 
        editingDay={editingDay} 
        form={shiftForm} 
        onFormChange={setShiftForm} 
        onSubmit={handleSaveShift} 
      />

      <PayrollRunDialog 
        open={showPayrollModal} 
        onOpenChange={setShowPayrollModal} 
        form={payrollForm} 
        onFormChange={setPayrollForm} 
        onSubmit={handleGeneratePayroll} 
      />

      <DeductionEntryDialog 
        open={showDeductionModal} 
        onOpenChange={setShowDeductionModal} 
        staffMembers={staffMembers} 
        form={deductionForm} 
        onFormChange={setDeductionForm} 
        onSubmit={handleAddDeduction} 
      />

    </div>
  );
};

export default ManagerDashboard;
