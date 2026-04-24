import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Target,
  Info,
  Download,
  Calendar,
  Settings,
  Mail,
  Phone,
  ShieldOff,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import apiClient from '../api/apiClient';

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
  netPay: number;
}

interface AttendanceRecord {
  id: number;
  staff: { full_name: string };
  date: string;
  check_in: string | null;
  check_out: string | null;
  tardiness_minutes: number;
  deduction_amount: number;
  notes: string | null;
}

interface StaffMember {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  fullName: string;
  specializations: string | null;
  createdAt: string;
}

const COLORS = ['#B8794E', '#D9A07E', '#E6B69E', '#F2CCBE', '#9A6440'];

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollRecord[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    specializations: '',
  });

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const fetchStaff = async () => {
    try {
      setIsStaffLoading(true);
      const res = await apiClient.get('/staff');
      if (res.data.success) {
        setStaffMembers(res.data.data);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    } finally {
      setIsStaffLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [salesRes, payrollRes, attendanceRes] = await Promise.all([
        apiClient.get('/reports/daily-sales'),
        apiClient.get('/reports/payroll', {
          params: { startDate: dateRange.start, endDate: dateRange.end },
        }),
        apiClient.get('/attendance/all'),
      ]);

      if (salesRes.data.success) setSalesStats(salesRes.data.data);
      if (payrollRes.data.success) setPayrollReport(payrollRes.data.data.report);
      if (attendanceRes.data.success) setAllAttendance(attendanceRes.data.data);
      
      await fetchStaff();
    } catch (err: any) {
      setError('Failed to fetch management data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsStaffLoading(true);
      const res = await apiClient.post('/staff', newStaffForm);
      if (res.data.success) {
        setShowAddStaffModal(false);
        setNewStaffForm({
          fullName: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          specializations: '',
        });
        await fetchStaff();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add staff member.');
    } finally {
      setIsStaffLoading(false);
    }
  };

  const handleToggleStaffStatus = async (id: number, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'reactivate'} this staff member?`)) return;
    
    try {
      setIsStaffLoading(true);
      await apiClient.put(`/staff/${id}`, { isActive: !currentStatus });
      await fetchStaff();
    } catch (err) {
      alert('Failed to update staff status.');
    } finally {
      setIsStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterPayroll = () => {
    fetchData();
  };

  if (isLoading && !salesStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading Management Dashboard...</p>
      </div>
    );
  }

  const pieData =
    salesStats?.serviceBreakdown.map((s) => ({ name: s.name, value: s.amount })) || [];
  const barData = salesStats?.serviceBreakdown.map((s) => ({ name: s.name, count: s.count })) || [];

  const revenueProgress = salesStats ? (salesStats.totalRevenue / salesStats.target) * 100 : 0;

  return (
    <div className="container max-w-7xl mx-auto py-10 px-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <p className="text-primary font-serif italic text-lg mb-1">Hi, {user?.fullName || 'there'}!</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Manager Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time performance analytics and payroll management.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="analytics" className="px-8">
            Performance Analytics
          </TabsTrigger>
          <TabsTrigger value="attendance" className="px-8">
            Attendance Review
          </TabsTrigger>
          <TabsTrigger value="payroll" className="px-8">
            Payroll & Reports
          </TabsTrigger>
          <TabsTrigger value="team" className="px-8">
            Team Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider">
                  Today's Revenue
                </CardDescription>
                <CardTitle className="text-2xl font-serif font-bold text-primary flex items-center justify-between">
                  ₱{salesStats?.totalRevenue.toLocaleString()}
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-success-color font-bold">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from yesterday
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider">
                  Total Bookings
                </CardDescription>
                <CardTitle className="text-2xl font-serif font-bold text-foreground flex items-center justify-between">
                  {salesStats?.transactionCount}
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {salesStats?.onlineCount} Online • {salesStats?.walkInCount} Walk-ins
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider">
                    Daily Team Target
                  </CardDescription>
                  <span className="text-xs font-bold text-primary">
                    {revenueProgress.toFixed(0)}%
                  </span>
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-foreground flex items-center justify-between">
                  ₱{salesStats?.target.toLocaleString()}
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  Remaining: ₱{(8000 - (salesStats?.totalRevenue || 0)).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Service Volume</CardTitle>
                <CardDescription>Number of services performed today by category.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      cursor={{ fill: '#FDF8F4' }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" fill="#B8794E" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Revenue Split</CardTitle>
                <CardDescription>Total earnings per service type.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full mt-4 space-y-2 overflow-y-auto max-h-[60px] pr-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-2 font-medium">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {entry.name}
                      </div>
                      <span className="font-bold">₱{entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-0 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif">Staff Attendance Logs</CardTitle>
                <CardDescription>Review and override staff check-in/out records.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchData()}>
                <Calendar className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Date</TableHead>
                    <TableHead className="font-bold">Staff</TableHead>
                    <TableHead className="font-bold">Check-In</TableHead>
                    <TableHead className="font-bold">Check-Out</TableHead>
                    <TableHead className="font-bold">Lateness</TableHead>
                    <TableHead className="pr-6 font-bold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAttendance.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="pl-6">
                        {new Date(row.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-bold">{row.staff.full_name}</TableCell>
                      <TableCell>
                        {row.check_in
                          ? new Date(row.check_in).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {row.check_out
                          ? new Date(row.check_out).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {row.tardiness_minutes > 0 ? (
                          <Badge variant="secondary" className="text-destructive font-bold">
                            {row.tardiness_minutes}m late
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-success-color font-bold">
                            On Time
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Settings className="h-3 w-3" /> Override
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allAttendance.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-20 text-muted-foreground italic"
                      >
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <CardTitle className="text-xl font-serif">Payroll Summary</CardTitle>
                  <CardDescription>
                    Aggregate commissions and attendance deductions.
                  </CardDescription>
                </div>
                <div className="flex items-end gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      className="h-9 text-xs"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      className="h-9 text-xs"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                  <Button size="sm" className="h-9 px-4 gap-2" onClick={handleFilterPayroll}>
                    <Filter className="h-3.5 w-3.5" /> Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Technician</TableHead>
                    <TableHead className="font-bold">Services</TableHead>
                    <TableHead className="font-bold text-right">Commissions</TableHead>
                    <TableHead className="font-bold">Late Records</TableHead>
                    <TableHead className="font-bold text-right">Deductions</TableHead>
                    <TableHead className="pr-6 font-bold text-right">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollReport.map((row) => (
                    <TableRow key={row.staffId} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6 font-bold">{row.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.commissionCount} services
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₱{row.totalCommission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {row.attendanceCount > 0 ? (
                          <Badge
                            variant="outline"
                            className="text-destructive border-destructive/20 bg-destructive/5"
                          >
                            {row.attendanceCount} incidents
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No lates</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-destructive font-medium">
                        -₱{row.totalDeduction.toFixed(2)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-primary">
                            ₱{row.netPay.toFixed(2)}
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-[10px] text-muted-foreground"
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payrollReport.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-20 text-muted-foreground italic"
                      >
                        No payroll data found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-4 justify-between items-center">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Net Pay = Total Commissions - Attendance Deductions.
              </p>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary font-bold">
                Process Batch Payment <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif">Staff Directory</CardTitle>
                <CardDescription>Manage technician profiles and system access.</CardDescription>
              </div>
              <Button onClick={() => setShowAddStaffModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Staff Member
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Staff Name</TableHead>
                    <TableHead className="font-bold">Contact Info</TableHead>
                    <TableHead className="font-bold">Specializations</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="pr-6 font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="pl-6 font-bold">{staff.fullName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs space-y-1">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" /> {staff.email || 'No email'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground" /> {staff.phone || 'No phone'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs italic text-muted-foreground">
                          {staff.specializations || 'General Technician'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {staff.isActive ? (
                          <Badge className="bg-success-color text-white border-none font-bold">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="border-none text-muted-foreground font-bold">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs gap-1 hover:bg-primary/5 text-primary font-bold"
                            onClick={() => handleToggleStaffStatus(staff.id, staff.isActive)}
                          >
                            {staff.isActive ? <ShieldOff className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                            {staff.isActive ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {isStaffLoading && staffMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!isStaffLoading && staffMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Modal */}
      <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-light">Onboard Technician</DialogTitle>
              <DialogDescription className="text-white/70 font-light mt-2">
                Create a new artisan account for the NailssentialsQC team.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleAddStaff} className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label htmlFor="staffFullName" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name</Label>
              <Input
                id="staffFullName"
                required
                className="rounded-none border-primary/20 focus-visible:ring-primary/20 h-11"
                value={newStaffForm.fullName}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffEmail" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  className="rounded-none border-primary/20 focus-visible:ring-primary/20 h-11"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  placeholder="juan@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffPhone" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Phone</Label>
                <Input
                  id="staffPhone"
                  className="rounded-none border-primary/20 focus-visible:ring-primary/20 h-11"
                  value={newStaffForm.phone}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                  placeholder="0917XXXXXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffUsername" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Username</Label>
                <Input
                  id="staffUsername"
                  required
                  className="rounded-none border-primary/20 focus-visible:ring-primary/20 h-11"
                  value={newStaffForm.username}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                  placeholder="juan.staff"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffPassword" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Temp Password</Label>
                <Input
                  id="staffPassword"
                  type="password"
                  required
                  className="rounded-none border-primary/20 focus-visible:ring-primary/20 h-11"
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffSpecializations" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Specializations</Label>
              <Input
                id="staffSpecializations"
                className="rounded-none border-primary/20 focus-visible:ring-primary/20 h-11"
                value={newStaffForm.specializations}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, specializations: e.target.value })}
                placeholder="Nail Art, Gel Polish, Foot Spa"
              />
            </div>
            <DialogFooter className="pt-6 gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                className="rounded-none uppercase tracking-widest text-[10px] font-bold"
                onClick={() => setShowAddStaffModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isStaffLoading}
                className="rounded-none uppercase tracking-widest text-[10px] font-bold px-8"
              >
                {isStaffLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
