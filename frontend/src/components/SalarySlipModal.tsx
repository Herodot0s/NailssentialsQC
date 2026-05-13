import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';

interface PayrollRecord {
  staffId: number;
  fullName: string;
  commissionCount: number;
  totalCommission: number;
  attendanceCount: number;
  totalDeduction: number;
  basePay: number;
  netPay: number;
  items?: {
    component_name: string;
    component_type: 'earning' | 'deduction';
    amount: number;
    formula_used?: string;
  }[];
}

interface SalarySlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollRecord | null;
}

const SalarySlipModal: React.FC<SalarySlipModalProps> = ({ open, onOpenChange, payroll }) => {
  if (!payroll) return null;

  const basePay = payroll.basePay || 0;
  const totalCommission = payroll.totalCommission || 0;
  const totalDeduction = payroll.totalDeduction || 0;
  const netPay = payroll.netPay || 0;

  const earnings = payroll.items?.filter((i) => i.component_type === 'earning') || [
    { component_name: 'Weekly Base Pay', amount: basePay },
    { component_name: 'Team Tier Commissions', amount: totalCommission },
  ];

  const deductions = payroll.items?.filter((i) => i.component_type === 'deduction') || [
    { component_name: 'Lateness / Absence', amount: totalDeduction },
  ];

  const grossPay = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDeducted = deductions.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-none shadow-3xl rounded-none p-0 overflow-hidden bg-white">
        <div className="bg-primary p-12 text-white">
          <DialogHeader className="text-left space-y-4">
            <div className="flex justify-between items-start">
              <Receipt className="h-10 w-10 text-white/40" />
              <Badge className="bg-white/20 border-none rounded-none text-[8px] uppercase tracking-widest">
                Slip ID #PAY-{payroll.staffId}-{Date.now().toString().slice(-4)}
              </Badge>
            </div>
            <div>
              <DialogTitle className="font-serif text-4xl font-light italic">
                Artisan <span className="not-italic">Salary Slip</span>
              </DialogTitle>
              <DialogDescription className="text-white/60 font-light mt-1 uppercase text-[10px] tracking-widest">
                Beneficiary: {payroll.fullName} • Status: Weekly Draft
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="p-12 space-y-12">
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-8">
              <h4 className="text-[10px] uppercase font-bold text-primary tracking-[0.3em] border-b border-primary/10 pb-2">
                Total Earnings
              </h4>
              <div className="space-y-4">
                {earnings.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light italic">
                      {item.component_name}
                    </span>
                    <span className="font-bold">₱{Number(item.amount).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-4 border-t border-gray-50 font-bold text-lg">
                  <span>Gross Payout</span>
                  <span className="text-primary">₱{grossPay.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] uppercase font-bold text-destructive tracking-[0.3em] border-b border-destructive/10 pb-2">
                Deductions
              </h4>
              <div className="space-y-4">
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light italic">
                      {item.component_name}
                    </span>
                    <span className="font-bold text-destructive">
                      -₱{Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-4 border-t border-gray-50 font-bold text-lg">
                  <span>Total Deducted</span>
                  <span className="text-destructive">-₱{totalDeducted.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-ultra/10 p-10 flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Net Payable Amount
              </p>
              <p className="text-[9px] text-primary/40 italic">
                Final value post-component evaluation
              </p>
            </div>
            <p className="text-5xl font-serif font-light text-primary tracking-tighter">
              ₱{netPay.toLocaleString()}
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 bg-gray-50 flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-none px-12 h-14 uppercase tracking-widest font-bold text-xs shadow-xl shadow-primary/20"
          >
            Close Payout Viewer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalarySlipModal;
