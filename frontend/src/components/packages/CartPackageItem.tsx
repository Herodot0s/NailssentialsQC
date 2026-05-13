import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Trash2, Package } from 'lucide-react';
import type { CartItem } from '@/types/CartItem';
import { useCart } from '@/context/CartContext';
import type { Staff } from '@/types/api';
import { cn } from '@/lib/utils';

interface Slot {
  time: string;
  available: boolean;
}

interface CartPackageItemProps {
  item: CartItem;
  staffList: Staff[];
  slots: Slot[];
}

export default function CartPackageItem({ item, staffList }: CartPackageItemProps) {
  const { removeFromCart, updateChildService } = useCart();

  if (!item.packageId || !item.childServices) return null;

  const packageValue = item.childServices.reduce((sum, child) => sum + child.price, 0);
  const savings =
    packageValue > (item.packagePrice || 0) ? packageValue - (item.packagePrice || 0) : 0;

  const isConfigured = item.childServices.every((child) => !!child.staffId);

  return (
    <Card
      className={cn(
        'rounded-md border-hairline shadow-none overflow-hidden transition-colors duration-300',
        isConfigured ? 'bg-surface-card' : 'bg-accent-red-soft/10 border-accent-red/20',
      )}
    >
      <CardContent className="p-0">
        {/* Package Header */}
        <div
          className={cn(
            'flex flex-col sm:flex-row transition-colors',
            isConfigured ? 'bg-accent-blue-soft/20' : 'bg-transparent',
          )}
        >
          <div className="p-5 md:p-6 flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="utility-xs text-accent-blue flex items-center gap-1.5">
                  <Package className="h-3 w-3" />
                  Bundle Configuration
                </p>
                <h3 className="text-xl md:heading-lg text-ink">{item.packageName}</h3>
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <p className="utility-xs text-body/60">{item.childServices.length} Components</p>
                  {savings > 0 && (
                    <p className="utility-xs text-accent-green bg-accent-green-soft px-2 py-0.5 rounded-sm whitespace-nowrap">
                      Efficient: -₱{savings.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-body/40 hover:text-accent-red hover:bg-accent-red-soft -mt-2 -mr-2 h-10 w-10 md:h-8 md:w-8"
                onClick={() => removeFromCart(item.serviceId, item.packageId)}
              >
                <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          <div
            className={cn(
              'px-5 py-4 md:p-6 flex items-center justify-between sm:justify-center sm:flex-col min-w-0 sm:min-w-[120px] transition-colors border-t sm:border-t-0 sm:border-l border-hairline',
              isConfigured ? 'bg-accent-green-soft/30' : 'bg-surface-soft/30',
            )}
          >
            <p className="sm:hidden utility-xs text-body/50 font-bold uppercase tracking-wider">
              Package Total
            </p>
            <p className="text-xl font-bold text-ink">₱{item.packagePrice?.toLocaleString()}</p>
          </div>
        </div>

        {/* Child Services List */}
        <div className="border-t border-hairline bg-surface-soft/10">
          {item.childServices.map((child, index) => {
            const isChildConfigured = !!child.staffId;
            return (
              <div
                key={child.serviceId}
                className={cn(
                  'p-5 md:p-6 border-b border-hairline last:border-none transition-colors',
                  !isChildConfigured && 'bg-accent-red-soft/5',
                )}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={cn(
                      'w-6 h-6 md:w-5 md:h-5 rounded-sm border flex items-center justify-center text-[10px] md:utility-xs shrink-0 mt-0.5 transition-colors font-bold',
                      isChildConfigured
                        ? 'bg-accent-green-soft text-accent-green border-accent-green/20'
                        : 'bg-surface-card text-body/60 border-hairline',
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="body-strong text-ink">{child.serviceName}</p>
                    <p className="utility-xs text-body/50 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {child.duration}m duration
                    </p>
                  </div>
                </div>

                <div className="pl-10 md:pl-9 space-y-2">
                  <Label className="utility-xs text-body/40">Technician Assignment</Label>
                  <Select
                    value={child.staffId?.toString()}
                    onValueChange={(val) =>
                      updateChildService(item.packageId!, child.serviceId, {
                        staffId: val ? parseInt(val) : undefined,
                        staffName: val
                          ? staffList.find((s) => s.id === parseInt(val))?.fullName
                          : undefined,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-hairline h-11 md:h-9 focus:ring-2 focus:ring-accent-blue bg-surface-card body-md">
                      <SelectValue placeholder="Assign staff...">{child.staffName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-hairline shadow-none bg-surface-card">
                      {staffList.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()} className="py-2.5">
                          <div className="flex flex-col">
                            <span className="body-md font-semibold">{staff.fullName}</span>
                            {staff.specializations && (
                              <span className="utility-xs text-body/50">
                                {staff.specializations}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
