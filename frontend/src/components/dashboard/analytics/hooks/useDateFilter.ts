import { useState, useMemo } from 'react';
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, format
} from 'date-fns';

export type DatePreset = 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'custom';

export interface DateRange {
  preset: DatePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

function getPresetRange(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
  switch (preset) {
    case 'today': return { startDate: fmt(startOfDay(now)), endDate: fmt(endOfDay(now)) };
    case 'this-week': return { startDate: fmt(startOfWeek(now, { weekStartsOn: 1 })), endDate: fmt(endOfWeek(now, { weekStartsOn: 1 })) };
    case 'this-month': return { startDate: fmt(startOfMonth(now)), endDate: fmt(endOfMonth(now)) };
    case 'last-month': {
      const last = subMonths(now, 1);
      return { startDate: fmt(startOfMonth(last)), endDate: fmt(endOfMonth(last)) };
    }
    case 'this-quarter': return { startDate: fmt(startOfQuarter(now)), endDate: fmt(endOfQuarter(now)) };
    default: return { startDate: fmt(startOfMonth(now)), endDate: fmt(now) };
  }
}

export function useDateFilter() {
  const defaultRange = getPresetRange('this-month');
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: 'this-month',
    ...defaultRange,
  });

  const setPreset = (preset: DatePreset) => {
    const range = getPresetRange(preset);
    setDateRange({ preset, ...range });
  };

  const setCustomRange = (startDate: string, endDate: string) => {
    setDateRange({ preset: 'custom', startDate, endDate });
  };

  const isValid = useMemo(() => dateRange.startDate <= dateRange.endDate, [dateRange]);

  return { dateRange, setPreset, setCustomRange, isValid };
}
