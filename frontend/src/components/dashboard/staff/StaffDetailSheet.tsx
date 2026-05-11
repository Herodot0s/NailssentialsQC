import React from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Briefcase, AlertCircle, Check, Wallet } from 'lucide-react';
import type { StaffDetailSheetProps } from '../types';

export const StaffDetailSheet: React.FC<StaffDetailSheetProps> = ({
  open,
  onOpenChange,
  staff,
  onStaffChange,
  schedule,
  categories,
  onEditShift,
  onUpdateBaseline
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent side="right" className="sm:max-w-xl p-0 border-none bg-white/95 backdrop-blur-xl flex flex-col h-full shadow-premium rounded-l-3xl animate-in slide-in-from-right duration-500 ease-out-quart">
        {staff && (
          <div className="flex flex-col h-full">
             <div className="bg-bisque-wash/30 p-8 border-b border-kiln-border">
                <SheetHeader className="space-y-6 text-left">
                   <div className="flex justify-between items-start">
                      <Avatar className="w-24 h-24 rounded-3xl border-2 border-kiln-border shadow-premium">
                        <AvatarImage src={staff.profilePictureUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 font-serif text-4xl font-light text-primary">{staff.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Badge className="bg-bisque-wash border border-kiln-border text-warm-stone rounded-xl text-[11px] uppercase tracking-[0.2em] font-semibold">Employee File #{staff.id}</Badge>
                   </div>
                   <div>
                      <SheetTitle className="text-5xl font-serif font-light text-charcoal-bark tracking-tight">{staff.fullName}</SheetTitle>
                      <SheetDescription className="text-warm-stone font-light text-base mt-2 flex items-center gap-2">
                         <Briefcase className="h-4 w-4 stroke-[1.5]" /> Senior Artisan • Joined {format(new Date(staff.createdAt), 'MMMM yyyy')}
                      </SheetDescription>
                   </div>
                </SheetHeader>
             </div>

             <div className="flex-1 overflow-y-auto p-8 bg-white">
                <Tabs defaultValue="profile" className="space-y-12">
                   <TabsList className="bg-transparent p-0 h-auto gap-8 border-b border-gray-100 w-full justify-start rounded-none">
                      {['profile', 'schedule', 'financials'].map(t => (
                        <TabsTrigger key={t} value={t} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-charcoal-bark rounded-none px-2 py-4 shadow-none hover:text-charcoal-bark transition-all duration-300">{t}</TabsTrigger>
                      ))}
                   </TabsList>

                   <TabsContent value="profile" className="space-y-12 mt-0">
                      <div className="grid gap-12">
                         <div className="space-y-6">
                            <h4 className="text-[11px] uppercase font-semibold text-primary tracking-[0.2em] flex items-center gap-2">
                               <AlertCircle className="h-3 w-3" /> Compliance & Identity
                            </h4>
                            <div className="grid gap-6">
                               <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                  <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">Profile Picture Link</Label>
                                  <Input 
                                     value={staff.profilePictureUrl || ''} 
                                     onChange={e => onStaffChange({...staff, profilePictureUrl: e.target.value})}
                                     placeholder="https://images.unsplash.com/..."
                                     className="rounded-xl border-kiln-border bg-white" 
                                  />
                               </div>
                               <div className="grid grid-cols-2 gap-8">
                                  <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                     <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">SSS Number</Label>
                                     <Input 
                                        value={staff.sssNumber || ''} 
                                        onChange={e => onStaffChange({...staff, sssNumber: e.target.value})}
                                        className="rounded-xl border-kiln-border bg-white" 
                                     />
                                  </div>
                                  <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                     <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">TIN Number</Label>
                                     <Input 
                                        value={staff.tinNumber || ''} 
                                        onChange={e => onStaffChange({...staff, tinNumber: e.target.value})}
                                        className="rounded-xl border-kiln-border bg-white" 
                                     />
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[11px] uppercase font-semibold text-primary tracking-[0.2em] flex items-center gap-2">
                               <Check className="h-3 w-3" /> Area of Specialization
                            </h4>
                            <div className="flex flex-wrap gap-2">
                               {categories.map(cat => (
                                 <Badge 
                                   key={cat.id} 
                                   variant="outline" 
                                   className={`rounded-xl px-4 py-1.5 text-[11px] uppercase font-semibold tracking-widest transition-all cursor-pointer ${staff.specializations?.includes(cat.name) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-transparent text-warm-stone border-kiln-border opacity-40'}`}
                                   onClick={() => {
                                      const current = staff.specializations || '';
                                      const specs = current.split(',').map(s => s.trim()).filter(Boolean);
                                      const next = specs.includes(cat.name) ? specs.filter(s => s !== cat.name) : [...specs, cat.name];
                                      onStaffChange({...staff, specializations: next.join(', ')});
                                   }}
                                 >
                                    {cat.name}
                                 </Badge>
                               ))}
                            </div>
                         </div>
                      </div>
                   </TabsContent>

                   <TabsContent value="schedule" className="mt-0">
                      <div className="space-y-8">
                         <div className="flex justify-between items-center mb-8 px-2">
                            <h4 className="text-[11px] uppercase font-semibold text-primary tracking-[0.2em]">Weekly Shift Assignment</h4>
                            <span className="text-[11px] font-semibold text-warm-stone uppercase opacity-60 italic">Global System Time (GMT+8)</span>
                         </div>
                         <div className="divide-y divide-kiln-border border-t border-kiln-border">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                              const sched = schedule.find(s => s.day_of_week === idx);
                              return (
                                <div key={day} className="py-6 flex justify-between items-center group">
                                   <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-stone group-hover:text-primary transition-colors">{day}</span>
                                   <div className="flex items-center gap-4">
                                      {sched?.is_active ? (
                                        <div className="flex items-center gap-2 bg-bisque-wash/30 px-4 py-1.5 border border-kiln-border rounded-xl">
                                           <span className="font-mono text-xs font-bold">{sched.start_time} — {sched.end_time}</span>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] uppercase font-semibold text-clay-dust tracking-tight">Day Off / Unset</span>
                                      )}
                                      <Button variant="ghost" size="sm" className="h-10 text-[11px] uppercase font-semibold border border-kiln-border rounded-xl px-4" onClick={() => onEditShift(idx)} aria-label={`Edit ${day} shift assignment`}>Edit</Button>
                                   </div>
                                </div>
                              );
                            })}
                         </div>
                      </div>
                   </TabsContent>

                   <TabsContent value="financials" className="mt-0 space-y-12">
                      <div className="grid gap-12">
                         <div className="space-y-6">
                            <h4 className="text-[11px] uppercase font-semibold text-primary tracking-[0.2em] flex items-center gap-2">
                               <Wallet className="h-3 w-3" /> Baseline Compensation
                            </h4>
                            <div className="space-y-8">
                               <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                  <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">Weekly Fixed Base</Label>
                                  <Input 
                                    type="number" 
                                    value={staff.basePayPerWeek} 
                                     onChange={e => {
                                        const val = e.target.value;
                                        onStaffChange({...staff, basePayPerWeek: val === '' ? 0 : parseFloat(val)});
                                     }}
                                    className="w-32 text-right font-serif text-2xl border-none focus-visible:ring-0 h-auto p-0"
                                  />
                               </div>
                               <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                  <Label className="text-[11px] uppercase font-semibold text-warm-stone tracking-[0.1em]">Daily Sales Quota Target</Label>
                                  <Input 
                                    type="number" 
                                    value={staff.dailyTarget} 
                                     onChange={e => {
                                        const val = e.target.value;
                                        onStaffChange({...staff, dailyTarget: val === '' ? 0 : parseFloat(val)});
                                     }}
                                    className="w-32 text-right font-serif text-2xl border-none focus-visible:ring-0 h-auto p-0"
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                   </TabsContent>
                </Tabs>
             </div>

             <div className="p-8 border-t border-kiln-border bg-warm-canvas/30 flex gap-4 mt-auto">
                <Button variant="outline" className="flex-1 rounded-xl border-kiln-border h-14 text-[11px] uppercase font-semibold tracking-[0.2em] text-brick-error hover:bg-brick-error hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" onClick={() => onOpenChange(false)} aria-label="Suspend this employee artisan file">Suspend Artisan</Button>
                <Button onClick={onUpdateBaseline} className="flex-[2] rounded-xl h-14 text-[11px] uppercase font-semibold tracking-[0.2em] shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" aria-label="Commit all changes to this employee file">Commit File Updates</Button>
             </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
