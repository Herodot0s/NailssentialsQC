import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getServices, getAvailability, createAppointment } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  price: string;
  duration_minutes: number;
}

interface Slot {
  time: string;
  available: boolean;
}

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchServiceAndAvailability = async () => {
    try {
      setIsLoading(true);
      // Fetch service details
      if (serviceId) {
        const svcRes = await getServices();
        const found = svcRes.data.data.find((s: any) => s.id === parseInt(serviceId));
        setService(found);
      }

      // Fetch initial availability
      const availRes = await getAvailability(selectedDate);
      setSlots(availRes.data.data);
    } catch {
      setError('Failed to load booking details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/booking?serviceId=${serviceId}`);
      return;
    }

    fetchServiceAndAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, isAuthenticated, navigate, selectedDate]);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime(null);
    try {
      const res = await getAvailability(newDate);
      setSlots(res.data.data);
    } catch {
      setError('Failed to load availability for this date.');
    }
  };

  const handleBooking = async () => {
    if (!selectedTime || !serviceId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        serviceId: parseInt(serviceId),
        date: selectedDate,
        time: selectedTime,
        notes,
      });
      setSuccess(true);
      setTimeout(() => navigate('/appointments'), 3000); // Redirect to appointments after 3s
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Preparing your booking...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto py-24 px-6">
        <Card className="text-center py-12 border-none shadow-card bg-white overflow-hidden">
          <div className="bg-success-color/10 py-8 mb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-success-color flex items-center justify-center text-white mb-4 shadow-lg shadow-success-color/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <CardTitle className="font-serif text-3xl font-bold text-success-color">
              Booking Confirmed!
            </CardTitle>
          </div>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">Your appointment for</p>
              <h3 className="text-xl font-bold text-foreground">{service?.name}</h3>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    Date
                  </p>
                  <p className="font-bold">{selectedDate}</p>
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    Time
                  </p>
                  <p className="font-bold">{selectedTime}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pt-4 animate-pulse italic">
              Redirecting you to your appointments...
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button render={<Link to="/appointments" />} variant="outline" className="w-full">
              View All Appointments
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-6">
      <Button
        render={<Link to="/services" />}
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Services
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl font-bold">1. Select Date & Time</CardTitle>
              <CardDescription>Choose a convenient time for your session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="date" className="text-base font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="h-12 text-base font-medium"
                  min={minDate}
                  max={maxDate}
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Available Slots
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? 'default' : 'outline'}
                      className={`h-11 font-bold ${!slot.available ? 'opacity-30 cursor-not-allowed border-dashed' : 'hover:border-primary hover:text-primary'}`}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
                {slots.length === 0 && (
                  <p className="text-center py-6 text-muted-foreground italic bg-muted/30 rounded-lg">
                    No available slots for this date.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl font-bold">
                2. Additional Information
              </CardTitle>
              <CardDescription>Tell us any special requests or requirements.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  className="min-h-[120px] resize-none focus-visible:ring-primary"
                  placeholder="Any special requests, allergies, or preferences?"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-24 border-none shadow-card bg-primary-ultra overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Your Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {service && (
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {service.duration_minutes} min
                    </span>
                    <span>•</span>
                    <span className="text-primary font-bold">
                      ₱{parseFloat(service.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-4 border-t border-primary/10">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date
                  </div>
                  <div className="text-sm font-bold text-right">{selectedDate}</div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Time
                  </div>
                  <div className="text-sm font-bold text-right text-primary">
                    {selectedTime || (
                      <span className="text-muted-foreground font-normal italic">Not selected</span>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-primary/5 pt-0 pb-6 px-6">
              <Button
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                disabled={!selectedTime || isSubmitting}
                onClick={handleBooking}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
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
