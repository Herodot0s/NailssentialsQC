import { useQuery } from '@tanstack/react-query';
import {
  getHistoricalAnalytics,
  getStaffPerformance,
  getRetentionAnalytics,
  getKpiSummary,
} from '@/api/apiClient';
import type { DateRange } from './useDateFilter';

export function useRevenueData(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'revenue', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const res = await getHistoricalAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      return res.data.success ? res.data.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStaffPerformance(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'staff-performance', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const res = await getStaffPerformance({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      return res.data.success ? res.data.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRetentionData(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'retention', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const res = await getRetentionAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      return res.data.success ? res.data.data : null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useKpiSummary(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'kpi-summary', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const res = await getKpiSummary({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      return res.data.success ? res.data.data : null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
