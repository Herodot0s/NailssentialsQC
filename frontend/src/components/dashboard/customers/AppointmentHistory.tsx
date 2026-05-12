import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Smartphone, UserCheck, Camera, Clock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, parse } from 'date-fns';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface AppointmentHistoryProps {
  appointments: Array<{
    id: number;
    customer: { full_name: string };
    status: string;
    appointment_date: string;
    is_walk_in: boolean;
    service_photo_url: string | null;
    items: Array<{
      service: { name: string };
      staff: { full_name: string };
      start_time: string;
    }>;
  }>;
}

export const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({ appointments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'walkin'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

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
  const filteredAppointments = safeAppointments.filter(app => {
    const matchesSearch = app.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.items?.some(i => i.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || 
                         (filter === 'online' && !app.is_walk_in) || 
                         (filter === 'walkin' && app.is_walk_in);
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeStyles = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-accent-green-soft text-accent-green border-accent-green/10';
      case 'cancelled': return 'bg-accent-red-soft text-accent-red border-accent-red/10';
      case 'no_show': return 'bg-surface-soft text-mute border-hairline';
      default: return 'bg-accent-blue-soft text-accent-blue border-accent-blue/10';
    }
  };

  return (
    <Card className="rounded-md border border-hairline shadow-none bg-surface-card overflow-hidden">
      <CardHeader className="border-b border-hairline-soft p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <CardTitle className="display-lg text-ink font-extrabold">Appointment History</CardTitle>
            <CardDescription className="utility-xs text-mute mt-1">
              Complete archive of past and upcoming rituals
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
              <Input 
                placeholder="Search clients or treatments..." 
                className="pl-10 h-10 rounded-md border-hairline bg-white text-body body-sm placeholder:text-ash"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex border border-hairline p-1 bg-surface-soft rounded-md">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 utility-xs transition-all rounded-sm ${filter === 'all' ? 'bg-white text-ink' : 'text-mute hover:text-ink'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('online')}
                className={`px-4 py-1.5 utility-xs transition-all rounded-sm ${filter === 'online' ? 'bg-white text-ink' : 'text-mute hover:text-ink'}`}
              >
                Online
              </button>
              <button 
                onClick={() => setFilter('walkin')}
                className={`px-4 py-1.5 utility-xs transition-all rounded-sm ${filter === 'walkin' ? 'bg-white text-ink' : 'text-mute hover:text-ink'}`}
              >
                Walk-in
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[140px_1fr_1fr_150px_100px_120px_120px] gap-4 p-4 bg-surface-soft/30 utility-xs text-mute border-b border-hairline-soft">
              <div className="pl-4">Date & Time</div>
              <div>Client</div>
              <div>Treatment</div>
              <div>Technician</div>
              <div className="text-center">Source</div>
              <div className="text-center">Proof</div>
              <div className="pr-4 text-right">Status</div>
            </div>
            
            <div className="divide-y divide-hairline-soft max-h-[600px] overflow-y-auto">
              {filteredAppointments.length === 0 ? (
                <div className="py-20 text-center body-md text-mute italic">
                  No matching records found in the archive.
                </div>
              ) : filteredAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className="grid grid-cols-[140px_1fr_1fr_150px_100px_120px_120px] gap-4 p-6 items-center hover:bg-surface-soft/50 transition-colors group cursor-pointer" 
                  onClick={() => setSelectedAppointment(app)}
                >
                  <div className="pl-4 space-y-1">
                    <p className="body-strong text-ink tabular-nums">
                      {format(new Date(app.appointment_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="caption-sm text-mute uppercase tabular-nums">
                      {formatTime12h(app.items[0]?.start_time)}
                    </p>
                  </div>
                  <div className="body-strong text-ink">
                    {app.customer.full_name}
                    <p className="caption-xs text-ash uppercase mt-0.5 group-hover:text-primary transition-colors">
                      ID #{app.id}
                    </p>
                  </div>
                  <div className="body-sm text-body">
                    {app.items.map(i => i.service.name).join(', ')}
                  </div>
                  <div className="caption-md text-ink uppercase">
                    {app.items[0]?.staff.full_name || 'Assigned Staff'}
                  </div>
                  <div className="flex justify-center">
                    {app.is_walk_in ? (
                      <UserCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-accent-blue" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {app.service_photo_url ? (
                      <div className="relative h-10 w-10 group/proof rounded-md overflow-hidden border border-hairline">
                        <img src={app.service_photo_url} className="h-full w-full object-cover grayscale group-hover/proof:grayscale-0 transition-all" />
                        <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover/proof:opacity-100 transition-opacity">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <span className="caption-xs text-stone uppercase">No Proof</span>
                    )}
                  </div>
                  <div className="pr-4 text-right">
                    <Badge variant="outline" className={`rounded-full px-3 py-1 caption-xs ${getStatusBadgeStyles(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-md border border-hairline p-0 overflow-hidden bg-surface-card shadow-2xl">
          {selectedAppointment && (
            <div className="flex flex-col">
              <div className="relative h-64 bg-ink overflow-hidden">
                {selectedAppointment.service_photo_url ? (
                  <img 
                    src={selectedAppointment.service_photo_url} 
                    alt="Proof of service"
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/10">
                    <Camera className="h-16 w-16 mb-2" />
                    <p className="utility-xs text-white/30">No service photo available</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent flex flex-col justify-end p-8">
                  <Badge className="w-fit mb-3 rounded-full bg-primary text-white border-none caption-xs">
                    Ritual #{selectedAppointment.id}
                  </Badge>
                  <h2 className="heading-lg text-white">{selectedAppointment.items.map((i: any) => i.service.name).join(' & ')}</h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-soft rounded-sm">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="caption-xs text-mute uppercase">Client</p>
                        <p className="body-strong text-ink">{selectedAppointment.customer.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-soft rounded-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="caption-xs text-mute uppercase">Date</p>
                        <p className="body-strong text-ink">{format(new Date(selectedAppointment.appointment_date), 'MMMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-soft rounded-sm">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="caption-xs text-mute uppercase">Time</p>
                        <p className="body-strong text-ink">{formatTime12h(selectedAppointment.items[0]?.start_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-soft rounded-sm">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="caption-xs text-mute uppercase">Technician</p>
                        <p className="body-strong text-ink">{selectedAppointment.items[0]?.staff.full_name || 'Assigned Artisan'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-hairline-soft flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`rounded-full px-3 py-1 caption-xs ${getStatusBadgeStyles(selectedAppointment.status)}`}>
                      {selectedAppointment.status.replace('_', ' ')}
                    </Badge>
                    <span className="caption-sm text-mute uppercase">
                      {selectedAppointment.is_walk_in ? 'Walk-in Client' : 'Online Booking'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="btn-secondary h-10 px-6" 
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Close Record
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
