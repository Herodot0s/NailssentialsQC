import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ viewTransitionName: `shift-edit-${editingDay}` }}
        className="max-w-sm border border-[#bfc1b7] bg-white rounded-[6px] p-0 overflow-hidden transition-all duration-500 ease-out-quart starting:scale-95 starting:opacity-0"
      >
        <style>{`
             ::view-transition-old(shift-edit-${editingDay}),
             ::view-transition-new(shift-edit-${editingDay}) {
                animation-duration: 0.5s;
                animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1);
             }
          `}</style>
        <div className="p-6 border-b border-[#dcdfd2]">
          <DialogHeader>
            <DialogTitle className="font-sans text-[20px] font-bold text-[#23251d]">
              Edit Shift
            </DialogTitle>
            <DialogDescription className="text-[#4d4f46] text-[15px]">
              Day{' '}
              {(editingDay ?? 0) === 0
                ? 'Sunday'
                : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                    editingDay! - 1
                  ]}
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-[12px] uppercase font-bold text-[#4d4f46] tracking-wider">
              Active Shift
            </Label>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              aria-label={`Toggle shift active status: ${form.isActive ? 'Active' : 'Inactive'}`}
              onClick={() => onFormChange({ ...form, isActive: !form.isActive })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${form.isActive ? 'bg-[#B8794E]' : 'bg-[#e5e7e0]'}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.isActive ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
          {form.isActive && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] uppercase font-bold text-[#6c6e63] tracking-tight">
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={form.start}
                  onChange={(e) => onFormChange({ ...form, start: e.target.value })}
                  className="rounded-[6px] border-[#bfc1b7] h-10 bg-white text-[#23251d] focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[#B8794E]"
                  aria-label="Shift start time"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] uppercase font-bold text-[#6c6e63] tracking-tight">
                  End Time
                </Label>
                <Input
                  type="time"
                  value={form.end}
                  onChange={(e) => onFormChange({ ...form, end: e.target.value })}
                  className="rounded-[6px] border-[#bfc1b7] h-10 bg-white text-[#23251d] focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[#B8794E]"
                  aria-label="Shift end time"
                />
              </div>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full rounded-[6px] h-10 bg-[#B8794E] hover:bg-[#dd9001] text-white font-bold text-[14px] uppercase tracking-wide transition-colors"
            >
              Save Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
