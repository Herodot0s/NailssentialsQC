import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
} from '../api/apiClient';
import { MessagesView } from '@/components/dashboard/MessagesView';
import { LogWalkInDialog } from '@/components/dashboard/LogWalkInDialog';
import type { PayrollRecord, StaffMember } from '@/types/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
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
import {
  Plus,
  Mail,
  Loader2,
} from 'lucide-react';

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
  items: {
    id: number;
    service: { name: string; price: number };
    staff_id: number;
    start_time: string;
    end_time: string;
    status: string;
  }[];
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
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
  const [attendanceMessage, setAttendanceMessage] = useState<{ text: string, type: 'info' | 'warning' | 'error' | 'success' } | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [attRes, aptRes, commRes, payrollRes] = await Promise.all([
        getAttendanceStatus(),
        getAppointments(),
        getCommissionSummary(),
        getMyPayroll()
      ]);

      if (attRes.data.success) setStatus(attRes.data.data.status);
      if (aptRes.data.success) {
        const aptData = aptRes.data.data;
        const aptItems = Array.isArray(aptData) ? aptData : (aptData?.items || []);
        setAppointments(aptItems);
      }
      if (commRes.data.success) setCommission(commRes.data.data);
      if (payrollRes.data.success) setMyPayrolls(payrollRes.data.data);

      const staffRes = await getAllStaff();
      if (staffRes.data.success) {
        const staffData = staffRes.data.data;
        setStaff(Array.isArray(staffData) ? staffData : (staffData?.items || []));
      }

    } catch (err: unknown) {
      console.error('Fetch error:', err instanceof Error ? err.message : err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          type: 'warning'
        });
        return;
      }

      if (diffMinutes > 15) {
        setAttendanceMessage({
          text: `You are late by ${Math.floor(diffMinutes)} minutes. Deductions will be applied to your payroll.`,
          type: 'error'
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
          type: 'warning'
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

  const handleComplete = (id: number) => setPaymentAptId(id);

  const processPayment = async (method: 'cash' | 'gcash') => {
    if (!paymentAptId) return;
    setIsProcessingPayment(true);
    try {
      await completeAppointment(paymentAptId, { paymentMethod: method });
      setPaymentAptId(null);
      fetchDashboardData();
    } catch {
      console.error('Failed to finalize ritual.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({
        receiverId: parseInt(newMessage.receiverId),
        subject: newMessage.subject,
        body: newMessage.body
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
      case 'completed': return <Badge className="bg-[#d9eddf] text-[#2c8c66] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">Finished</Badge>;
      case 'in_progress': return <Badge className="bg-[#B8794E] text-[#ffffff] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">Active</Badge>;
      case 'pending': return <Badge className="bg-[#e5e7e0] text-[#4d4f46] border-none rounded-md text-[10px] font-bold tracking-tight uppercase">Incoming</Badge>;
      default: return <Badge variant="outline" className="rounded-md text-[10px] tracking-tight uppercase border-[#bfc1b7]">{status}</Badge>;
    }
  };

  if (isLoading && !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 text-center px-6 bg-[#eeefe9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#B8794E]" />
        <p className="text-[12px] tracking-widest uppercase font-bold text-[#4d4f46]">Loading Artisan Dashboard</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter((a) => a.appointment_date.split('T')[0] === todayStr);

  const upcomingAppointments = appointments.filter((a) => {
    const aptDateStr = a.appointment_date.split('T')[0];
    if (aptDateStr === todayStr) return false;

    const aptDate = new Date(aptDateStr);
    const today = new Date(todayStr);
    const diffDays = (aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 14;
  }).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  return (
    <div className="min-h-screen bg-[#eeefe9] text-[#4d4f46]" style={{ fontFamily: '"IBM Plex Sans Variable", sans-serif' }}>
      <div className="container max-w-7xl mx-auto py-[80px] px-6 animate-in fade-in duration-1000">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-[80px]">
          <div className="space-y-3">
            <p className="text-[12px] tracking-widest uppercase font-bold text-[#B8794E]">Staff Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#23251d]">
              {user?.fullName.split(' ')[0]}'s Dashboard
              {status?.isCheckedIn && (
                <Badge className="ml-6 rounded-full bg-[#B8794E] text-white text-[10px] font-bold py-1 px-3 border-none tracking-tight uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2 inline-block" />
                  On Duty
                </Badge>
              )}
            </h1>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowMessageModal(true)} className="rounded-md gap-3 border-[#bfc1b7] bg-[#e5e7e0] hover:bg-[#dcdfd2] text-[#23251d] transition-all h-10 px-6 text-[14px] font-bold">
              <Mail className="h-4 w-4" /> Messages
            </Button>
            <Button onClick={() => setShowWalkInModal(true)} className="rounded-md gap-3 bg-[#B8794E] hover:bg-[#dd9001] text-white transition-all h-10 px-6 text-[14px] font-bold shadow-none">
              <Plus className="h-4 w-4" /> Log Walk-in
            </Button>
          </div>
        </header>

        {!status?.isCheckedIn && (
          <div className="mb-12 bg-[#dceaf6] border border-[#2c84e0]/20 p-6 flex items-center gap-4 rounded-md">
            <p className="text-[14px] font-medium text-[#23251d]">
              <span className="font-bold mr-2 text-[#2c84e0]">📘 Info:</span> Check-in required for attendance and commission tracking.
            </p>
          </div>
        )}

        <Tabs defaultValue="appointments" className="space-y-[80px]">
          <TabsList className="bg-transparent p-1 h-auto gap-2 border-none w-fit flex rounded-md mb-8">
            {[
              { label: 'Appointments', value: 'appointments' },
              { label: 'Commissions', value: 'commissions' },
              { label: 'Messages', value: 'messages' }
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[14px] uppercase tracking-wider font-bold text-[#6c6e63] bg-transparent data-[state=active]:bg-white data-[state=active]:text-[#23251d] data-[state=active]:shadow-none border border-transparent data-[state=active]:border-[#bfc1b7] rounded-md px-6 py-2.5 transition-all"
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
                  <span className="text-[12px] font-bold uppercase text-[#23251d]">Checked in at {status.checkInTime}</span>
                </div>
                <SwipeButton onSwipe={handleCheckOut} variant="destructive" className="h-10 text-[12px] uppercase px-5 py-0 min-w-0 flex-shrink-0 font-bold rounded-md">
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
                  <div className={`p-8 text-[14px] font-medium border rounded-md ${attendanceMessage.type === 'error' ? 'bg-[#f7d6d3] text-[#cd4239] border-[#cd4239]/20' :
                    attendanceMessage.type === 'warning' ? 'bg-[#fcf8e3] text-[#8a6d3b] border-[#faebcc]' :
                      'bg-[#d9eddf] text-[#2c8c66] border-[#2c8c66]/20'
                    }`}>
                    <p className="flex items-center gap-3">
                      {attendanceMessage.type === 'error' ? '⚠️' : '💡'}
                      {attendanceMessage.text}
                    </p>
                  </div>
                )}

                <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white">
                  <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-8">
                    <CardTitle className="text-2xl font-bold text-[#23251d]">Today's Appointments</CardTitle>
                    <CardDescription className="text-[14px] text-[#4d4f46] mt-2">
                      Viewing {todayAppointments.length} scheduled services for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-[#e5e7e0] border-b border-[#bfc1b7]">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-8 h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Time</TableHead>
                          <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Client</TableHead>
                          <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Service</TableHead>
                          <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Status</TableHead>
                          <TableHead className="pr-8 h-12 text-right font-bold text-[12px] uppercase text-[#6c6e63]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-24 text-[#6c6e63] italic text-sm font-medium">
                              No appointments scheduled for today.
                            </TableCell>
                          </TableRow>
                        ) : todayAppointments.map((apt) => {
                          const myItems = apt.items.filter(i => i.staff_id === user?.staffProfileId || (!user?.staffProfileId && i.staff_id === user?.id));
                          return myItems.map(item => {
                            const isActive = item.status === 'in_progress';
                            const now = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                            const isCurrentTimeSlot = now >= item.start_time && now <= item.end_time;

                            return (
                              <TableRow key={item.id} className={`hover:bg-[#e5e7e0]/50 border-b border-[#bfc1b7] transition-all duration-200 ${isActive ? 'bg-[#B8794E]/5' : ''} ${isCurrentTimeSlot ? 'bg-[#dceaf6]/30' : ''}`}>
                                <TableCell className="pl-8 py-6 font-bold text-sm tabular-nums text-[#23251d]">{item.start_time} — {item.end_time}</TableCell>
                                <TableCell className="text-lg font-bold text-[#23251d]">{apt.customer.full_name}</TableCell>
                                <TableCell className="font-medium text-sm text-[#4d4f46]">{item.service.name}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white/80">
                  <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-8">
                    <CardTitle className="text-2xl font-bold text-[#23251d]">Upcoming Appointments</CardTitle>
                    <CardDescription className="text-[14px] text-[#6c6e63] mt-2">Schedule for the next 14 days</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-[#e5e7e0]/50 border-b border-[#bfc1b7]">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-8 h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Date</TableHead>
                          <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Time</TableHead>
                          <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Client</TableHead>
                          <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Service</TableHead>
                          <TableHead className="pr-8 h-12 text-right font-bold text-[12px] uppercase text-[#6c6e63]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-20 text-[#6c6e63] italic text-sm font-medium">
                              No upcoming appointments found.
                            </TableCell>
                          </TableRow>
                        ) : upcomingAppointments.map((apt) => {
                          const myItems = apt.items.filter(i => i.staff_id === user?.staffProfileId || (!user?.staffProfileId && i.staff_id === user?.id));
                          return myItems.map(item => (
                            <TableRow key={item.id} className="hover:bg-[#e5e7e0]/50 border-b border-[#bfc1b7] transition-all duration-200 opacity-80 hover:opacity-100">
                              <TableCell className="pl-8 py-6 font-bold text-sm text-[#B8794E] tabular-nums">
                                {new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                              </TableCell>
                              <TableCell className="py-6 font-bold text-sm tabular-nums text-[#23251d]">{item.start_time} — {item.end_time}</TableCell>
                              <TableCell className="text-lg font-bold text-[#23251d]">{apt.customer.full_name}</TableCell>
                              <TableCell className="font-medium text-sm text-[#4d4f46]">{item.service.name}</TableCell>
                              <TableCell className="pr-8 text-right">{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ));
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="mt-0 space-y-[80px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
              <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-[12px] font-bold text-[#B8794E] uppercase tracking-widest">Commission Revenue</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="flex justify-between items-end border-b border-[#bfc1b7] pb-8">
                    <p className="text-[14px] font-bold uppercase text-[#4d4f46]">Today's Commission</p>
                    <p className="text-5xl font-extrabold text-[#23251d] tracking-tight">₱{commission.today.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <p className="text-[14px] font-bold uppercase text-[#4d4f46]">Weekly Total</p>
                    <p className="text-3xl font-bold text-[#B8794E] tracking-tight">₱{commission.thisWeek.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-[12px] font-bold text-[#B8794E] uppercase tracking-widest">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[12px] font-bold uppercase text-[#4d4f46]">
                      <span>Commission Rate</span>
                      <span className="text-[#B8794E]">Active (8%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#eeefe9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B8794E]" style={{ width: '80%' }} />
                    </div>
                    <p className="text-[11px] text-[#6c6e63] italic">Rate based on monthly performance tier.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[12px] font-bold uppercase text-[#4d4f46]">
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
              <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-8">
                <CardTitle className="text-2xl font-bold text-[#23251d]">Payroll History</CardTitle>
                <CardDescription className="text-[14px] text-[#4d4f46] mt-2">Historical record of finalized payouts and deductions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-[#e5e7e0] border-b border-[#bfc1b7]">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-8 h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Cycle</TableHead>
                      <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Base Pay</TableHead>
                      <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Commissions</TableHead>
                      <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6c6e63]">Deductions</TableHead>
                      <TableHead className="pr-8 h-12 text-right font-bold text-[12px] uppercase text-[#6c6e63]">Net Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayrolls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-[#6c6e63] italic text-sm font-medium">
                          No payroll records found.
                        </TableCell>
                      </TableRow>
                    ) : myPayrolls.map(p => (
                      <TableRow key={p.id || Math.random()} className="hover:bg-[#e5e7e0]/50 border-b border-[#bfc1b7] transition-all duration-200">
                        <TableCell className="pl-8 py-6 font-bold text-sm tabular-nums text-[#23251d]">
                          {p.period ? `${new Date(p.period.start_date).toLocaleDateString()} — ${new Date(p.period.end_date).toLocaleDateString()}` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-[#4d4f46]">₱{(p.base_pay || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm tabular-nums text-[#4d4f46]">₱{(p.commissions || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-[#cd4239] font-bold tabular-nums">-₱{(p.deductions || 0).toLocaleString()}</TableCell>
                        <TableCell className="pr-8 text-right font-bold text-xl text-[#B8794E] tabular-nums">₱{(p.net_pay || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <MessagesView />
          </TabsContent>
        </Tabs>

        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-md border-none shadow-2xl rounded-md p-0 overflow-hidden bg-[#eeefe9] animate-in zoom-in-95 duration-500">
            <div className="bg-[#23251d] p-12 text-white">
              <DialogHeader>
                <DialogTitle className="text-4xl font-extrabold tracking-tight">Send <span className="text-[#B8794E]">Message</span></DialogTitle>
                <DialogDescription className="text-white/60 font-medium mt-4 text-[12px] uppercase tracking-widest">Artisan Communication Portal</DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleSendMessage} className="p-12 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">Recipient</Label>
                  <Select required onValueChange={(val: string | null) => setNewMessage({ ...newMessage, receiverId: val || '' })}>
                    <SelectTrigger className="rounded-xl border-primary/10 h-14 active:scale-98 transition-all hover:bg-primary/5 text-xs"><SelectValue placeholder="Select staff member" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2">
                      {sortedStaff.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()} className="rounded-lg h-10 text-xs">{s.fullName} ({s.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">Subject</Label>
                  <Input required value={newMessage.subject} onChange={e => setNewMessage({ ...newMessage, subject: e.target.value })} placeholder="Inquiry / schedule update" className="rounded-xl border-primary/10 h-14 text-xs hover:bg-primary/5 transition-all" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">Message</Label>
                  <textarea
                    required
                    value={newMessage.body}
                    onChange={e => setNewMessage({ ...newMessage, body: e.target.value })}
                    className="w-full min-h-[160px] rounded-xl border border-primary/10 p-5 focus:outline-none focus:ring-2 focus:ring-primary/5 font-light text-sm hover:bg-primary/5 transition-all resize-none"
                    placeholder="Enter message details..."
                  />
                </div>
              </div>
              <DialogFooter className="pt-4 gap-4 sm:justify-between px-12 pb-12">
                <Button type="button" variant="ghost" className="rounded-md h-12 px-8 text-[12px] uppercase font-bold tracking-widest hover:bg-[#e5e7e0] text-[#4d4f46]" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                <Button type="submit" className="rounded-md px-12 h-12 font-bold text-[12px] uppercase tracking-widest bg-[#23251d] hover:bg-[#33342d] text-white shadow-none">Send Message</Button>
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
          <DialogContent className="max-w-sm border-none shadow-2xl rounded-md p-8 space-y-8 bg-[#eeefe9]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#23251d]">Finalize Ritual</DialogTitle>
              <DialogDescription className="text-[12px] uppercase tracking-widest font-bold text-[#6c6e63]">Select payment method</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <Button
                onClick={() => processPayment('cash')}
                disabled={isProcessingPayment}
                className="h-28 rounded-md flex flex-col gap-3 bg-[#23251d] hover:bg-[#33342d] text-white border-none shadow-none"
              >
                <span className="text-3xl font-bold">₱</span>
                <span className="text-[12px] uppercase tracking-widest font-bold">Cash</span>
              </Button>
              <Button
                onClick={() => processPayment('gcash')}
                disabled={isProcessingPayment}
                className="h-28 rounded-md flex flex-col gap-3 bg-[#007DFE] hover:bg-[#005bb5] text-white border-none shadow-none"
              >
                <span className="text-xl font-black italic tracking-tighter">GCash</span>
                <span className="text-[12px] uppercase tracking-widest font-bold opacity-80">Digital</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full rounded-xl text-[10px] uppercase tracking-widest font-bold text-[#5C544F] active:scale-95 transition-transform"
              onClick={() => setPaymentAptId(null)}
            >
              Cancel
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffDashboard;
