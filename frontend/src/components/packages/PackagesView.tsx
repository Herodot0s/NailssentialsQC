import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { getPackages, togglePackage, deletePackage } from '@/api/apiClient';
import type { ServicePackage } from '@/types/api';
import PackageBuilderDialog from './PackageBuilderDialog';
import { motion } from 'framer-motion';

const PREMIUM_EASE = [0.32, 0.72, 0, 1] as const;

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
      <div className="flex justify-between items-center mb-10">
        <h2 className="font-serif text-3xl font-light text-charcoal-bark">Package Studio</h2>
        <motion.button
          layoutId="package-bg-new"
          onClick={handleCreate}
          className="flex items-center justify-center rounded-xl bg-kiln-terracotta hover:bg-kiln-terracotta-hover text-white px-6 h-12 uppercase tracking-[0.2em] text-[11px] font-bold shadow-card hover:shadow-premium transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </motion.button>
      </div>

      {packages.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center border border-dashed border-kiln-border bg-linen-mist rounded-3xl">
          <Package className="w-12 h-12 text-kiln-terracotta/30 mb-6" />
          <h3 className="font-serif text-2xl font-light mb-3 text-charcoal-bark">No packages yet.</h3>
          <p className="text-base text-warm-stone mb-8 max-w-md font-light">
            Create your first service bundle to increase ticket size and simplify booking.
          </p>
          <Button onClick={handleCreate} className="rounded-xl uppercase tracking-[0.2em] text-[11px] font-bold bg-kiln-terracotta text-white hover:bg-kiln-terracotta-hover h-12 px-8">
            Create Your First Package
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <motion.div
              layoutId={`package-bg-${pkg.id}`}
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: PREMIUM_EASE }}
              className="group flex items-center bg-white border border-kiln-border/50 p-4 hover:border-kiln-border hover:shadow-card transition-all rounded-3xl cursor-pointer"
              onClick={() => handleEdit(pkg)}
            >
              <motion.div layoutId={`package-img-${pkg.id}`} className="h-20 w-20 bg-bisque-wash/50 flex items-center justify-center overflow-hidden shrink-0 rounded-2xl border border-kiln-border/30">
                {pkg.image_url ? (
                  <img src={pkg.image_url} alt={pkg.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-kiln-terracotta/40" />
                )}
              </motion.div>

              <div className="ml-6 flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <motion.h3 layoutId={`package-title-${pkg.id}`} className="font-serif text-xl font-light text-charcoal-bark group-hover:text-kiln-terracotta transition-colors">{pkg.name}</motion.h3>
                  <Badge variant={pkg.is_active ? 'default' : 'outline'} className="rounded-full text-[9px] uppercase tracking-wider py-0.5 px-3 bg-bisque-wash text-kiln-terracotta border-none">
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">
                    {pkg.services.length} services
                  </span>
                  <span className="text-[11px] text-warm-stone">
                    {pkg.bookings_count} bookings
                  </span>
                  <span className="text-xs text-warm-stone/80 font-light">
                    Valid: {pkg.valid_from ? new Date(pkg.valid_from).toLocaleDateString() : 'Now'} – {pkg.valid_until ? new Date(pkg.valid_until).toLocaleDateString() : 'Forever'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 ml-4 pr-4">
                <div className="text-right">
                  <div className="font-serif text-2xl font-light text-kiln-terracotta">₱{Number(pkg.price).toFixed(2)}</div>
                  <div className="text-[11px] text-warm-stone line-through">₱{Number(pkg.services_total).toFixed(2)} value</div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(pkg); }} title="Edit Package" className="rounded-full hover:bg-bisque-wash hover:text-kiln-terracotta text-warm-stone">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleToggle(pkg); }} title={pkg.is_active ? "Deactivate" : "Activate"} className="rounded-full hover:bg-bisque-wash hover:text-kiln-terracotta">
                    {pkg.is_active ? (
                      <ToggleRight className="w-5 h-5 text-kiln-terracotta" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-warm-stone" />
                    )}
                  </Button>
                  {pkg.bookings_count === 0 && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(pkg); }} title="Delete Package" className="rounded-full hover:bg-brick-error/10 hover:text-brick-error text-warm-stone">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
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
