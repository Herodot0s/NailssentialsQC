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
import type { StaffDetailSheetProps } from './types';

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
      <SheetContent side="right" className="sm:max-w-xl p-0 border-none bg-white flex flex-col h-full shadow-2xl">
        {staff && (
          <div className="flex flex-col h-full">
             <div className="bg-primary p-12 text-white">
                <SheetHeader className="space-y-6 text-left">
                   <div className="flex justify-between items-start">
                      <Avatar className="w-24 h-24 rounded-none border-2 border-white/20">
                        <AvatarImage src={staff.profilePictureUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-white/10 backdrop-blur-xl font-serif text-4xl font-light">{staff.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Badge className="bg-white/20 text-white border-none rounded-none text-[9px] uppercase tracking-[0.2em] font-bold">Employee File #{staff.id}</Badge>
                   </div>
                   <div>
                      <SheetTitle className="text-5xl font-serif font-light text-white tracking-tight">{staff.fullName}</SheetTitle>
                      <SheetDescription className="text-white/60 font-light text-base mt-2 flex items-center gap-2">
                         <Briefcase className="h-4 w-4 stroke-[1.5]" /> Senior Artisan • Joined {format(new Date(staff.createdAt), 'MMMM yyyy')}
                      </SheetDescription>
                   </div>
                </SheetHeader>
             </div>

             <div className="flex-1 overflow-y-auto p-12 bg-white">
                <Tabs defaultValue="profile" className="space-y-12">
                   <TabsList className="bg-transparent p-0 h-auto gap-8 border-b border-gray-100 w-full justify-start rounded-none">
                      {['profile', 'schedule', 'financials'].map(t => (
                        <TabsTrigger key={t} value={t} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-2 py-4 shadow-none">{t}</TabsTrigger>
                      ))}
                   </TabsList>

                   <TabsContent value="profile" className="space-y-12 mt-0">
                      <div className="grid gap-12">
                         <div className="space-y-6">
                            <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] flex items-center gap-2">
                               <AlertCircle className="h-3 w-3" /> Compliance & Identity
                            </h4>
                            <div className="grid gap-6">
                               <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                  <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Profile Picture Link</Label>
                                  <Input 
                                     value={staff.profilePictureUrl || ''} 
                                     onChange={e => onStaffChange({...staff, profilePictureUrl: e.target.value})}
                                     placeholder="https://images.unsplash.com/..."
                                     className="rounded-none border-gray-100 bg-white" 
                                  />
                               </div>
                               <div className="grid grid-cols-2 gap-8">
                                  <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                     <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">SSS Number</Label>
                                     <Input 
                                        value={staff.sssNumber || ''} 
                                        onChange={e => onStaffChange({...staff, sssNumber: e.target.value})}
                                        className="rounded-none border-gray-100 bg-white" 
                                     />
                                  </div>
                                  <div className="p-6 bg-gray-50/50 border border-gray-100 space-y-2">
                                     <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">TIN Number</Label>
                                     <Input 
                                        value={staff.tinNumber || ''} 
                                        onChange={e => onStaffChange({...staff, tinNumber: e.target.value})}
                                        className="rounded-none border-gray-100 bg-white" 
                                     />
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] flex items-center gap-2">
                               <Check className="h-3 w-3" /> Area of Specialization
                            </h4>
                            <div className="flex flex-wrap gap-2">
                               {categories.map(cat => (
                                 <Badge 
                                   key={cat.id} 
                                   variant="outline" 
                                   className={`rounded-none px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer ${staff.specializations?.includes(cat.name) ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted-foreground border-gray-100 opacity-40'}`}
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
                            <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em]">Weekly Shift Assignment</h4>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 italic">Global System Time (GMT+8)</span>
                         </div>
                         <div className="divide-y divide-gray-50 border-t border-gray-50">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                              const sched = schedule.find(s => s.day_of_week === idx);
                              return (
                                <div key={day} className="py-6 flex justify-between items-center group">
                                   <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{day}</span>
                                   <div className="flex items-center gap-4">
                                      {sched?.is_active ? (
                                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 border border-gray-100">
                                           <span className="font-mono text-xs font-bold">{sched.start_time} — {sched.end_time}</span>
                                        </div>
                                      ) : (
                                        <span className="text-[9px] uppercase font-bold text-gray-300 tracking-tighter">Day Off / Unset</span>
                                      )}
                                      <Button variant="ghost" size="sm" className="h-7 text-[8px] uppercase font-bold border border-gray-100 rounded-none px-3" onClick={() => onEditShift(idx)}>Edit</Button>
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
                            <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] flex items-center gap-2">
                               <Wallet className="h-3 w-3" /> Baseline Compensation
                            </h4>
                            <div className="space-y-8">
                               <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Weekly Fixed Base</Label>
                                  <Input 
                                    type="number" 
                                    value={staff.basePayPerWeek} 
                                    onChange={e => onStaffChange({...staff, basePayPerWeek: parseFloat(e.target.value)})}
                                    className="w-32 text-right font-serif text-2xl border-none focus-visible:ring-0 h-auto p-0"
                                  />
                               </div>
                               <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Daily Sales Quota Target</Label>
                                  <Input 
                                    type="number" 
                                    value={staff.dailyTarget} 
                                    onChange={e => onStaffChange({...staff, dailyTarget: parseFloat(e.target.value)})}
                                    className="w-32 text-right font-serif text-2xl border-none focus-visible:ring-0 h-auto p-0"
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                   </TabsContent>
                </Tabs>
             </div>

             <div className="p-12 border-t border-gray-50 bg-gray-50/30 flex gap-4">
                <Button variant="outline" className="flex-1 rounded-none border-gray-200 h-14 text-[10px] uppercase font-bold tracking-widest text-destructive hover:bg-destructive hover:text-white" onClick={() => onOpenChange(false)}>Suspend Artisan</Button>
                <Button onClick={onUpdateBaseline} className="flex-[2] rounded-none h-14 text-[10px] uppercase font-bold tracking-widest shadow-xl shadow-primary/20">Commit File Updates</Button>
             </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
