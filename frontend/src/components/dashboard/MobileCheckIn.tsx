import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import SwipeButton from '@/components/ui/swipe-button';

interface MobileCheckInProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  currentTime: Date;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export const MobileCheckIn: React.FC<MobileCheckInProps> = ({
  isCheckedIn,
  checkInTime,
  currentTime,
  onCheckIn,
  onCheckOut
}) => {
  const [skipOverlay, setSkipOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const weekday = currentTime.toLocaleDateString([], { weekday: 'long' });
  const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Full-screen overlay for mobile when not checked in and not skipped
  if (isMobile && !isCheckedIn && !skipOverlay) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 md:hidden">
        <div className="space-y-8 text-center w-full max-w-sm">
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">Artisan Terminal</p>

          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full p-12 shadow-2xl flex flex-col items-center justify-center w-64 h-64 mx-auto border border-primary/5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{weekday}</span>
            <span className="text-7xl font-bold font-serif text-primary my-2">{time}</span>
            <Badge className="rounded-none border-none text-[8px] uppercase tracking-widest font-bold bg-muted text-muted-foreground">
              Status: Off Duty
            </Badge>
          </div>

          <SwipeButton onSwipe={onCheckIn} variant="default" className="w-full">
            Swipe to Initialize Shift
          </SwipeButton>

          <button onClick={() => setSkipOverlay(true)} className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold underline-offset-4 hover:underline">
            View Schedule Without Checking In
          </button>
        </div>
      </div>
    );
  }

  // Compact card mode (desktop or mobile when checked in/skipped)
  return (
    <Card className="lg:col-span-4 rounded-none border-none shadow-[0_0_20px_rgba(0,0,0,0.05)] bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      <CardHeader className="pb-8">
        <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
          <Clock className="h-3 w-3" /> Shift Registry
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pb-12 space-y-8">
        <div className={isCheckedIn ? 'animate-pulse' : ''}>
          <div className="bg-white rounded-full p-10 shadow-2xl flex flex-col items-center justify-center w-56 h-56 border border-primary/5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{weekday}</span>
            <span className="text-6xl font-bold font-serif text-primary my-2">{time}</span>
            <Badge className={`rounded-none border-none text-[8px] uppercase tracking-widest font-bold ${isCheckedIn ? 'bg-success-color/90 text-white shadow-sm px-3 py-1' : 'bg-muted text-muted-foreground'}`}>
              {isCheckedIn ? 'Status: Active' : 'Status: Off Duty'}
            </Badge>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <SwipeButton
            onSwipe={isCheckedIn ? onCheckOut : onCheckIn}
            variant={isCheckedIn ? 'destructive' : 'default'}
            className="w-full max-w-xs"
          >
            {isCheckedIn ? 'Swipe to Check Out Artisan' : 'Swipe to Initialize Shift'}
          </SwipeButton>
          {isCheckedIn && checkInTime && (
            <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              Shift Started at {checkInTime}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
