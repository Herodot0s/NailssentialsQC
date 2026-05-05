import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AddStaffDialogProps } from './types';

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
        <div className="bg-primary p-12 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-4xl font-light italic">Artisan <span className="not-italic">Onboarding</span></DialogTitle>
            <DialogDescription className="text-white/60 font-light mt-2 text-base">Initialize corporate compliance and payroll baseline.</DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={onSubmit} className="p-12 space-y-8 bg-white">
           <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Identity & Login</Label>
              <Input required value={form.fullName} onChange={e => onFormChange({...form, fullName: e.target.value})} placeholder="Full Legal Name" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
              <Input value={form.profilePictureUrl} onChange={e => onFormChange({...form, profilePictureUrl: e.target.value})} placeholder="Profile Picture URL (Unsplash/Link)" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
              <div className="grid grid-cols-2 gap-4">
                 <Input value={form.email} onChange={e => onFormChange({...form, email: e.target.value})} placeholder="Email" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                 <Input value={form.phone} onChange={e => onFormChange({...form, phone: e.target.value})} placeholder="Contact No" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
              </div>
           </div>

           <div className="space-y-4 pt-6 border-t border-gray-50">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Payroll Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                 <Input required value={form.basePayPerWeek} onChange={e => onFormChange({...form, basePayPerWeek: e.target.value})} placeholder="Weekly Base (₱)" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
                 <Input required value={form.dailyTarget} onChange={e => onFormChange({...form, dailyTarget: e.target.value})} placeholder="Sales Quota (₱)" className="rounded-none border-gray-200 h-12 bg-gray-50/50" />
              </div>
           </div>

           <DialogFooter className="pt-8 gap-4 sm:justify-center">
              <Button type="button" variant="ghost" className="rounded-none h-12 px-8 text-[10px] uppercase font-bold tracking-widest" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="rounded-none px-12 h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Initialize Employee File</Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
