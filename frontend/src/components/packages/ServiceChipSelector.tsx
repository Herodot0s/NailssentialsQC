import { useEffect, useState } from 'react';
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
          <h4 className="utility-xs text-mute">
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
                    "flex items-center body-xs px-4 py-2 transition-colors rounded-full border",
                    isSelected 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-hairline-soft bg-white text-body hover:border-hairline"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 mr-1.5" />}
                  <span>{service.name} ₱{Number(service.price).toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-hairline flex flex-col gap-2">
        <div className="body-strong text-ink">
          Selected: {selectedServiceIds.length} services • Total: ₱{sum.toLocaleString()}
        </div>
        {selectedServiceIds.length < 2 && (
          <div className="utility-xs text-accent-red font-bold">Select at least 2 rituals</div>
        )}
        {packagePrice !== undefined && packagePrice > 0 && packagePrice < sum && (
          <div className="body-sm font-bold text-accent-green">
            Customer saves ₱{(sum - packagePrice).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
