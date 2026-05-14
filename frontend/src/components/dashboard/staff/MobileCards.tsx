import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Scissors, Calendar } from 'lucide-react';
import type { PayrollRecord } from '@/types/api';

interface AppointmentCardProps {
  customerName: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  status: string;
  statusBadge: React.ReactNode;
  onComplete?: () => void;
  date?: string;
  technicianName?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  customerName,
  startTime,
  endTime,
  serviceName,
  statusBadge,
  onComplete,
  date,
  technicianName,
}) => {
  return (
    <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white overflow-hidden mb-4">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#B8794E]">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[13px] font-bold tabular-nums">
                {date ? `${date} • ` : ''}
                {startTime} — {endTime}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#23251d] leading-tight">{customerName}</h3>
          </div>
          {statusBadge}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#4d4f46]">
            <Scissors className="h-4 w-4 opacity-60" />
            <span className="text-sm font-medium">{serviceName}</span>
          </div>
          {technicianName && (
            <div className="flex items-center gap-2 text-[#B8794E]">
              <span className="text-[10px] font-bold uppercase tracking-widest">Artisan:</span>
              <span className="text-xs font-bold">{technicianName}</span>
            </div>
          )}
        </div>

        {onComplete && (
          <div className="pt-2">
            <Button
              onClick={onComplete}
              className="w-full rounded-md h-11 bg-[#23251d] hover:bg-[#33342d] text-white text-[13px] font-bold uppercase tracking-widest"
            >
              Complete Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PayrollCardProps {
  payroll: PayrollRecord;
}

export const PayrollCard: React.FC<PayrollCardProps> = ({ payroll }) => {
  const startDate = payroll.period
    ? new Date(payroll.period.start_date).toLocaleDateString()
    : 'N/A';
  const endDate = payroll.period ? new Date(payroll.period.end_date).toLocaleDateString() : 'N/A';

  return (
    <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white overflow-hidden mb-4">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#6c6e63]">
          <Calendar className="h-4 w-4" />
          <span className="text-[12px] font-bold uppercase tracking-wider">
            {startDate} — {endDate}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-[#bfc1b7]/30 py-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#6c6e63] uppercase tracking-widest">
              Base Pay
            </p>
            <p className="text-sm font-bold text-[#4d4f46]">
              ₱{(payroll.base_pay || 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#6c6e63] uppercase tracking-widest">
              Commissions
            </p>
            <p className="text-sm font-bold text-[#4d4f46]">
              ₱{(payroll.commissions || 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#6c6e63] uppercase tracking-widest">
              Deductions
            </p>
            <p className="text-sm font-bold text-[#cd4239]">
              ₱{(payroll.deductions || 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#6c6e63] uppercase tracking-widest">
              Net Payout
            </p>
            <p className="text-lg font-black text-[#B8794E]">
              ₱{(payroll.net_pay || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
