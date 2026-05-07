import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { DeductionsViewProps } from '../types';

export const DeductionsView: React.FC<DeductionsViewProps> = ({
  staffMembers,
  deductionForm,
  onFormChange,
  onSubmit
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <Card className="rounded-none border-none shadow-sm bg-white">
             <CardHeader className="border-b border-gray-50">
                <CardTitle className="font-serif text-2xl font-light italic">Entry <span className="not-italic">Form</span></CardTitle>
                <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em]">Log employee advances and uniforms</CardDescription>
             </CardHeader>
             <CardContent className="pt-8">
                <form onSubmit={onSubmit} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Select Staff Member</Label>
                      <Select required onValueChange={(val: string | null) => onFormChange({...deductionForm, staffId: val || ''})}>
                         <SelectTrigger className="rounded-none border-gray-200 h-12 bg-gray-50/30"><SelectValue placeholder="Choose Technician" /></SelectTrigger>
                         <SelectContent className="rounded-none border-none shadow-2xl">
                            {staffMembers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.fullName}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Entry Type</Label>
                         <Select defaultValue="Cash Advance" onValueChange={(val: string | null) => onFormChange({...deductionForm, type: val || 'Cash Advance'})}>
                            <SelectTrigger className="rounded-none border-gray-200 h-12 bg-gray-50/30"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-none border-none shadow-2xl">
                               <SelectItem value="Cash Advance">Cash Advance</SelectItem>
                               <SelectItem value="Uniform">Uniform</SelectItem>
                               <SelectItem value="Loan Payment">Loan Payment</SelectItem>
                               <SelectItem value="Reloan">Reloan</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Amount (₱)</Label>
                         <Input type="number" required placeholder="0.00" value={deductionForm.amount} onChange={e => onFormChange({...deductionForm, amount: e.target.value})} className="rounded-none border-gray-200 h-12 bg-gray-50/30" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Notes</Label>
                      <textarea 
                        className="w-full min-h-[100px] border border-gray-200 p-4 rounded-none bg-gray-50/30 focus:ring-1 focus:ring-primary/20 outline-none font-light text-sm" 
                        placeholder="Reason for deduction..." 
                        value={deductionForm.notes}
                        onChange={e => onFormChange({...deductionForm, notes: e.target.value})}
                      />
                   </div>
                   <Button type="submit" className="w-full rounded-none h-14 uppercase tracking-[0.3em] font-bold text-xs shadow-xl shadow-primary/20">Commit Entry to Ledger</Button>
                </form>
             </CardContent>
          </Card>

          <div className="space-y-8">
             <h3 className="font-serif text-xl italic text-primary/60 px-2">Financial Insights</h3>
             <Card className="rounded-none border-none shadow-sm bg-primary-ultra/20">
                <CardContent className="p-8">
                   <div className="space-y-12">
                      <div className="flex justify-between items-end border-b border-primary/10 pb-6">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Advances</p>
                         <p className="text-4xl font-serif font-light">₱12,450</p>
                      </div>
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uniform Arrears</p>
                         <p className="text-2xl font-serif font-light text-primary">₱2,800</p>
                      </div>
                      <p className="text-[8px] text-muted-foreground italic pt-4">Data reflects unfinalized weekly deductions for the current cycle.</p>
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
};
