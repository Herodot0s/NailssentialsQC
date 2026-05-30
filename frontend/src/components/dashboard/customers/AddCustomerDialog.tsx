import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User, Sparkles, Phone, Mail, ShieldAlert, FileText, Key, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerForm {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  allergies?: string;
  notes?: string;
  isActive: boolean;
}

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CustomerForm;
  onFormChange: (form: CustomerForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}

export const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const autoSuggestUsername = (name: string) => {
    if (!name || form.username) return;
    const parts = name.toLowerCase().trim().split(/\s+/);
    if (parts.length >= 2) {
      const suggested = `${parts[0]}.${parts[parts.length - 1]}`.replace(/[^a-z0-9.]/g, '');
      onFormChange({ ...form, username: suggested });
    } else if (parts[0]) {
      onFormChange({ ...form, username: parts[0].replace(/[^a-z0-9.]/g, '') });
    }
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('0')) return '0' + digits.slice(1, 11);
    if (digits.startsWith('63')) {
      return '+63 ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12);
    }
    return digits.slice(0, 11);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate completeness progress
  const completeness = Math.round(
    ((form.fullName ? 1 : 0) +
      (form.email ? 1 : 0) +
      (form.phone ? 1 : 0) +
      (form.username ? 1 : 0) +
      (form.notes ? 1 : 0) +
      (form.allergies ? 1 : 0)) *
      16.6,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border border-[#bfc1b7] shadow-none rounded-[6px] p-0 overflow-hidden bg-[#ffffff] animate-in fade-in zoom-in-95 duration-300 ease-out-quart flex flex-col max-h-[95vh]">
        {/* Header Block */}
        <div className="bg-[#eeefe9] p-10 border-b border-[#bfc1b7] shrink-0 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-[#B8794E]/5 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10 flex justify-between items-end gap-8">
            <DialogHeader className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[2px] w-12 bg-[#B8794E]" />
                <span className="text-[12px] font-[700] uppercase tracking-[0.3em] text-[#B8794E]">
                  CRM INTAKE
                </span>
              </div>
              <DialogTitle className="font-serif text-[38px] font-[800] tracking-[-1px] text-[#23251d] leading-none">
                {isEdit ? 'Modify Customer Profile' : 'Register New Customer'}
              </DialogTitle>
              <DialogDescription className="font-sans text-[16px] font-[400] leading-[1.6] text-[#4d4f46] mt-4 max-w-[48ch]">
                {isEdit
                  ? 'Update medical records, salon preferences, and system login credentials.'
                  : 'Establish a new salon relationship file. Synchronizes user database and Clerk accounts.'}
              </DialogDescription>
            </DialogHeader>

            {/* Profile Integrity Card */}
            <div className="hidden lg:block w-64 h-36 bg-white border border-[#bfc1b7] rounded-[6px] p-5 shadow-[6px_6px_0px_rgba(35,37,29,0.05)] transform rotate-1 hover:rotate-0 transition-all duration-500">
              <div className="text-[11px] font-[800] text-[#B8794E] uppercase tracking-wider mb-2">
                Profile Preview
              </div>
              <div className="text-base font-bold text-[#23251d] truncate mb-3">
                {form.fullName || 'Anonymous'}
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-[#eeefe9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-700 ease-out-quint"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-[800] text-[#9b9c92] uppercase tracking-widest">
                  <span>File Integrity</span>
                  <span>{Math.min(100, completeness)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-[#ffffff] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Side: Contact Info */}
            <div className="space-y-6">
              <Label className="text-[12px] uppercase font-[800] tracking-[0.2em] text-[#23251d] flex items-center gap-2 border-b border-[#bfc1b7]/40 pb-2">
                <User className="h-4 w-4 text-[#B8794E]" /> Basic Information
              </Label>

              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    required
                    value={form.fullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => {
                      setFocusedField(null);
                      autoSuggestUsername(form.fullName);
                    }}
                    onChange={(e) => onFormChange({ ...form, fullName: e.target.value })}
                    placeholder="Full Legal Name"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-white text-sm focus:ring-0 focus:border-[#23251d] transition-all"
                  />
                  <div
                    className={cn(
                      'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                      focusedField === 'fullName' ? 'w-full' : 'w-0',
                    )}
                  />
                </div>

                <div className="relative group">
                  <Input
                    required={!isEdit}
                    type="email"
                    value={form.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => onFormChange({ ...form, email: e.target.value })}
                    placeholder="Email Address"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-white text-sm focus:ring-0 focus:border-[#23251d] transition-all"
                  />
                  <Mail className="absolute right-4 top-3.5 h-4.5 w-4.5 text-[#bfc1b7]" />
                  <div
                    className={cn(
                      'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                      focusedField === 'email' ? 'w-full' : 'w-0',
                    )}
                  />
                </div>

                <div className="relative group">
                  <Input
                    value={form.phone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => onFormChange({ ...form, phone: formatPhone(e.target.value) })}
                    placeholder="Phone Number (e.g. +63 917...)"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-white text-sm focus:ring-0 focus:border-[#23251d] transition-all"
                  />
                  <Phone className="absolute right-4 top-3.5 h-4.5 w-4.5 text-[#bfc1b7]" />
                  <div
                    className={cn(
                      'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                      focusedField === 'phone' ? 'w-full' : 'w-0',
                    )}
                  />
                </div>

                <div className="relative group">
                  <Input
                    required
                    value={form.username}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => onFormChange({ ...form, username: e.target.value })}
                    placeholder="Username"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-white text-sm focus:ring-0 focus:border-[#23251d] transition-all"
                  />
                  <div
                    className={cn(
                      'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                      focusedField === 'username' ? 'w-full' : 'w-0',
                    )}
                  />
                </div>

                <div className="relative group">
                  <Input
                    type="password"
                    value={form.password || ''}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => onFormChange({ ...form, password: e.target.value })}
                    placeholder={isEdit ? 'Update Password (optional)' : 'Choose Login Password'}
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-white text-sm focus:ring-0 focus:border-[#23251d] transition-all"
                  />
                  <Key className="absolute right-4 top-3.5 h-4.5 w-4.5 text-[#bfc1b7]" />
                  <div
                    className={cn(
                      'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                      focusedField === 'password' ? 'w-full' : 'w-0',
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Side: CRM and Care Profile */}
            <div className="space-y-6">
              <Label className="text-[12px] uppercase font-[800] tracking-[0.2em] text-[#23251d] flex items-center gap-2 border-b border-[#bfc1b7]/40 pb-2">
                <FileText className="h-4 w-4 text-[#B8794E]" /> CRM & Treatment Notes
              </Label>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Medical Allergies / Sensitivities
                  </Label>
                  <Textarea
                    placeholder="Allergies (e.g. acrylic, gel, UV lamps, latex)..."
                    value={form.allergies || ''}
                    onChange={(e) => onFormChange({ ...form, allergies: e.target.value })}
                    className="rounded-[6px] border-[#bfc1b7] min-h-[90px] bg-white text-sm focus-visible:ring-[#B8794E]"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-[#6c6e63]">
                    Care Notes & Styling Preferences
                  </Label>
                  <Textarea
                    placeholder="E.g. prefers square nails, soft pastel palettes, enjoys conversation..."
                    value={form.notes || ''}
                    onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
                    className="rounded-[6px] border-[#bfc1b7] min-h-[120px] bg-white text-sm focus-visible:ring-[#B8794E]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-8 gap-4 sm:justify-end border-t border-[#dcdfd2] mt-6">
            <Button
              type="button"
              variant="ghost"
              className="rounded-[6px] h-12 px-8 text-xs font-[850] text-[#23251d] uppercase tracking-[0.15em] transition-all bg-[#e5e7e0] hover:bg-[#dcdfd2] active:scale-[0.97]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'rounded-[6px] px-10 h-12 font-[850] text-xs uppercase tracking-[0.15em] transition-all relative overflow-hidden active:scale-[0.97]',
                isSubmitting
                  ? 'bg-[#bfc1b7]'
                  : 'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/15',
              )}
            >
              <div className="flex items-center gap-2 relative z-10">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Syncing Clerk...</span>
                  </>
                ) : (
                  <>
                    <span>{isEdit ? 'Save Intake' : 'Register Intake'}</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </>
                )}
              </div>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
