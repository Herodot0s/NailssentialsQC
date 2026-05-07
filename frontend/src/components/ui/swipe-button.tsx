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

  const getMaxThumbPosition = useCallback(() => {
    const trackWidth = trackRef.current?.offsetWidth || 0;
    const thumbWidth = thumbRef.current?.offsetWidth || 56;
    return Math.max(0, trackWidth - thumbWidth);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    currentXRef.current = thumbPosition;
  }, [thumbPosition]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startXRef.current;
    let newPosition = currentXRef.current + deltaX;
    const maxPos = getMaxThumbPosition();
    newPosition = Math.max(0, Math.min(newPosition, maxPos));
    setThumbPosition(newPosition);
  }, [isDragging, getMaxThumbPosition]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const maxPos = getMaxThumbPosition();
    const threshold = maxPos * 0.8;
    if (thumbPosition >= threshold) {
      onSwipe();
    }
    setThumbPosition(0);
  }, [isDragging, thumbPosition, getMaxThumbPosition, onSwipe]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };

  // Global event listeners for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const handleGlobalMouseUp = () => handleDragEnd();
    const handleGlobalTouchMove = (e: TouchEvent) => {
      e.preventDefault();
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

  const trackBgClass = variant === 'destructive'
    ? 'bg-destructive/10'
    : 'bg-primary/10';

  const thumbBgClass = variant === 'destructive'
    ? 'bg-destructive text-white'
    : 'bg-primary text-white';

  const fillWidth = getMaxThumbPosition() > 0
    ? (thumbPosition / getMaxThumbPosition()) * 100
    : 0;

  const maxPos = getMaxThumbPosition();
  const threshold = maxPos * 0.8;
  const isNearThreshold = thumbPosition >= threshold * 0.6;

  const thumbTransitionClass = isDragging
    ? '' // No transition during drag — thumb must track finger instantly
    : 'transition-all duration-300 ease-out'; // Smooth return when released

  return (
    <div ref={trackRef} className={cn('relative w-full h-14 rounded-none overflow-hidden cursor-pointer select-none', trackBgClass, className)}>
      {/* Filled background that follows the thumb */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-75 ease-out',
          thumbBgClass,
          isNearThreshold && 'opacity-40',
          !isNearThreshold && 'opacity-25'
        )}
        style={{ width: `${fillWidth}%` }}
      />

      {/* Label */}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest font-bold',
        variant === 'destructive' ? 'text-destructive' : 'text-primary'
      )}>
        {children}
      </div>

      {/* Draggable thumb */}
      <div
        ref={thumbRef}
        className={cn(
          'absolute left-0 top-0 h-full w-14 flex items-center justify-center z-10',
          thumbBgClass,
          thumbTransitionClass,
          isDragging ? 'shadow-xl scale-110' : 'shadow-lg'
        )}
        style={{ transform: `translateX(${thumbPosition}px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default SwipeButton;
