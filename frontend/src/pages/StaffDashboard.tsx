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
  checkOutTime: string | null;
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
      try { await checkIn(); fetchDashboardData(); } catch { console.error('Check-in failed.'); }
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
    } catch {
      console.error('Check-in failed.');
    }
  };

  const handleCheckOut = async () => {
    if (user?.role === 'manager') {
      try { await checkOut(); fetchDashboardData(); } catch { console.error('Check-out failed.'); }
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

    try { await checkOut(); fetchDashboardData(); } catch { console.error('Check-out failed.'); }
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
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase">Finished</Badge>;
      case 'in_progress': return <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase">Active</Badge>;
      case 'pending': return <Badge className="bg-slate-100 text-slate-500 border-none rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase">Incoming</Badge>;
      default: return <Badge variant="outline" className="rounded-xl text-[10px] tracking-[0.2em] uppercase">{status}</Badge>;
    }
  };

  if (isLoading && !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-muted-foreground">Synchronizing Artisan Rituals...</p>
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
    <div className="container max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.5em] uppercase font-bold text-primary">Artisan Terminal</p>
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-slate-900">
            {user?.fullName.split(' ')[0]}'s <span className="italic">Workspace</span>
            {status?.isCheckedIn && (
              <Badge className="ml-6 rounded-xl bg-[oklch(0.75_0.15_45)] text-white text-[10px] font-bold py-1.5 px-4 border-none animate-in fade-in slide-in-from-left-4 duration-1000 tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2 inline-block" />
                Active duty
              </Badge>
            )}
          </h1>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => setShowMessageModal(true)} className="rounded-xl gap-3 border-primary/20 hover:bg-primary/5 active:scale-95 transition-all h-12 px-6 text-[10px] uppercase font-bold tracking-[0.2em]">
             <Mail className="h-4 w-4" /> Correspondence
           </Button>
           <Button onClick={() => setShowWalkInModal(true)} className="rounded-xl gap-3 active:scale-95 transition-all h-12 px-6 text-[10px] uppercase font-bold tracking-[0.2em] bg-slate-900 hover:bg-slate-800">
             <Plus className="h-4 w-4" /> Log walk-in
           </Button>
        </div>
      </header>

      {!status?.isCheckedIn && (
        <div className="mb-12 bg-primary/5 border border-primary/10 p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700 rounded-2xl backdrop-blur-sm">
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#5C544F] leading-loose">
            <span className="italic mr-2 text-primary">Note:</span> Check-in required for hours and commission. Schedule remains visible.
          </p>
        </div>
      )}

      <Tabs defaultValue="rituals" className="space-y-12">
        <TabsList className="bg-transparent p-0 h-auto gap-12 border-b border-primary/10 w-full justify-start rounded-none mb-4">
          {['Rituals', 'Harvest', 'Letters'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase()}
              className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#5C544F]/60 bg-transparent border-b-2 border-transparent data-[state=active]:border-[oklch(0.75_0.15_45)] data-[state=active]:text-slate-900 rounded-none px-0 py-6 shadow-none transition-all hover:text-[#5C544F]"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="rituals" className="mt-0 space-y-12">
          {status?.isCheckedIn && (
            <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 p-5 md:hidden rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.75_0.15_45)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5C544F]">Active since {status.checkInTime}</span>
              </div>
              <SwipeButton onSwipe={handleCheckOut} variant="destructive" className="h-10 text-[10px] uppercase tracking-[0.2em] px-5 py-0 min-w-0 flex-shrink-0 font-bold">
                End Shift
              </SwipeButton>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <MobileCheckIn
               isCheckedIn={status?.isCheckedIn ?? false}
               checkInTime={status?.checkInTime ?? null}
               currentTime={currentTime}
               onCheckIn={handleCheckIn}
               onCheckOut={handleCheckOut}
             />

             {attendanceMessage && (
               <div className={`mt-2 p-5 text-[10px] uppercase tracking-[0.3em] font-bold border rounded-2xl backdrop-blur-sm animate-in zoom-in-95 duration-500 ${
                 attendanceMessage.type === 'error' ? 'bg-destructive/5 text-destructive border-destructive/10' :
                 attendanceMessage.type === 'warning' ? 'bg-amber-500/5 text-amber-700 border-amber-500/10' :
                 'bg-emerald-500/5 text-emerald-700 border-emerald-500/10'
               } lg:col-span-12`}>
                 <p className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                   {attendanceMessage.text}
                 </p>
               </div>
             )}

             <div className="lg:col-span-8 space-y-12">
                <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden bg-white hover:shadow-[0_12px_50px_rgba(0,0,0,0.06)] transition-all duration-700">
                    <CardHeader className="bg-primary/5 border-b border-primary/5 p-10">
                       <CardTitle className="font-serif text-3xl text-slate-900 tracking-tight">Today's rituals</CardTitle>
                       <CardDescription className="text-[10px] font-bold flex items-center gap-3 text-[#5C544F] uppercase tracking-[0.3em] mt-3">
                         <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.75_0.15_45)] animate-pulse" />
                         Managing {todayAppointments.length} scheduled treatment sessions
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                       <Table>
                          <TableHeader className="bg-muted/20 border-none">
                             <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="pl-10 h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Cycle</TableHead>
                                <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Client</TableHead>
                                <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Treatment</TableHead>
                                <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Status</TableHead>
                                <TableHead className="pr-10 h-16 text-right font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Actions</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {todayAppointments.length === 0 ? (
                               <TableRow>
                                 <TableCell colSpan={5} className="text-center py-32 text-muted-foreground italic text-sm font-medium bg-muted/5 border-none">
                                    No rituals scheduled for this cycle.
                                 </TableCell>
                               </TableRow>
                             ) : todayAppointments.map((apt) => {
                               const myItems = apt.items.filter(i => i.staff_id === user?.staffProfileId || (!user?.staffProfileId && i.staff_id === user?.id));
                               return myItems.map(item => {
                                 const isActive = item.status === 'in_progress';
                                 const now = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                 const isCurrentTimeSlot = now >= item.start_time && now <= item.end_time;

                                 return (
                                 <TableRow key={item.id} className={`hover:bg-primary/5 border-primary/5 transition-all duration-500 group ${isActive ? 'bg-[oklch(0.75_0.15_45)]/5' : ''} ${isCurrentTimeSlot ? 'bg-amber-50/30' : ''}`}>
                                   <TableCell className="pl-10 py-8 font-bold text-xs tabular-nums text-slate-900 tracking-tighter">{item.start_time} — {item.end_time}</TableCell>
                                   <TableCell className="font-serif text-xl text-slate-900">{apt.customer.full_name}</TableCell>
                                   <TableCell className="font-medium text-xs text-slate-700 uppercase tracking-widest">{item.service.name}</TableCell>
                                   <TableCell>{getStatusBadge(item.status)}</TableCell>
                                   <TableCell className="pr-10 text-right">
                                      {item.status !== 'completed' && (
                                         <Button
                                           onClick={() => handleComplete(apt.id)}
                                           size="sm"
                                           className="rounded-xl h-10 text-[10px] font-bold tracking-[0.2em] uppercase px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/10"
                                         >
                                           Finalize ritual
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

                <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden bg-white/80 hover:shadow-[0_12px_50px_rgba(0,0,0,0.05)] transition-all duration-700">
                    <CardHeader className="bg-muted/20 border-b border-primary/5 p-10">
                       <CardTitle className="font-serif text-3xl text-slate-400 tracking-tight">Upcoming rituals</CardTitle>
                       <CardDescription className="text-[10px] font-bold text-[#5C544F]/70 uppercase tracking-[0.3em] mt-3">Schedule for the next 14 days</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                       <Table>
                          <TableHeader className="bg-muted/10 border-none">
                             <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="pl-10 h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/50">Date</TableHead>
                                <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/50">Cycle</TableHead>
                                <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/50">Client</TableHead>
                                <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/50">Treatment</TableHead>
                                <TableHead className="pr-10 h-16 text-right font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/50">Status</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {upcomingAppointments.length === 0 ? (
                               <TableRow>
                                 <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic text-sm font-medium bg-muted/5 border-none">
                                    No upcoming sessions detected.
                                 </TableCell>
                               </TableRow>
                             ) : upcomingAppointments.map((apt) => {
                               const myItems = apt.items.filter(i => i.staff_id === user?.staffProfileId || (!user?.staffProfileId && i.staff_id === user?.id));
                               return myItems.map(item => (
                                 <TableRow key={item.id} className="hover:bg-primary/5 border-primary/5 transition-all duration-500 opacity-60 hover:opacity-100">
                                   <TableCell className="pl-10 py-8 font-bold text-xs text-primary tabular-nums tracking-tighter">
                                       {new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                                     </TableCell>
                                   <TableCell className="py-8 font-bold text-xs tabular-nums text-slate-900 tracking-tighter">{item.start_time} — {item.end_time}</TableCell>
                                   <TableCell className="font-serif text-xl text-slate-900">{apt.customer.full_name}</TableCell>
                                   <TableCell className="font-medium text-xs text-slate-700 uppercase tracking-widest">{item.service.name}</TableCell>
                                   <TableCell className="pr-10 text-right">{getStatusBadge(item.status)}</TableCell>
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

        <TabsContent value="harvest" className="mt-0 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] bg-primary/5 backdrop-blur-sm">
                 <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.5em]">Session revenue</CardTitle>
                 </CardHeader>
                 <CardContent className="p-10 space-y-8">
                    <div className="flex justify-between items-end border-b border-primary/10 pb-10">
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5C544F]">Today's accrual</p>
                       <p className="text-6xl font-serif font-light text-slate-900 tracking-tighter">₱{commission.today.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5C544F]">Weekly aggregate</p>
                       <p className="text-4xl font-serif font-light text-primary tracking-tighter">₱{commission.thisWeek.toLocaleString()}</p>
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] bg-white">
                 <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.5em]">Commission engine</CardTitle>
                 </CardHeader>
                 <CardContent className="p-10 space-y-10">
                    <div className="space-y-5">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C544F]">
                          <span>Team tier payout</span>
                          <span className="text-[oklch(0.75_0.15_45)]">Active (8%)</span>
                       </div>
                       <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[oklch(0.75_0.15_45)]" style={{ width: '80%' }} />
                       </div>
                       <p className="text-[10px] text-muted-foreground italic font-medium tracking-wide">Based on previous month's salon sales.</p>
                    </div>
                    <div className="space-y-5">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C544F]">
                          <span>Specialty quota</span>
                          <span className="text-[oklch(0.75_0.15_45)]">Target: ₱6,000</span>
                       </div>
                       <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[oklch(0.75_0.15_45)]" style={{ width: '45%' }} />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 border-b border-primary/5 p-10">
                 <CardTitle className="font-serif text-3xl text-slate-900 tracking-tight">Payroll archive</CardTitle>
                 <CardDescription className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em] mt-3">History of finalized payouts and deductions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/10 border-none">
                       <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="pl-10 h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Cycle</TableHead>
                          <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Base</TableHead>
                          <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Accrued</TableHead>
                          <TableHead className="h-16 font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Deductions</TableHead>
                          <TableHead className="pr-10 h-16 text-right font-bold text-[10px] uppercase tracking-[0.4em] text-[#5C544F]/70">Final net</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {myPayrolls.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic text-sm font-medium bg-muted/5 border-none">
                              No payroll records found.
                           </TableCell>
                         </TableRow>
                       ) : myPayrolls.map(p => (
                         <TableRow key={p.id || Math.random()} className="hover:bg-primary/5 border-primary/5 transition-all duration-500">
                            <TableCell className="pl-10 py-8 font-bold text-xs tabular-nums text-slate-900 tracking-tighter">
                               {p.period ? `${new Date(p.period.start_date).toLocaleDateString()} — ${new Date(p.period.end_date).toLocaleDateString()}` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs tabular-nums text-slate-700 tracking-tighter">₱{(p.base_pay || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-xs tabular-nums text-slate-700 tracking-tighter">₱{(p.commissions || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-xs text-destructive font-bold tabular-nums tracking-tighter">-₱{(p.deductions || 0).toLocaleString()}</TableCell>
                            <TableCell className="pr-10 text-right font-serif text-2xl font-light text-primary tabular-nums tracking-tighter">₱{(p.net_pay || 0).toLocaleString()}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="letters" className="mt-0">
           <MessagesView />
        </TabsContent>
      </Tabs>

      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden bg-white animate-in zoom-in-95 duration-500">
          <div className="bg-slate-900 p-12 text-white">
            <DialogHeader>
               <DialogTitle className="font-serif text-5xl font-light tracking-tight">Internal <span className="italic">dispatch</span></DialogTitle>
               <DialogDescription className="text-white/60 font-light mt-4 text-xs uppercase tracking-[0.3em]">Communicate with the collective.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSendMessage} className="p-12 space-y-8">
             <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">Recipient</Label>
                  <Select required onValueChange={(val: string | null) => setNewMessage({...newMessage, receiverId: val || ''})}>
                     <SelectTrigger className="rounded-xl border-primary/10 h-14 active:scale-98 transition-all hover:bg-primary/5 text-xs"><SelectValue placeholder="Select artisan" /></SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2">
                        {sortedStaff.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()} className="rounded-lg h-10 text-xs">{s.fullName} ({s.role})</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">Subject</Label>
                  <Input required value={newMessage.subject} onChange={e => setNewMessage({...newMessage, subject: e.target.value})} placeholder="Ritual query / schedule change" className="rounded-xl border-primary/10 h-14 text-xs hover:bg-primary/5 transition-all" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-[#5C544F] uppercase tracking-[0.3em]">Message body</Label>
                  <textarea
                    required
                    value={newMessage.body}
                    onChange={e => setNewMessage({...newMessage, body: e.target.value})}
                    className="w-full min-h-[160px] rounded-xl border border-primary/10 p-5 focus:outline-none focus:ring-2 focus:ring-primary/5 font-light text-sm hover:bg-primary/5 transition-all resize-none"
                    placeholder="Detail your request here..."
                  />
                </div>
             </div>
             <DialogFooter className="pt-4 gap-4 sm:justify-between">
                <Button type="button" variant="ghost" className="rounded-xl h-14 px-8 text-[10px] uppercase font-bold tracking-[0.2em] active:scale-95 transition-all" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                <Button type="submit" className="rounded-xl px-12 h-14 font-bold text-[10px] uppercase tracking-[0.2em] bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/20">Dispatch</Button>
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
        <DialogContent className="max-w-sm border-none shadow-2xl rounded-3xl p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-slate-900">Finalize Payment</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest font-bold text-[#5C544F]">Select client payment method</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => processPayment('cash')}
              disabled={isProcessingPayment}
              className="h-24 rounded-2xl flex flex-col gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all text-white border-none shadow-lg"
            >
              <span className="text-2xl">₱</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Cash</span>
            </Button>
            <Button
              onClick={() => processPayment('gcash')}
              disabled={isProcessingPayment}
              className="h-24 rounded-2xl flex flex-col gap-2 bg-[#007DFE] hover:bg-[#007DFE]/90 active:scale-95 transition-all text-white border-none shadow-lg"
            >
              <span className="text-xl font-bold italic tracking-tighter">GCash</span>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">Digital</span>
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
  );
};

export default StaffDashboard;
