import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStaffPerformance } from './hooks/useAnalyticsData';
import type { DateRange } from './hooks/useDateFilter';

interface StaffTabProps {
  dateRange: DateRange;
}

const CHART_COLORS: Record<string, string> = {
  Nail: '#B8794E',
  Spa: '#D9A07E',
  Hair: '#9A6440',
  Waxing: '#E6B69E',
  Threading: '#F2CCBE',
  Packages: '#5D7285',
};
const FALLBACK_COLORS = ['#B8794E', '#D9A07E', '#9A6440', '#E6B69E', '#F2CCBE', '#5D7285'];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

const formatCompact = (v: number) =>
  new Intl.NumberFormat('en-PH', { notation: 'compact', compactDisplay: 'short' }).format(v);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: Record<number, string> = { 1: '#B8794E', 2: '#8E8680', 3: '#9A6440' };
  const color = colors[rank];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
      {color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
      {rank}
    </span>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StaffTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white shadow-sm border border-gray-100 p-4" style={{ borderRadius: 0 }}>
      <p className="text-sm font-medium mb-1">{d?.fullName}</p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(d?.revenue)} revenue, {d?.serviceCount} services
      </p>
    </div>
  );
};

export const StaffTab: React.FC<StaffTabProps> = ({ dateRange }) => {
  const { data: staffData, isLoading } = useStaffPerformance(dateRange);
  const [expandedStaff, setExpandedStaff] = useState<number | null>(null);

  const toggleExpand = (staffId: number) => {
    setExpandedStaff((prev) => (prev === staffId ? null : staffId));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="bg-gray-50 animate-pulse rounded h-[300px]" />
          </CardContent>
        </Card>
        <Card className="rounded-none border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="bg-gray-50 animate-pulse rounded h-[400px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeData = Array.isArray(staffData) ? staffData : [];

  if (!safeData.length) {
    return (
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardContent className="py-16 text-center">
          <p className="font-serif text-xl font-light text-foreground mb-2">
            No data for this period
          </p>
          <p className="text-sm text-muted-foreground">
            Try selecting a different date range or check back after appointments are completed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Horizontal Bar Chart */}
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardHeader className="border-b border-gray-50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">
            Staff Revenue Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={Math.max(300, safeData.length * 48)}>
            <BarChart layout="vertical" data={safeData}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatCompact}
              />
              <YAxis
                dataKey="fullName"
                type="category"
                width={120}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<StaffTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#B8794E"
                radius={[0, 4, 4, 0]}
                activeBar={{ fill: '#9A6440' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardHeader className="border-b border-gray-50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">
            Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">
                  Rank
                </th>
                <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">
                  Staff Name
                </th>
                <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">
                  Revenue Generated
                </th>
                <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">
                  Commission Earned
                </th>
                <th className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-left px-6 py-4">
                  Services Completed
                </th>
              </tr>
            </thead>
            <tbody>
              {safeData.map((staff, i) => (
                <React.Fragment key={staff.staffId}>
                  <tr
                    onClick={() => toggleExpand(staff.staffId)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{staff.fullName}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {formatCurrency(staff.revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(staff.commission)}</td>
                    <td className="px-6 py-4 text-sm">{staff.serviceCount}</td>
                  </tr>
                  <AnimatePresence>
                    {expandedStaff === staff.staffId && (
                      <tr>
                        <td colSpan={5}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gray-50/30 px-6 py-4">
                              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                                Category Breakdown
                              </p>
                              <div className="space-y-2">
                                {Object.entries(staff.categoryBreakdown).map(([cat, amount]) => {
                                  const maxAmount = Math.max(
                                    ...Object.values(staff.categoryBreakdown),
                                  );
                                  const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                                  const colorIdx = Object.keys(CHART_COLORS).indexOf(cat);
                                  const color =
                                    CHART_COLORS[cat] ||
                                    FALLBACK_COLORS[colorIdx >= 0 ? colorIdx : 0];
                                  return (
                                    <div key={cat} className="flex items-center gap-3">
                                      <span className="text-xs text-muted-foreground w-20 shrink-0">
                                        {cat}
                                      </span>
                                      <div className="flex-1 h-4 bg-gray-100 rounded-none overflow-hidden">
                                        <div
                                          className="h-full transition-all duration-500"
                                          style={{ width: `${pct}%`, backgroundColor: color }}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold w-20 text-right">
                                        {formatCurrency(amount)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
