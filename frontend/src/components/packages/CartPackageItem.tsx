import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/CartItem';
import { useCart } from '@/context/CartContext';
import type { Staff } from '@/types/api';

interface Slot {
  time: string;
  available: boolean;
}

interface CartPackageItemProps {
  item: CartItem;
  staffList: Staff[];
  slots: Slot[];
}

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function CartPackageItem({ item, staffList, slots }: CartPackageItemProps) {
  const { removeFromCart, updateChildService } = useCart();
  
  if (!item.packageId || !item.childServices) return null;
  
  const packageValue = item.childServices.reduce((sum, child) => sum + child.price, 0);
  const savings = packageValue > (item.packagePrice || 0) ? packageValue - (item.packagePrice || 0) : 0;
  
  return (
    <Card className="rounded-none border-none bg-primary-ultra/20 shadow-none overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardContent className="p-0 border-l-[3px] border-primary">
        {/* Package Header */}
        <div className="flex flex-col sm:flex-row">
          <div className="p-8 flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">
                  Package
                </p>
                <h3 className="font-serif text-2xl font-light">{item.packageName}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold">
                    {item.childServices.length} Services
                  </p>
                  {savings > 0 && (
                    <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-success-color">
                      Save ₱{savings.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 -mt-2 -mr-2 rounded-none"
                onClick={() => removeFromCart(item.serviceId, item.packageId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-primary/5 p-8 flex items-center justify-center min-w-[140px]">
            <p className="font-serif text-2xl font-light text-primary">₱{item.packagePrice?.toLocaleString()}</p>
          </div>
        </div>

        {/* Child Services List */}
        <div className="border-t border-primary/10">
          {item.childServices.map((child, index) => (
            <div key={child.serviceId} className="p-6 sm:px-8 border-b border-primary/10 last:border-none bg-white/40 group/child">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary bg-primary/5 shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{child.serviceName}</p>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3" /> {child.duration} Minutes
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-10">
                <div className="space-y-2">
                  <Select 
                    value={child.staffId?.toString()} 
                    onValueChange={(val) => updateChildService(item.packageId!, child.serviceId, { 
                      staffId: val ? parseInt(val) : undefined,
                      staffName: val ? staffList.find(s => s.id === parseInt(val))?.fullName : undefined
                    })}
                  >
                    <SelectTrigger className="rounded-none border-primary/10 h-11 focus:ring-primary bg-white">
                      <SelectValue placeholder="Select Technician">
                        {child.staffName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-none shadow-xl">
                      {staffList.map(staff => (
                        <SelectItem key={staff.id} value={staff.id.toString()} className="rounded-none py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-sm">
                              {staff.fullName}
                            </span>
                            {staff.specializations && (
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-bold">
                                {staff.specializations}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Select 
                    value={child.startTime} 
                    onValueChange={(val) => updateChildService(item.packageId!, child.serviceId, { startTime: val || undefined })}
                  >
                    <SelectTrigger className="rounded-none border-primary/10 h-11 focus:ring-primary bg-white">
                      <SelectValue placeholder="Select Time">
                        {child.startTime ? formatTime(child.startTime) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-none shadow-xl h-64 overflow-y-auto">
                      {slots.map(slot => (
                        <SelectItem 
                          key={slot.time} 
                          value={slot.time} 
                          disabled={!slot.available}
                          className="rounded-none py-3"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                             <div className="flex items-center gap-2">
                                <Clock className={cn("h-3.5 w-3.5", slot.available ? "text-primary/40" : "text-muted-foreground/30")} />
                                <span className="font-medium text-sm">{formatTime(slot.time)}</span>
                             </div>
                             {!slot.available && (
                               <span className="text-[8px] uppercase tracking-widest font-bold text-destructive/50 bg-destructive/5 px-2 py-0.5">
                                 Busy
                               </span>
                             )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
