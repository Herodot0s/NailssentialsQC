import React from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRetentionData } from './hooks/useAnalyticsData';
import type { DateRange } from './hooks/useDateFilter';
import { format } from 'date-fns';

interface RetentionTabProps {
  dateRange: DateRange;
}

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
};

export const RetentionTab: React.FC<RetentionTabProps> = ({ dateRange }) => {
  const { data, isLoading } = useRetentionData(dateRange);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="rounded-none border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="bg-gray-50 animate-pulse rounded h-[160px]" />
            </CardContent>
          </Card>
          <Card className="rounded-none border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="bg-gray-50 animate-pulse rounded h-[250px]" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="rounded-none border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="bg-gray-50 animate-pulse rounded h-[300px]" />
            </CardContent>
          </Card>
          <Card className="rounded-none border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="bg-gray-50 animate-pulse rounded h-[300px]" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardContent className="py-16 text-center">
          <p className="font-serif text-xl font-light text-foreground mb-2">No data for this period</p>
          <p className="text-sm text-muted-foreground">Try selecting a different date range or check back after appointments are completed.</p>
        </CardContent>
      </Card>
    );
  }

  const donutData = [
    { name: 'Returning Customers', value: data.returningCustomers },
    { name: 'New Customers', value: data.newCustomers },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Retention Rate Hero Card */}
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground mb-4">60-Day Repeat Rate</p>
            <p className="font-serif text-5xl font-light text-foreground">{data.retentionRate}%</p>
            <p className="text-xs text-muted-foreground mt-2">
              {data.returningCustomers} of {data.totalCustomers} customers returned within 60 days
            </p>
          </CardContent>
        </Card>

        {/* Retention Trend Line Chart */}
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">Retention Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Retention Rate']} />
                  <Line type="monotone" dataKey="rate" stroke="#B8794E" strokeWidth={2} dot={{ fill: '#B8794E', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Not enough data for trend visualization</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* New vs Returning Donut Chart */}
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">Customer Composition</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                  <Cell fill="#B8794E" />
                  <Cell fill="#E7E2DF" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
              <span className="font-serif text-2xl font-light">{data.retentionRate}%</span>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: '#B8794E' }} />
                <span className="text-[10px] uppercase tracking-tight font-bold text-muted-foreground">Returning Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: '#E7E2DF' }} />
                <span className="text-[10px] uppercase tracking-tight font-bold text-muted-foreground">New Customers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Returning Customers Table */}
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">Top Returning Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">Rank</th>
                  <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">Customer Name</th>
                  <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">Visit Count</th>
                  <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-sm">{customer.visitCount}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(customer.lastVisit)}</td>
                  </tr>
                ))}
                {data.topCustomers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-sm text-muted-foreground text-center">No customer data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
