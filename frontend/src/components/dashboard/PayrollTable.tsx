import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Lock, Check } from 'lucide-react';
import type { PayrollTableProps } from './types';

export const PayrollTable: React.FC<PayrollTableProps> = ({ payrollReport, onPayrollRowClick, payrollPeriods, onLockPayroll }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif text-2xl font-light italic">Payroll <span className="not-italic">Register</span></CardTitle>
            <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1">Calculated commissions and weekly payouts</CardDescription>
          </div>
        </CardHeader>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="pl-8 py-5 text-[9px] uppercase font-bold">Artisan</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Gross Payout</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Deductions</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Status</TableHead>
              <TableHead className="text-right pr-8 text-[9px] uppercase font-bold">Net Payable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollReport.map(row => (
              <TableRow
                key={row.staffId}
                className="hover:bg-primary-ultra/10 border-gray-50 transition-colors cursor-pointer group"
                onClick={() => onPayrollRowClick(row)}
              >
                <TableCell className="pl-8 py-6">
                  <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{row.fullName}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">{row.commissionCount} Rituals Conducted</p>
                </TableCell>
                <TableCell className="font-bold text-xs">₱{(row.totalCommission + row.basePay).toLocaleString()}</TableCell>
                <TableCell className="text-destructive font-bold text-xs">-₱{row.totalDeduction.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className="bg-primary-ultra/30 text-primary border-none rounded-none text-[8px] font-bold uppercase tracking-widest">DRAFT</Badge>
                </TableCell>
                <TableCell className="text-right pr-8 font-serif text-2xl font-light text-primary">₱{row.netPay.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="space-y-6">
        <h3 className="font-serif text-2xl italic px-2">Cycle History</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {payrollPeriods.map(period => (
            <Card key={period.id} className="rounded-none border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className={`absolute top-0 left-0 w-full h-1 ${period.is_locked ? 'bg-success-color' : 'bg-primary/20'}`} />
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <Badge className={`rounded-none border-none text-[8px] font-bold uppercase tracking-widest px-3 py-1 ${period.is_locked ? 'bg-success-color/10 text-success-color' : 'bg-primary-ultra/30 text-primary animate-pulse'}`}>
                    {period.is_locked ? 'Finalized' : 'Draft Payout'}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(period.start_date), 'MMM dd')} — {format(new Date(period.end_date), 'MMM dd')}</span>
                </div>
                <h4 className="font-serif text-3xl font-light mb-8">₱{parseFloat(period.total_salon_sales || '0').toLocaleString()} <span className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-widest block mt-2 italic opacity-60">Confirmed Salon Sales</span></h4>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{period._count?.payrolls || 0} Employees</p>
                  {!period.is_locked ? (
                    <Button onClick={(e) => { e.stopPropagation(); onLockPayroll(period.id); }} variant="ghost" size="sm" className="rounded-none text-[9px] uppercase font-bold tracking-widest h-8 px-4 border border-primary/20 text-primary hover:bg-primary hover:text-white">
                      <Lock className="h-3 w-3 mr-2" /> Finalize
                    </Button>
                  ) : (
                    <span className="text-[9px] font-bold uppercase text-success-color flex items-center gap-1.5">
                       <Check className="h-3.5 w-3.5" /> Disbursed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
