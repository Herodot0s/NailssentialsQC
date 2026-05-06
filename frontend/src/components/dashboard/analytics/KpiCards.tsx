import React from 'react';
import type { KpiSummaryData } from '@/types/api';

interface KpiCardsProps {
  data: KpiSummaryData | null;
  isLoading: boolean;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

interface CardConfig {
  label: string;
  getValue: (d: KpiSummaryData) => string;
  getTrend: (d: KpiSummaryData) => number | null;
}

const cards: CardConfig[] = [
  {
    label: "TODAY'S REVENUE",
    getValue: (d) => formatCurrency(d.todayRevenue),
    getTrend: (d) => d.todayRevenueTrend,
  },
  {
    label: "THIS MONTH'S REVENUE",
    getValue: (d) => formatCurrency(d.monthRevenue),
    getTrend: (d) => d.monthRevenueTrend,
  },
  {
    label: 'ACTIVE STAFF',
    getValue: (d) => String(d.activeStaff),
    getTrend: () => null,
  },
  {
    label: 'APPOINTMENTS THIS MONTH',
    getValue: (d) => String(d.monthAppointments),
    getTrend: (d) => d.monthAppointmentsTrend,
  },
];

const TrendIndicator: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) return null;
  const isUp = value >= 0;
  return (
    <span
      className="text-xs font-semibold inline-flex items-center gap-0.5"
      style={{ color: isUp ? '#435334' : '#A94438' }}
    >
      {isUp ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
};

export const KpiCards: React.FC<KpiCardsProps> = ({ data, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-shadow p-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground mb-3">
            {card.label}
          </p>

          {isLoading || !data ? (
            <div className="space-y-2">
              <div className="bg-gray-100 animate-pulse rounded h-8 w-24" />
              <div className="bg-gray-100 animate-pulse rounded h-3 w-16" />
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <p className="font-serif text-3xl font-light text-foreground">
                {card.getValue(data)}
              </p>
              <TrendIndicator value={card.getTrend(data)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
