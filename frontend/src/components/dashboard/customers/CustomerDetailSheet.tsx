import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShieldAlert,
  Calendar,
  Sparkles,
  FileText,
  UserCheck,
  UserMinus,
  Loader2,
  Clock,
} from 'lucide-react';
import { getCustomerHistory } from '@/api/apiClient';
import { formatTime12h } from '@/lib/utils';

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

interface CustomerDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onCustomerChange: (customer: Customer) => void;
  onUpdateCustomer: () => void;
}

export const CustomerDetailSheet: React.FC<CustomerDetailSheetProps> = ({
  open,
  onOpenChange,
  customer,
  onCustomerChange,
  onUpdateCustomer,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && customer && customer.customerProfileId) {
      const fetchHistory = async () => {
        try {
          setIsLoadingHistory(true);
          const res = await getCustomerHistory(customer.customerProfileId!);
          if (res.data.success) {
            setHistory(res.data.data.history || []);
          }
        } catch (err) {
          console.error('Failed to fetch customer history:', err);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [open, customer?.id, customer?.customerProfileId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-xl p-0 border-l border-[#bfc1b7] bg-[#eeefe9] flex flex-col h-full animate-in slide-in-from-right duration-500 ease-out-quint"
      >
        {customer && (
          <div className="flex flex-col h-full font-sans">
            {/* Header Identity */}
            <div className="p-8 border-b border-[#bfc1b7] bg-white/40 backdrop-blur-sm">
              <SheetHeader className="space-y-6 text-left">
                <div className="flex justify-between items-start">
                  <Avatar className="w-20 h-20 rounded-[6px] border border-[#bfc1b7] bg-white">
                    <AvatarFallback className="bg-[#e5e7e0] text-[#23251d] font-bold text-2xl font-serif">
                      {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="px-3 py-1 bg-white border border-[#bfc1b7] rounded-full text-[10px] uppercase tracking-wider font-bold text-[#4d4f46]">
                    Client File #{customer.id}
                  </div>
                </div>
                <div>
                  <SheetTitle className="text-3xl font-extrabold text-[#23251d] tracking-tight leading-tight">
                    {customer.fullName}
                  </SheetTitle>
                  <SheetDescription className="text-[#4d4f46] text-sm mt-1 flex items-center gap-2 font-medium">
                    <User className="h-3.5 w-3.5 opacity-60" /> Registered{' '}
                    {customer.createdAt ? format(new Date(customer.createdAt), 'MMMM yyyy') : 'Recently'}
                  </SheetDescription>
                </div>
              </SheetHeader>
            </div>

            {/* Main Tabs Container */}
            <div className="flex-1 overflow-y-auto p-8">
              <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-[#e5e7e0] p-1 h-auto gap-1 rounded-[6px] w-full justify-start border border-[#bfc1b7]">
                  <TabsTrigger
                    value="profile"
                    className="flex-1 text-[11px] uppercase tracking-widest font-bold text-[#4d4f46] data-[state=active]:bg-white data-[state=active]:text-[#23251d] data-[state=active]:border-[#bfc1b7] rounded-[4px] py-2.5 transition-all duration-200 shadow-none border border-transparent"
                  >
                    Profile Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex-1 text-[11px] uppercase tracking-widest font-bold text-[#4d4f46] data-[state=active]:bg-white data-[state=active]:text-[#23251d] data-[state=active]:border-[#bfc1b7] rounded-[4px] py-2.5 transition-all duration-200 shadow-none border border-transparent"
                  >
                    Ritual History ({history.length})
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-8 mt-0">
                  <div className="grid gap-6">
                    {/* Basic Info Card */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest flex items-center gap-2">
                        <User className="h-3 w-3" /> Account & Contact
                      </h4>
                      <div className="grid gap-4">
                        <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                            Full Name
                          </Label>
                          <Input
                            value={customer.fullName || ''}
                            onChange={(e) =>
                              onCustomerChange({ ...customer, fullName: e.target.value })
                            }
                            className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Username
                            </Label>
                            <Input
                              value={customer.username || ''}
                              onChange={(e) =>
                                onCustomerChange({ ...customer, username: e.target.value })
                              }
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                          <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                              Phone Number
                            </Label>
                            <Input
                              value={customer.phone || ''}
                              onChange={(e) =>
                                onCustomerChange({ ...customer, phone: e.target.value })
                              }
                              className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                            />
                          </div>
                        </div>

                        <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                            Email Address
                          </Label>
                          <Input
                            value={customer.email || ''}
                            onChange={(e) =>
                              onCustomerChange({ ...customer, email: e.target.value })
                            }
                            className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CRM Medical/Allergies/Notes */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest flex items-center gap-2">
                        <FileText className="h-3 w-3" /> CRM Notes & Alerts
                      </h4>
                      <div className="grid gap-4">
                        <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-rose-500 tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5" /> Medical Allergies / Contraindications
                          </Label>
                          <Textarea
                            placeholder="Specify nail allergies, skin conditions, chemical sensitivities..."
                            value={customer.allergies || ''}
                            onChange={(e) =>
                              onCustomerChange({ ...customer, allergies: e.target.value })
                            }
                            className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E] min-h-[80px]"
                          />
                        </div>

                        <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" /> Ritual Preferences & General Notes
                          </Label>
                          <Textarea
                            placeholder="Service preferences (shape, colors, drinks, talkative or silent service)..."
                            value={customer.notes || ''}
                            onChange={(e) =>
                              onCustomerChange({ ...customer, notes: e.target.value })
                            }
                            className="rounded-[4px] border-[#bfc1b7] bg-[#fcfcfa] text-sm focus-visible:ring-[#B8794E] min-h-[100px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="space-y-4">
                      <div className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-3">
                        <Label className="text-[10px] uppercase font-bold text-[#6c6e63] tracking-wider">
                          Account Access Status
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onCustomerChange({ ...customer, isActive: true })}
                            className={`flex-1 h-10 rounded-[4px] text-[10px] uppercase font-bold tracking-widest gap-2 transition-all ${
                              customer.isActive
                                ? 'bg-[#d9eddf] text-[#2c8c66] border-[#2c8c66] hover:bg-[#d9eddf]'
                                : 'border-[#bfc1b7] text-[#9b9c92] hover:bg-gray-50'
                            }`}
                          >
                            <UserCheck className="h-3 w-3" /> Active
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onCustomerChange({ ...customer, isActive: false })}
                            className={`flex-1 h-10 rounded-[4px] text-[10px] uppercase font-bold tracking-widest gap-2 transition-all ${
                              !customer.isActive
                                ? 'bg-[#f7d6d3] text-[#cd4239] border-[#cd4239] hover:bg-[#f7d6d3]'
                                : 'border-[#bfc1b7] text-[#9b9c92] hover:bg-gray-50'
                            }`}
                          >
                            <UserMinus className="h-3 w-3" /> Deactivated
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Ritual History Tab */}
                <TabsContent value="history" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-[11px] uppercase font-bold text-[#B8794E] tracking-widest">
                      Ritual History
                    </h4>
                    {isLoadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white border border-[#bfc1b7] rounded-[6px]">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-[9px] uppercase tracking-wider text-[#9b9c92] font-semibold">
                          Retrieving service records...
                        </p>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-16 bg-white border border-[#bfc1b7] rounded-[6px] space-y-2 opacity-50">
                        <Calendar className="h-8 w-8 text-[#9b9c92] mx-auto stroke-[1.2]" />
                        <p className="text-xs uppercase font-bold tracking-wider text-[#4d4f46]">
                          No services recorded yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((app) => (
                          <div
                            key={app.id}
                            className="p-5 bg-white border border-[#bfc1b7] rounded-[6px] space-y-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start border-b border-[#bfc1b7]/40 pb-3">
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-[#23251d]">
                                  {format(new Date(app.appointment_date), 'MMMM dd, yyyy')}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-[#6c6e63] font-medium">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime12h(app.services?.[0]?.start_time)}</span>
                                </div>
                              </div>
                              <Badge
                                className={`rounded-md border-none text-[9px] font-bold uppercase tracking-wider ${
                                  app.status === 'completed'
                                    ? 'bg-[#d9eddf] text-[#2c8c66]'
                                    : app.status === 'cancelled'
                                    ? 'bg-[#f7d6d3] text-[#cd4239]'
                                    : 'bg-blue-50 text-blue-600'
                                }`}
                              >
                                {app.status}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {app.services?.map((item: any, itemIdx: number) => (
                                <div
                                  key={itemIdx}
                                  className="flex justify-between items-center text-xs font-medium"
                                >
                                  <span className="text-[#23251d]">
                                    {item.service?.name || 'Treatment'}
                                  </span>
                                  <span className="text-[#6c6e63]">
                                    by {item.staff?.full_name || 'Artisan'}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {app.notes && (
                              <div className="bg-[#fcfcfa] border border-[#bfc1b7]/45 p-3 rounded text-xs text-[#6c6e63] italic">
                                Note: "{app.notes}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-[#bfc1b7] bg-white flex gap-3 mt-auto shadow-inner">
              <Button
                variant="outline"
                className="flex-1 rounded-[6px] border-[#bfc1b7] h-12 text-[10px] uppercase font-bold tracking-widest text-[#cd4239] hover:bg-[#f7d6d3] hover:text-[#cd4239] transition-all"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                onClick={onUpdateCustomer}
                className="flex-[2] rounded-[6px] h-12 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-widest transition-all shadow-md shadow-primary/10"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
