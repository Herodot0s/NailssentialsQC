import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';
import {
  getAttendanceStatus,
  checkIn,
  checkOut,
  getAppointments,
  completeAppointment,
  getCommissionSummary,
  getMyPayroll,
  sendMessage,
  getAllStaff,
  uploadFile,
} from '../api/apiClient';
import { MessagesView } from '@/components/dashboard/MessagesView';
import { LogWalkInDialog } from '@/components/dashboard/customers/LogWalkInDialog';
import { AppointmentCard, PayrollCard } from '@/components/dashboard/staff/MobileCards';
import { StaffPersonalHistory } from '@/components/dashboard/staff/StaffPersonalHistory';
import type { PayrollRecord, StaffMember } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SwipeButton from '@/components/ui/swipe-button';
import { MobileCheckIn } from '@/components/dashboard/MobileCheckIn';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Mail, Loader2 } from 'lucide-react';

interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInRaw: string | null;
  checkOutTime: string | null;
  checkOutRaw: string | null;
  date: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

interface Appointment {
  id: number;
  customer: { id: number; full_name: string };
  status: string;
  appointment_date: string;
  is_walk_in: boolean;
  service_photo_url: string | null;
  items: {
    id: number;
    service: { name: string; price: number };
    staff_id: number;
    staff: { id: number; full_name: string };
    start_time: string;
    end_time: string;
    status: string;
  }[];
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { user: clerkUser } = useUser();
  
  // Prioritize actual username, then fallback to email prefix or full name
  const rawDisplayName = clerkUser?.username || user?.username || clerkUser?.fullName || 'Artisan';
  const displayName = rawDisplayName.includes('@') ? rawDisplayName.split('@')[0] : rawDisplayName;

  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [commission, setCommission] = useState({ today: 0, thisWeek: 0 });
  const [myPayrolls, setMyPayrolls] = useState<PayrollRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [paymentAptId, setPaymentAptId] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [newMessage, setNewMessage] = useState({ receiverId: '', subject: '', body: '' });
  const [attendanceMessage, setAttendanceMessage] = useState<{
    text: string;
    type: 'info' | 'warning' | 'error' | 'success';
  } | null>(null);

  // Completion Flow State
  const [servicePhotoUrl, setServicePhotoUrl] = useState<string>('');
  const [gcashReferenceNo, setGcashReferenceNo] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'gcash' | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [attRes, aptRes, commRes, payrollRes] = await Promise.all([
        getAttendanceStatus(),
        getAppointments(),
        getCommissionSummary(),
        getMyPayroll(),
      ]);

      if (attRes.data.success) {
        setStatus(attRes.data.data.status);
      }
      if (aptRes.data.success) {
        const aptData = aptRes.data.data;
        const aptItems = Array.isArray(aptData) ? aptData : aptData?.items || [];
        setAppointments(aptItems);
      }
      if (commRes.data.success) setCommission(commRes.data.data);
      if (payrollRes.data.success) setMyPayrolls(payrollRes.data.data);

      const staffRes = await getAllStaff();
      if (staffRes.data.success) {
        const staffData = staffRes.data.data;
        setStaff(Array.isArray(staffData) ? staffData : staffData?.items || []);
      }
    } catch (err: unknown) {
      console.error('Fetch error:', err instanceof Error ? err.message : err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      const fetchInterval = setInterval(fetchDashboardData, 30000); // Re-fetch every 30 seconds
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => {
        clearInterval(fetchInterval);
        clearInterval(timer);
      };
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user?.id]); // Re-fetch if user ID changes (e.g. after sync)

  const handleCheckIn = async () => {
    if (user?.role === 'manager') {
      try {
        await checkIn();
        fetchDashboardData();
      } catch (err: any) {
        console.error('Check-in failed:', err.response?.data?.message || err.message);
      }
      return;
    }

    if (status?.isCheckedIn) {
      console.warn('Check-in ignored: Already checked in.');
      return;
    }

    if (status?.scheduledStart) {
      const now = new Date();
      const [sHours, sMins] = status.scheduledStart.split(':').map(Number);
      const scheduledStartTime = new Date();
      scheduledStartTime.setHours(sHours, sMins, 0, 0);

      const diffMinutes = (now.getTime() - scheduledStartTime.getTime()) / (1000 * 60);

      if (diffMinutes < -15) {
        const earlyMins = Math.abs(Math.floor(diffMinutes));
        setAttendanceMessage({
          text: `You are early by ${earlyMins} minutes. Please wait until at least 15 minutes before your shift.`,
          type: 'warning',
        });
        return;
      }

      if (diffMinutes > 15) {
        setAttendanceMessage({
          text: `You are late by ${Math.floor(diffMinutes)} minutes. Deductions will be applied to your payroll.`,
          type: 'error',
        });
      } else {
        setAttendanceMessage(null);
      }
    }

    try {
      await checkIn();
      fetchDashboardData();
    } catch (err: any) {
      console.error('Check-in failed:', err.response?.data?.message || err.message);
    }
  };

  const handleCheckOut = async () => {
    if (user?.role === 'manager') {
      try {
        await checkOut();
        fetchDashboardData();
      } catch (err: any) {
        console.error('Check-out failed:', err.response?.data?.message || err.message);
      }
      return;
    }

    if (!status?.isCheckedIn) {
      console.warn('Check-out ignored: Not checked in.');
      return;
    }

    if (status?.scheduledEnd) {
      const now = new Date();
      const [eHours, eMins] = status.scheduledEnd.split(':').map(Number);
      const scheduledEndTime = new Date();
      scheduledEndTime.setHours(eHours, eMins, 0, 0);

      const diffMinutes = (scheduledEndTime.getTime() - now.getTime()) / (1000 * 60);

      if (diffMinutes > 15) {
        setAttendanceMessage({
          text: `You are checking out early by ${Math.floor(diffMinutes)} minutes. Management has been notified.`,
          type: 'warning',
        });
      } else {
        setAttendanceMessage(null);
      }
    }

    try {
      await checkOut();
      fetchDashboardData();
    } catch (err: any) {
      console.error('Check-out failed:', err.response?.data?.message || err.message);
    }
  };

  const handleComplete = (id: number) => {
    setPaymentAptId(id);
    setServicePhotoUrl('');
    setGcashReferenceNo('');
    setSelectedPaymentMethod(null);
  };

  const processPayment = async () => {
    if (!paymentAptId || !selectedPaymentMethod || !servicePhotoUrl) return;
    if (selectedPaymentMethod === 'gcash' && !gcashReferenceNo) return;

    setIsProcessingPayment(true);
    try {
      await completeAppointment(paymentAptId, {
        paymentMethod: selectedPaymentMethod,
        servicePhotoUrl,
        gcashReferenceNo: selectedPaymentMethod === 'gcash' ? gcashReferenceNo : undefined,
      });
      setPaymentAptId(null);
      fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to finalize ritual:', err.response?.data?.message || err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await uploadFile(file);
      if (res.data.success) {
        setServicePhotoUrl(res.data.data.url);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({
        receiverId: parseInt(newMessage.receiverId),
        subject: newMessage.subject,
        body: newMessage.body,
      });
      setShowMessageModal(false);
      setNewMessage({ receiverId: '', subject: '', body: '' });
      fetchDashboardData();
    } catch {
      alert('Failed to send message.');
    }
  };

  const sortedStaff = [...staff].sort((a, b) => a.fullName.localeCompare(b.fullName));

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <Badge className="bg-[#d9eddf] text-[#2c8c66] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">
            Finished
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-[#B8794E] text-[#ffffff] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[#e5e7e0] text-[#4d4f46] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">
            Incoming
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-[#f7d6d3] text-[#cd4239] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">
            Cancelled
          </Badge>
        );
      case 'no_show':
        return (
          <Badge className="bg-[#fcf8e3] text-[#8a6d3b] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">
            No-Show
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="rounded-md text-[10px] tracking-tight uppercase border-[#bfc1b7]"
          >
            {status}
          </Badge>
        );
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 text-center px-6 bg-[#eeefe9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#B8794E]" />
        <p className="text-[12px] tracking-widest uppercase font-bold text-[#4d4f46]">
          {!user ? 'Authenticating...' : 'Loading Artisan Dashboard'}
        </p>
      </div>
    );
  }

  const getLocalDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getLocalDateStr(new Date());
  
  const todayAppointments = appointments.filter((a) => {
    const aptDateStr = getLocalDateStr(a.appointment_date);
    return aptDateStr === todayStr;
  });

  const upcomingAppointments = appointments
    .filter((a) => {
      const aptDateStr = getLocalDateStr(a.appointment_date);
      if (aptDateStr === todayStr) return false;

      const aptDate = new Date(aptDateStr);
      const today = new Date(todayStr);
      const diffDays = (aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 14;
    })
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  // Helper to filter items for the current staff member
  const filterMyItems = (items: Appointment['items']) => {
    if (user?.role === 'manager') return items;
    
    const filtered = items.filter(
      (i) =>
        i.staff_id === user?.staffProfileId ||
        (i.staff && i.staff.user_id === user?.id) ||
        (user?.role === 'staff' && (!user?.staffProfileId || !i.staff_id)) // Fallback for staff
    );
    
    // If we found specific items for this staff, return them. 
    // Otherwise, if the user is staff, return ALL items (since backend already filtered the appointment)
    return filtered.length > 0 ? filtered : (user?.role === 'staff' ? items : []);
  };

  return (
    <div
      className="min-h-screen bg-[#eeefe9] text-[#4d4f46]"
      style={{ fontFamily: '"IBM Plex Sans Variable", sans-serif' }}
    >
      <div className="container max-w-7xl mx-auto py-10 md:py-[80px] px-4 md:px-6 animate-in fade-in duration-1000">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12 mb-12 md:mb-[80px]">
          <div className="space-y-2 md:space-y-3">
            <p className="text-[10px] md:text-[12px] tracking-widest uppercase font-bold text-[#B8794E]">
              Staff Dashboard
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#23251d] flex flex-wrap items-center gap-3">
              {displayName.split(' ')[0]}'s Dashboard
              {status?.isCheckedIn && (
                <Badge className="rounded-full bg-[#B8794E] text-white text-[9px] md:text-[10px] font-bold py-1 px-2 md:px-3 border-none tracking-tight uppercase">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white animate-pulse mr-1.5 md:mr-2 inline-block" />
                  On Duty
                </Badge>
              )}
            </h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowMessageModal(true)}
              className="flex-1 md:flex-none rounded-md gap-2 md:gap-3 border-[#bfc1b7] bg-[#e5e7e0] hover:bg-[#dcdfd2] text-[#23251d] transition-all h-10 px-4 md:px-6 text-[13px] md:text-[14px] font-bold"
            >
              <Mail className="h-4 w-4" /> <span className="hidden xs:inline">Messages</span>
              <span className="xs:hidden">Inbox</span>
            </Button>
            <Button
              onClick={() => setShowWalkInModal(true)}
              className="flex-1 md:flex-none rounded-md gap-2 md:gap-3 bg-[#B8794E] hover:bg-[#dd9001] text-white transition-all h-10 px-4 md:px-6 text-[13px] md:text-[14px] font-bold shadow-none"
            >
              <Plus className="h-4 w-4" /> Log Walk-in
            </Button>
          </div>
        </header>

        {!status?.isCheckedIn && (
          <div className="mb-12 bg-[#dceaf6] border border-[#2c84e0]/20 p-6 flex items-center gap-4 rounded-md">
            <p className="text-[14px] font-medium text-[#23251d]">
              <span className="font-bold mr-2 text-[#2c84e0]">📘 Info:</span> Check-in required for
              attendance and commission tracking.
            </p>
          </div>
        )}

        <Tabs defaultValue="appointments" className="space-y-12 md:space-y-[80px]">
          <TabsList className="bg-transparent p-1 h-auto gap-2 border-none w-full md:w-fit flex rounded-md mb-4 overflow-x-auto no-scrollbar">
            {[
              { label: 'Appointments', value: 'appointments' },
              { label: 'Commissions', value: 'commissions' },
              { label: 'History', value: 'history' },
              { label: 'Messages', value: 'messages' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[12px] md:text-[14px] uppercase tracking-wider font-bold text-[#6c6e63] bg-transparent data-[state=active]:bg-white data-[state=active]:text-[#23251d] data-[state=active]:shadow-none border border-transparent data-[state=active]:border-[#bfc1b7] rounded-md px-4 md:px-6 py-2.5 transition-all whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="appointments" className="mt-0 space-y-[80px]">
            {status?.isCheckedIn && (
              <div className="flex items-center justify-between bg-white border border-[#bfc1b7] p-6 md:hidden rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B8794E] animate-pulse" />
                  <span className="text-[12px] font-bold uppercase text-[#23251d]">
                    Checked in at {status.checkInTime}
                  </span>
                </div>
                <SwipeButton
                  onSwipe={handleCheckOut}
                  variant="destructive"
                  className="h-10 text-[12px] uppercase px-5 py-0 min-w-0 flex-shrink-0 font-bold rounded-md"
                >
                  Check Out
                </SwipeButton>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4">
                <MobileCheckIn
                  isCheckedIn={status?.isCheckedIn ?? false}
                  checkInTime={status?.checkInTime ?? null}
                  checkInRaw={status?.checkInRaw ?? null}
                  scheduledStart={status?.scheduledStart ?? null}
                  scheduledEnd={status?.scheduledEnd ?? null}
                  currentTime={currentTime}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                />
              </div>

              <div className="lg:col-span-8 space-y-[80px]">
                {attendanceMessage && (
                  <div
                    className={`p-8 text-[14px] font-medium border rounded-md ${
                      attendanceMessage.type === 'error'
                        ? 'bg-[#f7d6d3] text-[#cd4239] border-[#cd4239]/20'
                        : attendanceMessage.type === 'warning'
                          ? 'bg-[#fcf8e3] text-[#8a6d3b] border-[#faebcc]'
                          : 'bg-[#d9eddf] text-[#2c8c66] border-[#2c8c66]/20'
                    }`}
                  >
                    <p className="flex items-center gap-3">
                      {attendanceMessage.type === 'error' ? '⚠️' : '💡'}
                      {attendanceMessage.text}
                    </p>
                  </div>
                )}

                <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white">
                  <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-6 md:p-8">
                    <CardTitle className="text-xl md:text-2xl font-bold text-[#23251d]">
                      Today's Appointments
                    </CardTitle>
                    <CardDescription className="text-[13px] md:text-[14px] text-[#4d4f46] mt-1 md:mt-2">
                      Viewing {todayAppointments.reduce((acc, apt) => acc + filterMyItems(apt.items).length, 0)} scheduled services for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader className="bg-[#e5e7e0] border-b border-[#bfc1b7]">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-8 h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Time
                            </TableHead>
                            <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Client
                            </TableHead>
                            <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Service
                            </TableHead>
                            <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              {user?.role === 'manager' ? 'Artisan' : 'Status'}
                            </TableHead>
                            <TableHead className="pr-8 h-12 text-right font-bold text-[12px] uppercase text-[#6c6e63]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {todayAppointments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-24 text-[#6c6e63] italic text-sm font-medium"
                              >
                                No appointments scheduled for today.
                              </TableCell>
                            </TableRow>
                          ) : (
                            todayAppointments.map((apt) => {
                              const myItems = filterMyItems(apt.items);
                              return myItems.map((item) => {
                                const isActive = item.status === 'in_progress';
                                const now = currentTime.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                });
                                const isCurrentTimeSlot =
                                  now >= item.start_time && now <= item.end_time;

                                return (
                                  <TableRow
                                    key={item.id}
                                    className={`hover:bg-[#e5e7e0]/50 border-b border-[#bfc1b7] transition-all duration-200 ${isActive ? 'bg-[#B8794E]/5' : ''} ${isCurrentTimeSlot ? 'bg-[#dceaf6]/30' : ''}`}
                                  >
                                    <TableCell className="pl-8 py-6 font-bold text-sm tabular-nums text-[#23251d]">
                                      {item.start_time} — {item.end_time}
                                    </TableCell>
                                    <TableCell className="text-lg font-bold text-[#23251d]">
                                      {apt.customer.full_name}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm text-[#4d4f46]">
                                      {item.service.name}
                                    </TableCell>
                                    <TableCell className="font-bold text-sm text-[#B8794E]">
                                      {user?.role === 'manager' ? (
                                        item.staff?.full_name || 'Unassigned'
                                      ) : (
                                        getStatusBadge(item.status)
                                      )}
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                      {item.status !== 'completed' && (
                                        <Button
                                          onClick={() => handleComplete(apt.id)}
                                          size="sm"
                                          className="rounded-md h-9 text-[12px] font-bold uppercase px-6 bg-[#23251d] hover:bg-[#33342d] text-white transition-all shadow-none"
                                        >
                                          Complete Service
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              });
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden p-4 space-y-4 bg-[#eeefe9]/30">
                      {todayAppointments.length === 0 ? (
                        <p className="text-center py-12 text-[#6c6e63] italic text-sm font-medium">
                          No appointments scheduled for today.
                        </p>
                      ) : (
                        todayAppointments.flatMap((apt) => {
                          const myItems = filterMyItems(apt.items);
                          return myItems.map((item) => (
                            <AppointmentCard
                              key={item.id}
                              customerName={apt.customer.full_name}
                              startTime={item.start_time}
                              endTime={item.end_time}
                              serviceName={item.service.name}
                              status={item.status}
                              statusBadge={getStatusBadge(item.status)}
                              onComplete={
                                item.status !== 'completed'
                                  ? () => handleComplete(apt.id)
                                  : undefined
                              }
                              technicianName={user?.role === 'manager' ? item.staff?.full_name : undefined}
                            />
                          ));
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white/80">
                  <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-6 md:p-8">
                    <CardTitle className="text-xl md:text-2xl font-bold text-[#23251d]">
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription className="text-[13px] md:text-[14px] text-[#6c6e63] mt-1 md:mt-2">
                      Schedule for the next 14 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader className="bg-[#e5e7e0]/50 border-b border-[#bfc1b7]">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-8 h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Date
                            </TableHead>
                            <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Time
                            </TableHead>
                            <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Client
                            </TableHead>
                            <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                              Service
                            </TableHead>
                            <TableHead className="pr-8 h-12 text-right font-bold text-[12px] uppercase text-[#6c6e63]">
                              {user?.role === 'manager' ? 'Artisan' : 'Status'}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingAppointments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-20 text-[#6c6e63] italic text-sm font-medium"
                              >
                                No upcoming appointments found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            upcomingAppointments.map((apt) => {
                              const myItems = filterMyItems(apt.items);
                              return myItems.map((item) => (
                                <TableRow
                                  key={item.id}
                                  className="hover:bg-[#e5e7e0]/50 border-b border-[#bfc1b7] transition-all duration-200 opacity-80 hover:opacity-100"
                                >
                                  <TableCell className="pl-8 py-6 font-bold text-sm text-[#B8794E] tabular-nums">
                                    {new Date(apt.appointment_date).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      weekday: 'short',
                                    })}
                                  </TableCell>
                                  <TableCell className="py-6 font-bold text-sm tabular-nums text-[#23251d]">
                                    {item.start_time} — {item.end_time}
                                  </TableCell>
                                  <TableCell className="text-lg font-bold text-[#23251d]">
                                    {apt.customer.full_name}
                                  </TableCell>
                                  <TableCell className="font-medium text-sm text-[#4d4f46]">
                                    {item.service.name}
                                  </TableCell>
                                  <TableCell className="pr-8 text-right">
                                    {user?.role === 'manager' ? (
                                      <span className="font-bold text-sm text-[#B8794E]">
                                        {item.staff?.full_name || 'Unassigned'}
                                      </span>
                                    ) : (
                                      getStatusBadge(item.status)
                                    )}
                                  </TableCell>
                                </TableRow>
                              ));
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden p-4 space-y-4 bg-[#eeefe9]/20">
                      {upcomingAppointments.length === 0 ? (
                        <p className="text-center py-12 text-[#6c6e63] italic text-sm font-medium">
                          No upcoming appointments found.
                        </p>
                      ) : (
                        upcomingAppointments.flatMap((apt) => {
                          const myItems = filterMyItems(apt.items);
                          const dateStr = new Date(apt.appointment_date).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', weekday: 'short' },
                          );
                          return myItems.map((item) => (
                            <AppointmentCard
                              key={item.id}
                              customerName={apt.customer.full_name}
                              startTime={item.start_time}
                              endTime={item.end_time}
                              serviceName={item.service.name}
                              status={item.status}
                              statusBadge={getStatusBadge(item.status)}
                              date={dateStr}
                              technicianName={user?.role === 'manager' ? item.staff?.full_name : undefined}
                            />
                          ));
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="mt-0 space-y-[80px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
              <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white">
                <CardHeader className="p-6 md:p-10 pb-0">
                  <CardTitle className="text-[10px] md:text-[12px] font-bold text-[#B8794E] uppercase tracking-widest">
                    Commission Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
                  <div className="flex justify-between items-end border-b border-[#bfc1b7] pb-6 md:pb-8">
                    <p className="text-[12px] md:text-[14px] font-bold uppercase text-[#4d4f46]">
                      Today's Commission
                    </p>
                    <p className="text-3xl md:text-5xl font-extrabold text-[#23251d] tracking-tight">
                      ₱{commission.today.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <p className="text-[12px] md:text-[14px] font-bold uppercase text-[#4d4f46]">
                      Weekly Total
                    </p>
                    <p className="text-xl md:text-3xl font-bold text-[#B8794E] tracking-tight">
                      ₱{commission.thisWeek.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white">
                <CardHeader className="p-6 md:p-10 pb-0">
                  <CardTitle className="text-[10px] md:text-[12px] font-bold text-[#B8794E] uppercase tracking-widest">
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between text-[11px] md:text-[12px] font-bold uppercase text-[#4d4f46]">
                      <span>Commission Rate</span>
                      <span className="text-[#B8794E]">Active (8%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#eeefe9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B8794E]" style={{ width: '80%' }} />
                    </div>
                    <p className="text-[10px] md:text-[11px] text-[#6c6e63] italic">
                      Rate based on monthly performance tier.
                    </p>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between text-[11px] md:text-[12px] font-bold uppercase text-[#4d4f46]">
                      <span>Target Quota</span>
                      <span className="text-[#B8794E]">Target: ₱6,000</span>
                    </div>
                    <div className="h-2 w-full bg-[#eeefe9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B8794E]" style={{ width: '45%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white">
              <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-6 md:p-8">
                <CardTitle className="text-xl md:text-2xl font-bold text-[#23251d]">
                  Payroll History
                </CardTitle>
                <CardDescription className="text-[13px] md:text-[14px] text-[#4d4f46] mt-1 md:mt-2">
                  Historical record of finalized payouts and deductions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-[#e5e7e0] border-b border-[#bfc1b7]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-8 h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                          Cycle
                        </TableHead>
                        <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                          Base Pay
                        </TableHead>
                        <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                          Commissions
                        </TableHead>
                        <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">
                          Deductions
                        </TableHead>
                        <TableHead className="pr-8 h-12 text-right font-bold text-[12px] uppercase text-[#6c6e63]">
                          Net Payout
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myPayrolls.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-20 text-[#6c6e63] italic text-sm font-medium"
                          >
                            No payroll records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        myPayrolls.map((p) => (
                          <TableRow
                            key={p.id || Math.random()}
                            className="hover:bg-[#e5e7e0]/50 border-b border-[#bfc1b7] transition-all duration-200"
                          >
                            <TableCell className="pl-8 py-6 font-bold text-sm tabular-nums text-[#23251d]">
                              {p.period
                                ? `${new Date(p.period.start_date).toLocaleDateString()} — ${new Date(p.period.end_date).toLocaleDateString()}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-[#4d4f46]">
                              ₱{(p.base_pay || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-[#4d4f46]">
                              ₱{(p.commissions || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-[#cd4239] font-bold tabular-nums">
                              -₱{(p.deductions || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="pr-8 text-right font-bold text-xl text-[#B8794E] tabular-nums">
                              ₱{(p.net_pay || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden p-4 space-y-2 bg-[#eeefe9]/20">
                  {myPayrolls.length === 0 ? (
                    <p className="text-center py-12 text-[#6c6e63] italic text-sm font-medium">
                      No payroll records found.
                    </p>
                  ) : (
                    myPayrolls.map((p) => <PayrollCard key={p.id || Math.random()} payroll={p} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <StaffPersonalHistory
              appointments={appointments}
              staffProfileId={user?.staffProfileId || user?.id || 0}
            />
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <MessagesView />
          </TabsContent>
        </Tabs>

        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-md border-none shadow-2xl rounded-md p-0 overflow-hidden bg-[#eeefe9] animate-in zoom-in-95 duration-500">
            <div className="bg-[#23251d] p-12 text-white">
              <DialogHeader>
                <DialogTitle className="text-4xl font-extrabold tracking-tight">
                  Send <span className="text-[#B8794E]">Message</span>
                </DialogTitle>
                <DialogDescription className="text-white/60 font-medium mt-4 text-[12px] uppercase tracking-widest">
                  Artisan Communication Portal
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleSendMessage} className="p-12 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">
                    Recipient
                  </Label>
                  <Select
                    required
                    onValueChange={(val: string | null) =>
                      setNewMessage({ ...newMessage, receiverId: val || '' })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-primary/10 h-14 active:scale-98 transition-all hover:bg-primary/5 text-xs">
                      <SelectValue placeholder="Select staff member">
                        {
                          sortedStaff.find((s) => s.id.toString() === newMessage.receiverId)
                            ?.fullName
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2">
                      {sortedStaff.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id.toString()}
                          className="rounded-lg h-10 text-xs"
                        >
                          {s.fullName} ({s.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">
                    Subject
                  </Label>
                  <Input
                    required
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Inquiry / schedule update"
                    className="rounded-xl border-primary/10 h-14 text-xs hover:bg-primary/5 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">
                    Message
                  </Label>
                  <textarea
                    required
                    value={newMessage.body}
                    onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                    className="w-full min-h-[160px] rounded-xl border border-primary/10 p-5 focus:outline-none focus:ring-2 focus:ring-primary/5 font-light text-sm hover:bg-primary/5 transition-all resize-none"
                    placeholder="Enter message details..."
                  />
                </div>
              </div>
              <DialogFooter className="pt-4 gap-4 sm:justify-between px-12 pb-12">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-md h-12 px-8 text-[12px] uppercase font-bold tracking-widest hover:bg-[#e5e7e0] text-[#4d4f46]"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-md px-12 h-12 font-bold text-[12px] uppercase tracking-widest bg-[#23251d] hover:bg-[#33342d] text-white shadow-none"
                >
                  Send Message
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <LogWalkInDialog
          open={showWalkInModal}
          onOpenChange={setShowWalkInModal}
          onSuccess={fetchDashboardData}
        />

        <Dialog open={!!paymentAptId} onOpenChange={(open) => !open && setPaymentAptId(null)}>
          <DialogContent className="max-w-md border-none shadow-2xl rounded-md p-8 space-y-8 bg-[#eeefe9]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#23251d]">
                Finalize Ritual
              </DialogTitle>
              <DialogDescription className="text-[12px] uppercase tracking-widest font-bold text-[#6c6e63]">
                Capture completion and select payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Step 1: Photo Upload */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.2em]">
                  Service Completion Photo
                </Label>
                <div className="relative group">
                  {servicePhotoUrl ? (
                    <div className="relative rounded-md overflow-hidden aspect-video border border-[#bfc1b7] bg-white">
                      <img
                        src={servicePhotoUrl}
                        alt="Service completion"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[10px] uppercase font-bold"
                          onClick={() => setServicePhotoUrl('')}
                        >
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#bfc1b7] rounded-md bg-white hover:bg-[#fcfcfa] cursor-pointer transition-all">
                      {isUploadingPhoto ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-[#B8794E]" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c6e63]">
                            Uploading...
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Plus className="h-6 w-6 text-[#bfc1b7]" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c6e63]">
                            Tap to Take/Upload Photo
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.2em]">
                  Payment Method
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                    className={`h-16 rounded-md flex flex-col gap-1 border-[#bfc1b7] transition-all ${
                      selectedPaymentMethod === 'cash'
                        ? 'bg-[#23251d] text-white'
                        : 'bg-white text-[#23251d] hover:bg-[#eeefe9]'
                    }`}
                  >
                    <span className="text-xl font-bold">₱</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold">Cash</span>
                  </Button>
                  <Button
                    onClick={() => setSelectedPaymentMethod('gcash')}
                    variant={selectedPaymentMethod === 'gcash' ? 'default' : 'outline'}
                    className={`h-16 rounded-md flex flex-col gap-1 border-[#bfc1b7] transition-all ${
                      selectedPaymentMethod === 'gcash'
                        ? 'bg-[#007DFE] text-white border-none'
                        : 'bg-white text-[#007DFE] hover:bg-[#eeefe9]'
                    }`}
                  >
                    <span className="text-sm font-black italic tracking-tighter">GCash</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold">Digital</span>
                  </Button>
                </div>
              </div>

              {/* Step 3: GCash Ref No */}
              {selectedPaymentMethod === 'gcash' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.2em]">
                    GCash Reference Number
                  </Label>
                  <Input
                    placeholder="Enter 13-digit reference number"
                    value={gcashReferenceNo}
                    onChange={(e) => setGcashReferenceNo(e.target.value)}
                    className="rounded-md border-[#bfc1b7] h-12 bg-white text-sm font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={processPayment}
                disabled={
                  isProcessingPayment ||
                  !servicePhotoUrl ||
                  !selectedPaymentMethod ||
                  (selectedPaymentMethod === 'gcash' && !gcashReferenceNo)
                }
                className="w-full rounded-md h-12 bg-[#B8794E] hover:bg-[#dd9001] text-white text-[13px] font-bold uppercase tracking-widest shadow-none disabled:opacity-30"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
                  </div>
                ) : (
                  'Complete Appointment'
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-md h-10 text-[10px] uppercase tracking-widest font-bold text-[#5C544F]"
                onClick={() => setPaymentAptId(null)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffDashboard;
