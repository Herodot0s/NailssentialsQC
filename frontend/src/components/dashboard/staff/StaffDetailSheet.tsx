import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Briefcase, Check, Wallet, Fingerprint, RefreshCw, Upload, Camera, Loader2, UserCheck, UserMinus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { uploadFile } from '@/api/apiClient';
import type { StaffDetailSheetProps } from '../types';

export const StaffDetailSheet: React.FC<StaffDetailSheetProps> = ({
  open,
  onOpenChange,
  staff,
  onStaffChange,
  schedule,
  categories,
  onEditShift,
  onUpdateBaseline,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user: clerkUser } = useUser();

  const handleSyncFromClerk = () => {
    if (!clerkUser) return;
    
    // Only sync if the staff email matches the current clerk user email
    // or if the staff member is viewing their own profile.
    const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress;
    const isSameUser = clerkEmail && staff.email === clerkEmail;

    if (isSameUser) {
      onStaffChange({
        ...staff,
        username: clerkUser.username || staff.username,
        fullName: clerkUser.fullName || staff.fullName,
        profilePictureUrl: clerkUser.imageUrl || staff.profilePictureUrl,
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.data.success) {
        onStaffChange({ ...staff, profilePictureUrl: res.data.data.url });
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-sync with Clerk when same user
  useEffect(() => {
    if (open && clerkUser && staff) {
      const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress;
      if (clerkEmail && staff.email === clerkEmail) {
        const updates: any = {};
        let hasChanges = false;

        if (clerkUser.username && staff.username !== clerkUser.username) {
          updates.username = clerkUser.username;
          hasChanges = true;
        }
        if (clerkUser.fullName && staff.fullName !== clerkUser.fullName) {
          updates.fullName = clerkUser.fullName;
          hasChanges = true;
        }
        if (clerkUser.imageUrl && staff.profilePictureUrl !== clerkUser.imageUrl) {
          // Note: Clerk imageUrl is dynamic, maybe we only sync if local is empty?
          // But user said "sync", so we sync.
          updates.profilePictureUrl = clerkUser.imageUrl;
          hasChanges = true;
        }

        if (hasChanges) {
          onStaffChange({ ...staff, ...updates });
        }
      }
    }
  }, [open, clerkUser?.id, staff?.id, staff?.email]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-xl p-0 border-l border-[#bfc1b7] bg-[#eeefe9] flex flex-col h-full animate-in slide-in-from-right duration-500 ease-out-quint"
      >
        {staff && (
          <div className="flex flex-col h-full font-sans">
            {/* Header: Identity Section */}
            <div className="p-8 border-b border-[#bfc1b7]">
              <SheetHeader className="space-y-6 text-left">
                <div className="flex justify-between items-start">
                  <Avatar className="w-20 h-20 rounded-[6px] border border-[#bfc1b7] bg-white">
                    <AvatarImage
                      src={staff.profilePictureUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#e5e7e0] text-[#23251d] font-bold text-2xl">
                      {staff.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="px-2 py-1 bg-white border border-[#bfc1b7] rounded-full text-[10px] uppercase tracking-wider font-bold text-[#4d4f46]">
                    Staff ID #{staff.id}
                  </div>
                </div>
                <div>
                  <SheetTitle className="text-3xl font-extrabold text-[#23251d] tracking-tight leading-tight">
                    {staff.fullName}
                  </SheetTitle>
                  <SheetDescription className="text-[#4d4f46] text-sm mt-1 flex items-center gap-2 font-medium">
                    <Briefcase className="h-3.5 w-3.5 opacity-60" /> Senior Artisan • Joined{' '}
                    {staff.createdAt ? format(new Date(staff.createdAt), 'MMMM yyyy') : 'N/A'}
                  </SheetDescription>
                </div>
              </SheetHeader>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <Tabs defaultValue="profile" className="space-y-10">
                <TabsList className="bg-[#e5e7e0] p-1 h-auto gap-1 rounded-[6px] w-full justify-start border border-[#bfc1b7]">
                  {['profile', 'schedule', 'financials'].map((t) => (
                    <TabsTrigger
                      key={t}
                      value={t}
                      className="flex-1 text-[11px] uppercase tracking-widest font-bold text-[#4d4f46] data-[state=active]:bg-white data-[state=active]:text-[#23251d] data-[state=active]:border-[#bfc1b7] rounded-[4px] py-2.5 transition-all duration-200 shadow-none border border-transparent"
                    >
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-10 mt-0">
                  <div className="grid gap-10">
                    <div className="space-y-5">
                      <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest flex items-center gap-2">
                        <Fingerprint className="h-3 w-3" /> Identity & Access
                      </h4>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Full Legal Name
                            </Label>
                            <Input
                              value={staff.fullName || ''}
                              onChange={(e) =>
                                onStaffChange({ ...staff, fullName: e.target.value })
                              }
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                                System Username
                              </Label>
                              {clerkUser?.primaryEmailAddress?.emailAddress === staff.email && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#d9eddf] text-[#2c8c66] rounded-full text-[9px] font-bold uppercase tracking-tighter animate-in fade-in zoom-in duration-300">
                                  <Check className="h-2 w-2" /> Clerk Linked
                                </div>
                              )}
                            </div>
                            <Input
                              value={staff.username || ''}
                              onChange={(e) =>
                                onStaffChange({ ...staff, username: e.target.value })
                              }
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                                Avatar URL
                              </Label>
                              <div className="flex gap-1">
                                <label className="cursor-pointer">
                                  <div className="h-5 px-2 bg-[#23251d] text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 rounded-[4px] hover:bg-[#33342d] transition-colors">
                                    {isUploading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Upload className="h-2.5 w-2.5" />} 
                                    Upload
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handlePhotoUpload}
                                    disabled={isUploading}
                                  />
                                </label>
                              </div>
                            </div>
                            <Input
                              value={staff.profilePictureUrl || ''}
                              onChange={(e) =>
                                onStaffChange({ ...staff, profilePictureUrl: e.target.value })
                              }
                              placeholder="https://..."
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Email Address
                            </Label>
                            <Input
                              value={staff.email || ''}
                              onChange={(e) => onStaffChange({ ...staff, email: e.target.value })}
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Phone
                            </Label>
                            <Input
                              value={staff.phone || ''}
                              onChange={(e) => onStaffChange({ ...staff, phone: e.target.value })}
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-3">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Employment Status
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => onStaffChange({ ...staff, isActive: true })}
                                className={`flex-1 h-10 rounded-[4px] text-[10px] uppercase font-bold tracking-widest gap-2 transition-all ${
                                  staff.isActive 
                                    ? 'bg-[#d9eddf] text-[#2c8c66] border-[#2c8c66] hover:bg-[#d9eddf]' 
                                    : 'border-[#bfc1b7] text-[#9b9c92] hover:bg-gray-50'
                                }`}
                              >
                                <UserCheck className="h-3 w-3" /> Active
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => onStaffChange({ ...staff, isActive: false })}
                                className={`flex-1 h-10 rounded-[4px] text-[10px] uppercase font-bold tracking-widest gap-2 transition-all ${
                                  !staff.isActive 
                                    ? 'bg-[#f7d6d3] text-[#cd4239] border-[#cd4239] hover:bg-[#f7d6d3]' 
                                    : 'border-[#bfc1b7] text-[#9b9c92] hover:bg-gray-50'
                                }`}
                              >
                                <UserMinus className="h-3 w-3" /> Archived
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] grid grid-cols-2 gap-8 items-center">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Compliance IDs
                            </Label>
                            <div className="text-[10px] text-[#9b9c92] font-medium">
                              SSS / PAG-IBIG
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="SSS#"
                              value={staff.sssNumber || ''}
                              onChange={(e) =>
                                onStaffChange({ ...staff, sssNumber: e.target.value })
                              }
                              className="h-8 text-xs rounded-[4px] border-[#bfc1b7]"
                            />
                            <Input
                              placeholder="PAG-IBIG#"
                              value={staff.pagIbigNumber || ''}
                              onChange={(e) =>
                                onStaffChange({ ...staff, pagIbigNumber: e.target.value })
                              }
                              className="h-8 text-xs rounded-[4px] border-[#bfc1b7]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest flex items-center gap-2">
                        <Check className="h-3 w-3" /> Specializations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              const current = staff.specializations || '';
                              const specs = current
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              const next = specs.includes(cat.name)
                                ? specs.filter((s) => s !== cat.name)
                                : [...specs, cat.name];
                              onStaffChange({ ...staff, specializations: next.join(', ') });
                            }}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-tight transition-all border ${
                              staff.specializations?.includes(cat.name)
                                ? 'bg-[#23251d] text-white border-[#23251d]'
                                : 'bg-white text-[#4d4f46] border-[#bfc1b7] hover:border-[#23251d]'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest">
                        Shift Roster
                      </h4>
                      <span className="text-[10px] font-bold text-[#9b9c92] uppercase">
                        GMT+8 Manila
                      </span>
                    </div>
                    <div className="bg-white border border-[#bfc1b7] rounded-[6px] divide-y divide-[#dcdfd2]">
                      {[
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ].map((day, idx) => {
                        const sched = schedule.find((s) => s.day_of_week === idx);
                        return (
                          <div
                            key={day}
                            className="p-4 flex justify-between items-center group hover:bg-[#fcfcfa] transition-colors first:rounded-t-[6px] last:rounded-b-[6px]"
                          >
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4d4f46]">
                              {day}
                            </span>
                            <div className="flex items-center gap-4">
                              {sched?.is_active ? (
                                <div
                                  style={{ viewTransitionName: `shift-edit-${idx}` }}
                                  className="font-mono text-xs font-bold text-[#23251d]"
                                >
                                  {sched.start_time}—{sched.end_time}
                                </div>
                              ) : (
                                <span
                                  style={{ viewTransitionName: `shift-edit-${idx}` }}
                                  className="text-[10px] uppercase font-bold text-[#9b9c92]"
                                >
                                  Rest Day
                                </span>
                              )}
                              <button
                                onClick={() => onEditShift(idx)}
                                className="p-1.5 hover:bg-[#e5e7e0] rounded-[4px] border border-transparent hover:border-[#bfc1b7] transition-all text-[#4d4f46]"
                              >
                                <Briefcase className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Financials Tab */}
                <TabsContent value="financials" className="mt-0 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest flex items-center gap-2">
                      <Wallet className="h-3 w-3" /> Compensation Model
                    </h4>
                    <div className="grid gap-4">
                      <div className="p-6 bg-white border border-[#bfc1b7] rounded-[6px] flex justify-between items-center">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                            Weekly Base Pay
                          </Label>
                          <div className="text-[10px] text-[#9b9c92]">Fixed guaranteed salary</div>
                        </div>
                        <div className="flex items-baseline gap-1 border-b-2 border-[#B8794E] pb-1">
                          <span className="text-xs font-bold text-[#4d4f46]">PHP</span>
                          <Input
                            type="number"
                            value={staff.basePayPerWeek}
                            onChange={(e) =>
                              onStaffChange({
                                ...staff,
                                basePayPerWeek:
                                  e.target.value === '' ? 0 : parseFloat(e.target.value),
                              })
                            }
                            className="w-24 text-right font-bold text-2xl border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="p-6 bg-white border border-[#bfc1b7] rounded-[6px] flex justify-between items-center">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                            Daily Sales Target
                          </Label>
                          <div className="text-[10px] text-[#9b9c92]">
                            Quota for commission triggers
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 border-b-2 border-[#bfc1b7] pb-1 focus-within:border-[#B8794E] transition-colors">
                          <span className="text-xs font-bold text-[#4d4f46]">PHP</span>
                          <Input
                            type="number"
                            value={staff.dailyTarget}
                            onChange={(e) =>
                              onStaffChange({
                                ...staff,
                                dailyTarget: e.target.value === '' ? 0 : parseFloat(e.target.value),
                              })
                            }
                            className="w-24 text-right font-bold text-2xl border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-[#bfc1b7] bg-white flex gap-3 mt-auto">
              <Button
                variant="outline"
                className="flex-1 rounded-[6px] border-[#bfc1b7] h-12 text-[10px] uppercase font-bold tracking-widest text-[#cd4239] hover:bg-[#f7d6d3] hover:text-[#cd4239] transition-all"
                onClick={() => onOpenChange(false)}
              >
                Suspend
              </Button>
              <Button
                onClick={onUpdateBaseline}
                className="flex-[2] rounded-[6px] h-12 bg-[#B8794E] hover:bg-[#9A6440] text-white text-[10px] uppercase font-bold tracking-widest transition-all"
              >
                Commit Changes
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
