import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipeButtonProps {
  onSwipe: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

const SwipeButton: React.FC<SwipeButtonProps> = ({
  onSwipe,
  children,
  variant = 'default',
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbPosition, setThumbPosition] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const getMaxThumbPosition = useCallback(() => {
    const trackWidth = trackRef.current?.offsetWidth || 0;
    const thumbWidth = thumbRef.current?.offsetWidth || 56;
    return Math.max(0, trackWidth - thumbWidth);
  }, []);

  const runSpring = useCallback(
    (target: number) => {
      let currentPos = thumbPosition;
      let currentVel = velocity;
      const stiffness = 180;
      const damping = 25;
      const mass = 1;

      const step = () => {
        const dt = 0.016; // Fixed timestep for simplicity
        const force = -stiffness * (currentPos - target);
        const acceleration = force / mass;
        currentVel += (acceleration - damping * currentVel) * dt;
        currentPos += currentVel * dt;

        if (Math.abs(currentPos - target) < 0.1 && Math.abs(currentVel) < 0.1) {
          setThumbPosition(target);
          setVelocity(0);
          return;
        }

        setThumbPosition(currentPos);
        setVelocity(currentVel);
        animationFrameRef.current = requestAnimationFrame(step);
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [thumbPosition, velocity],
  );

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsDragging(true);
      startXRef.current = clientX;
      currentXRef.current = thumbPosition;
      setLastX(clientX);
      setLastTime(performance.now());
    },
    [thumbPosition],
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const v = (clientX - lastX) / dt;
        setVelocity(v * 10); // Scale velocity for spring
      }
      setLastX(clientX);
      setLastTime(now);

      const deltaX = clientX - startXRef.current;
      let newPosition = currentXRef.current + deltaX;
      const maxPos = getMaxThumbPosition();
      newPosition = Math.max(0, Math.min(newPosition, maxPos));
      setThumbPosition(newPosition);
    },
    [isDragging, getMaxThumbPosition, lastX, lastTime],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const maxPos = getMaxThumbPosition();
    const threshold = maxPos * 0.8;

    if (thumbPosition >= threshold) {
      onSwipe();
      setThumbPosition(0); // Instant reset on success
      setVelocity(0);
    } else {
      runSpring(0);
    }
  }, [isDragging, thumbPosition, getMaxThumbPosition, onSwipe, runSpring]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  // Global event listeners for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const handleGlobalMouseUp = () => handleDragEnd();
    const handleGlobalTouchMove = (e: TouchEvent) => {
      // Don't preventDefault here, let the browser handle scrolling if not on the track
      handleDragMove(e.touches[0].clientX);
    };
    const handleGlobalTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const trackBgClass = variant === 'destructive' ? 'bg-[#cd4239]/10' : 'bg-[#B8794E]/10';

  const thumbBgClass =
    variant === 'destructive' ? 'bg-[#cd4239] text-white' : 'bg-[#B8794E] text-white';

  const fillWidth = getMaxThumbPosition() > 0 ? (thumbPosition / getMaxThumbPosition()) * 100 : 0;

  const maxPos = getMaxThumbPosition();
  const threshold = maxPos * 0.8;
  const isNearThreshold = thumbPosition >= threshold;

  // Calculate distortion
  const skewX = isDragging ? Math.min(Math.max(velocity * 0.5, -15), 15) : 0;
  const scale = isDragging ? 1 + Math.abs(velocity * 0.002) : 1;

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative w-full h-14 rounded-md overflow-hidden cursor-pointer select-none border border-[#bfc1b7]/30',
        trackBgClass,
        className,
      )}
    >
      {/* Analog noise overlay on track */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Filled background that follows the thumb */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 transition-opacity duration-300',
          thumbBgClass,
          isNearThreshold ? 'opacity-40' : 'opacity-20',
        )}
        style={{ width: `${fillWidth}%` }}
      />

      {/* Label */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300',
          variant === 'destructive' ? 'text-[#cd4239]' : 'text-[#B8794E]',
          isNearThreshold && 'scale-105 tracking-[0.3em]',
        )}
      >
        {children}
      </div>

      {/* Draggable thumb */}
      <div
        ref={thumbRef}
        className={cn(
          'absolute left-0 top-0 h-full w-14 flex items-center justify-center z-10 border-r border-[#ffffff]/20',
          thumbBgClass,
          isDragging ? 'shadow-2xl' : 'shadow-lg',
        )}
        style={{
          transform: `translateX(${thumbPosition}px) skewX(${skewX}deg) scale(${scale})`,
          transition: isDragging
            ? 'none'
            : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={cn(
            'transition-transform duration-300',
            isNearThreshold && 'scale-125 rotate-12',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Tactile indicator for analog feel */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};

export default SwipeButton;
