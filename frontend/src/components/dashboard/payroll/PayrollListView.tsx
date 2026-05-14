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
import { Download, Eye, PlusCircle } from 'lucide-react';
import type { PayrollPeriod } from '@/types/api';

interface PayrollListViewProps {
  periods: PayrollPeriod[];
  onViewDetails: (period: PayrollPeriod) => void;
  onExport: (period: PayrollPeriod) => void;
  onGenerateNext: () => void;
}

export const PayrollListView: React.FC<PayrollListViewProps> = ({
  periods,
  onViewDetails,
  onExport,
  onGenerateNext
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-light text-foreground">Payroll Periods</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Manage weekly compensation cycles</p>
        </div>
        <Button onClick={onGenerateNext} className="gap-2 rounded-none px-6 uppercase text-[10px] font-bold tracking-widest h-11">
          <PlusCircle className="h-4 w-4" /> Generate Next Period
        </Button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Period ID</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Duration</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Salon Sales</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Staff Count</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <p className="text-lg font-serif italic">No Payroll Periods Generated</p>
                    <p className="text-[10px] uppercase tracking-widest">Click "Generate Next Period" to start a new weekly payroll.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              periods.map((period) => (
                <TableRow key={period.id} className="group border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <TableCell className="font-mono text-[11px] py-4">#{period.id}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground">
                        {format(new Date(period.start_date), 'MMM d')} - {format(new Date(period.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[13px]">
                    ₱{period.total_salon_sales.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-[11px] font-bold">{period._count?.payrolls || 0} Employees</span>
                  </TableCell>
                  <TableCell className="py-4">
                    {period.is_locked ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-50 rounded-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Locked
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-600 border-amber-100/50 hover:bg-amber-50 rounded-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-none hover:bg-primary/5 hover:text-primary"
                        onClick={() => onViewDetails(period)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-none hover:bg-primary/5 hover:text-primary"
                        onClick={() => onExport(period)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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
