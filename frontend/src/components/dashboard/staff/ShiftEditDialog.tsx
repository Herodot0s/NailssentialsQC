import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ShiftEditDialogProps } from '../types';

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
       <DialogContent className="max-w-sm border-none shadow-premium rounded-3xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 ease-out-quart">
          <div className="bg-bisque-wash/30 p-8 border-b border-kiln-border">
             <DialogHeader>
                <DialogTitle className="font-serif text-3xl font-light italic text-charcoal-bark">Edit <span className="not-italic">Shift</span></DialogTitle>
                <DialogDescription className="text-warm-stone font-light">Day {(editingDay ?? 0) === 0 ? 'Sunday' : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][editingDay! - 1]}</DialogDescription>
             </DialogHeader>
          </div>
          <form onSubmit={onSubmit} className="p-8 space-y-6">
             <div className="flex items-center justify-between py-2">
                <Label className="text-[11px] uppercase font-semibold tracking-[0.2em]">Active Shift</Label>
                <button 
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  aria-label={`Toggle shift active status: ${form.isActive ? 'Active' : 'Inactive'}`}
                  onClick={() => onFormChange({...form, isActive: !form.isActive})}
                  className={`w-14 h-8 rounded-full transition-all duration-300 ease-out-quart flex items-center px-1.5 ${form.isActive ? 'bg-forest-confirm justify-end shadow-[inset_0_2px_8px_rgba(67,83,52,0.3)]' : 'bg-warm-stone/20 justify-start'}`}
                >
                   <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out-quart" />
                </button>
             </div>
             {form.isActive && (
               <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                     <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">Start Time</Label>
                     <Input type="time" value={form.start} onChange={e => onFormChange({...form, start: e.target.value})} className="rounded-xl border-kiln-border h-12 bg-warm-canvas/50" aria-label="Shift start time" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">End Time</Label>
                     <Input type="time" value={form.end} onChange={e => onFormChange({...form, end: e.target.value})} className="rounded-xl border-kiln-border h-12 bg-warm-canvas/50" aria-label="Shift end time" />
                  </div>
               </div>
             )}
             <DialogFooter className="pt-6">
                <Button type="submit" className="w-full rounded-xl h-12 uppercase tracking-[0.2em] font-semibold text-[11px] shadow-premium">Save Shift Assignment</Button>
             </DialogFooter>
          </form>
       </DialogContent>
    </Dialog>
  );
};
