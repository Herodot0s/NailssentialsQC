import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { exportComponentToPDF } from '@/lib/pdf-utils';
import { PayslipPDFTemplate } from './PayslipPDFTemplate';
import type { PayrollRecord } from '@/types/api';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, payroll }) => {
  if (!payroll) return null;

  const handleDownload = async () => {
    const filename = `Payslip_${payroll.fullName.replace(/\s+/g, '_')}_${payroll.period?.start_date}.pdf`;
    await exportComponentToPDF('payslip-pdf-content', filename);
  };

  const earnings = payroll.items?.filter((i) => i.component_type === 'earning') || [];
  const deductions = payroll.items?.filter((i) => i.component_type === 'deduction') || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl rounded-md p-0 bg-[#eeefe9]">
        <div className="sticky top-0 z-10 bg-[#23251d] p-8 md:p-12 text-white flex justify-between items-center">
          <DialogHeader>
            <DialogTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Payslip <span className="text-[#B8794E]">Details</span>
            </DialogTitle>
            <DialogDescription className="text-white/60 font-medium mt-2 text-[12px] uppercase tracking-widest">
              {payroll.period 
                ? `${format(new Date(payroll.period.start_date), 'MMMM d')} - ${format(new Date(payroll.period.end_date), 'MMMM d, yyyy')}`
                : 'Payroll Period'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button
              onClick={handleDownload}
              className="rounded-md gap-3 bg-[#B8794E] hover:bg-[#dd9001] text-white transition-all h-12 px-8 text-[12px] font-bold uppercase shadow-none"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard title="Gross Pay" value={Number(payroll.base_pay) + Number(payroll.commissions)} />
            <SummaryCard title="Commissions" value={payroll.commissions} highlight />
            <SummaryCard title="Deductions" value={payroll.deductions} color="text-[#cd4239]" />
            <SummaryCard title="Net Payout" value={payroll.net_pay} variant="dark" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Earnings Breakdown */}
            <div className="space-y-6">
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#4d4f46] border-b border-[#bfc1b7] pb-4">
                Earnings Breakdown
              </h3>
              <div className="space-y-4">
                {earnings.map((item, idx) => (
                  <BreakdownRow key={idx} label={item.component_name} value={item.amount} />
                ))}
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="space-y-6">
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#4d4f46] border-b border-[#bfc1b7] pb-4">
                Deductions Breakdown
              </h3>
              {deductions.length > 0 ? (
                <div className="space-y-4">
                  {deductions.map((item, idx) => (
                    <BreakdownRow key={idx} label={item.component_name} value={item.amount} prefix="-₱" color="text-[#cd4239]" />
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-[#6c6e63]">No deductions recorded for this period.</p>
              )}
            </div>
          </div>

          {/* Daily Sales Performance */}
          {payroll.daily_breakdown && Object.keys(payroll.daily_breakdown).length > 0 && (
            <div className="space-y-6">
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#4d4f46] border-b border-[#bfc1b7] pb-4">
                Daily Sales Performance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(payroll.daily_breakdown).map(([date, sales]) => (
                  <div key={date} className="bg-white p-4 border border-[#bfc1b7] rounded-md text-center space-y-1">
                    <p className="text-[10px] font-bold uppercase text-[#B8794E]">{format(new Date(date), 'EEE')}</p>
                    <p className="text-sm font-bold text-[#23251d]">{format(new Date(date), 'MMM d')}</p>
                    <p className="text-[16px] font-black tabular-nums">₱{sales.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hidden PDF Template for generation */}
        <div className="absolute top-[-9999px] left-[-9999px]">
          <PayslipPDFTemplate payroll={payroll} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SummaryCard = ({ 
  title, 
  value, 
  highlight, 
  color, 
  variant = 'light' 
}: { 
  title: string; 
  value: number; 
  highlight?: boolean; 
  color?: string;
  variant?: 'light' | 'dark';
}) => (
  <div className={`p-6 rounded-md border ${variant === 'dark' ? 'bg-[#23251d] border-[#23251d] text-white' : 'bg-white border-[#bfc1b7] text-[#23251d]'} space-y-2 shadow-sm`}>
    <p className={`text-[10px] font-bold uppercase tracking-widest ${variant === 'dark' ? 'text-white/60' : 'text-[#6c6e63]'}`}>{title}</p>
    <p className={`text-2xl font-black tabular-nums ${color} ${highlight && !color ? 'text-[#B8794E]' : ''}`}>
      ₱{Number(value).toLocaleString()}
    </p>
  </div>
);

const BreakdownRow = ({ 
  label, 
  value, 
  prefix = '₱', 
  color = 'text-[#23251d]' 
}: { 
  label: string; 
  value: number; 
  prefix?: string; 
  color?: string;
}) => (
  <div className="flex justify-between items-center bg-white/50 p-4 rounded-md border border-[#bfc1b7]/30">
    <span className="text-sm font-bold uppercase tracking-tight text-[#4d4f46]">{label}</span>
    <span className={`text-[16px] font-black tabular-nums ${color}`}>
      {prefix}{Number(value).toLocaleString()}
    </span>
  </div>
);
