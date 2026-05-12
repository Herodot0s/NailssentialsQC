import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Clock } from 'lucide-react';
import { getServices, getAllStaff, createAppointment } from '@/api/apiClient';
import type { Service, StaffMember } from '@/types/api';

interface LogWalkInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const LogWalkInDialog: React.FC<LogWalkInDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walkInTime, setWalkInTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, hourCycle: 'h23' }));
  const [selectedItems, setSelectedItems] = useState<Array<{ serviceId: string, staffId: string }>>([
    { serviceId: '', staffId: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [serviceRes, staffRes] = await Promise.all([
            getServices(),
            getAllStaff()
          ]);
          setServices(serviceRes.data.data);
          const staffData = staffRes.data.data;
          setStaffList(Array.isArray(staffData) ? staffData : (staffData?.items || []));
        } catch (err) {
          setError('Failed to load services or staff.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [open]);

  const addItem = () => {
    setSelectedItems([...selectedItems, {
      serviceId: '',
      staffId: ''
    }]);
  };

  const removeItem = (index: number) => {
    if (selectedItems.length > 1) {
      const newItems = [...selectedItems];
      newItems.splice(index, 1);
      setSelectedItems(newItems);
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...selectedItems];
    (newItems[index] as any)[field] = value;
    setSelectedItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.some(i => !i.serviceId || !i.staffId) || !walkInTime) {
      setError('Please fill in all service details and start time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        items: selectedItems.map(i => ({
          serviceId: parseInt(i.serviceId),
          staffId: parseInt(i.staffId),
          startTime: walkInTime
        })),
        date: new Date().toISOString(),
        notes,
        isWalkIn: true
      });
      onSuccess();
      onOpenChange(false);
      setSelectedItems([{ serviceId: '', staffId: '' }]);
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to log walk-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-hairline shadow-2xl rounded-md p-0 overflow-hidden bg-surface-card">
        <div className="bg-primary p-10 text-white">
          <DialogHeader>
            <DialogTitle className="display-lg text-white">Walk-in <span className="italic opacity-80">Registration</span></DialogTitle>
            <DialogDescription className="text-white/70 body-md mt-2">Instant service logging for on-site clients.</DialogDescription>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="utility-xs text-mute">Loading Artisans...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label className="utility-xs text-mute">Global Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      type="time"
                      value={walkInTime}
                      onChange={(e) => setWalkInTime(e.target.value)}
                      className="rounded-md border-hairline h-12 pl-12 bg-white"
                    />
                  </div>
                </div>
                <div className="body-sm text-mute italic pb-3">
                  This time will apply to all services in this wave.
                </div>
              </div>

              <div className="space-y-4">
              {selectedItems.map((item, index) => (
                <div key={index} className="p-6 bg-surface-soft/50 border border-hairline-soft rounded-md space-y-4 relative group">
                  {selectedItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-mute hover:text-accent-red"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="utility-xs text-mute">Treatment</Label>
                      <Select value={item.serviceId} onValueChange={(val) => updateItem(index, 'serviceId', val || '')}>
                        <SelectTrigger className="rounded-md border-hairline h-12 bg-white">
                          <SelectValue placeholder="Select Service">
                            {services.find(s => s.id.toString() === item.serviceId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-hairline shadow-xl">
                          {services.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name} - ₱{s.price}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="utility-xs text-mute">Artisan</Label>
                      <Select value={item.staffId} onValueChange={(val) => updateItem(index, 'staffId', val || '')}>
                        <SelectTrigger className="rounded-md border-hairline h-12 bg-white">
                          <SelectValue placeholder="Select Technician">
                            {staffList.find(s => s.staffProfileId.toString() === item.staffId)?.fullName}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-hairline shadow-xl">
                          {staffList.filter(s => s.role !== 'customer').map(s => (
                            <SelectItem key={s.id} value={s.staffProfileId.toString()}>{s.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                onClick={addItem} 
                className="w-full rounded-md border-dashed border-hairline h-12 gap-2 utility-xs text-mute hover:bg-surface-soft"
              >
                <Plus className="h-4 w-4" /> Add Another Service
              </Button>
            </div>
            </div>

            <div className="space-y-2">
              <Label className="utility-xs text-mute">Internal Notes</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[100px] rounded-md border border-hairline p-4 focus:outline-none focus:ring-1 focus:ring-primary/20 body-sm text-body placeholder:text-ash resize-none"
                placeholder="Client preferences or specific requests..."
              />
            </div>

            {error && (
              <div className="p-4 bg-accent-red-soft border border-accent-red/10 text-accent-red utility-xs rounded-md">
                {error}
              </div>
            )}

            <DialogFooter className="pt-4 gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                className="btn-secondary px-6" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-primary px-10"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Recording...</>
                ) : (
                  'Log Ritual'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
