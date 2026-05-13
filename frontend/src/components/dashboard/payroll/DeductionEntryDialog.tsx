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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { DeductionEntryDialogProps } from '../types';

export const DeductionEntryDialog: React.FC<DeductionEntryDialogProps> = ({
  open,
  onOpenChange,
  staffMembers,
  form,
  onFormChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white">
        <div className="bg-primary p-12 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-4xl font-light italic">
              Financial <span className="not-italic">Entry</span>
            </DialogTitle>
            <DialogDescription className="text-white/60 font-light mt-2 text-base">
              Log cash advances, loans, and uniform payments.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={onSubmit} className="p-12 space-y-8 bg-white">
          <div className="space-y-4">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Technician
            </Label>
            <Select
              required
              onValueChange={(val: string | null) => onFormChange({ ...form, staffId: val || '' })}
            >
              <SelectTrigger className="rounded-none border-gray-200 h-12">
                <SelectValue placeholder="Choose Employee">
                  {staffMembers.find((s) => s.id.toString() === form.staffId)?.fullName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-none border-none shadow-2xl">
                {staffMembers.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Entry Category
              </Label>
              <Select
                defaultValue="Cash Advance"
                onValueChange={(val: string | null) =>
                  onFormChange({ ...form, type: val || 'Cash Advance' })
                }
              >
                <SelectTrigger className="rounded-none border-gray-200 h-12">
                  <SelectValue>{form.type || 'Cash Advance'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-none border-none shadow-2xl">
                  <SelectItem value="Cash Advance">Cash Advance</SelectItem>
                  <SelectItem value="Uniform">Uniform</SelectItem>
                  <SelectItem value="Loan Payment">Loan Payment</SelectItem>
                  <SelectItem value="Reloan">Reloan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Amount (₱)
              </Label>
              <Input
                type="number"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => onFormChange({ ...form, amount: e.target.value })}
                className="rounded-none border-gray-200 h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Notes
            </Label>
            <textarea
              className="w-full min-h-[100px] border border-gray-200 p-4 rounded-none outline-none font-light text-sm focus:ring-1 focus:ring-primary/20"
              placeholder="Detail justification..."
              value={form.notes}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
            />
          </div>
          <DialogFooter className="pt-8">
            <Button
              type="button"
              variant="ghost"
              className="rounded-none h-12 px-8 text-[10px] uppercase font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-none px-12 h-12 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30"
            >
              Commit to Ledger
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
