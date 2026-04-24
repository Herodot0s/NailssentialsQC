import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments } from '../api/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Sparkles, Loader2, AlertCircle, Receipt } from 'lucide-react';
import ReceiptModal from '@/components/ReceiptModal';

interface Appointment {
  id: number;
  status: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  technician: { full_name: string };
  services: { service: { name: string; price: number } }[];
  transactions: {
    id: number;
    amount: number;
    payment_method: string;
    receipt_number: string;
    transaction_date: string;
  }[];
}

const CustomerAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await getAppointments();
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch {
      setError('Failed to fetch appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleViewReceipt = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowReceipt(true);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <Badge className="bg-success-color hover:bg-success-color text-white">Completed</Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
            Cancelled
          </Badge>
        );
      case 'confirmed':
        return <Badge className="bg-info-color hover:bg-info-color text-white">Confirmed</Badge>;
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-primary-light text-primary-dark">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            My Appointments
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track your beauty sessions.</p>
        </div>
        <Button render={<Link to="/booking" />}>Book Your Next Session</Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {appointments.length === 0 ? (
        <Card className="text-center py-16 bg-primary-ultra/50 border-dashed">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold">No appointments found</h3>
              <p className="text-muted-foreground max-w-xs">
                You haven't booked any appointments yet. Treat yourself to a relaxing spa session
                today!
              </p>
            </div>
            <Button render={<Link to="/booking" />} size="lg" className="mt-4">
              Book Your First Visit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {appointments.map((apt) => (
            <Card
              key={apt.id}
              className="overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm"
            >
              <div className="flex flex-col md:flex-row">
                <div className="bg-primary/5 p-6 flex flex-col justify-center items-center text-center min-w-[180px]">
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">
                    {new Date(apt.appointment_date).toLocaleDateString([], { month: 'short' })}
                  </span>
                  <span className="text-4xl font-serif font-bold text-primary my-1">
                    {new Date(apt.appointment_date).getDate()}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {new Date(apt.appointment_date).getFullYear()}
                  </span>
                </div>

                <CardContent className="p-6 flex-grow flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {getStatusBadge(apt.status)}
                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {apt.start_time} - {apt.end_time}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-bold text-lg leading-tight">
                          {apt.services.map((s) => s.service.name).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <User className="h-4 w-4 shrink-0" />
                        Technician: {apt.technician.full_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 min-w-[140px]">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Total Cost
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        ₱{apt.services.reduce((total, s) => total + s.service.price, 0)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {apt.status === 'completed' && apt.transactions?.[0] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleViewReceipt(apt)}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          View Receipt
                        </Button>
                      )}
                      {apt.status === 'pending' && (
                        <p className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full text-center">
                          Can cancel up to 24h before
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <ReceiptModal
          open={showReceipt}
          onOpenChange={setShowReceipt}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

export default CustomerAppointments;
