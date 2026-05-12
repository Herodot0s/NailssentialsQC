import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, submitReview, cancelAppointment } from '../api/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Loader2, 
  AlertCircle, 
  Receipt, 
  Star,
  XCircle,
} from 'lucide-react';
import ReceiptModal from '@/components/ReceiptModal';
import type { AppointmentItem, Appointment, AppointmentWithServices } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const CustomerAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ 
    appointmentItemId: 0, 
    rating: 5, 
    tags: [] as string[],
    serviceName: '',
    staffName: ''
  });

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({ appointmentId: 0, reason: '' });
  const [isCancelling, setIsCancelling] = useState(false);

  const PRAISE_TAGS = ["Highly skilled", "Very gentle", "Great conversation", "Extremely hygienic", "Professional", "Punctual"];

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await getAppointments();
      if (res.data.success) {
        const aptData = res.data.data;
        const aptItems = Array.isArray(aptData) ? aptData : (aptData?.items || []);
        setAppointments(aptItems);
      }
    } catch {
      setError('Failed to synchronize ritual history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenReview = (item: AppointmentItem) => {
    setReviewForm({
      appointmentItemId: item.id,
      rating: 5,
      tags: [],
      serviceName: item.service.name,
      staffName: item.staff.full_name
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      await submitReview({
        appointmentItemId: reviewForm.appointmentItemId,
        rating: reviewForm.rating,
        tags: reviewForm.tags
      });
      setShowReviewModal(false);
      fetchAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review.';
      alert(message);
    }
  };

  const handleOpenCancel = (appointmentId: number) => {
    setCancelForm({ appointmentId, reason: '' });
    setShowCancelModal(true);
  };

  const handleCancelAppointment = async () => {
    try {
      setIsCancelling(true);
      await cancelAppointment(cancelForm.appointmentId, { reason: cancelForm.reason });
      setShowCancelModal(false);
      fetchAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel ritual.';
      alert(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'completed': return <Badge className="bg-success-color/10 text-success-color border-none rounded-none text-[8px] uppercase tracking-widest font-bold px-3">Completed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-muted-foreground border-muted-foreground rounded-none text-[8px] uppercase tracking-widest px-3">Cancelled</Badge>;
      case 'confirmed': return <Badge className="bg-info-color/10 text-info-color border-none rounded-none text-[8px] uppercase tracking-widest font-bold px-3">Confirmed</Badge>;
      case 'pending': return <Badge className="bg-primary/5 text-primary border-none rounded-none text-[8px] uppercase tracking-widest font-bold px-3">Incoming</Badge>;
      default: return <Badge variant="outline" className="rounded-none text-[8px] uppercase tracking-widest px-3">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">Synchronizing Your History...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-16 px-6 sm:px-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-2">
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">Member Archive</p>
          <h1 className="font-serif text-5xl font-light tracking-tight text-foreground">
            My <span className="italic">Rituals</span>
          </h1>
        </div>
        <Link to="/booking">
          <Button className="h-14 px-10 text-xs uppercase tracking-widest font-bold shadow-premium">
             Schedule New Session
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/5 border border-destructive/10 text-destructive text-[10px] tracking-widest uppercase p-6 flex items-center gap-4 mb-12 animate-in zoom-in-95">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="text-center py-32 bg-primary-ultra/10 border border-dashed border-primary/10 animate-in fade-in duration-1000">
           <div className="space-y-6 max-w-sm mx-auto">
              <Calendar className="h-12 w-12 text-primary/20 mx-auto" />
              <h2 className="font-serif text-3xl font-light">The archive is empty</h2>
              <p className="text-muted-foreground text-sm font-light">Begin your self-care journey with us by scheduling your first ritual.</p>
              <Link to="/booking">
                <Button variant="outline" className="h-12 px-8 rounded-none border-primary/20">
                   Book First Visit
                </Button>
              </Link>
           </div>
        </div>
      ) : (
        <div className="grid gap-12">
          {appointments.map((apt) => (
            <div key={apt.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-grow bg-primary/10" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">
                    {new Date(apt.appointment_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="h-[1px] flex-grow bg-primary/10" />
               </div>

               <div className="grid gap-6">
                 {apt.items.map(item => (
                   <Card key={item.id} className="rounded-none border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                      <div className="flex flex-col sm:flex-row">
                         <div className="bg-primary/5 p-8 flex flex-col justify-center items-center text-center min-w-[160px] border-r border-primary/5">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">{item.start_time}</span>
                            <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center font-serif text-primary text-xl">
                               {item.service.name.charAt(0)}
                            </div>
                         </div>

                         <CardContent className="p-8 flex-grow flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-6">
                               <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                     <h3 className="font-serif text-2xl font-light">{item.service.name}</h3>
                                     {getStatusBadge(item.status)}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                     <User className="h-3 w-3" /> Artisan: {item.staff.full_name}
                                  </div>
                               </div>
                               
                               {item.status === 'completed' && !item.review && (
                                 <Button 
                                   onClick={() => handleOpenReview(item)}
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-8 px-4 rounded-none border border-primary/10 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary hover:text-white transition-all"
                                 >
                                    <Star className="mr-2 h-3 w-3 fill-current" /> Rate Ritual
                                 </Button>
                               )}

                               {item.review && (
                                 <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < (item.review?.rating || 0) ? 'text-primary fill-primary' : 'text-muted'}`} />
                                    ))}
                                    <span className="text-[9px] font-bold text-success-color uppercase tracking-widest ml-2">Reviewed</span>
                                 </div>
                               )}
                            </div>

                            <div className="flex flex-col justify-between items-end gap-6">
                               <div className="text-right">
                                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Session Value</p>
                                  <p className="text-2xl font-serif font-light">₱{item.service.price.toLocaleString()}</p>
                               </div>
                               
                               <div className="flex flex-col gap-2 items-end">
                                 {apt.status === 'completed' && apt.transactions?.[0] && (
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-9 px-4 rounded-none text-[9px] uppercase tracking-widest font-bold gap-2 text-muted-foreground hover:text-primary"
                                     onClick={() => {
                                        setSelectedAppointment(apt);
                                        setShowReceipt(true);
                                     }}
                                   >
                                     <Receipt className="h-4 w-4" /> View Digital Receipt
                                   </Button>
                                 )}

                                 {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-9 px-4 rounded-none text-[9px] uppercase tracking-widest font-bold gap-2 text-destructive/60 hover:text-destructive hover:bg-destructive/5"
                                     onClick={() => handleOpenCancel(apt.id)}
                                   >
                                     <XCircle className="h-4 w-4" /> Cancel Ritual
                                   </Button>
                                 )}
                               </div>
                            </div>
                         </CardContent>
                      </div>
                   </Card>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
         <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
            <div className="bg-primary p-10 text-white">
               <DialogHeader>
                  <DialogTitle className="font-serif text-4xl font-light italic">Ritual <span className="not-italic">Feedback</span></DialogTitle>
                  <DialogDescription className="text-white/70 font-light mt-2">
                     Share your experience of {reviewForm.serviceName} with {reviewForm.staffName}.
                  </DialogDescription>
               </DialogHeader>
            </div>
            <div className="p-10 space-y-8 bg-white">
               <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Rating</Label>
                  <div className="flex gap-3">
                     {[1, 2, 3, 4, 5].map(star => (
                       <button 
                         key={star} 
                         onClick={() => setReviewForm({...reviewForm, rating: star})}
                         className="transition-transform active:scale-90"
                       >
                          <Star className={`h-8 w-8 ${star <= reviewForm.rating ? 'text-primary fill-primary' : 'text-muted stroke-[1]'}`} />
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Select Praise Tags</Label>
                  <div className="flex flex-wrap gap-2">
                     {PRAISE_TAGS.map(tag => (
                       <Badge 
                         key={tag}
                         onClick={() => {
                            if (reviewForm.tags.includes(tag)) {
                               setReviewForm({...reviewForm, tags: reviewForm.tags.filter(t => t !== tag)});
                            } else {
                               setReviewForm({...reviewForm, tags: [...reviewForm.tags, tag]});
                            }
                         }}
                         className={`rounded-none border-primary/10 cursor-pointer px-4 py-1 text-[9px] uppercase tracking-tighter transition-all ${reviewForm.tags.includes(tag) ? 'bg-primary text-white' : 'bg-transparent text-muted-foreground'}`}
                         variant="outline"
                       >
                          {tag}
                       </Badge>
                     ))}
                  </div>
               </div>

               <DialogFooter className="pt-6">
                  <Button type="button" variant="ghost" className="rounded-none" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                  <Button onClick={handleSubmitReview} className="rounded-none px-12 h-14 font-bold uppercase tracking-widest text-[10px]">Publish Review</Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>

      {/* Cancellation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
         <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
            <div className="bg-destructive p-10 text-white">
               <DialogHeader>
                  <DialogTitle className="font-serif text-4xl font-light italic">Cancel <span className="not-italic">Ritual</span></DialogTitle>
                  <DialogDescription className="text-white/70 font-light mt-2">
                     We understand plans change. Please let us know why you're cancelling so we can improve our service.
                  </DialogDescription>
               </DialogHeader>
            </div>
            <div className="p-10 space-y-8 bg-white">
               <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Reason for Cancellation (Optional)</Label>
                  <Textarea 
                    placeholder="e.g., Scheduling conflict, personal emergency..."
                    className="rounded-none border-primary/10 focus-visible:ring-destructive min-h-[100px]"
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                  />
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Note: Cancellations within 24 hours of the ritual may be subject to our standard policy.
                  </p>
               </div>

               <DialogFooter className="pt-6">
                  <Button type="button" variant="ghost" className="rounded-none" onClick={() => setShowCancelModal(false)}>Keep Ritual</Button>
                  <Button 
                    onClick={handleCancelAppointment} 
                    disabled={isCancelling}
                    className="rounded-none px-12 h-14 font-bold uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90"
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>

      {selectedAppointment && (
        <ReceiptModal
          open={showReceipt}
          onOpenChange={setShowReceipt}
          appointment={{
            id: selectedAppointment.id,
            customer: selectedAppointment.customer,
            technician: selectedAppointment.items[0]?.staff,
            services: selectedAppointment.items.map(item => ({
              service: item.service,
              price_at_booking: item.service.price
            })),
            transactions: selectedAppointment.transactions || []
          } as AppointmentWithServices}
        />
      )}
    </div>
  );
};

export default CustomerAppointments;
