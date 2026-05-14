import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRevenueData } from './hooks/useAnalyticsData';
import type { DateRange } from './hooks/useDateFilter';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface RevenueTabProps {
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg border border-gray-100 p-4 rounded-xl" style={{ borderRadius: '12px' }}>
      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const RevenueTab: React.FC<RevenueTabProps> = ({ dateRange }) => {
  const { data, isLoading } = useRevenueData(dateRange);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    if (Array.isArray(data)) {
      data.forEach((d: any) => Object.keys(d.categories || {}).forEach((n) => names.add(n)));
    }
    return Array.from(names).sort();
  }, [data]);

  const servicesInCategory = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const names = new Set<string>();
    if (Array.isArray(data)) {
      data.forEach((d: any) =>
        Object.keys(d.servicesByCategory?.[selectedCategory] || {}).forEach((n) => names.add(n))
      );
    }
    return Array.from(names).sort();
  }, [data, selectedCategory]);

  const handleCategoryChange = (name: string) => {
    setSelectedCategory(name);
    if (name === 'All') {
      setSelectedServices([]);
    } else {
      const names = new Set<string>();
      if (Array.isArray(data)) {
        data.forEach((d: any) =>
          Object.keys(d.servicesByCategory?.[name] || {}).forEach((n) => names.add(n))
        );
      }
      setSelectedServices(Array.from(names).sort());
    }
  };

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => {
      if (selectedCategory === 'All') {
        return {
          date: d.date,
          total: d.total,
          ...d.categories,
        };
      } else {
        const servicesData = d.servicesByCategory?.[selectedCategory] || {};
        const filteredServicesData: Record<string, number> = {};
        let total = 0;
        Object.entries(servicesData).forEach(([service, amount]) => {
          if (selectedServices.includes(service)) {
            filteredServicesData[service] = Number(amount);
            total += Number(amount);
          }
        });
        return {
          date: d.date,
          total,
          ...filteredServicesData,
        };
      }
    });
  }, [data, selectedCategory, selectedServices]);

  const barNames = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (selectedCategory === 'All') {
      const names = new Set<string>();
      data.forEach((d: any) => Object.keys(d.categories || {}).forEach((n) => names.add(n)));
      return Array.from(names).sort();
    } else {
      return selectedServices.slice().sort();
    }
  }, [data, selectedCategory, selectedServices]);

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
      {/* Category Toggle */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded-full ${
              selectedCategory === 'All'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-muted-foreground border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categoryNames.map((name) => (
            <button
              key={name}
              onClick={() => handleCategoryChange(name)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded-full ${
                selectedCategory === name
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-muted-foreground border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Multi-Select Services Filter */}
        {selectedCategory !== 'All' && servicesInCategory.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Filter Services:</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm transition-colors text-foreground">
                    {selectedServices.length === servicesInCategory.length
                      ? 'All Services'
                      : `${selectedServices.length} Selected`}
                    <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="w-64 max-h-[300px] overflow-y-auto">
                <DropdownMenuCheckboxItem
                  checked={selectedServices.length === servicesInCategory.length}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setSelectedServices(servicesInCategory);
                    } else {
                      setSelectedServices([]);
                    }
                  }}
                  className="font-bold border-b border-gray-100 mb-1"
                >
                  Select All
                </DropdownMenuCheckboxItem>
                {servicesInCategory.map((service) => (
                  <DropdownMenuCheckboxItem
                    key={service}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked: boolean) => {
                      setSelectedServices((prev) =>
                        checked ? [...prev, service] : prev.filter((s) => s !== service)
                      );
                    }}
                  >
                    {service}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Stacked Bar Chart */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">
            {selectedCategory === 'All' ? 'Revenue by Category' : `Revenue by Service: ${selectedCategory}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(v) => formatCompact(v)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
              {barNames.map((name, i) => (
                <Bar
                  key={name}
                  dataKey={name}
                  stackId="revenue"
                  fill={DIVERSE_COLORS[i % DIVERSE_COLORS.length]}
                  radius={i === barNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="font-serif text-2xl font-light !uppercase-none !tracking-normal !text-2xl">
            Revenue Trend {selectedCategory !== 'All' && `(${selectedCategory})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(v) => formatCompact(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#118ab2"
                strokeWidth={3}
                dot={{ r: 4, fill: '#118ab2', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
