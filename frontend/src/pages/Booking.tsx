import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAvailability, createAppointment, getAllStaff } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface Staff {
  id: number;
  fullName: string;
  specializations: string;
  role: string;
}

interface Slot {
  time: string;
  available: boolean;
}

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateCartItem, clearCart, totalPrice } = useCart();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/booking');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [staffRes, availRes] = await Promise.all([
          getAllStaff(),
          getAvailability(selectedDate)
        ]);
        setStaffList(staffRes.data.data.filter((s: any) => s.role === 'staff' || s.role === 'manager'));
        setSlots(availRes.data.data);
      } catch (err) {
        setError('Failed to load booking details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleBooking = async () => {
    const invalidItems = cart.filter(item => !item.staffId || !item.startTime);
    if (invalidItems.length > 0) {
      setError('Please select staff and time for all services in your cart.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        items: cart.map(item => ({
          serviceId: item.serviceId,
          staffId: item.staffId!,
          startTime: item.startTime!,
        })),
        date: selectedDate,
        notes,
      });
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/appointments'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const maxDate = useMemo(
    () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    [],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground">Tailoring your experience...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto py-24 px-6">
        <Card className="text-center py-12 border-none shadow-2xl bg-white overflow-hidden rounded-none">
          <div className="bg-success-color/10 py-12 mb-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-success-color flex items-center justify-center text-white mb-6 shadow-xl shadow-success-color/20">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <CardTitle className="font-serif text-4xl font-light text-success-color italic">
              Reserved
            </CardTitle>
          </div>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground font-light px-8">
              Your ritual has been scheduled. We look forward to welcoming you to our sanctuary.
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary animate-pulse italic">
              Redirecting to your appointments...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container max-w-xl mx-auto py-32 px-6 text-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="w-20 h-20 bg-primary-ultra/30 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-primary/40 stroke-[1]" />
           </div>
           <div className="space-y-3">
              <h2 className="font-serif text-4xl font-light">Your cart is empty</h2>
              <p className="text-muted-foreground font-light">Begin your journey by selecting from our curated treatments.</p>
           </div>
           <Button
             asChild
             className="h-14 px-10 rounded-none text-xs uppercase tracking-widest font-bold"
           >
             <Link to="/services">Explore Services</Link>
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-16 px-6 sm:px-12">
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1 space-y-12">
          <div className="space-y-4">
             <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">Finalize Ritual</p>
             <h1 className="font-serif text-5xl font-light">Your <span className="italic">Selection</span></h1>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="date" className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3 text-primary" />
                Select Date
              </Label>
              <Input
                id="date"
                type="date"
                className="h-14 rounded-none border-primary/10 focus:ring-primary text-lg font-light"
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="space-y-6">
               <Label className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground flex items-center gap-2">
                 <Sparkles className="h-3 w-3 text-primary" />
                 Treatment Details
               </Label>
               <div className="space-y-6">
                 {cart.map((item) => (
                   <Card key={item.serviceId} className="rounded-none border-none bg-primary-ultra/20 shadow-none overflow-hidden group">
                     <CardContent className="p-0">
                       <div className="flex flex-col sm:flex-row">
                          <div className="p-8 flex-1 space-y-8 border-r border-primary/5">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                   <h3 className="font-serif text-2xl font-light">{item.serviceName}</h3>
                                   <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold flex items-center gap-2">
                                      <Clock className="h-3 w-3" /> {item.duration} Minutes
                                   </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 -mt-2 -mr-2"
                                  onClick={() => removeFromCart(item.serviceId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <Label className="text-[9px] tracking-widest uppercase font-bold text-muted-foreground">Expert Artisan</Label>
                                   <Select 
                                     value={item.staffId?.toString()} 
                                     onValueChange={(val) => updateCartItem(item.serviceId, { 
                                       staffId: parseInt(val as any),
                                       staffName: staffList.find(s => s.id === parseInt(val as any))?.fullName
                                     })}
                                   >
                                     <SelectTrigger className="rounded-none border-primary/10 h-11 focus:ring-primary bg-white/50">
                                       <SelectValue placeholder="Select Technician" />
                                     </SelectTrigger>
                                     <SelectContent className="rounded-none border-none shadow-xl">
                                       {staffList.map(staff => (
                                         <SelectItem key={staff.id} value={staff.id.toString()} className="rounded-none">
                                           {staff.fullName}
                                         </SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                </div>

                                <div className="space-y-2">
                                   <Label className="text-[9px] tracking-widest uppercase font-bold text-muted-foreground">Preferred Time</Label>
                                   <Select 
                                     value={item.startTime} 
                                     onValueChange={(val) => updateCartItem(item.serviceId, { startTime: val || undefined })}
                                   >
                                     <SelectTrigger className="rounded-none border-primary/10 h-11 focus:ring-primary bg-white/50">
                                       <SelectValue placeholder="Select Time" />
                                     </SelectTrigger>
                                     <SelectContent className="rounded-none border-none shadow-xl h-64 overflow-y-auto">
                                       {slots.map(slot => (
                                         <SelectItem 
                                           key={slot.time} 
                                           value={slot.time} 
                                           disabled={!slot.available}
                                           className="rounded-none"
                                         >
                                           {slot.time} {!slot.available && '(Busy)'}
                                         </SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                </div>
                             </div>
                          </div>
                          <div className="bg-primary/5 p-8 flex items-center justify-center min-w-[140px]">
                             <p className="font-serif text-2xl font-light">₱{item.price.toLocaleString()}</p>
                          </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="notes" className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground flex items-center gap-2">
                Notes & Preferences
              </Label>
              <Textarea
                id="notes"
                className="min-h-[120px] rounded-none border-primary/10 focus:ring-primary font-light resize-none p-6"
                placeholder="Any special requests or requirements for our artisans?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <Card className="sticky top-32 rounded-none border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-primary-ultra/30 pb-8 border-b border-primary/5">
              <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.serviceId} className="flex justify-between items-baseline group">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{item.serviceName}</p>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{item.staffName || 'No technician'} • {item.startTime || '--:--'}</p>
                    </div>
                    <p className="text-sm font-serif italic">₱{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 space-y-4 border-t border-primary/10">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Date
                  </div>
                  <div className="text-sm font-medium">{selectedDate}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total Ritual
                  </div>
                  <div className="text-2xl font-serif font-light text-primary">
                    ₱{totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/5 border border-destructive/10 text-destructive text-[10px] tracking-widest uppercase p-4 flex items-center gap-3 animate-in shake-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pb-10 px-6">
              <Button
                className="w-full h-16 rounded-none text-xs uppercase tracking-[0.3em] font-bold shadow-xl hover:scale-[1.02] transition-transform duration-500"
                disabled={isSubmitting}
                onClick={handleBooking}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Schedule Ritual'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
