import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

interface DeductionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffPayroll: any;
  isLocked: boolean;
  onAddDeduction: (data: { type: string; amount: number; notes: string }) => void;
}

export const DeductionDetailSheet: React.FC<DeductionDetailSheetProps> = ({
  open,
  onOpenChange,
  staffPayroll,
  isLocked,
  onAddDeduction
}) => {
  const [type, setType] = useState('cash_advance');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!staffPayroll) return null;

  const items = staffPayroll.items || [];
  const earnings = items.filter((i: any) => i.component_type === 'earning');
  const deductions = items.filter((i: any) => i.component_type === 'deduction');

  const handleAdd = () => {
    if (!amount || isNaN(Number(amount))) return;
    onAddDeduction({ type, amount: Number(amount), notes });
    setAmount('');
    setNotes('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 border-none">
        <div className="h-full flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-gray-50">
            <SheetTitle className="font-serif text-2xl font-light">Payroll Items</SheetTitle>
            <SheetDescription className="text-[10px] uppercase tracking-widest font-bold text-primary/40">
              {staffPayroll.staff?.full_name} • #{staffPayroll.id}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Earnings Section */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Earnings</h3>
              <div className="border border-gray-100 bg-gray-50/30">
                <Table>
                  <TableBody>
                    {earnings.map((item: any) => (
                      <TableRow key={item.id} className="border-gray-50 hover:bg-transparent">
                        <TableCell className="text-[13px] py-3">{item.component_name}</TableCell>
                        <TableCell className="text-right font-mono text-[13px] py-3 text-emerald-600">
                          ₱{Number(item.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Deductions Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive">Deductions</h3>
              </div>
              <div className="border border-gray-100 bg-gray-50/30">
                <Table>
                  <TableBody>
                    {deductions.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="text-center py-8 text-[11px] italic text-muted-foreground">
                          No deductions recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      deductions.map((item: any) => (
                        <TableRow key={item.id} className="border-gray-50 hover:bg-transparent">
                          <TableCell className="py-3">
                            <div className="flex flex-col">
                              <span className="text-[13px]">{item.component_name}</span>
                              {item.formula_used === 'Manual' && (
                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Manual Adjustment</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-[13px] py-3 text-destructive">
                            -₱{Number(item.amount).toLocaleString()}
                          </TableCell>
                          {!isLocked && item.formula_used === 'Manual' && (
                            <TableCell className="text-right py-3 w-10">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  // This is tricky because items are historical snapshots.
                                  // We need to find the actual DeductionLog ID.
                                  // For now, if it's manual, we might need to pass the deduction ID in the item.
                                  // Let's assume we can't delete directly from historical items without the ID.
                                  // But for the scope of this UI, we'll just show them.
                                }}
                                disabled={true} // Need to link deductionLog ID to item to enable deletion
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Adjustment Form */}
            {!isLocked && (
              <section className="space-y-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 text-primary">
                  <Plus className="h-4 w-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Manual Adjustment</h3>
                </div>
                
                <div className="space-y-4 bg-gray-50/50 p-6">
                  <div className="grid gap-2">
                    <Label className="text-[9px] uppercase tracking-widest font-bold">Category</Label>
                    <Select value={type} onValueChange={(val) => setType(val || 'cash_advance')}>
                      <SelectTrigger className="rounded-none border-gray-200 h-10 text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-gray-100 shadow-xl">
                        <SelectItem value="cash_advance">Cash Advance</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                        <SelectItem value="uniform">Uniform</SelectItem>
                        <SelectItem value="reloan">Reloan</SelectItem>
                        <SelectItem value="other">Other Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[9px] uppercase tracking-widest font-bold">Amount (PHP)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-none border-gray-200 h-10 text-xs"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[9px] uppercase tracking-widest font-bold">Notes</Label>
                    <Input 
                      placeholder="Optional notes..." 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-none border-gray-200 h-10 text-xs"
                    />
                  </div>

                  <Button 
                    onClick={handleAdd}
                    className="w-full rounded-none h-11 uppercase text-[10px] font-bold tracking-widest mt-4"
                  >
                    Add Adjustment
                  </Button>
                </div>
              </section>
            )}

            <div className="flex justify-between items-center p-6 bg-primary text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Net Payable</span>
              <span className="text-xl font-mono font-black">₱{Number(staffPayroll.net_pay).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
