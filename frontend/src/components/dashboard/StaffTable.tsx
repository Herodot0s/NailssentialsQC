import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { StaffTableProps } from './types';

export const StaffTable: React.FC<StaffTableProps> = ({ staffMembers, onStaffClick }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="rounded-none border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="pl-8 py-5 text-[9px] uppercase tracking-[0.2em] font-bold">Employee</TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold">Role</TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold">Gov ID Status</TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold text-right pr-8">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {staffMembers.map(staff => (
              <TableRow
                key={staff.id}
                className="hover:bg-primary-ultra/10 cursor-pointer border-gray-50 transition-all duration-300"
                onClick={() => onStaffClick(staff)}
              >
                <TableCell className="pl-8 py-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 rounded-none border border-primary/10">
                      <AvatarImage src={staff.profilePictureUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 font-serif text-xl text-primary">{staff.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{staff.fullName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{staff.email || 'No email'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] uppercase font-bold tracking-tighter bg-gray-100 px-2 py-0.5">{staff.role}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {staff.sssNumber ? <Badge className="rounded-none bg-success-color/10 text-success-color text-[8px] font-bold uppercase border-none">SSS</Badge> : <Badge variant="outline" className="rounded-none text-[8px] font-bold uppercase border-dashed opacity-40">SSS</Badge>}
                    {staff.tinNumber ? <Badge className="rounded-none bg-success-color/10 text-success-color text-[8px] font-bold uppercase border-none">TIN</Badge> : <Badge variant="outline" className="rounded-none text-[8px] font-bold uppercase border-dashed opacity-40">TIN</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Badge className={`rounded-none border-none text-[8px] font-bold uppercase tracking-widest ${staff.isActive ? 'bg-success-color text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {staff.isActive ? 'Active' : 'Archived'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
