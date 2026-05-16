import React from 'react';
import { format } from 'date-fns';
import type { PayrollRecord } from '@/types/api';

interface PayslipPDFTemplateProps {
  payroll: PayrollRecord;
  salonInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const PayslipPDFTemplate: React.FC<PayslipPDFTemplateProps> = ({ payroll, salonInfo }) => {
  const earnings = payroll.items?.filter((i) => i.component_type === 'earning') || [];
  const deductions = payroll.items?.filter((i) => i.component_type === 'deduction') || [];
  
  return (
    <div 
      id="payslip-pdf-content" 
      className="p-12 bg-white text-[#23251d] max-w-[800px] mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#23251d] pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
            {salonInfo?.name || 'Nailssentials QC'}
          </h1>
          <div className="text-[12px] text-[#6c6e63] space-y-0.5 uppercase tracking-wider font-bold">
            <p>{salonInfo?.address || '123 Beauty Lane, Quezon City'}</p>
            <p>{salonInfo?.phone || '+63 917 123 4567'}</p>
            <p>{salonInfo?.email || 'hello@nailssentials.com'}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[#B8794E]">Payslip</h2>
          <p className="text-[14px] font-bold mt-2">
            {payroll.period 
              ? `${format(new Date(payroll.period.start_date), 'MMM d')} - ${format(new Date(payroll.period.end_date), 'MMM d, yyyy')}`
              : 'Period N/A'}
          </p>
        </div>
      </div>

      {/* Staff Info */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c6e63] mb-1">Employee</p>
          <p className="text-xl font-bold">{payroll.fullName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c6e63] mb-1">Issue Date</p>
          <p className="text-[14px] font-bold">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        <div className="bg-[#fcfcfa] border border-[#bfc1b7] p-4 rounded-md">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#6c6e63] mb-1">Gross Pay</p>
          <p className="text-lg font-bold">₱{(Number(payroll.base_pay) + Number(payroll.commissions)).toLocaleString()}</p>
        </div>
        <div className="bg-[#fcfcfa] border border-[#bfc1b7] p-4 rounded-md">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#6c6e63] mb-1">Commissions</p>
          <p className="text-lg font-bold text-[#B8794E]">₱{Number(payroll.commissions).toLocaleString()}</p>
        </div>
        <div className="bg-[#fcfcfa] border border-[#bfc1b7] p-4 rounded-md">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#6c6e63] mb-1">Deductions</p>
          <p className="text-lg font-bold text-[#cd4239]">₱{Number(payroll.deductions).toLocaleString()}</p>
        </div>
        <div className="bg-[#23251d] text-white p-4 rounded-md">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Net Pay</p>
          <p className="text-lg font-bold">₱{Number(payroll.net_pay).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Earnings Table */}
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-widest mb-4 pb-2 border-b border-[#bfc1b7]">Earnings</h3>
          <table className="w-full text-sm">
            <tbody>
              {earnings.map((item, idx) => (
                <tr key={idx} className="border-b border-[#bfc1b7]/30">
                  <td className="py-3 font-medium text-[#4d4f46]">{item.component_name}</td>
                  <td className="py-3 text-right font-bold tabular-nums">₱{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Deductions Table */}
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-widest mb-4 pb-2 border-b border-[#bfc1b7]">Deductions</h3>
          {deductions.length > 0 ? (
            <table className="w-full text-sm">
              <tbody>
                {deductions.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#bfc1b7]/30">
                    <td className="py-3 font-medium text-[#4d4f46]">{item.component_name}</td>
                    <td className="py-3 text-right font-bold text-[#cd4239] tabular-nums">-₱{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[12px] italic text-[#6c6e63]">No deductions applied.</p>
          )}
        </div>
      </div>

      {/* Daily Breakdown */}
      {payroll.daily_breakdown && Object.keys(payroll.daily_breakdown).length > 0 && (
        <div className="mt-12">
          <h3 className="text-[12px] font-black uppercase tracking-widest mb-4 pb-2 border-b border-[#bfc1b7]">Daily Sales Performance</h3>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(payroll.daily_breakdown).map(([date, sales]) => (
              <div key={date} className="text-center p-2 border border-[#bfc1b7]/50 rounded-md">
                <p className="text-[8px] font-black uppercase text-[#6c6e63]">{format(new Date(date), 'EEE')}</p>
                <p className="text-[10px] font-bold text-[#4d4f46] my-1">{format(new Date(date), 'MMM d')}</p>
                <p className="text-[11px] font-black text-[#B8794E]">₱{sales.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-[100px] pt-8 border-t border-[#bfc1b7] text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6c6e63]">
          This is a computer-generated document. No signature is required.
        </p>
        <p className="text-[9px] text-[#bfc1b7] mt-2">
          Generated via NailssentialsQC Artisan Portal &bull; {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
};
