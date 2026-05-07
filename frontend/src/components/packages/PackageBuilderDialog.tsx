import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X } from 'lucide-react';
import type { ServicePackage, CreatePackagePayload, UpdatePackagePayload } from '@/types/api';
import { uploadFile, createPackage, updatePackage } from '@/api/apiClient';
import ServiceChipSelector from './ServiceChipSelector';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const PREMIUM_EASE = [0.32, 0.72, 0, 1] as const;
const morphTransition = { duration: 0.5, ease: PREMIUM_EASE } as const;

interface PackageBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPackage?: ServicePackage | null;
  onSuccess: () => void;
}

export default function PackageBuilderDialog({ open, onOpenChange, editPackage, onSuccess }: PackageBuilderDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editPackage) {
        setName(editPackage.name);
        setDescription(editPackage.description || '');
        setPrice(editPackage.price.toString());
        setDisplayOrder(editPackage.display_order.toString());
        setValidFrom(editPackage.valid_from ? new Date(editPackage.valid_from).toISOString().split('T')[0] : '');
        setValidUntil(editPackage.valid_until ? new Date(editPackage.valid_until).toISOString().split('T')[0] : '');
        setMaxRedemptions(editPackage.max_redemptions?.toString() || '');
        setIsActive(editPackage.is_active);
        setSelectedServiceIds(editPackage.services.map(s => s.id));
        setPreviewUrl(editPackage.image_url);
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setDisplayOrder('0');
        setValidFrom('');
        setValidUntil('');
        setMaxRedemptions('');
        setIsActive(true);
        setSelectedServiceIds([]);
        setPreviewUrl(null);
      }
      setImageFile(null);
      setError(null);
    }
  }, [open, editPackage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl = previewUrl; // Use existing url or null by default

      if (imageFile) {
        const uploadRes = await uploadFile(imageFile);
        if (!uploadRes.data.success) {
          throw new Error('Image upload failed');
        }
        imageUrl = uploadRes.data.data.url;
      }

      const payload = {
        name,
        description: description || undefined,
        price: Number(price),
        image_url: imageUrl || undefined,
        display_order: Number(displayOrder),
        valid_from: validFrom || null,
        valid_until: validUntil || null,
        max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
        is_active: isActive,
        service_ids: selectedServiceIds,
      };

      if (editPackage) {
        return updatePackage(editPackage.id, payload as UpdatePackagePayload);
      } else {
        return createPackage(payload as CreatePackagePayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      console.error('Submit package error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save package. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || selectedServiceIds.length < 2 || Number(price) <= 0) return;
    setError(null);
    mutation.mutate();
  };

  const isSubmitting = mutation.isPending;
  const isSubmitDisabled = isSubmitting || selectedServiceIds.length < 2 || !name || !price || Number(price) <= 0;

  const layoutId = editPackage ? `package-bg-${editPackage.id}` : 'package-bg-new';
  const imgLayoutId = editPackage ? `package-img-${editPackage.id}` : 'package-img-new';
  const titleLayoutId = editPackage ? `package-title-${editPackage.id}` : 'package-title-new';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: PREMIUM_EASE }}
            className="fixed inset-0 bg-warm-canvas/80 backdrop-blur-md pointer-events-auto"
            onClick={() => onOpenChange(false)}
          />
          
          <motion.div
            layoutId={layoutId}
            transition={morphTransition}
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-premium relative z-10 pointer-events-auto flex flex-col"
          >
            <div className="sticky top-0 z-20 flex justify-between items-center bg-white/95 backdrop-blur-md px-10 py-8 border-b border-kiln-border/50">
              <motion.h2 layoutId={titleLayoutId} className="font-serif text-3xl font-light text-charcoal-bark" transition={morphTransition}>
                {editPackage ? 'Edit Package' : 'New Package'}
              </motion.h2>
              <button type="button" onClick={() => onOpenChange(false)} className="w-10 h-10 rounded-full bg-bisque-wash/50 flex items-center justify-center text-charcoal-bark hover:bg-bisque-wash transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-12">
              {error && (
                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="p-4 bg-brick-error/10 text-brick-error text-[11px] uppercase tracking-widest font-bold rounded-xl border border-brick-error/20">
                  {error}
                </motion.div>
              )}

              {/* Section 1 & 4 Combined visually - Top Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Featured Image */}
                <div className="space-y-4">
                  <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Featured Image</Label>
                  <motion.div layoutId={imgLayoutId} transition={morphTransition} className="relative aspect-square w-full rounded-[24px] border border-kiln-border overflow-hidden bg-bisque-wash/30 group hover:border-kiln-terracotta/40 transition-colors">
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-brick-error transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6 text-center">
                        <Upload className="h-10 w-10 text-kiln-terracotta/40 stroke-[1.5] mb-4" />
                        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-kiln-terracotta mb-1">Upload File</span>
                        <span className="text-xs font-light text-warm-stone">or drag and drop</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                    )}
                  </motion.div>
                </div>

                {/* Basic Info */}
                <div className="space-y-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Package Name *</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="rounded-xl border-kiln-border h-14 text-lg font-serif text-charcoal-bark focus-visible:ring-kiln-terracotta bg-transparent"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Description</Label>
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={5}
                      className="rounded-xl border-kiln-border text-base font-light text-charcoal-bark focus-visible:ring-kiln-terracotta resize-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 - Services */}
              <div className="space-y-6 pt-8 border-t border-kiln-border/50">
                <div className="flex justify-between items-end">
                  <h3 className="font-serif text-2xl font-light text-charcoal-bark">Included Rituals</h3>
                  <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-warm-stone">Select 2 or more</span>
                </div>
                <div className="bg-linen-mist rounded-[24px] p-8 border border-kiln-border/30">
                  <ServiceChipSelector
                    selectedServiceIds={selectedServiceIds}
                    onSelectionChange={setSelectedServiceIds}
                    packagePrice={Number(price)}
                  />
                </div>
              </div>

              {/* Section 3 & 5 - Pricing & Settings */}
              <div className="space-y-8 pt-8 border-t border-kiln-border/50">
                <h3 className="font-serif text-2xl font-light text-charcoal-bark">Pricing & Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Package Price *</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-kiln-terracotta font-serif text-xl">₱</span>
                      <Input
                        type="number" min="1" step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                        className="rounded-xl border-kiln-border h-14 pl-10 text-xl font-serif text-charcoal-bark focus-visible:ring-kiln-terracotta bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Display Order</Label>
                    <Input
                      type="number"
                      value={displayOrder}
                      onChange={e => setDisplayOrder(e.target.value)}
                      className="rounded-xl border-kiln-border h-14 text-base text-charcoal-bark focus-visible:ring-kiln-terracotta bg-transparent"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Available From</Label>
                    <Input
                      type="date"
                      value={validFrom}
                      onChange={e => setValidFrom(e.target.value)}
                      className="rounded-xl border-kiln-border h-14 text-base text-charcoal-bark focus-visible:ring-kiln-terracotta bg-transparent"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Available Until</Label>
                    <Input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      className="rounded-xl border-kiln-border h-14 text-base text-charcoal-bark focus-visible:ring-kiln-terracotta bg-transparent"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone">Redemption Limit</Label>
                    <Input
                      type="number"
                      value={maxRedemptions}
                      onChange={e => setMaxRedemptions(e.target.value)}
                      className="rounded-xl border-kiln-border h-14 text-base text-charcoal-bark focus-visible:ring-kiln-terracotta bg-transparent"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="space-y-3 flex flex-col justify-center bg-bisque-wash/30 rounded-xl p-5 border border-kiln-border/50 h-[84px] mt-auto">
                    <div className="flex justify-between items-center w-full">
                      <Label className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal-bark cursor-pointer" htmlFor="active-toggle">
                        Active Status
                      </Label>
                      <Switch id="active-toggle" checked={isActive} onCheckedChange={setIsActive} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-10 sticky bottom-0 bg-white/95 backdrop-blur-md pb-10 -mx-10 px-10 border-t border-kiln-border/50 z-20">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-14 px-8 uppercase tracking-[0.2em] text-[11px] font-bold text-charcoal-bark border-kiln-border hover:bg-bisque-wash/50">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="rounded-xl h-14 px-12 uppercase tracking-[0.2em] text-[11px] font-bold shadow-premium bg-kiln-terracotta text-white hover:bg-kiln-terracotta-hover transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    editPackage ? 'Save Package' : 'Create Package'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
