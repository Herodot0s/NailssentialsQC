import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PayrollRunDialogProps } from './types';

export const PayrollRunDialog: React.FC<PayrollRunDialogProps> = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
        <div className="bg-primary p-10 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-light italic">Run <span className="not-italic">Calculation</span></DialogTitle>
            <DialogDescription className="text-white/60 font-light mt-2">Generate weekly payroll slips based on attendance and performance.</DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={onSubmit} className="p-10 space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Period Start</Label>
                 <Input type="date" required value={form.startDate} onChange={e => onFormChange({...form, startDate: e.target.value})} className="rounded-none border-gray-100 bg-gray-50/50 text-sm" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Period End</Label>
                 <Input type="date" required value={form.endDate} onChange={e => onFormChange({...form, endDate: e.target.value})} className="rounded-none border-gray-100 bg-gray-50/50 text-sm" />
              </div>
           </div>
           <div className="space-y-2">
              <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Gross Salon Revenue (For Target Evaluation)</Label>
              <Input type="number" required value={form.totalSalonSales} onChange={e => onFormChange({...form, totalSalonSales: e.target.value})} placeholder="0.00" className="rounded-none border-gray-100 bg-gray-50/50 text-sm" />
           </div>
           <DialogFooter className="pt-6">
              <Button type="submit" className="w-full rounded-none h-12 uppercase tracking-widest font-bold text-[9px] shadow-lg shadow-primary/20">Run Calculation</Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
