import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ShiftEditDialogProps } from './types';

export const ShiftEditDialog: React.FC<ShiftEditDialogProps> = ({
  open,
  onOpenChange,
  editingDay,
  form,
  onFormChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-sm border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white">
          <div className="bg-primary p-10 text-white">
             <DialogHeader>
                <DialogTitle className="font-serif text-3xl font-light italic">Edit <span className="not-italic">Shift</span></DialogTitle>
                <DialogDescription className="text-white/60 font-light">Day {(editingDay ?? 0) === 0 ? 'Sunday' : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][editingDay! - 1]}</DialogDescription>
             </DialogHeader>
          </div>
          <form onSubmit={onSubmit} className="p-10 space-y-6">
             <div className="flex items-center justify-between py-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest">Active Shift</Label>
                <button 
                  type="button"
                  onClick={() => onFormChange({...form, isActive: !form.isActive})}
                  className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${form.isActive ? 'bg-success-color justify-end' : 'bg-gray-200 justify-start'}`}
                >
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
             </div>
             {form.isActive && (
               <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                     <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Start Time</Label>
                     <Input type="time" value={form.start} onChange={e => onFormChange({...form, start: e.target.value})} className="rounded-none border-gray-100 h-10 bg-gray-50/50" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">End Time</Label>
                     <Input type="time" value={form.end} onChange={e => onFormChange({...form, end: e.target.value})} className="rounded-none border-gray-100 h-10 bg-gray-50/50" />
                  </div>
               </div>
             )}
             <DialogFooter className="pt-6">
                <Button type="submit" className="w-full rounded-none h-12 uppercase tracking-widest font-bold text-[9px] shadow-lg shadow-primary/20">Save Shift Assignment</Button>
             </DialogFooter>
          </form>
       </DialogContent>
    </Dialog>
  );
};
