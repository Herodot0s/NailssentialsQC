import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const COLORS = ['#B8794E', '#D9A07E', '#E6B69E', '#F2CCBE', '#9A6440'];

interface HistoricalDataPoint {
  date: string;
  categories?: Record<string, number>;
  services?: Record<string, number>;
}

interface DrillDownLineChartProps {
  historicalData: HistoricalDataPoint[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  onReset: () => void;
}

const DrillDownLineChart: React.FC<DrillDownLineChartProps> = ({
  historicalData,
  selectedCategory,
  onCategorySelect,
  onReset,
}) => {
  const chartData = useMemo(() => {
    if (!historicalData.length) return [];

    return historicalData.map(d => {
      const entry: Record<string, string | number> = { date: d.date };
      if (!selectedCategory) {
        Object.keys(d.categories || {}).forEach(cat => {
          entry[cat] = d.categories?.[cat];
        });
      } else {
        Object.keys(d.services || {}).forEach(svc => {
          entry[svc] = d.services?.[svc];
        });
      }
      return entry;
    });
  }, [historicalData, selectedCategory]);

  const allSeriesNames = useMemo(() => {
    const names = new Set<string>();
    historicalData.forEach(d => {
      if (!selectedCategory) {
        Object.keys(d.categories || {}).forEach(n => names.add(n));
      } else {
        Object.keys(d.services || {}).forEach(n => names.add(n));
      }
    });
    return Array.from(names);
  }, [historicalData, selectedCategory]);

  const handleLegendClick = (data: { value: string }) => {
    if (!selectedCategory && data?.value) {
      onCategorySelect(data.value);
    }
  };

  // FIXED: Corrected the bracket order and added 'name' to the type definition
  const handleChartClick = (data: { activePayload?: Array<{ name?: string; payload?: { date: string } }> }) => {
    if (data && data.activePayload && !selectedCategory) {
      const payload = data.activePayload[0]?.name;
      if (payload) onCategorySelect(payload);
    }
  };

  return (
    <Card className="lg:col-span-2 rounded-none border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-serif text-2xl font-light">Performance Analytics</CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold">
            {selectedCategory ? `Viewing services in ${selectedCategory}` : 'Revenue trends by category'}
          </CardDescription>
        </div>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="rounded-none text-[8px] uppercase font-bold tracking-widest border border-primary/10"
          >
            <ArrowLeft className="h-3 w-3 mr-2" /> Back to Categories
          </Button>
        )}
      </CardHeader>
      <CardContent className="h-[400px] pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ borderRadius: '0', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 10, paddingTop: 20 }}
              onClick={handleLegendClick}
            />
            {allSeriesNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 0, fill: COLORS[index % COLORS.length] }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DrillDownLineChart;