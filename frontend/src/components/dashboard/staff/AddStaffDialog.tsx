import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AddStaffDialogProps } from '../types';

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-premium rounded-3xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 ease-out-quart">
        <div className="bg-bisque-wash/30 p-8 border-b border-primary-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="font-serif text-4xl font-light italic text-charcoal-bark">Artisan <span className="not-italic">Onboarding</span></DialogTitle>
            <DialogDescription className="text-warm-stone font-light mt-3 text-base leading-relaxed max-w-[40ch]">Initialize corporate compliance and payroll baseline.</DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
          <div className="space-y-4">
            <Label className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">Identity & Login</Label>
            <Input required value={form.fullName} onChange={e => onFormChange({ ...form, fullName: e.target.value })} placeholder="Full Legal Name" className="rounded-xl border-primary-border h-12 bg-warm-canvas/50" aria-label="Full Legal Name" />
            <Input value={form.profilePictureUrl} onChange={e => onFormChange({ ...form, profilePictureUrl: e.target.value })} placeholder="Profile Picture URL (Unsplash/Link)" className="rounded-xl border-primary-border h-12 bg-warm-canvas/50" aria-label="Profile Picture URL" />
            <div className="grid grid-cols-2 gap-4">
              <Input value={form.email} onChange={e => onFormChange({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border-primary-border h-12 bg-warm-canvas/50" aria-label="Email Address" />
              <Input value={form.phone} onChange={e => onFormChange({ ...form, phone: e.target.value })} placeholder="Contact No" className="rounded-xl border-primary-border h-12 bg-warm-canvas/50" aria-label="Contact Number" />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-primary-border">
            <Label className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">Payroll Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input required type="number" value={form.basePayPerWeek} onChange={e => onFormChange({ ...form, basePayPerWeek: e.target.value })} placeholder="Weekly Base (₱)" className="rounded-xl border-primary-border h-12 bg-warm-canvas/50" aria-label="Weekly Base Pay in Pesos" />
              <Input required type="number" value={form.dailyTarget} onChange={e => onFormChange({ ...form, dailyTarget: e.target.value })} placeholder="Sales Quota (₱)" className="rounded-xl border-primary-border h-12 bg-warm-canvas/50" aria-label="Daily Sales Quota in Pesos" />
            </div>
          </div>

          <DialogFooter className="pt-8 gap-4 sm:justify-center">
            <Button type="button" variant="ghost" className="rounded-xl h-12 px-8 text-[11px] uppercase font-semibold tracking-[0.15em] hover:bg-bisque-wash/50 transition-colors" onClick={() => onOpenChange(false)} aria-label="Cancel onboarding">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl px-12 h-12 font-semibold uppercase tracking-[0.15em] text-[11px] shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              {isSubmitting ? 'Initializing...' : 'Initialize Employee File'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
