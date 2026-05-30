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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Trash2, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface Customer {
  id: number;
  username: string;
  role: string;
  fullName: string;
  customerProfileId?: number;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  preferences?: any;
  allergies?: string | null;
  notes?: string | null;
  createdAt?: string;
}

interface CustomerTableProps {
  customers: Customer[];
  onCustomerClick: (customer: Customer) => void;
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onAddClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onCustomerClick,
  onEditClick,
  onDeleteClick,
  onAddClick,
  searchQuery,
  onSearchChange,
  hasMore,
  onLoadMore,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-stone/50" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-12 h-12 bg-gray-50/50 rounded-2xl border-gray-100 focus:border-primary/30 transition-all font-sans"
          />
        </div>
        <Button
          onClick={onAddClick}
          className="w-full sm:w-auto rounded-2xl gap-2 px-6 h-12 text-[10px] uppercase font-bold tracking-widest bg-primary hover:bg-primary/95 shadow-md shadow-primary/15 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card className="rounded-3xl border-kiln-border shadow-card overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-bisque-wash/30">
            <TableRow className="hover:bg-transparent border-kiln-border">
              <TableHead className="pl-8 py-5 text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Customer
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Contact Info
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Special Notes
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone">
                Status
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.2em] font-semibold text-warm-stone text-right pr-8">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <Sparkles className="h-10 w-10 text-primary stroke-[1.2] animate-pulse" />
                    <p className="text-[11px] uppercase font-semibold tracking-widest text-warm-stone">
                      No Customers Found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-bisque-wash/10 border-kiln-border transition-all duration-300 group"
                >
                  <TableCell className="pl-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-2xl border border-kiln-border shadow-sm group-hover:scale-105 transition-all duration-300">
                        <AvatarFallback className="bg-primary/5 font-serif text-lg text-primary">
                          {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-bold text-sm tracking-tight hover:text-primary cursor-pointer transition-colors"
                          onClick={() => onCustomerClick(customer)}
                        >
                          {customer.fullName}
                        </p>
                        <p className="text-[10px] text-warm-stone uppercase tracking-[0.1em] mt-0.5">
                          @{customer.username || 'anonymous'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs text-ink font-medium">{customer.email || '—'}</p>
                      <p className="text-[10px] text-warm-stone">{customer.phone || '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[240px] space-y-1">
                      {customer.allergies && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                          <ShieldAlert className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customer.allergies}</span>
                        </div>
                      )}
                      {customer.notes && (
                        <p className="text-xs text-warm-stone truncate italic">
                          "{customer.notes}"
                        </p>
                      )}
                      {!customer.allergies && !customer.notes && (
                        <span className="text-xs text-warm-stone/40 italic">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-md border-none text-[10px] font-semibold uppercase tracking-widest ${
                        customer.isActive
                          ? 'bg-forest-confirm text-white'
                          : 'bg-bisque-wash text-warm-stone'
                      }`}
                    >
                      {customer.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-bisque-wash/40 hover:text-primary transition-all text-warm-stone"
                        onClick={() => onCustomerClick(customer)}
                        title="View Profile & History"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-bisque-wash/40 hover:text-primary transition-all text-warm-stone"
                        onClick={() => onEditClick(customer)}
                        title="Edit Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all text-warm-stone"
                        onClick={() => onDeleteClick(customer)}
                        title="Delete Profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div className="flex justify-center p-6 border-t border-kiln-border bg-gray-50/30">
            <Button
              variant="outline"
              onClick={onLoadMore}
              className="rounded-2xl px-8 h-11 text-[10px] uppercase font-bold tracking-widest border-gray-200 hover:bg-white hover:text-primary hover:border-primary/20 shadow-sm transition-all"
            >
              Load More Customers
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
