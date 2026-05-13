import React from 'react';
import type { DateRange, DatePreset } from './hooks/useDateFilter';

interface DateFilterBarProps {
  dateRange: DateRange;
  onPresetChange: (preset: DatePreset) => void;
  onCustomRange: (start: string, end: string) => void;
  isValid: boolean;
}

const presets: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-quarter', label: 'This Quarter' },
];

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  dateRange,
  onPresetChange,
  onCustomRange,
  isValid,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-8">
      {presets.map((preset) => {
        const isActive = dateRange.preset === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onPresetChange(preset.id)}
            className={`rounded-none px-4 py-2 text-[10px] uppercase tracking-widest font-bold min-h-[44px] transition-all ${
              isActive
                ? 'bg-primary text-white'
                : 'border border-gray-200 text-muted-foreground hover:bg-gray-50'
            }`}
          >
            {preset.label}
          </button>
        );
      })}

      <span className="text-muted-foreground mx-1">—</span>

      <input
        type="date"
        value={dateRange.preset === 'custom' ? dateRange.startDate : ''}
        onChange={(e) => onCustomRange(e.target.value, dateRange.endDate)}
        className="border border-gray-200 px-3 py-2 text-sm rounded-none min-h-[44px] focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Start date"
      />
      <span className="text-muted-foreground text-sm">—</span>
      <input
        type="date"
        value={dateRange.preset === 'custom' ? dateRange.endDate : ''}
        onChange={(e) => onCustomRange(dateRange.startDate, e.target.value)}
        className={`border px-3 py-2 text-sm rounded-none min-h-[44px] focus:outline-none focus:ring-1 focus:ring-primary ${
          !isValid && dateRange.preset === 'custom' ? 'border-red-400' : 'border-gray-200'
        }`}
        placeholder="End date"
      />
    </div>
  );
};
