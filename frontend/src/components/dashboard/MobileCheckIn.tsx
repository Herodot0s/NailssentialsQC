import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity } from 'lucide-react';
import SwipeButton from '@/components/ui/swipe-button';

interface MobileCheckInProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInRaw?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  currentTime: Date;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export const MobileCheckIn: React.FC<MobileCheckInProps> = (props) => {
  const { isCheckedIn, currentTime, onCheckIn, onCheckOut } = props;
  const [skipOverlay, setSkipOverlay] = useState(false);
  const [duration, setDuration] = useState<string>('00:00:00');

  const weekday = currentTime.toLocaleDateString([], { weekday: 'long' });
  const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '--:--';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const scheduledShiftStr = useMemo(() => {
    if (!props.scheduledStart || !props.scheduledEnd) return null;
    return `${formatTime(props.scheduledStart)} — ${formatTime(props.scheduledEnd)}`;
  }, [props.scheduledStart, props.scheduledEnd]);

  const showMobileOverlay = !isCheckedIn && !skipOverlay;

  // Calculate duration if checked in
  useEffect(() => {
    if (!isCheckedIn) {
      setDuration('00:00:00');
      return;
    }

    try {
      let checkInDate: Date | null = null;

      // Use the most precise time available
      if (props.checkInRaw) {
        checkInDate = new Date(props.checkInRaw);
      } else if (props.checkInTime) {
        // Fallback to parsing checkInTime (e.g. "09:00 AM" or "09:00:00")
        let h = 0,
          m = 0;
        const timeStr = props.checkInTime;

        if (timeStr.includes(' ')) {
          const [baseTime, ampm] = timeStr.split(' ');
          const [hoursStr, minutesStr] = baseTime.split(':');
          h = parseInt(hoursStr);
          m = parseInt(minutesStr);
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
        } else {
          const [hoursStr, minutesStr] = timeStr.split(':');
          h = parseInt(hoursStr || '0');
          m = parseInt(minutesStr || '0');
        }
        checkInDate = new Date(currentTime);
        checkInDate.setHours(h, m, 0, 0);
      }

      if (!checkInDate || isNaN(checkInDate.getTime())) {
        setDuration('--:--:--');
        return;
      }

      const diff = Math.max(0, currentTime.getTime() - checkInDate.getTime());
      const hh = Math.floor(diff / 3600000)
        .toString()
        .padStart(2, '0');
      const mm = Math.floor((diff % 3600000) / 60000)
        .toString()
        .padStart(2, '0');
      const ss = Math.floor((diff % 60000) / 1000)
        .toString()
        .padStart(2, '0');
      setDuration(`${hh}:${mm}:${ss}`);
    } catch (e) {
      setDuration('--:--:--');
    }
  }, [isCheckedIn, props.checkInTime, props.checkInRaw, currentTime]);

  return (
    <>
      {/* SVG Filters for Analog Effects */}
      <svg className="absolute w-0 h-0 invisible">
        <filter id="analog-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.05" />
          </feComponentTransfer>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      {/* Full-screen overlay for mobile */}
      {showMobileOverlay && (
        <div className="fixed inset-0 z-50 bg-[#eeefe9] flex flex-col items-center justify-center p-6 md:hidden">
          <div className="space-y-[40px] text-center w-full max-w-sm relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,#000_1px,transparent_1px)] bg-[length:4px_4px]" />

            <p className="text-[12px] tracking-[0.4em] uppercase font-bold text-[#B8794E]">
              NailssentialsQC
            </p>

            <div className="bg-white rounded-md p-12 flex flex-col items-center justify-center border border-[#bfc1b7] relative overflow-hidden group">
              {/* Scanlines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

              <span
                suppressHydrationWarning
                className="text-[12px] text-[#4d4f46] font-bold uppercase tracking-[0.3em] mb-4 relative z-10"
              >
                {weekday}
              </span>
              <span
                suppressHydrationWarning
                className="text-7xl font-black text-[#23251d] mb-4 relative z-10 tabular-nums tracking-tighter filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]"
              >
                {time}
              </span>

              {scheduledShiftStr && (
                <div className="flex flex-col items-center mb-6 relative z-10">
                  <p className="text-[9px] text-[#6c6e63] font-black uppercase tracking-[0.2em] mb-1 opacity-60">
                    Scheduled Shift
                  </p>
                  <p className="text-[11px] font-bold text-[#23251d] tracking-wide">
                    {scheduledShiftStr}
                  </p>
                </div>
              )}

              <Badge
                className={`rounded-none border text-[10px] uppercase tracking-widest font-black px-6 py-2 shadow-none relative z-10 transition-colors duration-500 ${
                  isCheckedIn
                    ? 'bg-[#d9eddf] text-[#2c8c66] border-[#2c8c66]/20'
                    : 'bg-[#eeefe9] text-[#4d4f46] border-[#bfc1b7]'
                }`}
              >
                {isCheckedIn ? (
                  <span className="flex items-center gap-2">
                    <Activity className="h-3 w-3 animate-pulse" />
                    ON DUTY
                  </span>
                ) : (
                  'STATUS: OFFLINE'
                )}
              </Badge>
            </div>

            <div className="space-y-6 relative z-10">
              <SwipeButton
                onSwipe={isCheckedIn ? onCheckOut : onCheckIn}
                variant={isCheckedIn ? 'destructive' : 'default'}
                className="w-full"
              >
                {isCheckedIn ? 'Terminate Shift' : 'Initialize Shift'}
              </SwipeButton>

              <button
                onClick={() => setSkipOverlay(true)}
                className="text-[11px] text-[#6c6e63] uppercase tracking-[0.2em] font-bold hover:text-[#23251d] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#bfc1b7]" />
                Skip to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact card mode */}
      <Card
        className={`lg:col-span-4 rounded-md border border-[#bfc1b7] shadow-none bg-white overflow-hidden transition-all duration-500 ${
          showMobileOverlay ? 'hidden md:block' : 'block opacity-100 translate-y-0'
        }`}
      >
        <CardHeader className="p-8 border-b border-[#bfc1b7] bg-[#fcfcfa] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
          <CardTitle className="text-[12px] font-bold text-[#23251d] uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
            <Clock className="h-4 w-4 text-[#B8794E]" /> Shift Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center gap-10 relative">
          {/* Grainy Noise Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{ filter: 'url(#analog-grain)' }}
          />

          <div className="w-full space-y-8 relative z-10">
            <div className="flex flex-col items-center justify-center p-10 bg-[#eeefe9]/30 rounded-md border border-[#bfc1b7] relative overflow-hidden">
              {/* Internal Scanlines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />

              <span
                suppressHydrationWarning
                className="text-[11px] text-[#6c6e63] font-bold uppercase tracking-[0.2em] mb-2"
              >
                {weekday}
              </span>
              <span
                suppressHydrationWarning
                className="text-6xl font-black text-[#23251d] mb-6 tabular-nums tracking-tighter"
              >
                {time}
              </span>

              <div className="flex flex-col items-center gap-4 w-full">
                <Badge
                  className={`rounded-none border text-[10px] uppercase tracking-[0.2em] font-black px-5 py-2 flex items-center gap-2 shadow-none transition-colors duration-500 ${
                    isCheckedIn
                      ? 'bg-[#d9eddf] text-[#2c8c66] border-[#2c8c66]/20'
                      : 'bg-white text-[#4d4f46] border-[#bfc1b7]'
                  }`}
                >
                  {isCheckedIn ? (
                    <>
                      <Activity className="h-3 w-3 animate-pulse" />
                      ON DUTY
                    </>
                  ) : (
                    'STATUS: OFFLINE'
                  )}
                </Badge>

                {scheduledShiftStr && (
                  <div className="mt-4 pt-4 border-t border-[#bfc1b7]/30 w-full flex flex-col items-center">
                    <p className="text-[9px] text-[#6c6e63] font-black uppercase tracking-[0.3em] mb-1 opacity-60">
                      Scheduled Shift
                    </p>
                    <p className="text-[12px] font-bold text-[#23251d] tracking-widest tabular-nums">
                      {scheduledShiftStr}
                    </p>
                  </div>
                )}

                {isCheckedIn && (
                  <div
                    className={`mt-2 w-full flex flex-col items-center ${!scheduledShiftStr ? 'pt-4 border-t border-[#bfc1b7]/30' : ''}`}
                  >
                    <p className="text-[9px] text-[#6c6e63] font-black uppercase tracking-[0.3em] mb-2 opacity-60">
                      Elapsed Duration
                    </p>
                    <div className="font-mono text-2xl font-bold text-[#23251d] tracking-widest flex gap-1">
                      {duration.split('').map((char, i) => (
                        <span
                          key={i}
                          className="animate-in fade-in slide-in-from-top-1 duration-300"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <SwipeButton
                onSwipe={isCheckedIn ? onCheckOut : onCheckIn}
                variant={isCheckedIn ? 'destructive' : 'default'}
                className="w-full"
              >
                {isCheckedIn ? 'Terminate Shift' : 'Initialize Shift'}
              </SwipeButton>

              {isCheckedIn && props.checkInTime && (
                <div className="flex flex-col items-center gap-1">
                  <p
                    suppressHydrationWarning
                    className="text-[10px] text-[#6c6e63] font-bold uppercase tracking-[0.2em] opacity-80"
                  >
                    Registry Entry: {props.checkInTime}
                  </p>
                  <div className="w-12 h-0.5 bg-[#B8794E] opacity-20" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
