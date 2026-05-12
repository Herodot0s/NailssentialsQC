import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DrillDownLineChart from '@/components/DrillDownLineChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { OverviewCards } from './OverviewCards';
import { AppointmentTimeline } from './customers/AppointmentTimeline';
import type { OverviewViewProps } from './types';

const COLORS = ['#B8794E', '#D9A07E', '#E6B69E', '#F2CCBE', '#9A6440'];

export const OverviewView: React.FC<OverviewViewProps> = ({
  salesStats,
  historicalData,
  selectedCategory,
  onCategorySelect,
  onCategoryReset,
  activeStaffCount,
  pendingReviewCount,
  appointments,
  staffMembers
}) => {
  const pieData = salesStats?.serviceBreakdown.map((s) => ({ name: s.name, value: s.amount })) || [];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       <OverviewCards 
         salesStats={salesStats} 
         activeStaffCount={activeStaffCount} 
         pendingReviewCount={pendingReviewCount} 
       />

       <AppointmentTimeline 
         appointments={appointments} 
         staffMembers={staffMembers} 
       />

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          <DrillDownLineChart
            historicalData={historicalData}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            onReset={onCategoryReset}
          />

          <Card className="rounded-none border-none shadow-sm bg-white">
            <CardHeader className="border-b border-gray-50">
              <CardTitle className="font-serif text-2xl font-light">Revenue Split</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full mt-8 space-y-4 px-4 overflow-y-auto max-h-[120px]">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center group cursor-default">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">{entry.name}</span>
                     </div>
                     <span className="text-[10px] font-bold">₱{entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
};
