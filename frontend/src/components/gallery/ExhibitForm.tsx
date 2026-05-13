import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, X, Sparkles } from 'lucide-react';
import { getAllStaff, getServices, uploadFile, createExhibit, updateExhibit } from '../../api/apiClient';
import type { StaffMember, Service, Exhibit } from '../../types/api';

interface ExhibitFormProps {
  initialData?: Exhibit;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExhibitForm: React.FC<ExhibitFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState(initialData?.title || '');
  const [staffId, setStaffId] = useState<string>(initialData?.staff_id?.toString() || '');
  const [serviceId, setServiceId] = useState<string>(initialData?.service_id?.toString() || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, svcRes] = await Promise.all([getAllStaff(), getServices()]);

        // Handle paginated or array response for staff
        const staffData = staffRes.data.data;
        setStaff(Array.isArray(staffData) ? staffData : staffData?.items || []);

        // Handle paginated or array response for services
        const svcData = svcRes.data.data;
        setServices(Array.isArray(svcData) ? svcData : svcData?.items || []);
      } catch (err) {
        console.error('Failed to fetch form data', err);
        setError('Failed to load staff and services');
      }
    };
    fetchData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !staffId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!initialData && !imageFile) {
      setError('Please select an image for the new exhibit');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let imageUrl = initialData?.image_url;

      // 1. Upload Image if new file selected
      if (imageFile) {
        setIsUploading(true);
        const uploadRes = await uploadFile(imageFile);
        setIsUploading(false);

        if (!uploadRes.data.success) {
          throw new Error('Image upload failed');
        }
        imageUrl = uploadRes.data.data.url;
      }

      if (!imageUrl) {
        throw new Error('Image URL is missing');
      }

      // 2. Create or Update Exhibit
      if (initialData) {
        await updateExhibit(initialData.id, {
          title,
          image_url: imageUrl,
          staff_id: parseInt(staffId),
          service_id: serviceId && serviceId !== 'none' ? parseInt(serviceId) : undefined,
        });
      } else {
        await createExhibit({
          title,
          image_url: imageUrl,
          staff_id: parseInt(staffId),
          service_id: serviceId && serviceId !== 'none' ? parseInt(serviceId) : undefined,
        });
      }

      onSuccess();
    } catch (err: any) {
      console.error('Submit exhibit error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save exhibit');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-[11px] uppercase font-bold tracking-widest rounded-none border border-destructive/20 flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground"
          >
            Exhibit Title <span className="text-primary">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Autumn Floral Set"
            className="rounded-none border-gray-200 h-14 text-sm focus-visible:ring-primary/20 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="staff"
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground"
            >
              Artist (Staff) <span className="text-primary">*</span>
            </Label>
            <Select value={staffId} onValueChange={(val) => setStaffId(val || '')} required>
              <SelectTrigger id="staff" className="rounded-none border-gray-200 h-14 focus:ring-primary/20">
                <SelectValue placeholder="Select Artist" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-none shadow-2xl">
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.staffProfileId.toString()} className="rounded-none py-3">
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="service"
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground"
            >
              Service Context
            </Label>
            <Select value={serviceId} onValueChange={(val) => setServiceId(val || '')}>
              <SelectTrigger id="service" className="rounded-none border-gray-200 h-14 focus:ring-primary/20">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-none shadow-2xl">
                <SelectItem value="none" className="rounded-none py-3 italic">None</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()} className="rounded-none py-3">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Display Image <span className="text-primary">*</span>
          </Label>
          <div className={cn(
            "mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-none transition-all duration-500",
            previewUrl ? "border-primary/20 bg-primary/5" : "border-gray-200 hover:border-primary/40 bg-gray-50/50"
          )}>
            {previewUrl ? (
              <div className="relative group/preview w-full max-w-xs aspect-[4/5] max-h-[350px] shadow-2xl overflow-hidden bg-white">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                    }}
                    className="rounded-none bg-white text-foreground hover:bg-destructive hover:text-white border-none text-[10px] uppercase font-bold tracking-widest h-12 px-6"
                  >
                    <X className="h-4 w-4 mr-2" /> Change Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-2">
                  <Upload className="h-6 w-6 text-primary/40 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-transparent rounded-none font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>Upload high-res file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.1em]">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="rounded-none h-14 px-8 uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="rounded-none h-14 px-12 uppercase tracking-[0.2em] text-[11px] font-bold shadow-xl shadow-primary/20 min-w-[200px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isUploading ? 'Uploading...' : 'Saving...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>{initialData ? 'Update Exhibit' : 'Publish Exhibit'}</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExhibitForm;
