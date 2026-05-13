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
import { Button } from '@/components/ui/button';
import {
  Key,
  User,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  Wand2,
  Phone,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { AddStaffDialogProps } from '../types';

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  categories = [],
  form,
  onFormChange,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const autoSuggestUsername = (name: string) => {
    if (!name || form.username) return;
    const parts = name.toLowerCase().trim().split(/\s+/);
    if (parts.length >= 2) {
      const suggested = `${parts[0][0]}${parts[parts.length - 1]}`.replace(/[^a-z0-9]/g, '');
      onFormChange({ ...form, username: suggested });
    } else if (parts[0]) {
      onFormChange({ ...form, username: parts[0].replace(/[^a-z0-9]/g, '') });
    }
  };

  const formatSSS = (val: string) => {
    const digits = val.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length > 9)
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 9)}-${digits.slice(9, 10)}`;
    return formatted.slice(0, 12);
  };

  const formatPagIbig = (val: string) => {
    const digits = val.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 8)
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
    return formatted.slice(0, 14);
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('0')) return '0' + digits.slice(1, 11);
    if (digits.startsWith('63'))
      return '+63 ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12);
    return digits.slice(0, 11);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onFormChange({ ...form, password });
  };

  const toggleSpecialization = (name: string) => {
    const current = form.specializations
      ? form.specializations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const updated = current.includes(name) ? current.filter((s) => s !== name) : [...current, name];
    onFormChange({ ...form, specializations: updated.join(', ') });
  };

  const isSectionComplete = (type: 'identity' | 'credentials' | 'compliance' | 'compensation') => {
    switch (type) {
      case 'identity':
        return !!(form.fullName && form.specializations);
      case 'credentials':
        return !!(form.username && form.password && form.email && form.phone);
      case 'compliance':
        return !!(form.sssNumber || form.pagIbigNumber);
      case 'compensation':
        return !!(form.basePayPerWeek && form.dailyTarget);
      default:
        return false;
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl border border-[#bfc1b7] shadow-none rounded-[6px] p-0 overflow-hidden bg-[#ffffff] animate-in fade-in zoom-in-95 duration-300 ease-out-quart flex flex-col max-h-[95vh]">
        <div className="bg-[#eeefe9] p-10 border-b border-[#bfc1b7] shrink-0 relative overflow-hidden">
          {/* Animated Background Element */}
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#B8794E]/5 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10 flex justify-between items-end gap-8">
            <DialogHeader className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[2px] w-12 bg-[#B8794E]" />
                <span className="text-[12px] font-[700] uppercase tracking-[0.3em] text-[#B8794E]">
                  Personnel Intake
                </span>
              </div>
              <DialogTitle className="font-['IBM_Plex_Sans_Variable'] text-[42px] font-[800] tracking-[-1.5px] text-[#23251d] leading-none">
                Staff Onboarding
              </DialogTitle>
              <DialogDescription className="font-['IBM_Plex_Sans_Variable'] text-[18px] font-[400] leading-[1.6] text-[#4d4f46] mt-4 max-w-[50ch]">
                Establish a new artisan profile. Real-time validation ensures data integrity for
                payroll and system access.
              </DialogDescription>
            </DialogHeader>

            {/* Live Preview Card */}
            <div className="hidden lg:block w-72 h-44 bg-white border border-[#bfc1b7] rounded-[6px] p-6 shadow-[8px_8px_0px_rgba(35,37,29,0.05)] transform rotate-1 hover:rotate-0 transition-transform duration-500 group relative">
              <div className="absolute -top-3 -left-3 bg-[#B8794E] text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14 rounded-[4px] border border-[#bfc1b7] bg-[#eeefe9]">
                  <AvatarImage src={form.profilePictureUrl} className="object-cover" />
                  <AvatarFallback className="text-[#23251d] font-bold text-lg">
                    {form.fullName?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-[16px] font-[800] text-[#23251d] truncate">
                    {form.fullName || 'Artisan Name'}
                  </div>
                  <div className="text-[11px] font-[700] text-[#B8794E] uppercase tracking-wider truncate">
                    {form.specializations?.split(',')[0] || 'Unassigned'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-[#eeefe9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#23251d] transition-all duration-700 ease-out-quint"
                    style={{ width: `${(Object.values(form).filter(Boolean).length / 10) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-[700] text-[#9b9c92] uppercase tracking-tighter">
                  <span>Profile Integrity</span>
                  <span>
                    {Math.min(
                      100,
                      Math.round((Object.values(form).filter(Boolean).length / 10) * 100),
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12 bg-[#ffffff] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              {/* Identity Section */}
              <div
                className={cn(
                  'space-y-8 transition-all duration-500',
                  isSectionComplete('identity') ? 'opacity-100' : 'opacity-90',
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3">
                    <User
                      className={cn(
                        'h-4 w-4',
                        focusedField?.startsWith('id-') ? 'text-[#B8794E]' : 'text-[#bfc1b7]',
                      )}
                    />
                    Identity Profile
                  </Label>
                  {isSectionComplete('identity') && (
                    <CheckCircle2 className="h-4 w-4 text-[#2c8c66] animate-in zoom-in" />
                  )}
                </div>
                <div className="space-y-5">
                  <div className="relative group">
                    <Input
                      required
                      value={form.fullName}
                      onFocus={() => setFocusedField('id-name')}
                      onBlur={() => {
                        setFocusedField(null);
                        autoSuggestUsername(form.fullName);
                      }}
                      onChange={(e) => onFormChange({ ...form, fullName: e.target.value })}
                      placeholder="Full Legal Name"
                      className="rounded-[6px] border-[#bfc1b7] h-14 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[18px] px-5 focus:ring-0 focus:border-[#23251d] transition-all group-hover:border-[#6c6e63]"
                    />
                    <div
                      className={cn(
                        'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                        focusedField === 'id-name' ? 'w-full' : 'w-0',
                      )}
                    />
                  </div>
                  <div className="relative group">
                    <Input
                      value={form.profilePictureUrl}
                      onFocus={() => setFocusedField('id-pic')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => onFormChange({ ...form, profilePictureUrl: e.target.value })}
                      placeholder="Profile Picture URL"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[15px] px-5 focus:ring-0 focus:border-[#23251d] transition-all group-hover:border-[#6c6e63]"
                    />
                    <div
                      className={cn(
                        'absolute left-0 bottom-0 h-0.5 bg-[#B8794E] transition-all duration-300',
                        focusedField === 'id-pic' ? 'w-full' : 'w-0',
                      )}
                    />
                  </div>
                  <div className="space-y-4 pt-2">
                    <Label className="text-[11px] font-[800] uppercase tracking-[0.15em] text-[#6c6e63] ml-1 flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-[#B8794E]" /> Craft Specializations
                    </Label>
                    <div className="flex flex-wrap gap-2.5">
                      {categories.map((cat) => {
                        const isSelected = form.specializations
                          .split(',')
                          .map((s) => s.trim())
                          .includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleSpecialization(cat.name)}
                            className={cn(
                              'px-5 py-2 rounded-full text-[13px] font-[700] transition-all border transform active:scale-95',
                              isSelected
                                ? 'bg-[#23251d] text-[#ffffff] border-[#23251d] shadow-lg shadow-[#23251d]/10'
                                : 'bg-transparent text-[#4d4f46] border-[#bfc1b7] hover:border-[#23251d]',
                            )}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              <div
                className={cn(
                  'space-y-8 pt-10 border-t border-[#dcdfd2] transition-all duration-500',
                  isSectionComplete('credentials') ? 'opacity-100' : 'opacity-90',
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3">
                    <Key
                      className={cn(
                        'h-4 w-4',
                        focusedField?.startsWith('cre-') ? 'text-[#B8794E]' : 'text-[#bfc1b7]',
                      )}
                    />
                    System Access
                  </Label>
                  {isSectionComplete('credentials') && (
                    <CheckCircle2 className="h-4 w-4 text-[#2c8c66] animate-in zoom-in" />
                  )}
                </div>
                <div className="space-y-5">
                  <div className="relative group">
                    <Input
                      required
                      value={form.username}
                      onFocus={() => setFocusedField('cre-user')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) =>
                        onFormChange({
                          ...form,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                        })
                      }
                      placeholder="Username"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-mono text-[15px] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                    />
                    <Wand2
                      className={cn(
                        'absolute right-4 top-3.5 h-5 w-5 text-[#B8794E] transition-all duration-500',
                        form.fullName && !form.username
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      )}
                    />
                  </div>
                  <div className="relative group">
                    <Input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onFocus={() => setFocusedField('cre-pass')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => onFormChange({ ...form, password: e.target.value })}
                      placeholder="Security Password"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[15px] px-5 pr-32 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                    />
                    <div className="absolute right-2 top-1.5 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-[10px] font-[800] text-[#4d4f46] uppercase tracking-widest hover:bg-[#e5e7e0]"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-[10px] font-[800] text-[#B8794E] uppercase tracking-widest hover:bg-[#B8794E]/10"
                        onClick={generatePassword}
                      >
                        Gen
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative group">
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onFocus={() => setFocusedField('cre-email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => onFormChange({ ...form, email: e.target.value })}
                        placeholder="Email Address"
                        className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[15px] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                      />
                    </div>
                    <div className="relative group">
                      <Input
                        required
                        value={form.phone}
                        onFocus={() => setFocusedField('cre-phone')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) =>
                          onFormChange({ ...form, phone: formatPhone(e.target.value) })
                        }
                        placeholder="Phone Number"
                        className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[15px] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                      />
                      <Phone className="absolute right-4 top-3.5 h-5 w-5 text-[#bfc1b7]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {/* Compliance Section */}
              <div
                className={cn(
                  'space-y-8 transition-all duration-500',
                  isSectionComplete('compliance') ? 'opacity-100' : 'opacity-90',
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3">
                    <ShieldCheck
                      className={cn(
                        'h-4 w-4',
                        focusedField?.startsWith('com-') ? 'text-[#B8794E]' : 'text-[#bfc1b7]',
                      )}
                    />
                    Legal Compliance
                  </Label>
                  {isSectionComplete('compliance') && (
                    <CheckCircle2 className="h-4 w-4 text-[#2c8c66] animate-in zoom-in" />
                  )}
                </div>
                <div className="space-y-5">
                  <div className="relative group">
                    <Input
                      value={form.sssNumber}
                      onFocus={() => setFocusedField('com-sss')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) =>
                        onFormChange({ ...form, sssNumber: formatSSS(e.target.value) })
                      }
                      placeholder="SSS Number (00-0000000-0)"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-mono text-[15px] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                    />
                    <CreditCard className="absolute right-4 top-3.5 h-5 w-5 text-[#bfc1b7]" />
                  </div>
                  <div className="relative group">
                    <Input
                      value={form.pagIbigNumber}
                      onFocus={() => setFocusedField('com-pag')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) =>
                        onFormChange({ ...form, pagIbigNumber: formatPagIbig(e.target.value) })
                      }
                      placeholder="Pag-IBIG Number (0000-0000-0000)"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-mono text-[15px] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                    />
                    <ShieldCheck className="absolute right-4 top-3.5 h-5 w-5 text-[#bfc1b7]" />
                  </div>
                </div>
              </div>

              {/* Compensation Section */}
              <div
                className={cn(
                  'space-y-8 pt-10 border-t border-[#dcdfd2] transition-all duration-500',
                  isSectionComplete('compensation') ? 'opacity-100' : 'opacity-90',
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3">
                    <Award
                      className={cn(
                        'h-4 w-4',
                        focusedField?.startsWith('pay-') ? 'text-[#B8794E]' : 'text-[#bfc1b7]',
                      )}
                    />
                    Compensation Model
                  </Label>
                  {isSectionComplete('compensation') && (
                    <CheckCircle2 className="h-4 w-4 text-[#2c8c66] animate-in zoom-in" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-[800] uppercase tracking-[0.15em] text-[#6c6e63] ml-1">
                      Weekly Baseline
                    </Label>
                    <div className="relative group">
                      <Input
                        required
                        type="number"
                        onFocus={() => setFocusedField('pay-base')}
                        onBlur={() => setFocusedField(null)}
                        value={form.basePayPerWeek}
                        onChange={(e) => onFormChange({ ...form, basePayPerWeek: e.target.value })}
                        placeholder="₱0.00"
                        className="rounded-[6px] border-[#bfc1b7] h-14 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[24px] font-[700] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                      />
                      <span className="absolute right-5 top-4 text-[14px] font-[800] text-[#9b9c92]">
                        PHP
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-[800] uppercase tracking-[0.15em] text-[#6c6e63] ml-1">
                      Daily Target Quota
                    </Label>
                    <div className="relative group">
                      <Input
                        required
                        type="number"
                        onFocus={() => setFocusedField('pay-target')}
                        onBlur={() => setFocusedField(null)}
                        value={form.dailyTarget}
                        onChange={(e) => onFormChange({ ...form, dailyTarget: e.target.value })}
                        placeholder="₱0.00"
                        className="rounded-[6px] border-[#bfc1b7] h-14 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[24px] font-[700] px-5 focus:ring-0 focus:border-[#23251d] group-hover:border-[#6c6e63]"
                      />
                      <span className="absolute right-5 top-4 text-[14px] font-[800] text-[#9b9c92]">
                        PHP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-10 gap-5 sm:justify-end border-t border-[#dcdfd2] mt-12">
            <Button
              type="button"
              variant="ghost"
              className="rounded-[6px] h-14 px-10 text-[14px] font-[800] text-[#23251d] uppercase tracking-[0.15em] transition-all bg-[#e5e7e0] hover:bg-[#dcdfd2] active:scale-[0.97]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'rounded-[6px] px-12 h-14 font-[800] text-[14px] uppercase tracking-[0.15em] transition-all relative overflow-hidden active:scale-[0.97]',
                isSubmitting
                  ? 'bg-[#bfc1b7]'
                  : 'bg-[#B8794E] text-[#ffffff] hover:bg-[#23251d] shadow-xl shadow-[#B8794E]/20',
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <span>Complete Intake</span>
                    <Sparkles className="h-4 w-4" />
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
