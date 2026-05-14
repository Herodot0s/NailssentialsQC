import React from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Lock, RefreshCw } from 'lucide-react';
import type { PayrollPeriod } from '@/types/api';

interface PayrollDetailViewProps {
  period: PayrollPeriod;
  onBack: () => void;
  onExport: () => void;
  onLock: () => void;
  onRegenerate: () => void;
  onStaffClick: (staffPayroll: any) => void;
}

export const PayrollDetailView: React.FC<PayrollDetailViewProps> = ({
  period,
  onBack,
  onExport,
  onLock,
  onRegenerate,
  onStaffClick
}) => {
  const payrolls = (period as any).payrolls || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-none h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-light text-foreground">
              Period Details: {format(new Date(period.start_date), 'MMM d')} - {format(new Date(period.end_date), 'MMM d, yyyy')}
            </h2>
            <div className="flex gap-3 items-center mt-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                ID: #{period.id} • SALON SALES: ₱{period.total_salon_sales.toLocaleString()}
              </p>
              {period.is_locked ? (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-50 rounded-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                  <Lock className="h-2 w-2 mr-1" /> Locked
                </Badge>
              ) : (
                <Badge className="bg-amber-50 text-amber-600 border-amber-100/50 hover:bg-amber-50 rounded-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                  Draft
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {!period.is_locked && (
            <>
              <Button 
                variant="outline" 
                onClick={onRegenerate}
                className="gap-2 rounded-none px-4 uppercase text-[9px] font-bold tracking-widest border-gray-100 h-10"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Recalculate
              </Button>
              <Button 
                onClick={onLock}
                className="gap-2 rounded-none px-6 uppercase text-[9px] font-bold tracking-widest h-10"
              >
                <Lock className="h-3.5 w-3.5" /> Finalize & Lock
              </Button>
            </>
          )}
          <Button 
            variant="outline"
            onClick={onExport}
            className="gap-2 rounded-none px-4 uppercase text-[9px] font-bold tracking-widest border-gray-100 h-10"
          >
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4">Employee Name</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4">Commission</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4">Basic Pay</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4">Gross Pay</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4">Deductions</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4">Net Pay</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs italic">
                  No payroll records found for this period.
                </TableCell>
              </TableRow>
            ) : (
              payrolls.map((p: any) => (
                <TableRow key={p.id} className="group border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <TableCell className="py-4">
                    <span className="text-[13px] font-bold text-foreground">{p.staff?.full_name || 'Unknown Staff'}</span>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[13px]">
                    ₱{Number(p.commissions).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[13px]">
                    ₱{Number(p.base_pay).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[13px] font-bold">
                    ₱{(Number(p.commissions) + Number(p.base_pay)).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-mono text-[13px] text-destructive">
                      -₱{Number(p.deductions).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-mono text-[14px] font-black text-primary">
                      ₱{Number(p.net_pay).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-none text-[9px] uppercase font-bold tracking-wider h-8 px-3"
                      onClick={() => onStaffClick(p)}
                    >
                      {period.is_locked ? 'View Items' : 'Adjustments'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
