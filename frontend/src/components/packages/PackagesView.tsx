import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { getPackages, togglePackage, deletePackage } from '@/api/apiClient';
import type { ServicePackage } from '@/types/api';
import PackageBuilderDialog from './PackageBuilderDialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (args: { id: number; isActive: boolean }) => togglePackage(args.id, args.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
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
    if (
      window.confirm(
        `Permanently delete '${pkg.name}'? This cannot be undone. Existing bookings are not affected.`,
      )
    ) {
      deleteMutation.mutate(pkg.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-5xl mx-auto min-h-screen bg-canvas">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-surface-soft animate-pulse rounded-md"></div>
          <div className="h-10 w-32 bg-surface-soft animate-pulse rounded-md"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-surface-card border border-hairline animate-pulse rounded-md"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto min-h-screen bg-canvas">
        <div className="p-4 bg-accent-red-soft text-ink border border-accent-red/20 rounded-md">
          Failed to load packages. Please try again later.
        </div>
      </div>
    );
  }

  const packages = data || [];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-canvas">
      <div className="flex justify-between items-center mb-10 relative">
        <h2 className="display-lg text-ink">Package Studio</h2>
        <motion.button
          layoutId="package-bg-new"
          onClick={handleCreate}
          className="flex items-center justify-center rounded-md bg-primary hover:bg-primary-pressed text-white px-6 h-10 utility-xs transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </motion.button>
      </div>

      {packages.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center border border-dashed border-hairline bg-surface-card rounded-md">
          <h3 className="heading-md mb-3 text-ink">No packages yet.</h3>
          <p className="body-md text-body mb-8 max-w-md">
            Create your first service bundle to increase ticket size and simplify booking.
          </p>
          <Button onClick={handleCreate} className="btn-primary">
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
              className="group flex items-center bg-surface-card border border-hairline p-5 hover:border-body transition-all rounded-md cursor-pointer relative overflow-hidden"
              onClick={() => handleEdit(pkg)}
            >
              <motion.div
                layoutId={`package-img-${pkg.id}`}
                className="h-20 w-20 bg-surface-soft flex items-center justify-center overflow-hidden shrink-0 rounded-md border border-hairline-soft"
              >
                {pkg.image_url ? (
                  <img src={pkg.image_url} alt={pkg.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-mute/40" />
                )}
              </motion.div>

              <div className="ml-6 flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <motion.h3
                    layoutId={`package-title-${pkg.id}`}
                    className="heading-md text-ink group-hover:text-primary transition-colors"
                  >
                    {pkg.name}
                  </motion.h3>
                  <Badge
                    className={cn(
                      'rounded-full text-[10px] uppercase tracking-wider py-0.5 px-3 border-none',
                      pkg.is_active
                        ? 'bg-accent-green-soft text-accent-green'
                        : 'bg-surface-soft text-mute',
                    )}
                  >
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <span className="utility-xs text-mute lowercase">
                    {pkg.services.length} services
                  </span>
                  <span className="body-xs text-mute">{pkg.bookings_count} bookings</span>
                  <span className="body-xs text-mute/80">
                    Valid: {pkg.valid_from ? new Date(pkg.valid_from).toLocaleDateString() : 'Now'}{' '}
                    – {pkg.valid_until ? new Date(pkg.valid_until).toLocaleDateString() : 'Forever'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 ml-4 pr-4">
                <div className="text-right">
                  <div className="heading-lg text-primary">
                    ₱{Number(pkg.price).toLocaleString()}
                  </div>
                  <div className="body-xs text-mute line-through">
                    ₱{Number(pkg.services_total).toLocaleString()} value
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(pkg);
                    }}
                    title="Edit Package"
                    className="rounded-md hover:bg-surface-soft text-mute"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(pkg);
                    }}
                    title={pkg.is_active ? 'Deactivate' : 'Activate'}
                    className="rounded-md hover:bg-surface-soft"
                  >
                    {pkg.is_active ? (
                      <ToggleRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-mute" />
                    )}
                  </Button>
                  {pkg.bookings_count === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pkg);
                      }}
                      title="Delete Package"
                      className="rounded-md hover:bg-accent-red-soft hover:text-accent-red text-mute"
                    >
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
