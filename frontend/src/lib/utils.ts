import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parse } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a 24h time string (HH:mm or HH:mm:ss) to 12h format (h:mm aa)
 */
export const formatTime12h = (timeStr?: string | null) => {
  if (!timeStr) return '';
  try {
    // Handle HH:mm or HH:mm:ss
    const date = parse(timeStr.substring(0, 5), 'HH:mm', new Date());
    return format(date, 'h:mm aa');
  } catch (e) {
    return timeStr;
  }
};

/**
 * Formats a Date object or ISO string to 12h time string
 */
export const formatDateTime12h = (date?: Date | string | null) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'h:mm aa');
  } catch (e) {
    return '';
  }
};
/**
 * Formats minutes into "X hour(s) and Y minute(s)"
 */
export const formatDuration = (totalMinutes: number) => {
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = Math.floor(absMinutes % 60);

  const hPart = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : '';
  const mPart = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : '';

  if (hPart && mPart) return `${hPart} and ${mPart}`;
  return hPart || mPart || '0 minutes';
};
