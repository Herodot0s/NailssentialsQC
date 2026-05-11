import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, User, ShieldCheck, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AddStaffDialogProps } from '../types';

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  categories = [],
  form,
  onFormChange,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onFormChange({ ...form, password });
  };

  const toggleSpecialization = (name: string) => {
    const current = form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [];
    const updated = current.includes(name) 
      ? current.filter(s => s !== name) 
      : [...current, name];
    onFormChange({ ...form, specializations: updated.join(', ') });
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
        <div className="bg-[#eeefe9] p-10 border-b border-[#bfc1b7] shrink-0">
          <DialogHeader>
            <DialogTitle className="font-['IBM_Plex_Sans_Variable'] text-[32px] font-[800] tracking-[-0.8px] text-[#23251d]">
              Staff Onboarding
            </DialogTitle>
            <DialogDescription className="font-['IBM_Plex_Sans_Variable'] text-[18px] font-[400] leading-[1.6] text-[#4d4f46] mt-2 max-w-[60ch]">
              Initialize profile, credentials, and compliance baseline. Ensure all information matches legal identification for payroll accuracy.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12 bg-[#ffffff] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              {/* Identity Section */}
              <div className="space-y-6">
                <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3 mb-4">
                  <User className="h-4 w-4" /> Identity & Profile
                </Label>
                <div className="space-y-4">
                  <Input
                    required
                    value={form.fullName}
                    onChange={e => onFormChange({ ...form, fullName: e.target.value })}
                    placeholder="Full Legal Name"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                  />
                  <Input
                    value={form.profilePictureUrl}
                    onChange={e => onFormChange({ ...form, profilePictureUrl: e.target.value })}
                    placeholder="Profile Picture URL"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                  />
                  <div className="space-y-3">
                    <Label className="text-[11px] font-[700] uppercase tracking-widest text-[#6c6e63] ml-1">Specializations</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {categories.map((cat) => {
                        const isSelected = form.specializations.split(',').map(s => s.trim()).includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleSpecialization(cat.name)}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[13px] font-[500] transition-all border",
                              isSelected 
                                ? "bg-[#23251d] text-[#ffffff] border-[#23251d]" 
                                : "bg-transparent text-[#4d4f46] border-[#bfc1b7] hover:border-[#23251d]"
                            )}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                      {categories.length === 0 && (
                        <p className="text-[13px] text-[#9b9c92] italic">No categories defined in database.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              <div className="space-y-6 pt-10 border-t border-[#dcdfd2]">
                <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3 mb-4">
                  <Key className="h-4 w-4" /> Account Credentials
                </Label>
                <div className="space-y-4">
                  <Input
                    required
                    value={form.username}
                    onChange={e => onFormChange({ ...form, username: e.target.value })}
                    placeholder="Username"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                  />
                  <div className="relative">
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => onFormChange({ ...form, password: e.target.value })}
                      placeholder="Security Password"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 pr-24 focus:ring-1 focus:ring-[#B8794E]"
                    />
                    <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-[11px] font-[700] text-[#4d4f46] uppercase tracking-wider hover:bg-[#e5e7e0]"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-[11px] font-[700] text-[#B8794E] uppercase tracking-wider hover:bg-[#B8794E]/10"
                        onClick={generatePassword}
                      >
                        Gen
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => onFormChange({ ...form, email: e.target.value })}
                      placeholder="Email Address"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                    />
                    <Input
                      required
                      value={form.phone}
                      onChange={e => onFormChange({ ...form, phone: e.target.value })}
                      placeholder="Phone"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {/* Compliance Section */}
              <div className="space-y-6">
                <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-4 w-4" /> Compliance Details
                </Label>
                <div className="space-y-4">
                  <Input
                    value={form.sssNumber}
                    onChange={e => onFormChange({ ...form, sssNumber: e.target.value })}
                    placeholder="SSS Number"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                  />
                  <Input
                    value={form.pagIbigNumber}
                    onChange={e => onFormChange({ ...form, pagIbigNumber: e.target.value })}
                    placeholder="Pag-ibig Number"
                    className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                  />
                </div>
              </div>

              {/* Compensation Section */}
              <div className="space-y-6 pt-10 border-t border-[#dcdfd2]">
                <Label className="text-[13px] uppercase font-[700] tracking-[0.2em] text-[#23251d] flex items-center gap-3 mb-4">
                  <Award className="h-4 w-4" /> Compensation Baseline
                </Label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-[700] uppercase tracking-widest text-[#6c6e63] ml-1">Weekly Base</Label>
                    <Input
                      required
                      type="number"
                      value={form.basePayPerWeek}
                      onChange={e => onFormChange({ ...form, basePayPerWeek: e.target.value })}
                      placeholder="₱0.00"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-[700] uppercase tracking-widest text-[#6c6e63] ml-1">Daily Target</Label>
                    <Input
                      required
                      type="number"
                      value={form.dailyTarget}
                      onChange={e => onFormChange({ ...form, dailyTarget: e.target.value })}
                      placeholder="₱0.00"
                      className="rounded-[6px] border-[#bfc1b7] h-12 bg-[#ffffff] font-['IBM_Plex_Sans_Variable'] text-[16px] px-4 focus:ring-1 focus:ring-[#B8794E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-10 gap-4 sm:justify-end border-t border-[#dcdfd2] mt-12">
            <Button
              type="button"
              variant="ghost"
              className="rounded-[6px] h-12 px-8 text-[14px] font-[700] text-[#23251d] uppercase tracking-[0.1em] transition-colors bg-[#e5e7e0] hover:bg-[#dcdfd2]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[6px] px-10 h-12 font-[700] text-[14px] uppercase tracking-[0.1em] bg-[#B8794E] text-[#ffffff] hover:bg-[#dd9001] shadow-md transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Processing...' : 'Complete Onboarding'}
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
};
