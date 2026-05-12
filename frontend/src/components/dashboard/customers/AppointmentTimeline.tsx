import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parse } from 'date-fns';
import type { StaffMember } from '@/types/api';

interface AppointmentTimelineProps {
  appointments: Array<{
    id: number;
    customer: { full_name: string };
    status: string;
    appointment_date: string;
    items: Array<{
      id: number;
      service: { name: string };
      staff_id: number;
      start_time: string;
      end_time: string;
      status: string;
    }>;
  }>;
  staffMembers: StaffMember[];
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({ appointments, staffMembers }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return '--:--';
    try {
      const date = parse(timeStr, 'HH:mm', new Date());
      return format(date, 'h:mm aa');
    } catch {
      return timeStr;
    }
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  
  const todayItems = safeAppointments
    .filter(app => app?.appointment_date?.startsWith(todayStr))
    .flatMap(app => 
      (app?.items || []).map(item => ({
        id: item.id,
        appId: app.id,
        customerName: app.customer?.full_name || 'Walk-in Client',
        serviceName: item.service?.name || 'Service',
        staffId: item.staff_id,
        startTime: item.start_time,
        endTime: item.end_time,
        status: item.status
      }))
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getStaffName = (id: number) => {
    return staffMembers.find(s => s.staffProfileId === id)?.fullName || `Staff #${id}`;
  };

  const getStatusBadgeStyles = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-accent-green-soft text-accent-green border-accent-green/10';
      case 'in_progress': return 'bg-accent-blue-soft text-accent-blue border-accent-blue/10';
      case 'cancelled': return 'bg-accent-red-soft text-accent-red border-accent-red/10';
      default: return 'bg-surface-soft text-mute border-hairline';
    }
  };

  const nowTime = new Date().toTimeString().substring(0, 5);
  let closestIdx = -1;
  for (let i = 0; i < todayItems.length; i++) {
    if (todayItems[i].startTime >= nowTime) {
      closestIdx = i;
      break;
    }
  }

  return (
    <Card className="rounded-md border border-hairline shadow-none bg-surface-card mt-8 overflow-hidden">
      <CardHeader className="border-b border-hairline-soft p-6">
        <CardTitle className="display-lg text-ink font-extrabold">Today's Schedule</CardTitle>
        <CardDescription className="utility-xs text-mute mt-1">
          {todayItems.length} Rituals Scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {todayItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="body-md text-mute italic">
              No rituals scheduled for this cycle.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[120px_1fr_1fr_150px_120px] gap-4 p-4 bg-surface-soft/30 utility-xs text-mute border-b border-hairline-soft">
                <div className="pl-4">Timeline</div>
                <div>Client</div>
                <div>Treatment</div>
                <div>Staff</div>
                <div>Status</div>
              </div>
              
              <div className="divide-y divide-hairline-soft max-h-[400px] overflow-y-auto">
                {todayItems.map((item, idx) => {
                  const isCurrent = idx === closestIdx;
                  return (
                    <div 
                      key={`${item.appId}-${item.id}`} 
                      className={`grid grid-cols-[120px_1fr_1fr_150px_120px] gap-4 p-4 items-center hover:bg-surface-soft/50 transition-colors ${
                        isCurrent ? 'border-l-2 border-l-primary bg-primary/5' : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="pl-4 body-strong text-primary">
                        {formatTime12h(item.startTime)}
                      </div>
                      <div className="body-strong text-ink">
                        {item.customerName}
                      </div>
                      <div className="body-sm text-mute">
                        {item.serviceName}
                      </div>
                      <div className="caption-md text-ink uppercase">
                        {getStaffName(item.staffId)}
                      </div>
                      <div>
                        <Badge variant="outline" className={`rounded-full px-3 py-1 caption-xs ${getStatusBadgeStyles(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
