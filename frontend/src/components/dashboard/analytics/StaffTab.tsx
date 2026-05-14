import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStaffPerformance } from './hooks/useAnalyticsData';
import type { DateRange } from './hooks/useDateFilter';

interface StaffTabProps {
  dateRange: DateRange;
}

const DIVERSE_COLORS = [
  '#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c',
  '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#9b5de5',
  '#f15bb5', '#fee440', '#00bbf9', '#00f5d4', '#ff9f1c',
  '#2ec4b6', '#ffbf69', '#8338ec', '#ff006e', '#8ac926',
];

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
  const colors: Record<number, string> = { 1: '#ffd166', 2: '#e0e1dd', 3: '#e07a5f' };
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
    <div className="bg-white shadow-lg border border-gray-100 p-4 rounded-xl" style={{ borderRadius: '12px' }}>
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
      <Card className="rounded-2xl border-none shadow-sm bg-white">
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
      <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
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
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={formatCompact}
              />
              <YAxis
                dataKey="fullName"
                type="category"
                width={120}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip content={<StaffTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar
                dataKey="revenue"
                radius={[0, 4, 4, 0]}
              >
                {safeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DIVERSE_COLORS[index % DIVERSE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">
            Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/20">
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
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{staff.fullName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {formatCurrency(staff.revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(staff.commission)}</td>
                    <td className="px-6 py-4 text-sm">{staff.serviceCount}</td>
                  </tr>
                  <AnimatePresence>
                    {expandedStaff === staff.staffId && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                                Category Breakdown
                              </p>
                              <div className="space-y-3">
                                {Object.entries(staff.categoryBreakdown).map(([cat, amount], idx) => {
                                  const maxAmount = Math.max(
                                    ...Object.values(staff.categoryBreakdown).map((v) => Number(v))
                                  );
                                  const amt = Number(amount);
                                  const pct = maxAmount > 0 ? (amt / maxAmount) * 100 : 0;
                                  const color = DIVERSE_COLORS[idx % DIVERSE_COLORS.length];
                                  return (
                                    <div key={cat} className="flex items-center gap-3">
                                      <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">
                                        {cat}
                                      </span>
                                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{ width: `${pct}%`, backgroundColor: color }}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold w-24 text-right">
                                        {formatCurrency(amt)}
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
