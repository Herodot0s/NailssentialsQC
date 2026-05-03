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
  getMyMessages,
  sendMessage,
} from '../api/apiClient';
import type { PayrollRecord, Message } from '@/types/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SwipeButton from '@/components/ui/swipe-button';
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
  Clock,
  Plus,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';

interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  date: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modals
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ receiverId: '', subject: '', body: '' });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [attRes, aptRes, commRes, payrollRes, msgRes] = await Promise.all([
        getAttendanceStatus(),
        getAppointments(),
        getCommissionSummary(),
        getMyPayroll(),
        getMyMessages()
      ]);

      if (attRes.data.success) setStatus(attRes.data.data.status);
      if (aptRes.data.success) {
        setAppointments(Array.isArray(aptRes.data.data) ? aptRes.data.data : []);
        if (!Array.isArray(aptRes.data.data)) {
          console.error('[StaffDashboard] Unexpected appointments response format, expected array:', aptRes.data.data);
        }
      }
      if (commRes.data.success) setCommission(commRes.data.data);
      if (payrollRes.data.success) setMyPayrolls(payrollRes.data.data);
      if (msgRes.data.success) setMessages(msgRes.data.data);

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
    try { await checkIn(); fetchDashboardData(); } catch { console.error('Check-in failed.'); }
  };

  const handleCheckOut = async () => {
    try { await checkOut(); fetchDashboardData(); } catch { console.error('Check-out failed.'); }
  };

  const handleComplete = async (id: number) => {
    const paymentMethod = window.confirm('Pay with GCash? (Cancel for Cash)') ? 'gcash' : 'cash';
    try {
      await completeAppointment(id, { paymentMethod });
      fetchDashboardData();
    } catch {
      console.error('Failed to finalize ritual.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
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

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'completed': return <Badge className="bg-success-color/10 text-success-color border-none rounded-none text-[8px] uppercase tracking-widest font-bold">Finished</Badge>;
      case 'in_progress': return <Badge className="bg-info-color/10 text-info-color border-none rounded-none text-[8px] uppercase tracking-widest font-bold">Active</Badge>;
      case 'pending': return <Badge className="bg-primary/5 text-primary border-none rounded-none text-[8px] uppercase tracking-widest font-bold">Incoming</Badge>;
      default: return <Badge variant="outline" className="rounded-none text-[8px] uppercase tracking-widest">{status}</Badge>;
    }
  };

  if (isLoading && !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">Synchronizing Artisan Rituals...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointment_date.startsWith(todayStr));

  return (
    <div className="container max-w-7xl mx-auto py-12 px-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="space-y-2">
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">Artisan Terminal</p>
          <h1 className="font-serif text-5xl font-light tracking-tight text-foreground">
            {user?.fullName.split(' ')[0]}'s <span className="italic">Workspace</span>
          </h1>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => setShowMessageModal(true)} className="rounded-none gap-2 border-primary/20">
             <Mail className="h-4 w-4" /> Internal Inbox
           </Button>
           <Button className="rounded-none gap-2">
             <Plus className="h-4 w-4" /> Log Walk-in
           </Button>
        </div>
      </header>

      <Tabs defaultValue="schedule" className="space-y-12">
        <TabsList className="bg-transparent p-0 h-auto gap-8 border-b border-primary/5 w-full justify-start rounded-none">
          {['schedule', 'earnings', 'messages'].map(tab => (
            <TabsTrigger 
              key={tab}
              value={tab} 
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-2 py-4 shadow-none transition-all"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="schedule" className="space-y-12 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <Card className="lg:col-span-4 rounded-none border-none shadow-[0_0_20px_rgba(0,0,0,0.05)] bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                <CardHeader className="pb-8">
                   <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Shift Registry
                   </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pb-12 space-y-8">
                   <div className={status?.isCheckedIn ? 'animate-pulse' : ''}>
                      <div className="bg-white rounded-full p-10 shadow-2xl flex flex-col items-center justify-center w-56 h-56 border border-primary/5">
                         <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                           {currentTime.toLocaleDateString([], { weekday: 'long' })}
                         </span>
                         <span className="text-6xl font-bold font-serif text-primary my-2">
                           {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         <Badge className={`rounded-none border-none text-[8px] uppercase tracking-widest font-bold ${status?.isCheckedIn ? 'bg-success-color/90 text-white shadow-sm px-3 py-1' : 'bg-muted text-muted-foreground'}`}>
                           {status?.isCheckedIn ? 'Status: Active' : 'Status: Off Duty'}
                         </Badge>
                      </div>
                   </div>

                   <div className="w-full max-w-xs space-y-4">
                      <SwipeButton
                        onSwipe={status?.isCheckedIn ? handleCheckOut : handleCheckIn}
                        variant={status?.isCheckedIn ? 'destructive' : 'default'}
                        className="w-full max-w-xs"
                      >
                        {status?.isCheckedIn ? 'Swipe to Check Out Artisan' : 'Swipe to Initialize Shift'}
                      </SwipeButton>
                      {status?.isCheckedIn && status.checkInTime && (
                        <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                          Shift Started at {status.checkInTime}
                        </p>
                      )}
                   </div>
                </CardContent>
             </Card>

             <Card className="lg:col-span-8 rounded-none border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8">
                   <CardTitle className="font-serif text-2xl">Today's Rituals</CardTitle>
                   <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Managing {todayAppointments.length} scheduled treatment sessions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   {todayAppointments.length === 0 ? (
                     <div className="text-center py-32 text-muted-foreground italic text-[10px] uppercase tracking-widest bg-muted/5 font-bold">
                        No rituals scheduled for this cycle.
                     </div>
                   ) : (
                     <Table>
                        <TableHeader className="bg-muted/30 border-none">
                           <TableRow className="border-none">
                              <TableHead className="pl-8 font-bold text-[9px] uppercase tracking-widest">Timeline</TableHead>
                              <TableHead className="font-bold text-[9px] uppercase tracking-widest">Client</TableHead>
                              <TableHead className="font-bold text-[9px] uppercase tracking-widest">Treatment</TableHead>
                              <TableHead className="font-bold text-[9px] uppercase tracking-widest">Status</TableHead>
                              <TableHead className="pr-8 text-right font-bold text-[9px] uppercase tracking-widest">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {todayAppointments.map((apt) => {
                             const myItems = apt.items.filter(i => i.staff_id === user?.id || !user?.id); 
                             return myItems.map(item => (
                               <TableRow key={item.id} className="hover:bg-primary-ultra/10 border-primary/5 transition-colors">
                                 <TableCell className="pl-8 py-6 font-bold text-xs">{item.start_time} — {item.end_time}</TableCell>
                                 <TableCell className="font-serif text-lg">{apt.customer.full_name}</TableCell>
                                 <TableCell className="font-medium text-xs">{item.service.name}</TableCell>
                                 <TableCell>{getStatusBadge(item.status)}</TableCell>
                                 <TableCell className="pr-8 text-right">
                                    {item.status !== 'completed' && (
                                       <Button onClick={() => handleComplete(apt.id)} size="sm" className="rounded-none h-8 text-[9px] uppercase font-bold tracking-widest px-4 bg-success-color hover:bg-success-color/90">Finalize Ritual</Button>
                                    )}
                                 </TableCell>
                               </TableRow>
                             ));
                           })}
                        </TableBody>
                     </Table>
                   )}
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-0 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-none border-none shadow-sm bg-primary-ultra/30">
                 <CardHeader>
                    <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Session Revenue</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="flex justify-between items-end border-b border-primary/10 pb-6">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's Accrual</p>
                       <p className="text-5xl font-serif font-light">₱{commission.today.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weekly Aggregate</p>
                       <p className="text-3xl font-serif font-light text-primary">₱{commission.thisWeek.toLocaleString()}</p>
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-none border-none shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Commission Engine</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="space-y-4">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span>Rule 1: Team Tier Payout</span>
                          <span className="text-success-color">Active (8%)</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success-color" style={{ width: '80%' }} />
                       </div>
                       <p className="text-[9px] text-muted-foreground italic">Based on previous month's salon sales.</p>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span>Rule 2: Specialty Quota</span>
                          <span className="text-primary">Target: ₱6,000</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '45%' }} />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           <Card className="rounded-none border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/5">
                 <CardTitle className="font-serif text-2xl">Payroll Archive</CardTitle>
                 <CardDescription className="text-[10px] uppercase font-bold tracking-widest">History of finalized payouts and deductions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/20">
                       <TableRow className="border-none">
                          <TableHead className="pl-8 font-bold text-[9px] uppercase tracking-widest">Cycle</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase tracking-widest">Base</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase tracking-widest">Accrued</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase tracking-widest">Deductions</TableHead>
                          <TableHead className="pr-8 text-right font-bold text-[9px] uppercase tracking-widest">Final Net</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {myPayrolls.map(p => (
                         <TableRow key={p.id} className="hover:bg-primary-ultra/10 border-primary/5 transition-colors">
                            <TableCell className="pl-8 py-6 font-bold text-xs">{new Date(p.period.start_date).toLocaleDateString()} — {new Date(p.period.end_date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs">₱{parseFloat(p.base_pay).toLocaleString()}</TableCell>
                            <TableCell className="text-xs">₱{parseFloat(p.commissions).toLocaleString()}</TableCell>
                            <TableCell className="text-xs text-destructive">-₱{parseFloat(p.deductions).toLocaleString()}</TableCell>
                            <TableCell className="pr-8 text-right font-serif text-xl font-light text-primary">₱{parseFloat(p.net_pay).toLocaleString()}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-0">
           <Card className="rounded-none border-none shadow-sm min-h-[400px]">
              <CardHeader className="bg-primary/5 border-b border-primary/5 flex flex-row justify-between items-center">
                 <CardTitle className="font-serif text-2xl">Internal Inbox</CardTitle>
                 <Badge className="rounded-none bg-primary text-white text-[8px] uppercase tracking-widest font-bold">{messages.filter(m => !m.is_read).length} New</Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-primary/5">
                    {messages.map(msg => (
                      <div key={msg.id} className={`p-8 hover:bg-primary-ultra/10 transition-colors cursor-pointer group ${!msg.is_read ? 'bg-primary-ultra/30' : ''}`}>
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                                  {msg.sender.username.charAt(0)}
                               </div>
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-bold uppercase tracking-widest">{msg.sender.username} <span className="font-normal text-muted-foreground lowercase ml-1">({msg.sender.role})</span></p>
                                  <p className="text-sm font-bold">{msg.subject}</p>
                               </div>
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{new Date(msg.created_at).toLocaleDateString()}</span>
                         </div>
                         <p className="text-xs text-muted-foreground font-light leading-relaxed pl-11 line-clamp-2 group-hover:line-clamp-none transition-all">
                            {msg.body}
                         </p>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-32 text-muted-foreground italic text-[10px] uppercase tracking-widest font-bold">Inbox is empty.</div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* Internal Messaging Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
          <div className="bg-primary p-10 text-white">
            <DialogHeader>
               <DialogTitle className="font-serif text-4xl font-light">Internal <span className="italic">Dispatch</span></DialogTitle>
               <DialogDescription className="text-white/70 font-light mt-2">Communicate with management or other technicians.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSendMessage} className="p-10 space-y-6 bg-white">
             <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Recipient</Label>
                <Select required onValueChange={(val: string | null) => setNewMessage({...newMessage, receiverId: val || ''})}>
                   <SelectTrigger className="rounded-none border-primary/10 h-12"><SelectValue placeholder="Select User" /></SelectTrigger>
                   <SelectContent className="rounded-none border-none shadow-xl">
                      <SelectItem value="1">Salon Management (System)</SelectItem>
                   </SelectContent>
                </Select>

                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Subject</Label>
                <Input required value={newMessage.subject} onChange={e => setNewMessage({...newMessage, subject: e.target.value})} placeholder="Ritual Query / Schedule Change" className="rounded-none border-primary/10 h-12" />

                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Message Body</Label>
                <textarea 
                  required 
                  value={newMessage.body} 
                  onChange={e => setNewMessage({...newMessage, body: e.target.value})} 
                  className="w-full min-h-[150px] rounded-none border border-primary/10 p-4 focus:outline-none focus:ring-1 focus:ring-primary/20 font-light text-sm" 
                  placeholder="Detail your request here..." 
                />
             </div>
             <DialogFooter className="pt-8">
                <Button type="button" variant="ghost" className="rounded-none" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                <Button type="submit" className="rounded-none px-10 h-12 font-bold uppercase tracking-widest text-[10px] gap-2"><Send className="h-3.5 w-3.5" /> Dispatch Message</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
