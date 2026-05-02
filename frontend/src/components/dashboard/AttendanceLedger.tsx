import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { AttendanceLedgerProps } from './types';

export const AttendanceLedger: React.FC<AttendanceLedgerProps> = ({ attendance, onUpdateAttendance }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif text-2xl font-light italic">Daily <span className="not-italic">Ledger</span></CardTitle>
            <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1">Manual overrides and attendance tracking</CardDescription>
          </div>
        </CardHeader>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="pl-8 py-5 text-[9px] uppercase font-bold">Artisan</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Check In</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Lateness</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Penalty</TableHead>
              <TableHead className="text-right pr-8 text-[9px] uppercase font-bold">Override</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map(log => (
              <TableRow key={log.id} className="hover:bg-gray-50/50 border-gray-50 transition-colors">
                <TableCell className="pl-8 py-6">
                  <p className="font-bold text-sm tracking-tight">{log.staff.full_name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.check_in ? format(new Date(log.check_in), 'HH:mm:ss') : <span className="text-destructive font-bold uppercase tracking-tighter opacity-50">No Data</span>}
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold ${log.tardiness_minutes > 0 ? 'text-destructive' : 'text-success-color'}`}>
                    {log.tardiness_minutes > 0 ? `${log.tardiness_minutes} MINS` : 'ON TIME'}
                  </span>
                </TableCell>
                <TableCell className="font-bold">₱{parseFloat(log.deduction_amount || '0').toLocaleString()}</TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => onUpdateAttendance(log.id, 'Present')} variant="ghost" size="sm" className="rounded-none h-8 text-[8px] uppercase font-bold tracking-widest border border-success-color/20 text-success-color hover:bg-success-color hover:text-white">Present</Button>
                    <Button onClick={() => onUpdateAttendance(log.id, 'Absent')} variant="ghost" size="sm" className="rounded-none h-8 text-[8px] uppercase font-bold tracking-widest border border-destructive/20 text-destructive hover:bg-destructive hover:text-white">Absent</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {attendance.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">No logs found for current period.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
