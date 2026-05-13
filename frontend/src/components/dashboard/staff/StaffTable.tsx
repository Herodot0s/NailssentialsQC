import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase } from 'lucide-react';
import type { StaffTableProps } from '../types';

export const StaffTable: React.FC<StaffTableProps> = ({ staffMembers, onStaffClick }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="rounded-3xl border-kiln-border shadow-card overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-bisque-wash/30">
            <TableRow className="hover:bg-transparent border-kiln-border">
              <TableHead className="pl-8 py-5 text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Employee
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Role
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Gov ID Status
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone text-right pr-8">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {staffMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-40">
                    <Briefcase className="h-8 w-8 stroke-[1.2]" />
                    <p className="text-[11px] uppercase font-semibold tracking-widest text-warm-stone">
                      No Artisans Recruited Yet
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              staffMembers.map((staff) => (
                <TableRow
                  key={staff.id}
                  className="hover:bg-bisque-wash/20 cursor-pointer border-kiln-border transition-all duration-300 group hover:translate-x-1"
                  onClick={() => onStaffClick(staff)}
                  role="button"
                  aria-label={`View file for ${staff.fullName}`}
                >
                  <TableCell className="pl-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-xl border border-kiln-border shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <AvatarImage src={staff.profilePictureUrl} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 font-serif text-xl text-primary">
                          {staff.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{staff.fullName}</p>
                        <p className="text-[11px] text-warm-stone uppercase tracking-[0.1em]">
                          {staff.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] uppercase font-semibold tracking-tight bg-bisque-wash/50 text-warm-stone px-2 py-0.5">
                      {staff.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {staff.sssNumber ? (
                        <Badge className="rounded-md bg-forest-confirm/10 text-forest-confirm text-[11px] font-semibold uppercase border-none">
                          SSS
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-md text-[11px] font-semibold uppercase border-dashed opacity-40"
                        >
                          SSS
                        </Badge>
                      )}
                      {staff.pagIbigNumber ? (
                        <Badge className="rounded-md bg-forest-confirm/10 text-forest-confirm text-[11px] font-semibold uppercase border-none">
                          PAG-IBIG
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-md text-[11px] font-semibold uppercase border-dashed opacity-40"
                        >
                          PAG-IBIG
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Badge
                      className={`rounded-md border-none text-[11px] font-semibold uppercase tracking-widest ${staff.isActive ? 'bg-forest-confirm text-white' : 'bg-bisque-wash text-warm-stone'}`}
                    >
                      {staff.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
