import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const todayStr = new Date().toISOString().split('T')[0];
  
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  
  // Flatten appointments into individual items for the timeline
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

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-success-color text-white border-none';
      case 'in_progress': return 'bg-primary text-white border-none';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-none';
      default: return 'bg-gray-100 text-muted-foreground border-none';
    }
  };

  // Find the closest appointment to "now"
  const nowTime = new Date().toTimeString().substring(0, 5); // "HH:MM"
  let closestIdx = -1;
  for (let i = 0; i < todayItems.length; i++) {
    if (todayItems[i].startTime >= nowTime) {
      closestIdx = i;
      break;
    }
  }

  return (
    <Card className="rounded-none border-none shadow-sm bg-white mt-8">
      <CardHeader className="border-b border-gray-50 p-8 pb-6">
        <CardTitle className="font-serif text-2xl font-light">Today's Schedule</CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">
          {todayItems.length} Rituals Scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {todayItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-light italic text-muted-foreground">
              No rituals scheduled for this cycle.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-[100px_1fr_1fr_150px_120px] gap-4 p-4 bg-muted/30 text-[9px] uppercase tracking-widest font-bold text-muted-foreground border-b border-gray-50">
              <div className="pl-4">Timeline</div>
              <div>Client</div>
              <div>Treatment</div>
              <div>Staff</div>
              <div>Status</div>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {todayItems.map((item, idx) => {
                const isCurrent = idx === closestIdx;
                return (
                  <div 
                    key={`${item.appId}-${item.id}`} 
                    className={`grid grid-cols-[100px_1fr_1fr_150px_120px] gap-4 p-4 items-center hover:bg-primary-ultra/10 transition-colors ${
                      isCurrent ? 'border-l-2 border-l-primary bg-primary-ultra/5' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="pl-4 font-mono text-[11px] font-bold">
                      {item.startTime.substring(0, 5)}
                    </div>
                    <div className="text-sm font-medium">
                      {item.customerName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.serviceName}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-bold">
                      {getStaffName(item.staffId)}
                    </div>
                    <div>
                      <Badge variant="outline" className={`rounded-none text-[9px] uppercase tracking-widest font-bold px-3 py-1 ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
