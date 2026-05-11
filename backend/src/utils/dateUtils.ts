import { parse } from 'date-fns';

/**
 * Combines a date string and a time string into a single Date object.
 * Handles both YYYY-MM-DD and ISO string formats for the date part.
 */
export const getFullDate = (dateStr: string, timeStr: string): Date => {
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return parse(`${datePart} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
};

/**
 * Extracts the YYYY-MM-DD part from a date string or ISO string.
 */
export const getDatePart = (dateStr: string): string => {
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
};
