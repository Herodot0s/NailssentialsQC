import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDateFilter } from './hooks/useDateFilter';
import { useKpiSummary } from './hooks/useAnalyticsData';
import { KpiCards } from './KpiCards';
import { DateFilterBar } from './DateFilterBar';
import { RevenueTab } from './RevenueTab';
import { StaffTab } from './StaffTab';
import { RetentionTab } from './RetentionTab';

export const AnalyticsDashboard: React.FC = () => {
  const { dateRange, setPreset, setCustomRange, isValid } = useDateFilter();
  const { data: kpiData, isLoading: kpiLoading } = useKpiSummary(dateRange);

  return (
    <div className="space-y-2">
      {/* KPI Summary Cards — always visible */}
      <KpiCards data={kpiData ?? null} isLoading={kpiLoading} />

      {/* Date Filter Bar */}
      <DateFilterBar
        dateRange={dateRange}
        onPresetChange={setPreset}
        onCustomRange={setCustomRange}
        isValid={isValid}
      />

      {/* Tabbed Analytics Views */}
      <Tabs defaultValue="revenue">
        <TabsList className="border-b border-gray-100 w-full justify-start rounded-none bg-transparent h-auto p-0 mb-8">
          <TabsTrigger
            value="revenue"
            className="text-[10px] uppercase tracking-[0.2em] font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-4 transition-all"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="staff"
            className="text-[10px] uppercase tracking-[0.2em] font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-4 transition-all"
          >
            Staff
          </TabsTrigger>
          <TabsTrigger
            value="retention"
            className="text-[10px] uppercase tracking-[0.2em] font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-4 transition-all"
          >
            Retention
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="animate-in fade-in duration-300">
          <RevenueTab dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="staff" className="animate-in fade-in duration-300">
          <StaffTab dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="retention" className="animate-in fade-in duration-300">
          <RetentionTab dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
