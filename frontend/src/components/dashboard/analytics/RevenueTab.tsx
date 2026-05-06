import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRevenueData } from './hooks/useAnalyticsData';
import type { DateRange } from './hooks/useDateFilter';

interface RevenueTabProps {
  dateRange: DateRange;
}

const CHART_COLORS: Record<string, string> = {
  'Nail': '#B8794E',
  'Spa': '#D9A07E',
  'Hair': '#9A6440',
  'Waxing': '#E6B69E',
  'Threading': '#F2CCBE',
  'Packages': '#5D7285',
};
const FALLBACK_COLORS = ['#B8794E', '#D9A07E', '#9A6440', '#E6B69E', '#F2CCBE', '#5D7285'];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatCompact = (v: number) =>
  new Intl.NumberFormat('en-PH', { notation: 'compact', compactDisplay: 'short' }).format(v);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-sm border border-gray-100 p-4" style={{ borderRadius: 0 }}>
      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const RevenueTab: React.FC<RevenueTabProps> = ({ dateRange }) => {
  const { data, isLoading } = useRevenueData(dateRange);

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({
      date: d.date,
      total: d.total,
      ...d.categories,
    }));
  }, [data]);

  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    if (Array.isArray(data)) {
      data.forEach((d: any) => Object.keys(d.categories || {}).forEach(n => names.add(n)));
    }
    return Array.from(names);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="bg-gray-50 animate-pulse rounded h-[400px]" />
          </CardContent>
        </Card>
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="bg-gray-50 animate-pulse rounded h-[300px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardContent className="py-16 text-center">
          <p className="font-serif text-xl font-light text-foreground mb-2">No data for this period</p>
          <p className="text-sm text-muted-foreground">Try selecting a different date range or check back after appointments are completed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stacked Bar Chart — Revenue by Category */}
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardHeader className="border-b border-gray-50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="square" wrapperStyle={{ fontSize: 10, paddingTop: 16 }} />
              {categoryNames.map((name, i) => (
                <Bar key={name} dataKey={name} stackId="revenue" fill={CHART_COLORS[name] || FALLBACK_COLORS[i % 6]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart — Revenue Trend */}
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardHeader className="border-b border-gray-50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#2D2723" strokeWidth={2} dot={{ r: 3, fill: '#2D2723' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
