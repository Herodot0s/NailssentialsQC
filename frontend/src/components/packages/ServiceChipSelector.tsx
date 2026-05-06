import React, { useEffect, useState } from 'react';
import { getServices, getCategories } from '@/api/apiClient';
import type { Service, Category } from '@/types/api';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceChipSelectorProps {
  selectedServiceIds: number[];
  onSelectionChange: (ids: number[]) => void;
  packagePrice?: number;
}

export default function ServiceChipSelector({ selectedServiceIds, onSelectionChange, packagePrice }: ServiceChipSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          getServices(),
          getCategories()
        ]);
        setServices(servicesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data for chip selector:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading services...</div>;
  }

  const handleToggle = (serviceId: number) => {
    if (selectedServiceIds.includes(serviceId)) {
      onSelectionChange(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      onSelectionChange([...selectedServiceIds, serviceId]);
    }
  };

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const sum = selectedServices.reduce((acc, curr) => acc + Number(curr.price), 0);

  // Group by category
  const servicesByCategory = categories.map(category => {
    return {
      category,
      services: services.filter(s => s.category_id === category.id && s.is_active)
    };
  }).filter(group => group.services.length > 0);

  return (
    <div className="space-y-6">
      {servicesByCategory.map(group => (
        <div key={group.category.id} className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {group.category.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {group.services.map(service => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleToggle(service.id)}
                  className={cn(
                    "flex items-center text-xs px-3 py-2 transition-colors rounded-none",
                    isSelected 
                      ? "border border-primary bg-primary/5 text-primary ring-1 ring-primary/20" 
                      : "border border-primary/10 bg-[#fafaf9] text-foreground hover:border-primary/30"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 mr-1.5" />}
                  <span>{service.name} ₱{Number(service.price).toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-border flex flex-col gap-1">
        <div className="text-sm font-medium">
          Selected: {selectedServiceIds.length} services • Total: ₱{sum.toFixed(2)}
        </div>
        {selectedServiceIds.length < 2 && (
          <div className="text-xs text-destructive">Select at least 2 services</div>
        )}
        {packagePrice !== undefined && packagePrice > 0 && packagePrice < sum && (
          <div className="text-xs text-success-color font-bold text-green-600">
            Customer saves ₱{(sum - packagePrice).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
