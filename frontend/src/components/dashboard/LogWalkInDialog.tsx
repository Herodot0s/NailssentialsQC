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
  const [selectedItems, setSelectedItems] = useState<Array<{ serviceId: string, staffId: string, startTime: string }>>([
    { serviceId: '', staffId: '', startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }
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
      staffId: '',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
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
    if (selectedItems.some(i => !i.serviceId || !i.staffId || !i.startTime)) {
      setError('Please fill in all service details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        items: selectedItems.map(i => ({
          serviceId: parseInt(i.serviceId),
          staffId: parseInt(i.staffId),
          startTime: i.startTime
        })),
        date: new Date().toISOString(),
        notes,
        isWalkIn: true
      });
      onSuccess();
      onOpenChange(false);
      setSelectedItems([{ serviceId: '', staffId: '', startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }]);
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to log walk-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white">
        <div className="bg-primary p-10 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-4xl font-light">Walk-in <span className="italic">Registration</span></DialogTitle>
            <DialogDescription className="text-white/70 font-light mt-2 text-base">Instant service logging for on-site clients.</DialogDescription>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">Loading Artisans...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {selectedItems.map((item, index) => (
                <div key={index} className="p-6 bg-primary-ultra/10 border border-primary/5 space-y-4 relative group">
                  {selectedItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Treatment</Label>
                      <Select value={item.serviceId} onValueChange={(val) => updateItem(index, 'serviceId', val || '')}>
                        <SelectTrigger className="rounded-none border-primary/10 h-12 bg-white">
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-none shadow-xl">
                          {services.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name} - ₱{s.price}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Artisan</Label>
                      <Select value={item.staffId} onValueChange={(val) => updateItem(index, 'staffId', val || '')}>
                        <SelectTrigger className="rounded-none border-primary/10 h-12 bg-white">
                          <SelectValue placeholder="Select Technician" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-none shadow-xl">
                          {staffList.filter(s => s.role !== 'customer').map(s => (
                            <SelectItem key={s.id} value={s.staffProfileId.toString()}>{s.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => updateItem(index, 'startTime', e.target.value)}
                        className="rounded-none border-primary/10 h-12 pl-12 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem} className="w-full rounded-none border-dashed border-primary/30 h-12 gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-primary/5">
                <Plus className="h-4 w-4" /> Add Another Service
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Internal Notes</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[100px] rounded-none border border-primary/10 p-4 focus:outline-none focus:ring-1 focus:ring-primary/20 font-light text-sm resize-none"
                placeholder="Client preferences or specific requests..."
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/5 border border-destructive/10 text-destructive text-[10px] uppercase tracking-widest font-bold">
                {error}
              </div>
            )}

            <DialogFooter className="pt-4 gap-4">
              <Button type="button" variant="ghost" className="rounded-none text-[10px] uppercase tracking-widest font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-none px-10 h-12 font-bold uppercase tracking-widest text-[10px]">
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
