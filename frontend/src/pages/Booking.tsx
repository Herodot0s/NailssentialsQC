import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { cn, formatTime12h } from '@/lib/utils';
import { getAvailability, createAppointment, getAllStaff, getAddons } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import type { Staff } from '@/types/api';
import CartPackageItem from '@/components/packages/CartPackageItem';

interface Slot {
  time: string;
  available: boolean;
  availableTechnicianIds?: number[];
}

interface Addon {
  id: number;
  name: string;
  description: string | null;
  price: string;
}

interface SelectedAddon {
  addonId: number;
  quantity: number;
  price: number;
  name: string;
}


const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isSignedIn } = useUser();


  const { cart, removeFromCart, updateCartItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();

  const isStaffOrManager = user?.role === 'staff' || user?.role === 'manager';

  useEffect(() => {
    if (isStaffOrManager) {
      navigate('/');
    }
  }, [isStaffOrManager, navigate]);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);



  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const itemCount = cart.reduce((acc, item) => {
          if (item.type === 'package' && item.childServices) {
            return acc + item.childServices.length;
          }
          return acc + 1;
        }, 0);

        const [staffRes, availRes, addonsRes] = await Promise.all([
          getAllStaff(),
          getAvailability(selectedDate, itemCount),
          getAddons(),
        ]);
        const staffData = staffRes.data.data;
        const staffItems = Array.isArray(staffData) ? staffData : staffData?.items || [];
        setStaffList(staffItems.filter((s: Staff) => s.role === 'staff'));
        setSlots(availRes.data.data);
        setAvailableAddons(addonsRes.data.data || []);
      } catch (err) {
        setError('Failed to load booking details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, authLoading, navigate, selectedDate, cart]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const updateAddonQuantity = (addon: Addon, delta: number) => {
    setSelectedAddons((prev) => {
      const existing = prev.find((a) => a.addonId === addon.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((a) => a.addonId !== addon.id);
        return prev.map((a) => (a.addonId === addon.id ? { ...a, quantity: newQty } : a));
      }
      if (delta > 0) {
        return [
          ...prev,
          { addonId: addon.id, quantity: 1, price: parseFloat(addon.price), name: addon.name },
        ];
      }
      return prev;
    });
  };

  const handleBooking = async () => {
    const invalidItems = cart.filter((item) => {
      if (item.type === 'package' && item.childServices) {
        return item.childServices.some((child) => !child.staffId);
      }
      return !item.staffId;
    });

    if (!selectedTime) {
      setError('Please select a preferred booking time.');
      return;
    }

    if (invalidItems.length > 0) {
      setError('Please assign a technician for all selected services.');
      return;
    }

    // Operating Hours & Past Time Validation
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    if (selectedDateTime < now) {
      setError('Selected time has already passed. Please select a future time.');
      return;
    }

    const [hours] = selectedTime.split(':').map(Number);
    if (hours < 12) {
      setError('Store opens at 12:00 PM. Please select a later time.');
      return;
    }

    // Check if all services fit within operating hours (end by 10 PM)
    const tooLate = cart.some(item => {
      const duration = item.duration || 0;
      const startTimeDate = new Date(`1970-01-01T${selectedTime}:00`);
      const endTimeDate = new Date(startTimeDate.getTime() + duration * 60000);
      const endHour = endTimeDate.getHours();
      const endMin = endTimeDate.getMinutes();
      return endHour > 22 || (endHour === 22 && endMin > 0);
    });

    if (tooLate) {
      setError('Selected time is too late for the duration of one or more treatments. Store closes at 10:00 PM.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const itemsToBook = cart.flatMap((item) => {
        if (item.type === 'package' && item.childServices) {
          return item.childServices.map((child) => ({
            serviceId: child.serviceId,
            staffId: child.staffId!,
            startTime: selectedTime,
            packageId: item.packageId,
          }));
        }
        return [
          {
            serviceId: item.serviceId,
            staffId: item.staffId!,
            startTime: selectedTime,
          },
        ];
      });

      await createAppointment({
        items: itemsToBook,
        date: selectedDate,
        notes,
        addons: selectedAddons.map((a) => ({ addonId: a.addonId, quantity: a.quantity })),
      });


      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/appointments'), 3000);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || err.message || 'Failed to book appointment.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const maxDate = useMemo(
    () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    [],
  );

  const finalTotalPrice = useMemo(() => {
    return totalPrice + selectedAddons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  }, [totalPrice, selectedAddons]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 text-center px-6 bg-canvas">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="utility-xs text-body">Initializing Appointment Configuration...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto py-24 px-6 bg-canvas">
        <Card className="text-center py-12 border-hairline shadow-none bg-surface-card overflow-hidden rounded-md">
          <div className="py-12 mb-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-accent-green-soft flex items-center justify-center text-accent-green mb-6">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="display-lg text-ink">Reserved</h2>
          </div>
          <CardContent className="space-y-6">
            <p className="body-md text-body px-8">
              Your appointment has been successfully configured and logged.
            </p>
            <p className="utility-xs text-primary animate-pulse">Redirecting to logbook...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container max-w-xl mx-auto py-32 px-6 text-center bg-canvas">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="display-lg text-ink">Cart is empty</h2>
            <p className="body-md text-body">Select treatments from Services Page to begin.</p>
          </div>
          <Link to="/services">
            <Button className="h-10 px-8 rounded-md bg-primary text-white utility-xs hover:bg-primary-pressed transition-colors">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas selection:bg-primary/20">
      <div className="max-w-[1280px] mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="flex-1 space-y-10 md:space-y-12">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-[36px] font-bold text-ink tracking-tight">
                Service Cart
              </h1>
            </div>

            <div className="space-y-8 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <Label htmlFor="date" className="utility-xs text-body flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-body/40" />
                    Select Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="h-9 rounded-md border-hairline focus:ring-2 focus:ring-accent-blue focus:border-accent-blue body-md bg-surface-card"
                    min={minDate}
                    max={maxDate}
                    value={selectedDate}
                    onChange={handleDateChange}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="utility-xs text-body flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-body/40" />
                      Preferred Time
                    </Label>
                    <button
                      type="button"
                      onClick={() => setIsCustomTime(!isCustomTime)}
                      className="text-[10px] uppercase font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      {isCustomTime ? 'Back to Presets' : 'Custom Time'}
                    </button>
                  </div>
                  {isCustomTime ? (
                    <div className="relative">
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        min="12:00"
                        max="21:30"
                        className="h-9 rounded-md border-hairline focus:ring-2 focus:ring-accent-blue focus:border-accent-blue body-md bg-surface-card pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Clock className="h-4 w-4 text-body/30" />
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedTime} onValueChange={(val) => setSelectedTime(val || '')}>
                      <SelectTrigger className="h-9 rounded-md border-hairline focus:ring-2 focus:ring-accent-blue focus:border-accent-blue body-md bg-surface-card">
                        <SelectValue placeholder="Select Time">
                          {selectedTime ? formatTime12h(selectedTime) : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-md border-hairline shadow-none bg-surface-card max-h-64">
                        {slots.map((slot) => (
                          <SelectItem
                            key={slot.time}
                            value={slot.time}
                            disabled={!slot.available}
                            className="py-2.5"
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-2">
                                <span className="body-md">{formatTime12h(slot.time)}</span>
                              </div>
                              {!slot.available && (
                                <span className="utility-xs text-accent-red-soft bg-accent-red/10 px-2 py-0.5 rounded-sm">
                                  UNAVAILABLE
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <Label className="utility-xs text-body">Line Items</Label>
                <div className="space-y-4">
                  {cart.map((item) => {
                    if (item.type === 'package') {
                      return (
                        <CartPackageItem
                          key={item.serviceId}
                          item={item}
                          staffList={staffList}
                          slots={slots}
                        />
                      );
                    }

                    const isConfigured = !!item.staffId;
                    return (
                      <Card
                        key={item.serviceId}
                        className={cn(
                          'rounded-md border-hairline shadow-none overflow-hidden transition-colors duration-300',
                          isConfigured
                            ? 'bg-surface-card'
                            : 'bg-accent-red-soft/10 border-accent-red/20',
                        )}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {item.imageUrl && (
                              <div className="w-full sm:w-32 lg:w-40 h-48 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-hairline overflow-hidden bg-surface-soft">
                                <img
                                  src={item.imageUrl}
                                  alt={item.serviceName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-6 flex-1 space-y-6 border-r border-hairline">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <h3 className="text-xl font-bold text-ink">{item.serviceName}</h3>
                                  <p className="utility-xs text-body/60 flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> {item.duration}m duration
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-body/40 hover:text-accent-red hover:bg-accent-red-soft -mt-2 -mr-2 h-10 w-10 md:h-8 md:w-8"
                                  onClick={() => removeFromCart(item.serviceId)}
                                >
                                  <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="utility-xs text-body/60">Technician</Label>
                                  <Select
                                    value={item.staffId?.toString()}
                                    onValueChange={(val) =>
                                      updateCartItem(item.serviceId, {
                                        staffId: val ? parseInt(val) : undefined,
                                        staffName: val
                                          ? staffList.find((s) => s.id === parseInt(val))?.fullName
                                          : undefined,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="rounded-md border-hairline h-11 md:h-9 focus:ring-2 focus:ring-accent-blue bg-surface-card">
                                      <SelectValue placeholder="Select Technician">
                                        {item.staffName}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-hairline shadow-none bg-surface-card">
                                      {staffList.map((staff) => {
                                        const isAvailable = !selectedTime || !slots.find(s => s.time === selectedTime)?.availableTechnicianIds || slots.find(s => s.time === selectedTime)?.availableTechnicianIds?.includes(staff.id);
                                        return (
                                          <SelectItem
                                            key={staff.id}
                                            value={staff.id.toString()}
                                            className="py-2"
                                            disabled={!isAvailable}
                                          >
                                            <div className="flex flex-col">
                                              <div className="flex items-center justify-between">
                                                <span className="body-md font-semibold">
                                                  {staff.fullName}
                                                </span>
                                                {!isAvailable && (
                                                  <Badge variant="outline" className="text-[9px] uppercase border-accent-red/30 text-accent-red h-4">Taken</Badge>
                                                )}
                                              </div>
                                              {staff.specializations && (
                                                <span className="utility-xs text-body/50">
                                                  {staff.specializations}
                                                </span>
                                              )}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <div
                              className={cn(
                                'p-6 flex items-center justify-between sm:justify-center sm:flex-col min-w-0 sm:min-w-[120px] transition-colors border-t sm:border-t-0 sm:border-l border-hairline',
                                isConfigured ? 'bg-accent-green-soft/30' : 'bg-surface-soft/30',
                              )}
                            >
                              <p className="sm:hidden utility-xs text-body/50">Subtotal</p>
                              <p className="text-xl font-bold text-ink">
                                ₱{item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {availableAddons.length > 0 && (
                <div className="space-y-4">
                  <Label className="utility-xs text-body">Enhancements</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableAddons.map((addon) => {
                      const selected = selectedAddons.find((a) => a.addonId === addon.id);
                      const qty = selected?.quantity || 0;
                      return (
                        <div
                          key={addon.id}
                          className="p-4 rounded-md border border-hairline bg-surface-card flex justify-between items-center transition-colors hover:border-primary/30"
                        >
                          <div>
                            <h4 className="body-strong text-ink">{addon.name}</h4>
                            <p className="utility-xs text-body/60">
                              +₱{parseFloat(addon.price).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-full border-hairline"
                              onClick={() => updateAddonQuantity(addon, -1)}
                              disabled={qty === 0}
                            >
                              -
                            </Button>
                            <span className="body-md font-bold w-4 text-center">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-full border-hairline"
                              onClick={() => updateAddonQuantity(addon, 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="notes" className="utility-xs text-body">
                  Notes & Specifications
                </Label>
                <Textarea
                  id="notes"
                  className="min-h-[100px] rounded-md border-hairline focus:ring-2 focus:ring-accent-blue body-md resize-none p-4 bg-surface-card"
                  placeholder="Enter special requirements or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>


            </div>
          </div>

          <div className="w-full lg:w-[360px]">
            <div className="sticky top-32 space-y-6">
              <Card className="rounded-md border-hairline shadow-none bg-accent-blue-soft/20 overflow-hidden relative">
                <CardHeader className="bg-accent-blue-soft/40 py-4 border-b border-accent-blue/10">
                  <CardTitle className="utility-xs text-accent-blue flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    {cart.map((item) => {
                      if (item.type === 'package') {
                        return (
                          <div key={item.serviceId} className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <p className="body-strong text-ink">{item.packageName}</p>
                              <p className="body-strong text-ink">
                                ₱{item.packagePrice?.toLocaleString()}
                              </p>
                            </div>
                            <div className="pl-3 space-y-1 border-l border-hairline">
                              {item.childServices?.map((child) => (
                                <div
                                  key={child.serviceId}
                                  className="flex justify-between items-baseline"
                                >
                                  <p className="body-sm text-body">{child.serviceName}</p>
                                    <p className="utility-xs text-body/50">
                                      {child.startTime ? formatTime12h(child.startTime) : '--:--'}
                                    </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={item.serviceId} className="flex justify-between items-baseline">
                          <div className="space-y-0.5">
                            <p className="body-strong text-ink">{item.serviceName}</p>
                            <p className="utility-xs text-body/50">
                              {item.staffName || 'Unassigned'} • {item.startTime ? formatTime12h(item.startTime) : '--:--'}
                            </p>
                          </div>
                          <p className="body-strong text-ink">₱{item.price.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>

                  {selectedAddons.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-accent-blue/10">
                      <p className="utility-xs text-body/60 uppercase tracking-wider">
                        Enhancements
                      </p>
                      {selectedAddons.map((addon) => (
                        <div key={addon.addonId} className="flex justify-between items-baseline">
                          <p className="body-sm text-ink">
                            {addon.quantity}x {addon.name}
                          </p>
                          <p className="body-sm text-ink">
                            ₱{(addon.price * addon.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-6 space-y-4 border-t border-accent-blue/10">
                    <div className="flex justify-between items-center">
                      <div className="utility-xs text-body/60">Target Date</div>
                      <div className="body-md font-semibold text-ink">{selectedDate}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="utility-xs text-body/60">Base Time</div>
                      <div className="body-md font-semibold text-ink">
                        {selectedTime ? formatTime12h(selectedTime) : 'Not set'}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="utility-xs text-accent-blue uppercase tracking-wider">
                        Total
                      </div>
                      <div className="text-3xl font-bold text-primary tabular-nums">
                        ₱{finalTotalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-accent-red-soft/20 border border-accent-red/10 text-accent-red utility-xs p-4 flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pb-6 px-6">
                  {!isSignedIn ? (
                    <SignInButton mode="modal" fallbackRedirectUrl={location.pathname}>
                      <Button
                        className="w-full h-11 rounded-md bg-primary text-white text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-primary-pressed transition-colors shadow-none"
                      >
                        Login to Schedule
                      </Button>
                    </SignInButton>
                  ) : (
                    <Button
                      className="w-full h-11 rounded-md bg-primary text-white text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-primary-pressed transition-colors shadow-none"
                      disabled={isSubmitting || (isSignedIn && !isAuthenticated && !authLoading)}
                      onClick={handleBooking}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          SUBMITTING...
                        </>
                      ) : isSignedIn && !isAuthenticated && !authLoading ? (
                        'FINISHING SYNC...'
                      ) : (
                        'SCHEDULE APPOINTMENT'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <div className="p-6 bg-surface-soft/20 rounded-md border border-hairline-soft">
                <p className="body-sm text-body/70 italic">
                  "Precision is the foundation of elegance."
                  <span className="block mt-1 text-[10px] uppercase font-bold not-italic">
                    — NailssentialsQC
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
