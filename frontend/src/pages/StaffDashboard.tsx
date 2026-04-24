import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAttendanceStatus,
  checkIn,
  checkOut,
  getAppointments,
  completeAppointment,
  getCommissionSummary,
  getStaffCommissions,
  getServices,
  createAppointment,
  getCustomerHistory,
} from '../api/apiClient';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Clock,
  Calendar,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  LogIn,
  LogOut,
  Info,
  Wallet,
  ArrowRight,
  TrendingUp,
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
  technician: { full_name: string };
  status: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  is_walk_in: boolean;
  services: { service: { name: string; price: number } }[];
}

interface CommissionRecord {
  id: number;
  commission_amount: number;
  commission_date: string;
  commission_rate: number;
  base_amount: number;
  service: { name: string };
  transaction: {
    receipt_number: string;
    appointment: {
      customer: { full_name: string };
    };
  };
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  // Attendance State
  const [status, setStatus] = useState<AttendanceStatus | null>(null);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [commission, setCommission] = useState({ today: 0, thisWeek: 0 });
  const [detailedCommissions, setDetailedCommissions] = useState<CommissionRecord[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);

  // Walk-in Form State
  const [services, setServices] = useState<any[]>([]);
  const [walkInForm, setWalkInForm] = useState({
    serviceId: '',
    time: '12:00',
    notes: '',
    isWalkIn: true,
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [attRes, aptRes, commRes, detCommRes, svcRes] = await Promise.all([
        getAttendanceStatus(),
        getAppointments(),
        getCommissionSummary(),
        getStaffCommissions(),
        getServices(),
      ]);

      if (attRes.data.success) {
        setStatus(attRes.data.data.status);
      }

      if (aptRes.data.success) {
        setAppointments(aptRes.data.data);
      }

      if (commRes.data.success) {
        setCommission(commRes.data.data);
      }

      if (detCommRes.data.success) {
        setDetailedCommissions(detCommRes.data.data);
      }

      if (svcRes.data.success) {
        setServices(svcRes.data.data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to fetch dashboard data.');
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
    try {
      setIsLoading(true);
      await checkIn();
      await fetchDashboardData();
    } catch {
      setError('Check-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      await checkOut();
      await fetchDashboardData();
    } catch {
      setError('Check-out failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    const paymentMethod = window.confirm('Pay with GCash? (Cancel for Cash)') ? 'gcash' : 'cash';
    try {
      setIsLoading(true);
      await completeAppointment(id, { paymentMethod });
      await fetchDashboardData();
    } catch {
      setError('Failed to complete appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      await createAppointment({
        serviceId: parseInt(walkInForm.serviceId),
        date: today,
        time: walkInForm.time,
        notes: walkInForm.notes,
        isWalkIn: true,
      } as any);
      setShowWalkInModal(false);
      await fetchDashboardData();
    } catch {
      setError('Failed to create walk-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const viewCustomerHistory = async (customer: any) => {
    try {
      setIsLoading(true);
      const res = await getCustomerHistory(customer.id);
      setSelectedCustomer(res.data.data.customer);
      setCustomerHistory(res.data.data.history);
      setShowHistoryModal(true);
    } catch {
      setError('Failed to fetch history.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <Badge className="bg-success-color hover:bg-success-color text-white">Completed</Badge>
        );
      case 'in_progress':
        return <Badge className="bg-info-color hover:bg-info-color text-white">In Progress</Badge>;
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-primary-light text-primary-dark">
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading && !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading staff dashboard...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointment_date.startsWith(todayStr));

  return (
    <div className="container max-w-7xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <p className="text-primary font-serif italic text-lg mb-1">Hi, {user?.fullName || 'there'}!</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Staff Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule, attendance, and earnings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCommissionModal(true)}
            className="h-11 px-6 shadow-sm"
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Earning Logs
          </Button>
          <Button onClick={() => setShowWalkInModal(true)} className="h-11 px-6 shadow-sm">
            <Plus className="mr-2 h-5 w-5" />
            Quick Walk-In
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Row: Attendance & Commissions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        {/* Attendance Card */}
        <Card className="md:col-span-5 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Attendance Control
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center -mt-6 pb-8 space-y-6">
            <div className="bg-white rounded-full p-8 shadow-card flex flex-col items-center justify-center w-48 h-48 border-4 border-primary/10">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
                {currentTime.toLocaleDateString([], { weekday: 'short' })}
              </span>
              <span className="text-4xl font-serif font-bold text-primary my-1">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <Badge
                variant={status?.isCheckedIn ? 'default' : 'secondary'}
                className={status?.isCheckedIn ? 'bg-success-color text-white' : ''}
              >
                {status?.isCheckedIn ? 'ACTIVE' : 'OFF DUTY'}
              </Badge>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <Button
                onClick={status?.isCheckedIn ? handleCheckOut : handleCheckIn}
                disabled={isLoading}
                variant={status?.isCheckedIn ? 'destructive' : 'default'}
                className="w-full h-12 text-base font-bold shadow-sm"
              >
                {status?.isCheckedIn ? (
                  <>
                    <LogOut className="mr-2 h-5 w-5" />
                    Check Out
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Check In
                  </>
                )}
              </Button>
              {status?.isCheckedIn && status.checkInTime && (
                <p className="text-center text-xs text-muted-foreground font-medium">
                  Logged in at{' '}
                  {new Date(`2000-01-01T${status.checkInTime}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commission Card */}
        <Card className="md:col-span-7 border-none shadow-sm flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  My Earnings
                </CardTitle>
                <CardDescription>Track your service commissions for this period.</CardDescription>
              </div>
              <Button
                variant="link"
                onClick={() => setShowCommissionModal(true)}
                className="text-primary p-0 h-auto gap-1"
              >
                View detailed logs <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Commission</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-success-color">
                    ₱{commission.today.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success-color" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">This Week Total</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-primary">
                    ₱{commission.thisWeek.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t py-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Commissions are calculated based on completed service values.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Bottom Row: Appointments */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-serif font-bold">Today's Schedule</CardTitle>
            <CardDescription>
              You have {todayAppointments.length} appointments scheduled for today.
            </CardDescription>
          </div>
          <div className="hidden sm:block">
            <Badge variant="outline" className="text-muted-foreground">
              {currentTime.toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground italic bg-muted/20">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Time</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Service</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="pr-6 text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAppointments.map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {apt.start_time} - {apt.end_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <button
                            onClick={() => viewCustomerHistory(apt.customer)}
                            className="text-primary font-bold hover:underline text-left"
                          >
                            {apt.customer.full_name}
                          </button>
                          {apt.is_walk_in && (
                            <span className="text-[10px] w-fit font-bold px-1.5 py-0.5 rounded-sm bg-info-color/10 text-info-color uppercase mt-1">
                              Walk-in
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary/60 shrink-0" />
                          <span className="font-medium">
                            {apt.services.map((s) => s.service.name).join(', ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <Button
                            onClick={() => handleComplete(apt.id)}
                            size="sm"
                            className="bg-success-color hover:bg-success-color/90 text-white font-bold h-9 px-4"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Complete & Pay
                          </Button>
                        )}
                        {apt.status === 'completed' && (
                          <div className="text-success-color font-bold flex items-center justify-end gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            Done
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Walk-In Modal */}
      <Dialog open={showWalkInModal} onOpenChange={setShowWalkInModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">
              New Walk-In Appointment
            </DialogTitle>
            <DialogDescription>
              Quickly add a walk-in customer to your current schedule.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWalkInSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select
                required
                onValueChange={(val: string | null) =>
                  val && setWalkInForm({ ...walkInForm, serviceId: val })
                }
              >
                <SelectTrigger id="service" className="h-11">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} - ₱{s.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                required
                value={walkInForm.time}
                onChange={(e) => setWalkInForm({ ...walkInForm, time: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional details..."
                value={walkInForm.notes}
                onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })}
                className="h-11"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowWalkInModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-11 px-8">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">
              {selectedCustomer?.full_name}'s Profile
            </DialogTitle>
            <DialogDescription>
              Customer history and important health information.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto pr-2 space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Allergies
                </p>
                <p className="font-medium text-foreground">
                  {selectedCustomer?.allergies || 'None reported'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Internal Notes
                </p>
                <p className="font-medium text-foreground">
                  {selectedCustomer?.notes || 'No notes available'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold border-b pb-2">Past Visits</h3>
              <div className="space-y-3">
                {customerHistory.map((h) => (
                  <Card key={h.id} className="border shadow-none bg-white">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold text-sm">
                            {new Date(h.appointment_date).toLocaleDateString([], {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {h.services.map((s: any) => s.service.name).join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Technician: {h.technician.full_name}
                        </p>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="text-lg font-bold text-primary">
                          ₱{h.transactions?.[0]?.amount || 0}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {h.transactions?.[0]?.payment_method || 'CASH'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {customerHistory.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground italic">
                    No past visits recorded.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button onClick={() => setShowHistoryModal(false)}>Close Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Logs Modal */}
      <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Commission Logs
            </DialogTitle>
            <DialogDescription>
              A detailed list of your earned commissions from the last 50 services.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto mt-4">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Receipt #</TableHead>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold">Service</TableHead>
                  <TableHead className="text-right font-bold">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedCommissions.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/10">
                    <TableCell className="text-xs">
                      {new Date(log.commission_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {log.transaction.receipt_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.transaction.appointment.customer.full_name}
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.service.name}
                      <p className="text-[10px] text-muted-foreground">
                        Base: ₱{Number(log.base_amount).toFixed(2)} ({log.commission_rate}%)
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-bold text-success-color">
                      ₱{Number(log.commission_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {detailedCommissions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground italic"
                    >
                      No commission records found yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button onClick={() => setShowCommissionModal(false)}>Close Logs</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
