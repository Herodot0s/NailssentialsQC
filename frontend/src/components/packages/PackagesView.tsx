import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { getPackages, togglePackage, deletePackage } from '@/api/apiClient';
import { ServicePackage } from '@/types/api';
import PackageBuilderDialog from './PackageBuilderDialog';
import { cn } from '@/lib/utils';

export default function PackagesView() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await getPackages();
      return response.data.data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (args: { id: number; isActive: boolean }) => togglePackage(args.id, args.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    }
  });

  const handleCreate = () => {
    setEditingPackage(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const handleToggle = (pkg: ServicePackage) => {
    if (window.confirm(`Deactivate '${pkg.name}'? It will no longer be available for booking.`)) {
      toggleMutation.mutate({ id: pkg.id, isActive: !pkg.is_active });
    }
  };

  const handleDelete = (pkg: ServicePackage) => {
    if (window.confirm(`Permanently delete '${pkg.name}'? This cannot be undone. Existing bookings are not affected.`)) {
      deleteMutation.mutate(pkg.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-muted animate-pulse"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-none"></div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-none"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          Failed to load packages. Please try again later.
        </div>
      </div>
    );
  }

  const packages = data || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-2xl font-light">Package Studio</h2>
        <Button onClick={handleCreate} className="rounded-none uppercase tracking-widest text-[10px] font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50/50">
          <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-serif text-xl font-light mb-2">No packages yet.</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Create your first service bundle to increase ticket size and simplify booking.
          </p>
          <Button onClick={handleCreate} className="rounded-none uppercase tracking-widest text-[10px] font-bold">
            Create Your First Package
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="group flex items-center bg-white border border-border p-4 hover:bg-primary/5 transition-colors"
            >
              <div className="h-16 w-16 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                {pkg.image_url ? (
                  <img src={pkg.image_url} alt={pkg.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-primary/30" />
                )}
              </div>

              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg font-light">{pkg.name}</h3>
                  <Badge variant={pkg.is_active ? 'default' : 'outline'} className="rounded-none text-[8px] uppercase tracking-wider py-0 px-2 h-4">
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    {pkg.services.length} services
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {pkg.bookings_count} bookings
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Valid: {pkg.valid_from ? new Date(pkg.valid_from).toLocaleDateString() : 'Now'} – {pkg.valid_until ? new Date(pkg.valid_until).toLocaleDateString() : 'Forever'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 ml-4">
                <div className="text-right">
                  <div className="font-serif text-lg font-light text-primary">₱{Number(pkg.price).toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground line-through">₱{Number(pkg.services_total).toFixed(2)} value</div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)} title="Edit Package" className="rounded-none">
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleToggle(pkg)} title={pkg.is_active ? "Deactivate" : "Activate"} className="rounded-none">
                    {pkg.is_active ? (
                      <ToggleRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  {pkg.bookings_count === 0 && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg)} title="Delete Package" className="rounded-none hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PackageBuilderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editPackage={editingPackage}
        onSuccess={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
