import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X } from 'lucide-react';
import { ServicePackage, CreatePackagePayload, UpdatePackagePayload } from '@/types/api';
import { uploadFile, createPackage, updatePackage } from '@/api/apiClient';
import ServiceChipSelector from './ServiceChipSelector';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-light">
            {editPackage ? 'Edit Package' : 'New Package'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {/* Section 1 - Basic Info */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Package Name *</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="rounded-none"
              />
            </div>
          </div>

          {/* Section 2 - Services */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-light">Select Services</h3>
            <ServiceChipSelector
              selectedServiceIds={selectedServiceIds}
              onSelectionChange={setSelectedServiceIds}
              packagePrice={Number(price)}
            />
          </div>

          {/* Section 3 - Pricing */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Package Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">₱</span>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="rounded-none pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">Set the final bundle price customers will pay</p>
          </div>

          {/* Section 4 - Featured Image */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Featured Image</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-none hover:border-primary/50 transition-colors bg-gray-50/50">
              {previewUrl ? (
                <div className="relative w-full aspect-video">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white shadow-lg rounded-full hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300 stroke-[1]" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="package-image-upload"
                      className="relative cursor-pointer bg-transparent rounded-md font-bold text-primary hover:text-primary/80"
                    >
                      <span>Upload a file</span>
                      <input id="package-image-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">PNG, JPG, WEBP up to 4MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 5 - Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Display Order</Label>
              <Input
                type="number"
                value={displayOrder}
                onChange={e => setDisplayOrder(e.target.value)}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2 flex items-center justify-between sm:justify-start sm:gap-4 h-full pt-4">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Available From</Label>
              <Input
                type="date"
                value={validFrom}
                onChange={e => setValidFrom(e.target.value)}
                className="rounded-none"
              />
              <p className="text-[10px] text-muted-foreground">Leave empty for always available</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Available Until</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Redemption Limit</Label>
              <Input
                type="number"
                value={maxRedemptions}
                onChange={e => setMaxRedemptions(e.target.value)}
                className="rounded-none"
              />
              <p className="text-[10px] text-muted-foreground">Leave empty for unlimited</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-none h-12 px-6 uppercase tracking-widest text-[10px] font-bold">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="rounded-none h-12 px-10 uppercase tracking-widest text-[10px] font-bold shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editPackage ? 'Update Package' : 'Create Package'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
