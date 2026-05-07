import React, { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths, isAfter, isBefore, min, max } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getStaffSchedule, getAllAttendance } from '@/api/apiClient';
import type { AttendanceLedgerProps } from '../types';
import type { StaffMember, ScheduleItem, AttendanceRecord } from '@/types/api';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export const AttendanceLedger: React.FC<AttendanceLedgerProps> = ({ attendance, staffMembers, onUpdateAttendance }) => {
  const [schedules, setSchedules] = useState<Record<number, ScheduleItem[]>>({});
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Modal state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [rangeSelection, setRangeSelection] = useState<{ start: Date; end: Date } | null>(null);
  const [staffAttendance, setStaffAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Range picker state
  const [customRangeStart, setCustomRangeStart] = useState<string>('');
  const [customRangeEnd, setCustomRangeEnd] = useState<string>('');

  useEffect(() => {
    const fetchSchedules = async () => {
      const scheduleMap: Record<number, ScheduleItem[]> = {};
      await Promise.all(
        staffMembers.map(async (staff) => {
          try {
            const res = await getStaffSchedule(staff.staffProfileId);
            if (res.data.success) {
              scheduleMap[staff.id] = res.data.data;
            }
          } catch (e) { }
        })
      );
      setSchedules(scheduleMap);
    };
    if (staffMembers?.length > 0) fetchSchedules();
  }, [staffMembers]);

  // Fetch full attendance history when a staff member is selected
  useEffect(() => {
    if (selectedStaff) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          // Fetch a wider range for the specific staff
          const start = new Date();
          start.setMonth(start.getMonth() - 6);
          const res = await getAllAttendance({
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
          });
          if (res.data.success) {
            // filter just for this staff
            const all = res.data.data as AttendanceRecord[];
            setStaffAttendance(all.filter(a => a.staff_id === selectedStaff.id));
          }
        } catch (e) {
          console.error("Failed to fetch history");
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();

      // Reset selections
      setSelectedDate(new Date());
      setRangeSelection(null);
      setCustomRangeStart('');
      setCustomRangeEnd('');
    }
  }, [selectedStaff]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayDate = new Date();
  const apiDayOfWeek = todayDate.getDay() === 0 ? 7 : todayDate.getDay();

  const handleDayClick = (day: Date) => {
    if (selectedDate && !rangeSelection && !isSameDay(selectedDate, day)) {
      const start = min([selectedDate, day]);
      const end = max([selectedDate, day]);
      setRangeSelection({ start, end });
      setCustomRangeStart(format(start, 'yyyy-MM-dd'));
      setCustomRangeEnd(format(end, 'yyyy-MM-dd'));
    } else {
      setSelectedDate(day);
      setRangeSelection(null);
      setCustomRangeStart('');
      setCustomRangeEnd('');
    }
  };

  const applyCustomRange = () => {
    if (customRangeStart && customRangeEnd) {
      setRangeSelection({
        start: new Date(customRangeStart),
        end: new Date(customRangeEnd)
      });
      setSelectedDate(null);
    }
  };

  // Calendar render logic
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const startDate = monthStart;
  const endDate = monthEnd;
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  const startDayPadding = getDay(monthStart); // 0 (Sun) - 6 (Sat)

  // Data for chart
  const chartData = useMemo(() => {
    if (!rangeSelection || !selectedStaff) return [];
    const interval = eachDayOfInterval(rangeSelection);
    return interval.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = staffAttendance.find(a => a.date.startsWith(dateStr));
      const dOfWeek = day.getDay() === 0 ? 7 : day.getDay();
      const sched = schedules[selectedStaff.id]?.find(s => s.day_of_week === dOfWeek && s.is_active);

      let expectedVal = null;
      if (sched) {
        const [eh, em] = sched.start_time.split(':');
        expectedVal = parseInt(eh) + parseInt(em) / 60;
      }

      let actualVal = null;
      if (record && record.check_in) {
        const d = new Date(record.check_in);
        actualVal = d.getHours() + d.getMinutes() / 60;
      }

      return {
        date: format(day, 'MMM dd'),
        expected: expectedVal,
        actual: actualVal,
        expectedStr: sched ? sched.start_time : 'Off',
        actualStr: record?.check_in ? format(new Date(record.check_in), 'HH:mm') : (dateStr > format(new Date(), 'yyyy-MM-dd') ? 'Upcoming' : 'Absent')
      };
    });
  }, [rangeSelection, selectedStaff, staffAttendance, schedules]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 shadow-premium rounded-none">
          <p className="font-semibold text-[11px] uppercase tracking-[0.2em] mb-2 text-foreground">{label}</p>
          <p className="text-[11px] uppercase tracking-wide"><span className="font-semibold text-warm-stone">Expected:</span> <span className="text-foreground">{payload[0]?.payload?.expectedStr}</span></p>
          <p className="text-[11px] uppercase tracking-wide"><span className="font-semibold text-primary">Actual:</span> <span className="text-foreground">{payload[0]?.payload?.actualStr}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mt-2 text-warm-stone">Monitor current shift status</p>
      </div>

      <div className="bg-card border border-kiln-border shadow-card rounded-3xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-kiln-border bg-bisque-wash/30 text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-stone">
          <div className="col-span-4 lg:col-span-5">Staff Member</div>
          <div className="col-span-3">Shift</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 lg:col-span-2 text-right">Action</div>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {staffMembers?.map(staff => {
            const todayRecord = attendance.find(a => a.staff_id === staff.id && a.date.startsWith(todayStr));
            const isTimedIn = todayRecord?.check_in && !todayRecord?.check_out;
            const sched = schedules[staff.id]?.find(s => s.day_of_week === apiDayOfWeek && s.is_active);

            return (
              <div key={staff.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-bisque-wash/20 transition-colors border-b border-kiln-border last:border-none">
                <div className="col-span-1 md:col-span-4 lg:col-span-5 flex items-center gap-4">
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${isTimedIn ? 'bg-forest-confirm animate-pulse shadow-[0_0_8px_rgba(67,83,52,0.4)]' : 'bg-brick-error/80'}`} title={isTimedIn ? 'Currently Timed In' : 'Not Timed In'} />
                  <div>
                    <p className="font-serif text-lg font-medium tracking-tight">{staff.fullName}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-stone">{staff.role}</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex items-center gap-2 md:block">
                  <span className="md:hidden text-xs font-semibold uppercase tracking-widest text-muted-foreground w-20">Shift</span>
                  <span className="font-mono text-sm">{sched ? `${sched.start_time} - ${sched.end_time}` : <span className="text-muted-foreground italic">Off Duty</span>}</span>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center gap-2 md:block">
                  <span className="md:hidden text-xs font-semibold uppercase tracking-widest text-muted-foreground w-20">Status</span>
                  <span className="font-mono text-sm font-medium">{todayRecord?.check_in ? format(new Date(todayRecord.check_in), 'HH:mm:ss') : <span className="text-muted-foreground uppercase text-xs tracking-widest">Pending</span>}</span>
                </div>

                   <div className="col-span-1 md:col-span-3 lg:col-span-2 flex justify-start md:justify-end gap-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-kiln-border md:border-t-0">
                  {todayRecord ? (
                    <>
                      {!todayRecord.check_in && <Button onClick={() => onUpdateAttendance(todayRecord.id, 'Present')} variant="outline" className="rounded-xl min-h-[44px] text-[11px] font-semibold uppercase tracking-widest border-forest-confirm/20 text-forest-confirm hover:bg-forest-confirm hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" aria-label={`Time in ${staff.fullName}`}>Time In</Button>}
                      {!todayRecord.check_out && todayRecord.check_in && <Button onClick={() => onUpdateAttendance(todayRecord.id, 'Absent')} variant="outline" className="rounded-xl min-h-[44px] text-[11px] font-semibold uppercase tracking-widest border-brick-error/20 text-brick-error hover:bg-brick-error hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" aria-label={`Time out ${staff.fullName}`}>Time Out</Button>}
                    </>
                  ) : (
                    <Badge variant="outline" className="rounded-md text-[11px] font-semibold uppercase text-warm-stone tracking-widest px-3 py-1 border-kiln-border/40 bg-bisque-wash/10">No Record</Badge>
                  )}
                  <Button onClick={() => setSelectedStaff(staff)} variant="outline" size="icon" className="rounded-xl h-11 w-11 border-kiln-border hover:bg-bisque-wash/50 hover:scale-[1.05] active:scale-[0.95] transition-all duration-200" aria-label={`View dossier for ${staff.fullName}`}>
                    <CalendarDays className="w-4 h-4 text-warm-stone" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedStaff} onOpenChange={(o) => !o && setSelectedStaff(null)}>
        <DialogContent className="sm:max-w-[900px] rounded-3xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-kiln-border shadow-premium animate-in fade-in zoom-in-95 duration-500 ease-out-quart">
          <DialogHeader className="p-8 border-b border-kiln-border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-bisque-wash border border-primary/20 flex items-center justify-center text-primary">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-serif text-3xl font-medium tracking-tight text-foreground">
                  {selectedStaff?.fullName}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold uppercase tracking-widest mt-1 text-muted-foreground">
                  Attendance Dossier & Performance
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[500px]">
            {/* Left sidebar: Calendar */}
            <div className="lg:col-span-1 border-r border-border p-6 bg-card flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest">{format(calendarMonth, 'MMMM yyyy')}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} aria-label="Next month"><ChevronRight className="h-5 w-5" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-xs font-semibold uppercase text-muted-foreground">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-8">
                {Array.from({ length: startDayPadding }).map((_, i) => <div key={`pad-${i}`} className="aspect-square" />)}
                {daysInMonth.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const record = staffAttendance.find(a => a.date.startsWith(dateStr));
                  const isSel = selectedDate && isSameDay(day, selectedDate);
                  const isInRange = rangeSelection && isAfter(day, rangeSelection.start) && isBefore(day, rangeSelection.end);
                  const isRangeEdge = rangeSelection && (isSameDay(day, rangeSelection.start) || isSameDay(day, rangeSelection.end));
                  const hasWarning = record && record.tardiness_minutes > 0;
                  const hasSuccess = record && record.check_in && record.tardiness_minutes === 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square flex items-center justify-center text-xs font-mono relative transition-all duration-200 rounded-lg
                             ${isSel || isRangeEdge ? 'bg-primary text-white font-bold shadow-sm' : ''}
                             ${isInRange ? 'bg-bisque-wash text-primary' : ''}
                             ${!isSel && !isRangeEdge && !isInRange ? 'hover:bg-warm-canvas' : ''}
                           `}
                    >
                      {format(day, 'd')}
                      {hasWarning && <span className="absolute bottom-1 w-1 h-1 bg-destructive rounded-full" />}
                      {hasSuccess && <span className="absolute bottom-1 w-1 h-1 bg-success-color rounded-full" />}
                    </button>
                  )
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-kiln-border">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-stone mb-6">Calendar View</h3>
                <div className="flex flex-col gap-2">
                  <input type="date" value={customRangeStart} onChange={e => setCustomRangeStart(e.target.value)} className="w-full text-xs font-mono p-3 border border-kiln-border bg-bisque-wash/20 focus:outline-none focus:border-primary transition-colors rounded-xl" aria-label="Start date for custom range" />
                  <input type="date" value={customRangeEnd} onChange={e => setCustomRangeEnd(e.target.value)} className="w-full text-xs font-mono p-3 border border-kiln-border bg-bisque-wash/20 focus:outline-none focus:border-primary transition-colors rounded-xl" aria-label="End date for custom range" />
                  <Button onClick={applyCustomRange} variant="outline" className="w-full rounded-xl text-[11px] font-semibold uppercase tracking-[0.15em] h-10 mt-2 border-kiln-border hover:bg-bisque-wash/30" aria-label="Apply custom date range to history">Apply Range</Button>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-2 p-8 bg-bisque-wash/10 flex flex-col">
              {isLoadingHistory ? (
                <div className="flex-1 flex items-center justify-center text-xs font-semibold uppercase tracking-widest animate-pulse text-warm-stone">Loading Records...</div>
              ) : rangeSelection ? (
                <div className="flex-1 flex flex-col animate-in fade-in">
                  <h3 className="font-serif text-2xl font-normal mb-6">Timeline Analysis</h3>
                  <div className="flex items-center gap-8 border-b border-kiln-border pb-6 mb-6">
                    <div>
                      <p className="text-xs font-semibold uppercase text-warm-stone tracking-widest mb-1">Period</p>
                      <p className="font-mono text-lg">{format(rangeSelection.start, 'MMM dd')} - {format(rangeSelection.end, 'MMM dd')}</p>
                    </div>
                    <div className="w-px h-8 bg-kiln-border"></div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-warm-stone tracking-widest mb-1">Data Points</p>
                      <p className="font-mono text-lg">{chartData.length} Days</p>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--kiln-border))" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--warm-stone)' }} dy={10} />
                        <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--warm-stone)' }} dx={-10} tickFormatter={(v) => {
                          const h = Math.floor(v);
                          const m = Math.round((v - h) * 60).toString().padStart(2, '0');
                          return `${h}:${m}`;
                        }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }} />
                        <Line type="monotone" dataKey="expected" name="Scheduled" stroke="hsl(var(--kiln-border))" strokeWidth={2} dot={false} />
                        <Line type="stepAfter" dataKey="actual" name="Actual Check-in" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--foreground))' }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-warm-stone font-semibold uppercase tracking-widest mt-4 text-center">Tap two dates to select a range</p>
                </div>
              ) : selectedDate ? (
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-10">
                    <p className="text-xs font-semibold uppercase text-warm-stone tracking-widest mb-2">Daily Summary</p>
                    <h3 className="font-serif text-3xl font-medium tracking-tight">{format(selectedDate, 'EEEE, MMMM do')}</h3>
                  </div>

                  {(() => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const record = staffAttendance.find(a => a.date.startsWith(dateStr));
                    const dOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
                    const sched = schedules[selectedStaff?.id || 0]?.find(s => s.day_of_week === dOfWeek && s.is_active);

                    return (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-kiln-border/50 pb-4">
                          <span className="text-xs font-semibold uppercase tracking-widest text-warm-stone">Expected</span>
                          <span className="font-mono text-lg">{sched ? `${sched.start_time} - ${sched.end_time}` : 'Off Duty'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-kiln-border/50 pb-4">
                          <span className="text-xs font-semibold uppercase tracking-widest text-warm-stone">Check In</span>
                          <span className={`font-mono text-lg ${record?.check_in ? (record.tardiness_minutes > 0 ? 'text-brick-error font-bold' : 'text-forest-confirm font-bold') : (dateStr > format(new Date(), 'yyyy-MM-dd') ? 'text-warm-stone' : '')}`}>
                            {record?.check_in ? format(new Date(record.check_in), 'HH:mm:ss') : (dateStr > format(new Date(), 'yyyy-MM-dd') ? 'Upcoming' : 'No Record')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-stone">Attendance Dossier</p>
                          <span className={`font-mono text-lg ${record && record.tardiness_minutes > 0 ? 'text-brick-error font-bold' : ''}`}>
                            {record ? `${record.tardiness_minutes} mins` : '-'}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground opacity-50">
                  <CalendarDays className="h-16 w-16 mb-4 stroke-1" />
                  <p className="text-xs font-semibold uppercase tracking-widest">Select a date or range</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

